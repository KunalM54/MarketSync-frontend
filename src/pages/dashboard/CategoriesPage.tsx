import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiRequest, ApiError } from "../../lib/api";
import type { Category } from "../../lib/types";
import DataTable, { type Column } from "../../components/dashboard/DataTable";
import { AlertIcon, EditIcon, PlusIcon, LayersIcon } from "../../components/icons";

interface CategoryForm {
  name: string;
  description: string;
}

const EMPTY_FORM: CategoryForm = {
  name: "",
  description: "",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [view, setView] = useState<{ mode: "list" } | { mode: "form"; category: Category | null }>({ mode: "list" });
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiRequest<Category[]>("/categories");
      setCategories(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load categories.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startAdd = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError(null);
    setView({ mode: "form", category: null });
  };

  const startEdit = (c: Category) => {
    setForm({
      name: c.name,
      description: c.description ?? "",
    });
    setFieldErrors({});
    setFormError(null);
    setView({ mode: "form", category: c });
  };

  const toggleActive = async (c: Category) => {
    setError(null);
    try {
      const updated = await apiRequest<Category>(`/categories/${c._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      if (categories) {
        setCategories(categories.map((item) => (item._id === c._id ? updated : item)));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update status.");
    }
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters.";
    } else if (form.name.trim().length > 50) {
      errs.name = "Name cannot exceed 50 characters.";
    }
    if (form.description.trim().length > 200) {
      errs.description = "Description cannot exceed 200 characters.";
    }
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const isEdit = view.mode === "form" && view.category !== null;
    const url = isEdit ? `/categories/${view.category?._id}` : "/categories";
    const method = isEdit ? "PATCH" : "POST";

    try {
      await apiRequest(url, {
        method,
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        }),
      });
      setView({ mode: "list" });
      void load();
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else {
        setFormError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Category Name",
      render: (c) => <span className="cell-strong">{c.name}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      render: (c) => <span className="mono cell-muted">{c.slug}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (c) => <span>{c.description || <span className="cell-muted">—</span>}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <button
          type="button"
          onClick={() => void toggleActive(c)}
          className={`badge ${c.isActive ? "badge-success" : "badge-warning"}`}
          title="Click to toggle active status"
        >
          {c.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => (
        <div className="cell-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => startEdit(c)}
            title="Edit category"
          >
            <EditIcon />
          </button>
        </div>
      ),
    },
  ];

  if (view.mode === "form") {
    const isEdit = view.category !== null;
    return (
      <div className="dash-module">
        <div className="page-head">
          <div>
            <h1>{isEdit ? "Edit Category" : "Add Category"}</h1>
            <p className="page-sub">
              {isEdit ? "Update name or description." : "Create a new category for products."}
            </p>
          </div>
        </div>

        <div className="panel max-w-xl">
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div className="panel-body form-grid">
              {formError ? (
                <div className="alert alert-error span-all" role="alert">
                  <AlertIcon />
                  <span>{formError}</span>
                </div>
              ) : null}

              <div className="field-group span-all">
                <label htmlFor="cat-name">Category Name</label>
                <input
                  id="cat-name"
                  type="text"
                  className={`input plain ${fieldErrors.name ? "invalid" : ""}`}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Electronics, Clothing"
                  required
                  disabled={submitting}
                />
                {fieldErrors.name ? <span className="field-error">{fieldErrors.name}</span> : null}
              </div>

              <div className="field-group span-all">
                <label htmlFor="cat-description">Description (Optional)</label>
                <textarea
                  id="cat-description"
                  className={`input plain ${fieldErrors.description ? "invalid" : ""}`}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the category"
                  rows={3}
                  disabled={submitting}
                />
                {fieldErrors.description ? (
                  <span className="field-error">{fieldErrors.description}</span>
                ) : null}
              </div>
            </div>

            <div className="panel-foot">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setView({ mode: "list" })}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-module">
      <div className="page-head">
        <div>
          <h1>Categories</h1>
          <p className="page-sub">
            Manage product categories — {categories ? `${categories.length} loaded.` : "loading..."}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startAdd}>
          <PlusIcon /> Add Category
        </button>
      </div>

      {error ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      ) : null}

      {categories === null ? (
        <div className="store-state">
          <span className="spinner" aria-hidden="true" />
          <p>Loading categories…</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="module-empty">
          <span className="module-empty-ico">
            <LayersIcon />
          </span>
          <h2>No categories yet</h2>
          <p>Start by creating a category to classify products.</p>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <LayersIcon /> Categories List
            </h3>
            <span className="panel-meta">{categories.length} categories</span>
          </div>
          <div className="panel-body flush">
            <DataTable columns={columns} rows={categories} />
          </div>
        </div>
      )}
    </div>
  );
}

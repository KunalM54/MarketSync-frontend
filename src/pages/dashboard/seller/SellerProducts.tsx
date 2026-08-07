import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductImage from "../../../components/store/ProductImage";
import { useAuth } from "../../../lib/auth";
import { apiRequest, ApiError } from "../../../lib/api";
import { formatINR, type Brand, type Category, type Product } from "../../../lib/types";
import { AlertIcon, BoxIcon, EditIcon, PlusIcon, TrashIcon } from "../../../components/icons";
import SellerProductForm from "./SellerProductForm";

type View = { mode: "list" } | { mode: "form"; product: Product | null };

export default function SellerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ mode: "list" });
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [productData, categoryData, brandData] = await Promise.all([
        apiRequest<Product[]>(`/products?sellerId=${encodeURIComponent(user.id)}`),
        apiRequest<Category[]>("/categories").catch(() => [] as Category[]),
        apiRequest<Brand[]>("/brands").catch(() => [] as Brand[]),
      ]);
      setProducts(productData);
      setCategories(categoryData);
      setBrands(brandData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your products.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete “${product.name}”? It will be hidden from the store.`)) return;

    setDeleting(product.id);
    setError(null);
    try {
      await apiRequest(`/products/${product.id}`, { method: "DELETE" });
      setProducts((rows) => rows.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete product.");
    } finally {
      setDeleting(null);
    }
  };

  const closeForm = () => {
    setView({ mode: "list" });
    void load();
  };

  if (view.mode === "form") {
    return (
      <div className="dash-module">
        <div className="page-head">
          <div>
            <h1>{view.product ? "Edit product" : "Add product"}</h1>
            <p className="page-sub">
              {view.product
                ? "Update your listing and images."
                : "Upload 1–4 product images and list your first product."}
            </p>
          </div>
        </div>
        <SellerProductForm
          categories={categories}
          brands={brands}
          initial={view.product}
          onDone={closeForm}
          onCancel={() => setView({ mode: "list" })}
        />
      </div>
    );
  }

  return (
    <div className="dash-module">
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p className="page-sub">Manage your listings — {products.length} active.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setView({ mode: "form", product: null })}
        >
          <PlusIcon /> Add product
        </button>
      </div>

      {error ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="store-state">
          <span className="spinner" aria-hidden="true" />
          <p>Loading your products…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="module-empty">
          <span className="module-empty-ico">
            <BoxIcon />
          </span>
          <h2>No products yet</h2>
          <p>Add your first product with up to 4 images so buyers can see what you sell.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setView({ mode: "form", product: null })}
          >
            <PlusIcon /> Add product
          </button>
        </div>
      ) : (
        <div className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variants</th>
                  <th className="num">Price from</th>
                  <th>Images</th>
                  <th className="num">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const minPrice =
                    p.variants.length > 0
                      ? Math.min(...p.variants.map((v) => v.price))
                      : null;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="cell-product">
                          <span className="cell-thumb">
                            <ProductImage src={p.images[0]} alt={p.name} fallbackChar={p.name.charAt(0)} />
                          </span>
                          <span>
                            <span className="cell-strong">{p.name}</span>
                            <span className="cell-sub">
                              {typeof p.category === "object" && p.category !== null
                                ? p.category.name
                                : ""}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="cell-muted">{p.variants.length}</td>
                      <td className="num">{minPrice !== null ? formatINR(minPrice) : "—"}</td>
                      <td>
                        <div className="thumb-strip">
                          {p.images.slice(0, 4).map((src, i) => (
                            <span className="thumb-strip-img" key={i}>
                              <ProductImage src={src} alt="" fallbackChar={""} />
                            </span>
                          ))}
                          {p.images.length === 0 ? <span className="cell-muted">None</span> : null}
                        </div>
                      </td>
                      <td className="num">
                        <div className="row-actions">
                          <Link
                            to={`/shop/${p.id}`}
                            className="icon-btn"
                            title="View in store"
                            aria-label={`View ${p.name} in store`}
                          >
                            <BoxIcon />
                          </Link>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Edit"
                            aria-label={`Edit ${p.name}`}
                            onClick={() => setView({ mode: "form", product: p })}
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            title="Delete"
                            aria-label={`Delete ${p.name}`}
                            onClick={() => void handleDelete(p)}
                            disabled={deleting === p.id}
                          >
                            {deleting === p.id ? <span className="spinner" /> : <TrashIcon />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

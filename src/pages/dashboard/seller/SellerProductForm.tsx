import { useRef, useState, type FormEvent } from "react";
import { apiRequest, ApiError } from "../../../lib/api";
import type { Brand, Category, Product } from "../../../lib/types";
import { AlertIcon, ImageIcon, PlusIcon, TrashIcon } from "../../../components/icons";

const MAX_IMAGES = 4;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

interface VariantRow {
  key: number;
  name: string;
  sku: string;
  price: string;
  stock: string;
}

interface ImageRow {
  url: string;
  uploading: boolean;
}

interface SellerProductFormProps {
  categories: Category[];
  brands: Brand[];
  initial?: Product | null;
  onDone: () => void;
  onCancel: () => void;
}

const emptyVariant = (key: number): VariantRow => ({ key, name: "", sku: "", price: "", stock: "" });

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function SellerProductForm({
  categories,
  brands,
  initial,
  onDone,
  onCancel,
}: SellerProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(
    initial && typeof initial.category === "object" ? initial.category._id : "",
  );
  const [brandId, setBrandId] = useState(
    initial && typeof initial.brand === "object" ? initial.brand._id : "",
  );
  const [images, setImages] = useState<ImageRow[]>(
    (initial?.images ?? []).map((url) => ({ url, uploading: false })),
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    initial && initial.variants.length > 0
      ? initial.variants.map((v, i) => ({
          key: i,
          name: v.name,
          sku: v.sku,
          price: String(v.price),
          stock: "",
        }))
      : [emptyVariant(0)],
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const nextKey = useRef(variants.length + 1);

  const setVariant = (key: number, field: keyof VariantRow, value: string) => {
    setVariants((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addVariant = () => {
    setVariants((rows) => [...rows, emptyVariant(nextKey.current++)]);
  };

  const removeVariant = (key: number) => {
    setVariants((rows) => (rows.length > 1 ? rows.filter((r) => r.key !== key) : rows));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setFormError(null);
    setNotice(null);

    const allowed = Math.min(files.length, MAX_IMAGES - images.length);

    for (let i = 0; i < allowed; i++) {
      const file = files[i]!;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFormError(`Unsupported file type: ${file.type || "unknown"}. Use JPG, PNG, WEBP, GIF or AVIF.`);
        continue;
      }

      if (file.size > MAX_FILE_BYTES) {
        setFormError(`${file.name} is too large. Maximum size is 5 MB.`);
        continue;
      }

      const placeholderKey = `uploading-${Date.now()}-${i}`;

      setImages((rows) => [...rows, { url: placeholderKey, uploading: true }]);

      try {
        const base64 = await toBase64(file);
        const uploaded = await apiRequest<{ url: string }>("/uploads/image", {
          method: "POST",
          body: JSON.stringify({ file: base64, fileName: file.name.replace(/\.[^.]+$/, "") }),
        });

        setImages((rows) =>
          rows.map((row) =>
            row.url === placeholderKey ? { url: uploaded.url, uploading: false } : row,
          ),
        );
      } catch (err) {
        setImages((rows) => rows.filter((row) => row.url !== placeholderKey));
        setFormError(
          err instanceof ApiError ? err.message : "Image upload failed. Please try again.",
        );
      }
    }
  };

  const removeImage = (url: string) => {
    setImages((rows) => rows.filter((row) => row.url !== url));
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (name.trim().length < 3) errs.name = "Name must be at least 3 characters.";
    if (!categoryId) errs.categoryId = "Select a category.";
    if (!brandId) errs.brandId = "Select a brand.";
    if (images.length === 0) errs.images = "Add at least 1 product image.";
    if (images.length > MAX_IMAGES) errs.images = `Maximum ${MAX_IMAGES} images allowed.`;

    variants.forEach((v, i) => {
      const prefix = `variants.${i}`;
      if (!v.name.trim()) errs[`${prefix}.name`] = "Variant name is required.";
      if (!v.sku.trim()) errs[`${prefix}.sku`] = "SKU is required.";
      const price = Number(v.price);
      if (!v.price.trim() || Number.isNaN(price) || price <= 0) {
        errs[`${prefix}.price`] = "Enter a valid price.";
      }
      if (v.stock.trim() !== "" && (Number.isNaN(Number(v.stock)) || Number(v.stock) < 0)) {
        errs[`${prefix}.stock`] = "Stock must be 0 or more.";
      }
    });

    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setFormError(null);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setErrors({});
    setNotice(null);

    const payload = {
      name: name.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      categoryId,
      brandId,
      images: images.map((img) => img.url),
      variants: variants.map((v) => ({
        name: v.name.trim(),
        sku: v.sku.trim(),
        price: Number(v.price),
      })),
    };

    try {
      if (initial) {
        await apiRequest<Product>(`/products/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setNotice("Product updated successfully.");
      } else {
        const product = await apiRequest<Product>("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        // Create inventory records for variants that have a stock value.
        let inventoryCreated = 0;
        for (let i = 0; i < variants.length; i++) {
          const stock = variants[i]!.stock.trim();
          if (stock === "") continue;

          try {
            await apiRequest("/inventory", {
              method: "POST",
              body: JSON.stringify({
                productId: product.id,
                variantId: product.variants[i]!.id,
                stock: Number(stock),
              }),
            });
            inventoryCreated++;
          } catch {
            // A failed inventory record shouldn't fail the whole product.
          }
        }

        setNotice(
          `Product created.${inventoryCreated > 0 ? ` Stock added for ${inventoryCreated} variant${inventoryCreated === 1 ? "" : "s"}.` : ""}`,
        );
      }

      // Let the parent refresh its list shortly after.
      setTimeout(onDone, 900);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <div className="panel-head form-head">
        <h3 className="panel-title">{initial ? "Edit product" : "Add product"}</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {formError ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{formError}</span>
        </div>
      ) : null}

      {notice ? (
        <div className="alert alert-success" role="status">
          <AlertIcon />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="form-body">
        <div className="form-grid">
          <div className="field">
            <div className="field-label">
              <label htmlFor="p-name">Product name</label>
            </div>
            <input
              id="p-name"
              className={`input plain ${errors.name ? "invalid" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wireless Noise-Cancel Headphones"
            />
            {errors.name ? <span className="field-error">{errors.name}</span> : null}
          </div>

          <div className="field">
            <div className="field-label">
              <label htmlFor="p-desc">Description</label>
              <span className="opt">Optional</span>
            </div>
            <textarea
              id="p-desc"
              className="input plain textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description shown to buyers…"
            />
          </div>

          <div className="field">
            <div className="field-label">
              <label htmlFor="p-category">Category</label>
            </div>
            <select
              id="p-category"
              className={`input plain ${errors.categoryId ? "invalid" : ""}`}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? <span className="field-error">{errors.categoryId}</span> : null}
          </div>

          <div className="field">
            <div className="field-label">
              <label htmlFor="p-brand">Brand</label>
            </div>
            <select
              id="p-brand"
              className={`input plain ${errors.brandId ? "invalid" : ""}`}
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              <option value="">Select brand…</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.brandId ? <span className="field-error">{errors.brandId}</span> : null}
          </div>
        </div>

        {/* Images (1–4) */}
        <div className="field">
          <div className="field-label">
            <label>Product images</label>
            <span className="opt">
              {images.length}/4 · minimum 1 required
            </span>
          </div>
          <div className="image-uploader">
            {images.map((img) => (
              <div className="image-tile" key={img.url}>
                {img.uploading ? (
                  <div className="image-tile-loading">
                    <span className="spinner" />
                    <span>Uploading…</span>
                  </div>
                ) : (
                  <>
                    <img src={img.url} alt="Product preview" />
                    <button
                      type="button"
                      className="image-remove"
                      onClick={() => removeImage(img.url)}
                      aria-label="Remove image"
                    >
                      <TrashIcon />
                    </button>
                  </>
                )}
              </div>
            ))}

            {images.length < MAX_IMAGES ? (
              <button
                type="button"
                className="image-add"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon />
                <span>Add image</span>
              </button>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            hidden
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {errors.images ? <span className="field-error">{errors.images}</span> : null}
        </div>

        {/* Variants */}
        <div className="field">
          <div className="field-label">
            <label>Variants</label>
            <span className="opt">At least one required</span>
          </div>
          <div className="variant-editor">
            {variants.map((v, i) => (
              <div className="variant-row" key={v.key}>
                <input
                  className={`input plain ${errors[`variants.${i}.name`] ? "invalid" : ""}`}
                  placeholder="Name (e.g. Black · M)"
                  value={v.name}
                  onChange={(e) => setVariant(v.key, "name", e.target.value)}
                />
                <input
                  className={`input plain mono ${errors[`variants.${i}.sku`] ? "invalid" : ""}`}
                  placeholder="SKU"
                  value={v.sku}
                  onChange={(e) => setVariant(v.key, "sku", e.target.value)}
                />
                <input
                  className={`input plain ${errors[`variants.${i}.price`] ? "invalid" : ""}`}
                  placeholder="Price (₹)"
                  type="number"
                  min="1"
                  step="0.01"
                  value={v.price}
                  onChange={(e) => setVariant(v.key, "price", e.target.value)}
                />
                <input
                  className={`input plain ${errors[`variants.${i}.stock`] ? "invalid" : ""}`}
                  placeholder="Stock (optional)"
                  type="number"
                  min="0"
                  step="1"
                  value={v.stock}
                  onChange={(e) => setVariant(v.key, "stock", e.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => removeVariant(v.key)}
                  disabled={variants.length <= 1}
                  aria-label="Remove variant"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            <button type="button" className="add-variant" onClick={addVariant}>
              <PlusIcon /> Add variant
            </button>
            <div className="variant-errors">
              {variants.map((v, i) => (
                <span key={v.key} className="field-error">
                  {errors[`variants.${i}.name`] ?? errors[`variants.${i}.sku`] ?? errors[`variants.${i}.price`] ?? errors[`variants.${i}.stock`]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || images.some((img) => img.uploading)}
          >
            {submitting ? <span className="spinner" /> : null}
            {submitting ? "Saving…" : initial ? "Save changes" : "Create product"}
          </button>
          <span className="form-hint">
            Stock is optional — add it to enable stock checks during checkout.
          </span>
        </div>
      </div>
    </form>
  );
}

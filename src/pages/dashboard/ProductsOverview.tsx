import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, ApiError } from "../../lib/api";
import type { Product } from "../../lib/types";
import { formatINR } from "../../lib/types";
import DataTable, { type Column } from "../../components/dashboard/DataTable";
import { AlertIcon, BoxIcon } from "../../components/icons";
import type { Inventory } from "./InventoryOverview";

interface CatalogRow {
  product: Product;
  sku: string;
  price: number | null;
  variants: number;
  stock: number;
  low: boolean;
}

const minPrice = (p: Product) =>
  p.variants.length > 0 ? Math.min(...p.variants.map((v) => v.price)) : null;

const firstSku = (p: Product) => p.variants[0]?.sku ?? "—";

const categoryName = (p: Product) =>
  typeof p.category === "object" && p.category !== null ? p.category.name : "";

const columns: Column<CatalogRow>[] = [
  {
    key: "product",
    header: "Product",
    render: (r) => (
      <div className="cell-product">
        <span className="mono-tile">{r.product.name.charAt(0)}</span>
        <span>
          <span className="cell-strong">{r.product.name}</span>
          <span className="cell-sub">
            {r.sku} · {categoryName(r.product)}
          </span>
        </span>
      </div>
    ),
  },
  { key: "price", header: "From", align: "right", render: (r) => (r.price !== null ? formatINR(r.price) : "—") },
  { key: "variants", header: "Variants", align: "right", render: (r) => r.variants },
  { key: "stock", header: "Stock", align: "right", render: (r) => r.stock.toLocaleString("en-IN") },
  {
    key: "status",
    header: "Status",
    render: (r) =>
      r.low ? (
        <span className="badge badge-warning">Low</span>
      ) : (
        <span className="badge badge-success">In stock</span>
      ),
  },
];

export default function ProductsOverview() {
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setRows(null);
    try {
      const [products, inventory] = await Promise.all([
        apiRequest<Product[]>("/products"),
        apiRequest<Inventory[]>("/inventory").catch(() => [] as Inventory[]),
      ]);

      const stockByProduct = new Map<string, { stock: number; low: boolean }>();
      for (const e of inventory) {
        const cur = stockByProduct.get(e.product.id) ?? { stock: 0, low: false };
        cur.stock += e.available;
        cur.low = cur.low || e.isLowStock;
        stockByProduct.set(e.product.id, cur);
      }

      setRows(
        products.map((p) => ({
          product: p,
          sku: firstSku(p),
          price: minPrice(p),
          variants: p.variants.filter((v) => v.isActive).length,
          stock: stockByProduct.get(p.id)?.stock ?? 0,
          low: stockByProduct.get(p.id)?.low ?? false,
        })),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load the catalog.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const inStock = (rows ?? []).filter((r) => !r.low).length;

  return (
    <div className="dash-module">
      <div className="page-head">
        <div>
          <h1>Product catalog</h1>
          <p className="page-sub">
            Everything sellers have listed live in the store
            {rows ? ` · ${rows.length} products, ${inStock} in stock.` : ""}
          </p>
        </div>
        <Link to="/shop" className="btn btn-outline">
          View storefront
        </Link>
      </div>

      {error ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      ) : null}

      {rows === null ? (
        <div className="store-state">
          <span className="spinner" aria-hidden="true" />
          <p>Loading catalog…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="module-empty">
          <span className="module-empty-ico">
            <BoxIcon />
          </span>
          <h2>No products yet</h2>
          <p>Sellers haven&apos;t listed anything yet. Products appear here automatically.</p>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <BoxIcon /> Live listings
            </h3>
            <span className="panel-meta">{rows.length} products</span>
          </div>
          <div className="panel-body flush">
            <DataTable columns={columns} rows={rows} />
          </div>
        </div>
      )}
    </div>
  );
}
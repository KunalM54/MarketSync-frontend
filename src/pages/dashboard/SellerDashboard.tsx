import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { apiRequest, ApiError } from "../../lib/api";
import DataTable, { type Column } from "../../components/dashboard/DataTable";
import StatCard from "../../components/dashboard/StatCard";
import type { Product } from "../../lib/types";
import { formatINR } from "../../lib/types";
import type { Inventory } from "./InventoryOverview";
import { AlertIcon, BoxIcon, CheckCircleIcon, LayersIcon, PlusIcon } from "../../components/icons";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const today = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const minPrice = (p: Product) =>
  p.variants.length > 0 ? Math.min(...p.variants.map((v) => v.price)) : null;

const categoryName = (p: Product) =>
  typeof p.category === "object" && p.category !== null ? p.category.name : "";

interface ProductRow {
  product: Product;
  stock: number;
  low: boolean;
}

const productColumns: Column<ProductRow>[] = [
  {
    key: "product",
    header: "Product",
    render: (r) => (
      <div className="cell-product">
        <span className="mono-tile">{r.product.name.charAt(0)}</span>
        <span>
          <span className="cell-strong">{r.product.name}</span>
          <span className="cell-sub">
            {r.product.variants[0]?.sku ?? "—"} · {categoryName(r.product)}
          </span>
        </span>
      </div>
    ),
  },
  {
    key: "price",
    header: "Price from",
    align: "right",
    render: (r) => (minPrice(r.product) !== null ? formatINR(minPrice(r.product)!) : "—"),
  },
  {
    key: "variants",
    header: "Options",
    align: "right",
    render: (r) => r.product.variants.filter((v) => v.isActive).length,
  },
  {
    key: "stock",
    header: "Stock",
    align: "right",
    render: (r) => r.stock.toLocaleString("en-IN"),
  },
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

export default function SellerDashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "Seller";
  const sellerId = user?.id;

  const [products, setProducts] = useState<Product[] | null>(null);
  const [inventory, setInventory] = useState<Inventory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [productData, inventoryData] = await Promise.all([
        apiRequest<Product[]>("/products"),
        apiRequest<Inventory[]>("/inventory").catch(() => [] as Inventory[]),
      ]);
      setProducts(productData);
      setInventory(inventoryData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load dashboard data.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const mine = (products ?? []).filter((p) => sellerId === undefined || p.seller?.id === sellerId);

  const myProductIds = new Set(mine.map((p) => p.id));
  const myInventory = (inventory ?? []).filter((e) => myProductIds.has(e.product.id));

  const stockByProduct = new Map<string, number>();
  for (const e of myInventory) {
    stockByProduct.set(e.product.id, (stockByProduct.get(e.product.id) ?? 0) + e.available);
  }
  const isLowProduct = (p: Product) => myInventory.some((e) => e.product.id === p.id && e.isLowStock);

  const productRows: ProductRow[] = mine.map((p) => ({
    product: p,
    stock: stockByProduct.get(p.id) ?? 0,
    low: isLowProduct(p),
  }));

  const lowEntries = myInventory.filter((e) => e.isLowStock).slice(0, 6);
  const availableUnits = myInventory.reduce((sum, e) => sum + e.available, 0);

  const loading = products === null || inventory === null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {greeting()}, {firstName}
          </h1>
          <p className="page-sub">{today()} · your listings and stock, live</p>
        </div>
        <Link to="/shop" className="btn btn-outline">
          View my products in the store
        </Link>
      </div>

      {error ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="kpis">
        <StatCard
          label="My products"
          value={loading ? "…" : String(mine.length)}
          sub="Listed in the storefront"
          tone="brand"
          icon={<BoxIcon />}
        />
        <StatCard
          label="Inventory SKUs"
          value={loading ? "…" : String(myInventory.length)}
          sub={`${loading ? "…" : availableUnits.toLocaleString("en-IN")} units available`}
          tone="info"
          icon={<LayersIcon />}
        />
        <StatCard
          label="Low stock SKUs"
          value={loading ? "…" : String(myInventory.filter((e) => e.isLowStock).length)}
          sub={myInventory.some((e) => e.isLowStock) ? "need reorder attention" : "all levels healthy"}
          tone="warning"
          icon={<AlertIcon />}
        />
        <StatCard
          label="Plus"
          value="+"
          sub="Put a new product on the store"
          tone="success"
          icon={<PlusIcon />}
        />
      </div>

      <div className="dash-grid-main">
        <section className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <BoxIcon /> My products
            </h3>
            <span className="panel-meta">{productRows.length} listed</span>
          </div>
          <div className="panel-body flush">
            {loading ? (
              <div className="store-state mini-state">
                <span className="spinner" aria-hidden="true" />
                <p>Loading…</p>
              </div>
            ) : productRows.length === 0 ? (
              <div className="module-empty">
                <span className="module-empty-ico">
                  <BoxIcon />
                </span>
                <h2>No products listed yet</h2>
                <p>Products you add in the catalog will show up here.</p>
              </div>
            ) : (
              <DataTable columns={productColumns} rows={productRows} />
            )}
          </div>
        </section>

        <aside className="dash-stack">
          <section className="panel">
            <div className="panel-head">
              <h3 className="panel-title">
                <AlertIcon /> Low stock
              </h3>
            </div>
            <div className="panel-body mini-list">
              {inventory === null ? (
                <div className="store-state mini-state">
                  <p>Loading…</p>
                </div>
              ) : lowEntries.length === 0 ? (
                <div className="mini-empty">
                  <CheckCircleIcon />
                  <p>No low-stock SKUs. Your inventory is healthy.</p>
                </div>
              ) : (
                lowEntries.map((e) => {
                  const pct = Math.min(
                    100,
                    Math.round((e.available / Math.max(e.lowStockThreshold, 1)) * 100),
                  );
                  return (
                    <div className="mini-row" key={e.id}>
                      <span className="mono-tile sm">{e.product.name.charAt(0)}</span>
                      <span className="mini-main">
                        <span className="mini-title">{e.product.name}</span>
                        <span className="mini-sub">
                          {e.available} available · threshold {e.lowStockThreshold}
                        </span>
                        <span className="stock-bar">
                          <span style={{ width: `${pct}%` }} />
                        </span>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
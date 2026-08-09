import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { apiRequest, ApiError } from "../../lib/api";
import DataTable, { type Column } from "../../components/dashboard/DataTable";
import StatCard from "../../components/dashboard/StatCard";
import type { Product } from "../../lib/types";
import { formatINR } from "../../lib/types";
import type { Inventory } from "./InventoryOverview";
import type { ManagedUser } from "./UsersPage";
import {
  AlertIcon,
  BoxIcon,
  CheckCircleIcon,
  LayersIcon,
  UserIcon,
  UsersIcon,
} from "../../components/icons";

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
    header: "From",
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

const userColumns: Column<ManagedUser>[] = [
  { key: "name", header: "Customer", render: (u) => <span className="cell-strong">{u.name}</span> },
  { key: "email", header: "Email", render: (u) => <span className="cell-muted">{u.email}</span> },
  {
    key: "phone",
    header: "Phone",
    render: (u) =>
      u.phone ? <span className="mono">{u.phone}</span> : <span className="cell-muted">—</span>,
  },
  {
    key: "verified",
    header: "Verification",
    render: (u) =>
      u.isPhoneVerified ? (
        <span className="badge badge-success">Verified</span>
      ) : (
        <span className="badge badge-warning">Unverified</span>
      ),
  },
  {
    key: "active",
    header: "Status",
    render: (u) =>
      u.isActive ? (
        <span className="badge badge-info">Active</span>
      ) : (
        <span className="badge badge-danger">Inactive</span>
      ),
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "Admin";

  const [products, setProducts] = useState<Product[] | null>(null);
  const [inventory, setInventory] = useState<Inventory[] | null>(null);
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [productData, inventoryData, userData] = await Promise.all([
        apiRequest<Product[]>("/products"),
        apiRequest<Inventory[]>("/inventory").catch(() => [] as Inventory[]),
        apiRequest<ManagedUser[]>("/users/getAll").catch(() => [] as ManagedUser[]),
      ]);
      setProducts(productData);
      setInventory(inventoryData);
      setUsers(userData.filter((u) => u.role === "CUSTOMER"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load dashboard data.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stockByProduct = new Map<string, number>();
  for (const e of inventory ?? []) {
    stockByProduct.set(e.product.id, (stockByProduct.get(e.product.id) ?? 0) + e.available);
  }
  const isLowProduct = (p: Product) =>
    (inventory ?? []).some((e) => e.product.id === p.id && e.isLowStock);

  const productRows: ProductRow[] = (products ?? []).map((p) => ({
    product: p,
    stock: stockByProduct.get(p.id) ?? 0,
    low: isLowProduct(p),
  }));

  const lowEntries = (inventory ?? []).filter((e) => e.isLowStock).slice(0, 6);
  const availableUnits = (inventory ?? []).reduce((sum, e) => sum + e.available, 0);

  const loading = products === null || inventory === null || users === null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {greeting()}, {firstName}
          </h1>
          <p className="page-sub">{today()} · live data from the platform</p>
        </div>
      </div>

      {error ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="kpis">
        <StatCard
          label="Products live"
          value={products !== null ? String(products.length) : "…"}
          sub="Listed on the storefront"
          tone="brand"
          icon={<BoxIcon />}
        />
        <StatCard
          label="Inventory SKUs"
          value={inventory !== null ? String(inventory.length) : "…"}
          sub={`${inventory !== null ? availableUnits.toLocaleString("en-IN") : "…"} units available`}
          tone="info"
          icon={<LayersIcon />}
        />
        <StatCard
          label="Low stock SKUs"
          value={inventory !== null ? String((inventory ?? []).filter((e) => e.isLowStock).length) : "…"}
          sub={(inventory ?? []).some((e) => e.isLowStock) ? "need reorder attention" : "all levels healthy"}
          tone="warning"
          icon={<AlertIcon />}
        />
        <StatCard
          label="Customers"
          value={users !== null ? String(users.length) : "…"}
          sub={`${users !== null ? users.filter((u) => u.isPhoneVerified).length : "…"} phone-verified`}
          tone="success"
          icon={<UsersIcon />}
        />
      </div>

      <div className="dash-grid-main">
        <section className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <BoxIcon /> Products on the platform
            </h3>
            <span className="panel-meta">
              {productRows.length} {productRows.length === 1 ? "product" : "products"}
            </span>
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
                <h2>No products yet</h2>
                <p>Sellers haven&apos;t listed anything.</p>
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
                  <p>No low-stock SKUs. Inventory is healthy.</p>
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

      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">
            <UserIcon /> Customers
          </h3>
          <span className="panel-meta">Latest registered accounts</span>
        </div>
        <div className="panel-body flush">
          {users === null ? (
            <div className="store-state mini-state">
              <span className="spinner" aria-hidden="true" />
              <p>Loading…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="module-empty">
              <span className="module-empty-ico">
                <UsersIcon />
              </span>
              <h2>No customers yet</h2>
              <p>Accounts appear as people sign up.</p>
            </div>
          ) : (
            <DataTable columns={userColumns} rows={users.slice(0, 8)} />
          )}
        </div>
      </section>
    </>
  );
}
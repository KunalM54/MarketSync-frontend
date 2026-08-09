import { useCallback, useEffect, useState } from "react";
import { apiRequest, ApiError } from "../../lib/api";
import DataTable, { type Column } from "../../components/dashboard/DataTable";
import { AlertIcon, LayersIcon } from "../../components/icons";

export interface Inventory {
  id: string;
  product: { id: string; name: string; slug: string };
  variantId: string;
  sku: string;
  stock: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const columns: Column<Inventory>[] = [
  {
    key: "product",
    header: "Product",
    render: (e) => (
      <div className="cell-product">
        <span className="mono-tile">{e.product.name.charAt(0)}</span>
        <span>
          <span className="cell-strong">{e.product.name}</span>
          <span className="cell-sub">{e.sku}</span>
        </span>
      </div>
    ),
  },
  { key: "stock", header: "Stock", align: "right", render: (e) => e.stock.toLocaleString("en-IN") },
  { key: "reserved", header: "Reserved", align: "right", render: (e) => e.reserved.toLocaleString("en-IN") },
  { key: "available", header: "Available", align: "right", render: (e) => e.available.toLocaleString("en-IN") },
  {
    key: "threshold",
    header: "Low-stock alert",
    align: "right",
    render: (e) => `≤ ${e.lowStockThreshold}`,
  },
  {
    key: "status",
    header: "Status",
    render: (e) =>
      e.isLowStock ? (
        <span className="badge badge-warning">Low</span>
      ) : (
        <span className="badge badge-success">OK</span>
      ),
  },
];

export default function InventoryOverview({ title = "Inventory" }: { title?: string }) {
  const [entries, setEntries] = useState<Inventory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setEntries(null);
    try {
      const data = await apiRequest<Inventory[]>("/inventory");
      setEntries(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load inventory.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const lowCount = (entries ?? []).filter((e) => e.isLowStock).length;
  const availableUnits = (entries ?? []).reduce((sum, e) => sum + e.available, 0);

  return (
    <div className="dash-module">
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p className="page-sub">
            Real stock levels per SKU — {entries ? entries.length : "…"} entries,
            {lowCount > 0 ? ` ${lowCount} low` : ""}.
            {entries ? ` ${availableUnits.toLocaleString("en-IN")} units available.` : ""}
          </p>
        </div>
      </div>

      {error ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      ) : null}

      {entries === null ? (
        <div className="store-state">
          <span className="spinner" aria-hidden="true" />
          <p>Loading inventory…</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="module-empty">
          <span className="module-empty-ico">
            <LayersIcon />
          </span>
          <h2>No inventory records</h2>
          <p>Inventory entries appear here once products are listed and tracked.</p>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <LayersIcon /> Stock by SKU
            </h3>
            <span className="panel-meta">{entries.length} records</span>
          </div>
          <div className="panel-body flush">
            <DataTable columns={columns} rows={entries} />
          </div>
        </div>
      )}
    </div>
  );
}
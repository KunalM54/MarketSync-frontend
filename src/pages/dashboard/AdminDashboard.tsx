import { useAuth } from "../../lib/auth";
import DataTable, { type Column } from "../../components/dashboard/DataTable";
import { DonutChart, LineChart } from "../../components/dashboard/Charts";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Stars from "../../components/dashboard/Stars";
import {
  adminActivity,
  adminOrders,
  adminOrdersSeries,
  adminRevenue,
  adminTopProducts,
  formatINR,
  lowStock,
  monthLabels,
  orderStatusSegments,
  recentCustomers,
  type MockCustomer,
  type MockOrder,
  type MockProduct,
} from "../../lib/mock";
import {
  AlertIcon,
  BoxIcon,
  CartIcon,
  ChartIcon,
  CheckCircleIcon,
  LayersIcon,
  UsersIcon,
} from "../../components/icons";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const today = () =>
  new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const orderColumns: Column<MockOrder>[] = [
  { key: "id", header: "Order", render: (o) => <span className="mono">{o.id}</span> },
  { key: "customer", header: "Customer", render: (o) => <span className="cell-strong">{o.customer}</span> },
  { key: "date", header: "Date", render: (o) => <span className="cell-muted">{o.date}</span> },
  { key: "items", header: "Items", align: "right", render: (o) => o.items },
  { key: "total", header: "Total", align: "right", render: (o) => formatINR(o.total) },
  { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
];

const productColumns: Column<MockProduct>[] = [
  {
    key: "product",
    header: "Product",
    render: (p) => (
      <div className="cell-product">
        <span className="mono-tile">{p.name.charAt(0)}</span>
        <span>
          <span className="cell-strong">{p.name}</span>
          <span className="cell-sub">
            {p.sku} · {p.category}
          </span>
        </span>
      </div>
    ),
  },
  { key: "sold", header: "Sold", align: "right", render: (p) => p.sold.toLocaleString("en-IN") },
  { key: "revenue", header: "Revenue", align: "right", render: (p) => formatINR(p.revenue) },
  { key: "rating", header: "Rating", render: (p) => <Stars rating={p.rating} /> },
  {
    key: "stock",
    header: "Stock",
    align: "right",
    render: (p) => <span className={p.stock <= p.threshold ? "text-warn" : undefined}>{p.stock}</span>,
  },
];

const customerColumns: Column<MockCustomer>[] = [
  { key: "name", header: "Customer", render: (c) => <span className="cell-strong">{c.name}</span> },
  { key: "email", header: "Email", render: (c) => <span className="cell-muted">{c.email}</span> },
  { key: "orders", header: "Orders", align: "right", render: (c) => c.orders },
  { key: "spent", header: "Lifetime", align: "right", render: (c) => formatINR(c.spent) },
  { key: "joined", header: "Joined", render: (c) => <span className="cell-muted">{c.joined}</span> },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "Admin";

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {greeting()}, {firstName}
          </h1>
          <p className="page-sub">{today()}</p>
        </div>
      </div>

      <div className="kpis">
        <StatCard label="Total revenue" value="₹48.29L" delta={12.4} sub="vs ₹42.9L last month" tone="brand" icon={<ChartIcon />} />
        <StatCard label="Orders" value="1,204" delta={8.1} sub="vs 1,114 last month" tone="info" icon={<CartIcon />} />
        <StatCard label="Customers" value="3,482" delta={5.3} sub="+176 this month" tone="success" icon={<UsersIcon />} />
        <StatCard label="Low stock SKUs" value="8" sub="4 need reorder today" tone="warning" icon={<LayersIcon />} />
      </div>

      <div className="dash-grid-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">
                <ChartIcon /> Revenue
              </h3>
              <p className="panel-meta">This year · ₹48.29L total</p>
            </div>
            <div className="legend">
              <span className="legend-key">
                <span className="swatch brand" /> Revenue
              </span>
              <span className="legend-key">
                <span className="swatch accent" /> Orders
              </span>
            </div>
          </div>
          <div className="panel-body">
            <LineChart data={adminRevenue} data2={adminOrdersSeries} labels={monthLabels} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <CheckCircleIcon /> Orders by status
            </h3>
          </div>
          <div className="panel-body donut-panel">
            <div className="donut-wrap">
              <DonutChart segments={orderStatusSegments} />
              <div className="donut-center">
                <strong>1,204</strong>
                <span>total orders</span>
              </div>
            </div>
            <div className="donut-legend">
              {orderStatusSegments.map((s) => (
                <div className="donut-legend-row" key={s.label}>
                  <span className="swatch" style={{ background: s.color }} />
                  <span>{s.label}</span>
                  <span className="donut-legend-val">{s.value.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="dash-grid-main">
        <section className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <CartIcon /> Recent orders
            </h3>
            <span className="panel-meta">View all</span>
          </div>
          <div className="panel-body flush">
            <DataTable columns={orderColumns} rows={adminOrders} />
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
              {lowStock.map((p) => {
                const pct = Math.min(100, Math.round((p.stock / p.threshold) * 100));
                return (
                  <div className="mini-row" key={p.sku}>
                    <span className="mono-tile sm">{p.name.charAt(0)}</span>
                    <span className="mini-main">
                      <span className="mini-title">{p.name}</span>
                      <span className="mini-sub">
                        {p.stock} left · {p.reserved} reserved
                      </span>
                      <span className="stock-bar">
                        <span style={{ width: `${pct}%` }} />
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h3 className="panel-title">
                <LayersIcon /> Recent activity
              </h3>
            </div>
            <div className="panel-body mini-list">
              {adminActivity.map((a, i) => (
                <div className="mini-row" key={i}>
                  <span className={`activity-dot ${a.tone ?? ""}`} />
                  <span className="mini-main">
                    <span className="mini-title">{a.text}</span>
                    <span className="mini-sub">{a.time}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">
            <BoxIcon /> Top products
          </h3>
          <span className="panel-meta">By revenue this month</span>
        </div>
        <div className="panel-body flush">
          <DataTable columns={productColumns} rows={adminTopProducts} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">
            <UsersIcon /> New customers
          </h3>
          <span className="panel-meta">Latest signups</span>
        </div>
        <div className="panel-body flush">
          <DataTable columns={customerColumns} rows={recentCustomers} />
        </div>
      </section>
    </>
  );
}

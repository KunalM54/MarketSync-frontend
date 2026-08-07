import { useAuth } from "../../lib/auth";
import DataTable, { type Column } from "../../components/dashboard/DataTable";
import { DonutChart, LineChart } from "../../components/dashboard/Charts";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Stars from "../../components/dashboard/Stars";
import {
  formatINR,
  lowStock,
  monthLabels,
  sellerOrders,
  sellerRevenue,
  sellerStatusSegments,
  sellerTopProducts,
  sellerReviews,
  type MockOrder,
  type MockProduct,
} from "../../lib/mock";
import {
  AlertIcon,
  BoxIcon,
  CartIcon,
  ChartIcon,
  CheckCircleIcon,
  StarIcon,
  WalletIcon,
} from "../../components/icons";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

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

export default function SellerDashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "Seller";

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {greeting()}, {firstName}
          </h1>
          <p className="page-sub">Your store overview · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      <div className="kpis">
        <StatCard label="Store revenue" value="₹1.04L" delta={9.2} sub="This month so far" tone="brand" icon={<ChartIcon />} />
        <StatCard label="Orders" value="342" delta={6.4} sub="41 pending fulfilment" tone="info" icon={<CartIcon />} />
        <StatCard label="Active products" value="48" delta={3} sub="12 listed this month" tone="success" icon={<BoxIcon />} />
        <StatCard label="Avg rating" value="4.8 ★" sub="128 reviews · +0.2 pts" tone="warning" icon={<StarIcon />} />
      </div>

      <div className="dash-grid-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">
                <ChartIcon /> Sales
              </h3>
              <p className="panel-meta">Revenue · last 12 months</p>
            </div>
          </div>
          <div className="panel-body">
            <LineChart data={sellerRevenue} labels={monthLabels} />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              <CheckCircleIcon /> Order fulfilment
            </h3>
          </div>
          <div className="panel-body donut-panel">
            <div className="donut-wrap">
              <DonutChart segments={sellerStatusSegments} />
              <div className="donut-center">
                <strong>342</strong>
                <span>orders</span>
              </div>
            </div>
            <div className="donut-legend">
              {sellerStatusSegments.map((s) => (
                <div className="donut-legend-row" key={s.label}>
                  <span className="swatch" style={{ background: s.color }} />
                  <span>{s.label}</span>
                  <span className="donut-legend-val">{s.value}</span>
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
            <DataTable columns={orderColumns} rows={sellerOrders} />
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
              {lowStock.slice(0, 4).map((p) => {
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
                <WalletIcon /> Next payout
              </h3>
            </div>
            <div className="panel-body payout-card">
              <div className="payout-amount">{formatINR(28460)}</div>
              <p>Estimated settlement for the current cycle, arriving on Aug 12.</p>
              <div className="payout-progress">
                <span style={{ width: "72%" }} />
              </div>
              <div className="payout-labels">
                <span>₹20,480 paid</span>
                <span>₹28,460 pending</span>
              </div>
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
          <DataTable columns={productColumns} rows={sellerTopProducts} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">
            <StarIcon /> Latest reviews
          </h3>
          <span className="panel-meta">4.8 average across 128 reviews</span>
        </div>
        <div className="panel-body">
          <div className="review-grid">
            {sellerReviews.map((r) => (
              <article className="review-card" key={r.customer}>
                <div className="review-top">
                  <span className="avatar sm">{r.customer.charAt(0)}</span>
                  <span className="review-who">
                    <span className="cell-strong">{r.customer}</span>
                    <span className="mini-sub">{r.date}</span>
                  </span>
                  <Stars rating={r.rating} />
                </div>
                <p className="review-text">{r.text}</p>
                <p className="review-product">{r.product}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

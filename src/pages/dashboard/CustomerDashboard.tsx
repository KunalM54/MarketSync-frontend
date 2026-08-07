import { useAuth } from "../../lib/auth";
import DataTable, { type Column } from "../../components/dashboard/DataTable";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import Stars from "../../components/dashboard/Stars";
import {
  customerAddresses,
  customerOrders,
  formatINR,
  recommended,
  type MockOrder,
} from "../../lib/mock";
import {
  BoxIcon,
  CartIcon,
  CheckCircleIcon,
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  TruckIcon,
  UserIcon,
} from "../../components/icons";

const orderColumns: Column<MockOrder>[] = [
  { key: "id", header: "Order", render: (o) => <span className="mono">{o.id}</span> },
  { key: "date", header: "Placed", render: (o) => <span className="cell-muted">{o.date}</span> },
  { key: "items", header: "Items", align: "right", render: (o) => o.items },
  { key: "total", header: "Total", align: "right", render: (o) => formatINR(o.total) },
  { key: "payment", header: "Payment", render: (o) => <span className="cell-muted">{o.payment}</span> },
  { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "there";
  const orders = customerOrders;

  return (
    <>
      <div className="welcome-banner">
        <div className="welcome-copy">
          <span className="pill-light">Free shipping on orders over ₹999</span>
          <h1>Hey {firstName} 👋</h1>
          <p>Your order <span className="mono light">ORD-1042</span> is out for delivery. Track it anytime from Orders.</p>
        </div>
        <div className="banner-ico" aria-hidden="true">
          <TruckIcon />
        </div>
      </div>

      <div className="kpis">
        <StatCard label="Orders placed" value={String(orders.length + 8)} delta={12} sub="All time" tone="brand" icon={<CartIcon />} />
        <StatCard label="In transit" value="1" sub="Arriving Aug 8" tone="info" icon={<TruckIcon />} />
        <StatCard label="Delivered" value="9" delta={4} sub="This quarter" tone="success" icon={<CheckCircleIcon />} />
        <StatCard label="Wishlist" value="6" sub="2 items on sale" tone="warning" icon={<HeartIcon />} />
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
            <DataTable columns={orderColumns} rows={orders} />
          </div>
        </section>

        <aside className="dash-stack">
          <section className="panel">
            <div className="panel-head">
              <h3 className="panel-title">
                <UserIcon /> My account
              </h3>
            </div>
            <div className="panel-body">
              <div className="account-card">
                <span className="avatar lg">{user?.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}</span>
                <div>
                  <div className="cell-strong">{user?.name}</div>
                  <div className="mini-sub">{user?.email}</div>
                  <div className="mini-sub">{user?.phone ?? "No phone added"}</div>
                </div>
              </div>
              <div className="account-role">
                <span className="badge badge-neutral">Customer account</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h3 className="panel-title">
                <MapPinIcon /> Addresses
              </h3>
            </div>
            <div className="panel-body mini-list">
              {customerAddresses.map((a) => (
                <div className="address-card" key={a.label}>
                  <div className="address-top">
                    <span className="cell-strong">{a.label}</span>
                    {a.isDefault ? <span className="badge badge-info">Default</span> : null}
                  </div>
                  <p className="address-lines">
                    {a.line1}
                    <br />
                    {a.line2}
                    <br />
                    {a.city}
                  </p>
                  <p className="address-phone">
                    <PhoneIcon /> {a.phone}
                  </p>
                </div>
              ))}
              <button type="button" className="add-address">
                <PlusIcon /> Add address
              </button>
            </div>
          </section>
        </aside>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">
            <BoxIcon /> Picked for you
          </h3>
          <span className="panel-meta">Based on your recent orders</span>
        </div>
        <div className="panel-body">
          <div className="product-grid">
            {recommended.map((p) => (
              <article className="product-card" key={p.name}>
                <div className="product-tile" aria-hidden="true">
                  {p.name.charAt(0)}
                </div>
                <div className="product-body">
                  <h4 className="product-name">{p.name}</h4>
                  <div className="product-meta">
                    <span>{p.category}</span>
                    <Stars rating={p.rating} />
                  </div>
                  <div className="price-row">
                    <span className="price">
                      {formatINR(p.price)}
                      {p.oldPrice ? <s className="price-old">{formatINR(p.oldPrice)}</s> : null}
                    </span>
                    <button type="button" className="add-btn" title="Add to cart" aria-label={`Add ${p.name} to cart`}>
                      <CartIcon />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

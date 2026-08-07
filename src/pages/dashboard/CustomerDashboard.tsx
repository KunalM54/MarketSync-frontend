import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { useCart } from "../../lib/cart";
import { apiRequest, ApiError } from "../../lib/api";
import DataTable, { type Column } from "../../components/dashboard/DataTable";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/dashboard/StatusBadge";
import ProductImage from "../../components/store/ProductImage";
import {
  customerAddresses,
  customerOrders,
  formatINR,
  type MockOrder,
} from "../../lib/mock";
import { formatINR as formatINRReal, type Product } from "../../lib/types";
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

const realPrice = (p: Product) =>
  p.variants.length > 0 ? Math.min(...p.variants.map((v) => v.price)) : null;

const categoryName = (p: Product) =>
  typeof p.category === "object" && p.category !== null ? p.category.name : "";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const firstName = user?.name.split(" ")[0] ?? "there";
  const orders = customerOrders;

  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [addNotice, setAddNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest<Product[]>("/products")
      .then((data) => {
        if (!cancelled) setLiveProducts(data.slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setLiveProducts(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const quickAdd = async (p: Product) => {
    const variant = p.variants.find((v) => v.isActive) ?? p.variants[0];
    if (!variant) return;
    setAdding(p.id);
    setAddNotice(null);
    try {
      await addItem(variant.id, 1);
      setAddNotice(`Added “${variant.name}” to your cart`);
    } catch (err) {
      setAddNotice(err instanceof ApiError ? err.message : "Could not add to cart.");
    } finally {
      setAdding(null);
    }
  };

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

      {addNotice ? (
        <div className="alert alert-success" role="status">
          <CheckCircleIcon />
          <span>{addNotice}</span>
        </div>
      ) : null}

      <section className="panel">
        <div className="panel-head">
          <h3 className="panel-title">
            <BoxIcon /> Picked for you
          </h3>
          <span className="panel-meta">From the store · <Link to="/shop" className="view-all">View all</Link></span>
        </div>
        <div className="panel-body">
          <div className="product-grid">
            {(liveProducts ?? []).map((p) => {
              const price = realPrice(p);
              const variant = p.variants.find((v) => v.isActive) ?? p.variants[0];
              return (
                <Link to={`/shop/${p.id}`} className="product-card" key={p.id}>
                  <div className="product-tile">
                    <ProductImage src={p.images[0]} alt={p.name} fallbackChar={p.name.charAt(0)} />
                  </div>
                  <div className="product-body">
                    <h4 className="product-name">{p.name}</h4>
                    <div className="product-meta">
                      <span>{categoryName(p)}</span>
                      {p.variants.length > 1 ? <span>{p.variants.length} options</span> : null}
                    </div>
                    <div className="price-row">
                      <span className="price">
                        {price !== null ? formatINRReal(price) : "—"}
                      </span>
                      <button
                        type="button"
                        className="add-btn"
                        title="Add to cart"
                        aria-label={`Add ${p.name} to cart`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!variant) return;
                          void quickAdd(p);
                        }}
                        disabled={adding === p.id || !variant}
                      >
                        {adding === p.id ? <span className="spinner" /> : <CartIcon />}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}

            {liveProducts === null ? (
              <div className="store-state mini-state">
                <p>Products will appear here once sellers list them.</p>
                <Link to="/shop" className="btn btn-outline btn-sm">
                  Browse store
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

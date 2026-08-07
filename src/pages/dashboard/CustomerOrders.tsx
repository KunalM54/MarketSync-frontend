import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/dashboard/StatusBadge";
import ProductImage from "../../components/store/ProductImage";
import { apiRequest, ApiError } from "../../lib/api";
import { formatINR, type Order, type OrderItem } from "../../lib/types";
import { AlertIcon, CartIcon } from "../../components/icons";

const itemName = (item: OrderItem) =>
  typeof item.product === "object" && item.product !== null
    ? item.product.name
    : item.name;

const itemImage = (item: OrderItem) =>
  typeof item.product === "object" && item.product !== null
    ? item.product.images?.[0] ?? ""
    : "";

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest<Order[]>("/orders");
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Could not load your orders.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dash-module">
      <div className="page-head">
        <div>
          <h1>Orders</h1>
          <p className="page-sub">Your purchase history, newest first.</p>
        </div>
        <Link to="/shop" className="btn btn-outline">
          Continue shopping
        </Link>
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
          <p>Loading your orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="module-empty">
          <span className="module-empty-ico">
            <CartIcon />
          </span>
          <h2>No orders yet</h2>
          <p>When you buy something it will show up here with live payment status.</p>
          <Link to="/shop" className="btn btn-primary">
            Go to shop
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <section className="panel order-card" key={order._id}>
              <div className="order-card-head">
                <div>
                  <span className="order-id mono">{order.razorpayOrderId}</span>
                  <span className="order-date cell-muted">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <StatusBadge status={(order.status ?? "pending").toUpperCase()} />
              </div>
              <div className="order-card-items">
                {order.items.map((item) => (
                  <div className="order-item" key={item.variantId}>
                    <span className="cell-thumb sm">
                      <ProductImage src={itemImage(item)} alt={itemName(item)} fallbackChar={itemName(item).charAt(0)} />
                    </span>
                    <span className="order-item-name">
                      <span className="cell-strong">{itemName(item)}</span>
                      <span className="cell-sub">SKU: {item.sku} · {item.quantity} × {formatINR(item.price)}</span>
                    </span>
                    <span className="order-item-total">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="order-card-foot">
                <span className="cell-muted">{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                <span className="order-total">
                  Total: <strong>{formatINR(order.totalAmount ?? (order as any).total)}</strong>
                </span>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

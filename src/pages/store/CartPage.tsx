import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import StoreNavbar from "../../components/store/StoreNavbar";
import ProductImage from "../../components/store/ProductImage";
import QuantityStepper from "../../components/store/QuantityStepper";
import { useAuth } from "../../lib/auth";
import { useCart } from "../../lib/cart";
import { apiRequest, ApiError } from "../../lib/api";
import { payForOrder } from "../../lib/checkout";
import { formatINR, type CheckoutResponse } from "../../lib/types";
import { AlertIcon, CartIcon, TrashIcon } from "../../components/icons";

export default function CartPage() {
  const { user } = useAuth();
  const { cart, loading, updateQuantity, removeItem, refresh } = useCart();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  if (!user) {
    return (
      <>
        <StoreNavbar />
        <main className="store-page">
          <div className="container">
            <div className="store-state">
              <CartIcon />
              <h2>Sign in to view your cart</h2>
              <p>Your cart is saved to your account across devices.</p>
              <Link to="/login" state={{ from: "/cart" }} className="btn btn-primary">
                Sign in
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const handleQuantity = async (variantId: string, quantity: number) => {
    setError(null);
    try {
      await updateQuantity(variantId, quantity);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update quantity.");
    }
  };

  const handleRemove = async (variantId: string) => {
    setRemoving(variantId);
    setError(null);
    try {
      await removeItem(variantId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove item.");
    } finally {
      setRemoving(null);
    }
  };

  const handleCheckout = async () => {
    setBusy(true);
    setError(null);
    try {
      const checkout = await apiRequest<CheckoutResponse>("/payment/checkout", {
        method: "POST",
      });

      await payForOrder(checkout, {
        name: user.name,
        email: user.email,
        contact: user.phone,
      });

      await refresh();

      navigate(
        `/checkout/success?order=${checkout.order._id}&payment=${checkout.razorpayOrder.id}&amount=${checkout.order.totalAmount}`,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment could not be completed.");
      setBusy(false);
    }
  };

  const items = cart?.items ?? [];

  return (
    <>
      <StoreNavbar />
      <main className="store-page">
        <div className="container">
          <header className="store-head">
            <div>
              <span className="kicker">Your cart</span>
              <h1>Shopping cart</h1>
              <p>{cart ? `${cart.totalItems} ${cart.totalItems === 1 ? "item" : "items"}` : "Review your items before checkout."}</p>
            </div>
          </header>

          {error ? (
            <div className="alert alert-error" role="alert">
              <AlertIcon />
              <span>{error}</span>
            </div>
          ) : null}

          {loading ? (
            <div className="store-state">
              <span className="spinner" aria-hidden="true" />
              <p>Loading your cart…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="store-state">
              <CartIcon />
              <h2>Your cart is empty</h2>
              <p>Browse the store and add something you love.</p>
              <Link to="/shop" className="btn btn-primary">
                Go to shop
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-list">
                {items.map((item) => (
                  <article className="cart-item" key={item.variantId}>
                    <Link to={`/shop/${item.product.id}`} className="cart-item-media">
                      <ProductImage src={item.image} alt={item.name} fallbackChar={item.name.charAt(0)} />
                    </Link>
                    <div className="cart-item-info">
                      <Link to={`/shop/${item.product.id}`} className="cart-item-name">
                        {item.name}
                      </Link>
                      <span className="cell-sub">SKU: {item.sku}</span>
                      <div className="cart-item-controls">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(q) => void handleQuantity(item.variantId, q)}
                        />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => void handleRemove(item.variantId)}
                          disabled={removing === item.variantId}
                          aria-label={`Remove ${item.name}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">{formatINR(item.lineTotal)}</div>
                  </article>
                ))}
              </div>

              <aside className="cart-summary">
                <h3>Order summary</h3>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatINR(cart?.subtotal ?? 0)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free">Free</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatINR(cart?.subtotal ?? 0)}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => void handleCheckout()}
                  disabled={busy || items.length === 0}
                >
                  {busy ? <span className="spinner" /> : null}
                  {busy ? "Opening payment…" : "Proceed to checkout"}
                </button>
                <p className="summary-note">
                  You'll be redirected to Razorpay to complete the payment securely.
                </p>
                <Link to="/shop" className="summary-continue">
                  ← Continue shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { useCart } from "../../lib/cart";
import { CartIcon } from "../icons";
import ConfirmDialog from "../ConfirmDialog";

const LogoMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8 12 3l9 5-9 5-9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

export default function StoreNavbar() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const home = user ? (user.role === "CUSTOMER" ? "/shop" : "/dashboard") : "/";

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/");
  };

  return (
    <header className="navbar" id="store-top">
      <div className="container navbar-inner">
        <Link to={home} className="brand" title={user ? "Go to your home" : "CommerceX"}>
          <span className="brand-mark">
            <LogoMark />
          </span>
          CommerceX
        </Link>

        <nav className="nav-links" aria-label="Store">
          {!user ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/shop">Shop</Link>
            </>
          ) : user.role === "CUSTOMER" ? (
            <>
              <Link to="/shop">Shop</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/account">Account</Link>
            </>
          ) : null}
        </nav>

        <div className="nav-actions">
          <Link to="/cart" className="icon-btn cart-btn" title="Cart" aria-label={`Cart, ${count} items`}>
            <CartIcon />
            {count > 0 ? <span className="cart-badge">{count > 99 ? "99+" : count}</span> : null}
          </Link>
          {user ? (
            <>
              {user.role !== "CUSTOMER" ? (
                <Link to="/dashboard" className="btn btn-outline btn-sm">
                  Dashboard
                </Link>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmSignOut(true)}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmSignOut}
        title="Sign out of CommerceX?"
        message="You'll need to sign in again to continue shopping."
        confirmLabel="Sign out"
        danger
        pending={signingOut}
        onConfirm={() => void handleSignOut()}
        onCancel={() => setConfirmSignOut(false)}
      />
    </header>
  );
}
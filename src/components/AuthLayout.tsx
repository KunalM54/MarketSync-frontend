import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const LogoMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8 12 3l9 5-9 5-9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const POINTS = [
  {
    title: "One workspace for everything",
    body: "Products, inventory, orders, and payments — no tab-hopping.",
  },
  {
    title: "Built for every role",
    body: "Dedicated views for customers, sellers, and admins.",
  },
  {
    title: "Secure by default",
    body: "JWT auth, role-based access, and phone verification.",
  },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-brand">
        <div className="auth-brand-inner">
          <Link to="/" className="auth-brand-top">
            <span className="brand-mark">
              <LogoMark />
            </span>
            CommerceX
          </Link>

          <h2>The workspace your store deserves.</h2>
          <p className="auth-brand-sub">
            Sell smarter with products, inventory, and orders in one beautifully simple platform.
          </p>

          <ul className="auth-points">
            {POINTS.map((p) => (
              <li className="auth-point" key={p.title}>
                <span className="auth-point-ico">
                  <CheckIcon />
                </span>
                <span className="auth-point-body">
                  <b>{p.title}</b>
                  <span>{p.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="auth-quote">
            <p>One workspace. Every essential. Nothing you don&apos;t need.</p>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-shell">
          <Link to="/" className="brand auth-mobile-brand">
            <span className="brand-mark">
              <LogoMark />
            </span>
            CommerceX
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}

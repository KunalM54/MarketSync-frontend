import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

/* ------------------------------------------------------------------ */
/* Small icon set (inline SVG, no dependencies)                        */
/* ------------------------------------------------------------------ */

type IconProps = { size?: number };

const Icon = ({ size = 20, children }: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const LogoMark = () => (
  <span className="brand-mark" aria-hidden="true">
    <Icon size={16}>
      <path d="M3 8 12 3l9 5-9 5-9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </Icon>
  </span>
);

const CartIcon = () => (
  <Icon>
    <circle cx="9" cy="20" r="1.6" />
    <circle cx="17" cy="20" r="1.6" />
    <path d="M3 3h2l2.6 12.4a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
  </Icon>
);

const BoxIcon = () => (
  <Icon>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="M3 8l9 5 9-5" />
    <path d="M12 13v8" />
  </Icon>
);

const LayersIcon = () => (
  <Icon>
    <path d="M12 2 2 7l10 5 10-5-10-5Z" />
    <path d="m2 17 10 5 10-5" />
    <path d="m2 12 10 5 10-5" />
  </Icon>
);

const BoltIcon = () => (
  <Icon>
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
  </Icon>
);

const ChartIcon = () => (
  <Icon>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M7 14l4-4 3 3 5-6" />
  </Icon>
);

const ShieldIcon = () => (
  <Icon>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    icon: <LayersIcon />,
    title: "Multi-vendor marketplace",
    body: "One platform for customers, sellers, and admins — each with a focused workspace and the right permissions.",
  },
  {
    icon: <BoxIcon />,
    title: "Inventory intelligence",
    body: "Track stock, reserved units, and low-stock thresholds across every variant. Never oversell again.",
  },
  {
    icon: <CartIcon />,
    title: "Orders & payments",
    body: "Checkout, Razorpay payments, and verification built in — with clear status every step of the way.",
  },
  {
    icon: <ChartIcon />,
    title: "Real-time analytics",
    body: "Revenue, orders by status, and top products surfaced on a clean, filterable dashboard.",
  },
  {
    icon: <BoltIcon />,
    title: "Fast by default",
    body: "React + Vite frontend, typed end to end, with instant feedback on every action you take.",
  },
  {
    icon: <ShieldIcon />,
    title: "Secure by design",
    body: "JWT auth, role-based access, and phone verification keep every account and order safe.",
  },
];

const BARS = [34, 52, 40, 66, 58, 82, 70, 92, 78, 60, 86, 96];

function HeroMockup() {
  return (
    <div className="mockup" aria-hidden="true">
      <div className="mockup-bar">
        <div className="traffic">
          <span />
          <span />
          <span />
        </div>
        <div className="address">app.commercex.io/admin/overview</div>
      </div>
      <div className="mockup-body">
        <aside className="mockup-sidebar">
          <div className="m-item active">
            <span className="m-ico" /> Overview
          </div>
          <div className="m-item">
            <span className="m-ico" /> Products
          </div>
          <div className="m-item">
            <span className="m-ico" /> Inventory
          </div>
          <div className="m-item">
            <span className="m-ico" /> Orders
          </div>
          <div className="m-item">
            <span className="m-ico" /> Customers
          </div>
          <div className="m-item">
            <span className="m-ico" /> Reports
          </div>
        </aside>
        <div className="mockup-main">
          <div className="m-head">
            <strong>Overview</strong>
            <span className="pill">● Live</span>
          </div>
          <div className="m-stats">
            <div className="m-stat">
              <div className="lbl">Revenue</div>
              <div className="val up">$48,290</div>
            </div>
            <div className="m-stat">
              <div className="lbl">Orders</div>
              <div className="val">1,204</div>
            </div>
            <div className="m-stat">
              <div className="lbl">Low stock</div>
              <div className="val warn">8</div>
            </div>
          </div>
          <div className="m-chart">
            {BARS.map((h, i) => (
              <div key={i} className="bar" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="navbar" id="top">
        <div className="container navbar-inner">
          <Link to="/" className="brand">
            <LogoMark />
            CommerceX
          </Link>
          <nav className="nav-links">
            <a href="#features">Features</a>
          </nav>
          <div className="nav-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-outline btn-sm">
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => void signOut()}
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
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1>
              Your store&apos;s entire backend, <span className="grad">beautifully simplified</span>
            </h1>
            <p className="hero-sub">
              Products, inventory, orders, and payments in one clean workspace — for
              customers, sellers, and admins alike. Professional tooling, zero clutter.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary">
                Start selling — it&apos;s free
              </Link>
              <a href="#features" className="btn btn-outline">
                See how it works
              </a>
            </div>
            <HeroMockup />
          </div>
        </section>

        <section className="section" id="features">
          <div className="container">
            <div className="section-head">
              <div className="kicker">Why CommerceX</div>
              <h2>Everything your store needs. Nothing it doesn&apos;t.</h2>
              <p>
                Built for real commerce teams — the essentials done extremely well,
                with room to grow.
              </p>
            </div>
            <div className="features">
              {FEATURES.map((f) => (
                <article className="feature" key={f.title}>
                  <div className="f-ico">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-flush" id="cta">
          <div className="container">
            <div className="cta-band">
              <h2>Ready to move faster?</h2>
              <p>
                Join the sellers already running their store on CommerceX. Set up
                takes minutes, not months.
              </p>
              <Link to="/register" className="btn btn-white">
                Create your free account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <Link to="/" className="brand">
              <LogoMark />
              CommerceX
            </Link>
            <p className="footer-tag">The commerce platform for modern sellers.</p>
          </div>
          <nav className="footer-links">
            <a href="#features">Features</a>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Back to top
            </a>
          </nav>
          <span className="footer-copy">© 2026 CommerceX</span>
        </div>
      </footer>
    </>
  );
}

import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type AuthUser } from "../../lib/auth";
import ModulePlaceholder from "./ModulePlaceholder";
import {
  BellIcon,
  BoxIcon,
  CartIcon,
  ChartIcon,
  CreditCardIcon,
  HeartIcon,
  HomeIcon,
  LayersIcon,
  LogoutIcon,
  MapPinIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  StoreIcon,
  UsersIcon,
  WalletIcon,
} from "../icons";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const NAV: Record<string, NavGroup[]> = {
  ADMIN: [
    { items: [{ id: "overview", label: "Overview", icon: <HomeIcon /> }] },
    {
      label: "Manage",
      items: [
        { id: "products", label: "Products", icon: <BoxIcon /> },
        { id: "inventory", label: "Inventory", icon: <LayersIcon /> },
        { id: "orders", label: "Orders", icon: <CartIcon /> },
        { id: "customers", label: "Customers", icon: <UsersIcon /> },
        { id: "sellers", label: "Sellers", icon: <StoreIcon /> },
        { id: "payments", label: "Payments", icon: <CreditCardIcon /> },
      ],
    },
    { label: "Insights", items: [{ id: "reports", label: "Reports", icon: <ChartIcon /> }] },
    { label: "System", items: [{ id: "settings", label: "Settings", icon: <SettingsIcon /> }] },
  ],
  SELLER: [
    { items: [{ id: "overview", label: "Overview", icon: <HomeIcon /> }] },
    {
      label: "Manage",
      items: [
        { id: "products", label: "Products", icon: <BoxIcon /> },
        { id: "inventory", label: "Inventory", icon: <LayersIcon /> },
        { id: "orders", label: "Orders", icon: <CartIcon /> },
        { id: "reviews", label: "Reviews", icon: <StarIcon /> },
      ],
    },
    { label: "Finance", items: [{ id: "payouts", label: "Payouts", icon: <WalletIcon /> }] },
    { label: "Account", items: [{ id: "settings", label: "Settings", icon: <SettingsIcon /> }] },
  ],
  CUSTOMER: [
    { items: [{ id: "overview", label: "Overview", icon: <HomeIcon /> }] },
    {
      label: "Shopping",
      items: [
        { id: "orders", label: "Orders", icon: <CartIcon /> },
        { id: "addresses", label: "Addresses", icon: <MapPinIcon /> },
        { id: "wishlist", label: "Wishlist", icon: <HeartIcon /> },
      ],
    },
    { label: "Account", items: [{ id: "settings", label: "Settings", icon: <SettingsIcon /> }] },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator",
  SELLER: "Seller",
  CUSTOMER: "Customer",
};

const DESCRIPTIONS: Record<string, string> = {
  products: "Manage the full product catalog — add, edit, and organize listings across every category.",
  inventory: "Track stock, reserved units, and restock thresholds so you never oversell.",
  orders: "Review and manage every order on the platform, from checkout to delivery.",
  customers: "Browse your customer base, order history, and lifetime value.",
  sellers: "Approve and manage seller stores, ratings, and account health.",
  payments: "Reconcile payments, refunds, and Razorpay settlements.",
  reports: "Export revenue, tax, and performance reports for any date range.",
  settings: "Configure store, team, and notification preferences.",
  reviews: "Read and respond to reviews left on your products.",
  payouts: "Track your earnings and scheduled payout cycles.",
  addresses: "Manage the delivery addresses on your account.",
  wishlist: "Products you have saved for later.",
};

const LogoMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8 12 3l9 5-9 5-9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

export default function DashboardLayout({ overview, user }: { overview: ReactNode; user: AuthUser }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  const groups = NAV[user.role] ?? NAV.CUSTOMER;
  const activeLabel =
    groups.flatMap((g) => g.items).find((i) => i.id === active)?.label ?? "Overview";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const select = (id: string) => {
    setActive(id);
    setMenuOpen(false);
  };

  return (
    <div className="dash">
      <div
        className={`side-scrim ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside className={`dash-sidebar ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="side-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">
            <LogoMark />
          </span>
          CommerceX
        </Link>

        <nav className="side-nav" aria-label="Dashboard">
          {groups.map((group, gi) => (
            <div className="side-group" key={gi}>
              {group.label ? <div className="side-group-label">{group.label}</div> : null}
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`side-item ${active === item.id ? "active" : ""}`}
                  onClick={() => select(item.id)}
                  aria-current={active === item.id ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="side-user">
          <span className="avatar">{initials(user.name)}</span>
          <span className="side-user-meta">
            <span className="side-user-name">{user.name}</span>
            <span className="side-user-role">{ROLE_LABEL[user.role] ?? user.role}</span>
          </span>
          <button
            type="button"
            className="icon-btn signout-btn"
            onClick={() => void handleSignOut()}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <button
            type="button"
            className="icon-btn dash-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <div className="dash-title">{activeLabel}</div>
          <div className="dash-search">
            <SearchIcon />
            <input type="search" placeholder="Search products, orders…" aria-label="Search" />
          </div>
          <div className="top-actions">
            <button type="button" className="icon-btn" aria-label="Notifications" title="Notifications">
              <BellIcon />
              <span className="dot" />
            </button>
            <span className="avatar top-avatar" title={user.name}>
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main className="dash-content">
          {active === "overview" ? (
            overview
          ) : (
            <ModulePlaceholder
              title={activeLabel}
              description={DESCRIPTIONS[active] ?? "This module is under construction."}
            />
          )}
        </main>
      </div>
    </div>
  );
}

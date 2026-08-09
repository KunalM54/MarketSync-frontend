import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type AuthUser } from "../../lib/auth";
import ModulePlaceholder from "./ModulePlaceholder";
import SellerProducts from "../../pages/dashboard/seller/SellerProducts";
import CustomerOrders from "../../pages/dashboard/CustomerOrders";
import AccountSettings from "../../pages/dashboard/AccountSettings";
import InventoryOverview from "../../pages/dashboard/InventoryOverview";
import ProductsOverview from "../../pages/dashboard/ProductsOverview";
import UsersPage from "../../pages/dashboard/UsersPage";
import ConfirmDialog from "../ConfirmDialog";
import {
  BoxIcon,
  HomeIcon,
  LayersIcon,
  LogoutIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  StoreIcon,
  UsersIcon,
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
        { id: "customers", label: "Customers", icon: <UsersIcon /> },
        { id: "sellers", label: "Sellers", icon: <StoreIcon /> },
      ],
    },
    { label: "Account", items: [{ id: "settings", label: "Settings", icon: <SettingsIcon /> }] },
  ],
  SELLER: [
    { items: [{ id: "overview", label: "Overview", icon: <HomeIcon /> }] },
    {
      label: "Manage",
      items: [
        { id: "products", label: "Products", icon: <BoxIcon /> },
        { id: "inventory", label: "Inventory", icon: <LayersIcon /> },
      ],
    },
    { label: "Account", items: [{ id: "settings", label: "Settings", icon: <SettingsIcon /> }] },
  ],
  CUSTOMER: [
    { items: [{ id: "overview", label: "Overview", icon: <HomeIcon /> }] },
    {
      label: "Shopping",
      items: [{ id: "orders", label: "Orders", icon: <BoxIcon /> }],
    },
    { label: "Account", items: [{ id: "settings", label: "Settings", icon: <SettingsIcon /> }] },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator",
  SELLER: "Seller",
  CUSTOMER: "Customer",
};

// Real (API-backed) modules keyed by role → nav id.
const LIVE_MODULES: Record<string, Record<string, ReactNode>> = {
  ADMIN: {
    products: <ProductsOverview />,
    inventory: <InventoryOverview />,
    customers: <UsersPage roleFilter="CUSTOMER" title="Customers" sub="People who shop on the platform." />,
    sellers: <UsersPage roleFilter="SELLER" title="Sellers" sub="Accounts that list products on the platform." />,
    settings: <AccountSettings />,
  },
  SELLER: {
    products: <SellerProducts />,
    inventory: <InventoryOverview title="My inventory" />,
    settings: <AccountSettings />,
  },
  CUSTOMER: {
    orders: <CustomerOrders />,
    settings: <AccountSettings />,
  },
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
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const groups = NAV[user.role] ?? NAV.CUSTOMER;
  const activeLabel =
    groups.flatMap((g) => g.items).find((i) => i.id === active)?.label ?? "Overview";

  const handleSignOut = async () => {
    setSigningOut(true);
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
            onClick={() => setConfirmSignOut(true)}
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
            <span className="avatar top-avatar" title={user.name}>
              {initials(user.name)}
            </span>
          </div>
        </header>

        <main className="dash-content">
          {active === "overview" ? (
            overview
          ) : LIVE_MODULES[user.role]?.[active] ? (
            LIVE_MODULES[user.role][active]
          ) : (
            <ModulePlaceholder
              title={activeLabel}
              description="This module is under construction."
            />
          )}
        </main>
      </div>

      <ConfirmDialog
        open={confirmSignOut}
        title="Sign out of CommerceX?"
        message="You'll need to sign in again to manage your store."
        confirmLabel="Sign out"
        danger
        pending={signingOut}
        onConfirm={() => void handleSignOut()}
        onCancel={() => setConfirmSignOut(false)}
      />
    </div>
  );
}
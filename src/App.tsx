import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { CartProvider } from "./lib/cart";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import StoreNavbar from "./components/store/StoreNavbar";
import AccountSettings from "./pages/dashboard/AccountSettings";
import CustomerOrders from "./pages/dashboard/CustomerOrders";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SellerDashboard from "./pages/dashboard/SellerDashboard";
import StorePage from "./pages/store/Store";
import ProductDetailPage from "./pages/store/ProductDetail";
import CartPage from "./pages/store/CartPage";
import OrderSuccessPage from "./pages/store/OrderSuccess";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function DashboardRoute() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Customers live on the storefront, never the admin/seller-style dashboard.
  if (user.role === "CUSTOMER") return <Navigate to="/shop" replace />;

  const overview =
    user.role === "ADMIN" ? (
      <AdminDashboard />
    ) : (
      <SellerDashboard />
    );

  return <DashboardLayout user={user} overview={overview} />;
}

function StoreFooter() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-tag">CommerceX — shop with confidence.</span>
        <span className="footer-copy">© 2026 CommerceX</span>
      </div>
    </footer>
  );
}

function OrdersPage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "CUSTOMER") return <Navigate to="/dashboard" replace />;

  return (
    <>
      <StoreNavbar />
      <main className="store-page">
        <div className="container">
          <CustomerOrders />
        </div>
      </main>
      <StoreFooter />
    </>
  );
}

function AccountPage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "CUSTOMER") return <Navigate to="/dashboard" replace />;

  return (
    <>
      <StoreNavbar />
      <main className="store-page">
        <div className="container">
          <AccountSettings />
        </div>
      </main>
      <StoreFooter />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<DashboardRoute />} />
            <Route path="/shop" element={<StorePage />} />
            <Route path="/shop/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/success" element={<OrderSuccessPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
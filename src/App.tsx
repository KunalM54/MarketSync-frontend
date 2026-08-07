import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SellerDashboard from "./pages/dashboard/SellerDashboard";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";

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

  const overview =
    user.role === "ADMIN" ? (
      <AdminDashboard />
    ) : user.role === "SELLER" ? (
      <SellerDashboard />
    ) : (
      <CustomerDashboard />
    );

  return <DashboardLayout user={user} overview={overview} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

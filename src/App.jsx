import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./stores/useAuthStore";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import AccountDetail from "./pages/AccountDetail";
import SellAccount from "./pages/SellAccount";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import TestConnection from "./pages/TestConnection";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import Orders from "./pages/dashboard/Orders";
import Wishlist from "./pages/dashboard/Wishlist";
import Messages from "./pages/dashboard/Messages";
import ProfileSettings from "./pages/dashboard/ProfileSettings";
import useWishlistStore from "./stores/useWishlistStore";
import SellerDashboardLayout from "./components/dashboard/SellerDashboardLayout";
import SellerOverview from "./pages/seller/SellerOverview";
import ListingsManagement from "./pages/seller/ListingsManagement";
import SellerOrders from "./pages/seller/SellerOrders";
import Revenue from "./pages/seller/Revenue";
import Verification from "./pages/seller/Verification";
import SelectRole from "./pages/SelectRole";
import SellerProfile from "./pages/SellerProfile";
import BuyConfirmModal from "./components/marketplace/BuyConfirmModal";
import { useLocation } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import Users from "./pages/admin/Users";
import AdminAccounts from "./pages/admin/Accounts";
import AdminOrders from "./pages/admin/Orders";
import Verifications from "./pages/admin/Verifications";
import Reports from "./pages/admin/Reports";
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const fetchWishlistIds = useWishlistStore((state) => state.fetchWishlistIds);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      fetchWishlistIds();
    } else {
      clearWishlist();
    }
  }, [user]);

  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(10, 10, 10, 0.9)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          },
        }}
      />
      <BuyConfirmModal />
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/account/:id" element={<AccountDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/test" element={<TestConnection />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route
            path="/profile"
            element={<Navigate to="/dashboard/profile" replace />}
          />
          <Route
            path="/settings"
            element={<Navigate to="/dashboard/settings" replace />}
          />

          {/* Protected Routes */}
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <SellAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Messages />} />
            <Route path="reviews" element={<Messages />} />
            <Route path="recent" element={<Messages />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>

          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute allowedRoles={["seller", "admin"]}>
                <SellerDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SellerOverview />} />
            <Route path="listings" element={<ListingsManagement />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="messages" element={<Messages />} />
            <Route path="verification" element={<Verification />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="settings" element={<ProfileSettings />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<Users />} />
            <Route path="accounts" element={<AdminAccounts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="verifications" element={<Verifications />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

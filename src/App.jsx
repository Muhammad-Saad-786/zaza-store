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
import Disputes from "./pages/admin/Disputes";
import PlayerChecker from "./components/mlbb/PlayerChecker";
import useOnlineStatus from "./stores/useOnlineStatus";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Cookies from "./pages/Cookies";
import useCookieConsent from "./stores/useCookieConsent";
import CookieBanner from "./components/ui/CookieBanner";
import PaymentModal from "./components/payment/PaymentModal";
import PaymentSettings from "./pages/seller/PaymentSettings";
import Notifications from "./pages/dashboard/Notifications";
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
  const { setOnline, setOffline, updateLastSeen, subscribeToOnlineUsers } =
    useOnlineStatus();
  // Subscribe to online users
  useEffect(() => {
    const unsubscribe = subscribeToOnlineUsers();
    return () => unsubscribe();
  }, []);

  // Set online/offline when user logs in/out
  useEffect(() => {
    if (user) {
      setOnline();

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        updateLastSeen();
      }, 30000);

      // Set offline on close/refresh
      const handleBeforeUnload = () => setOffline();
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        clearInterval(heartbeat);
        setOffline();
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [user]);

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

  // Cookies
  const initCookies = useCookieConsent((state) => state.init);

  useEffect(() => {
    initCookies();
  }, []);

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
      <CookieBanner />
      <BuyConfirmModal />
      <PaymentModal />

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
          <Route path="/player-checker" element={<PlayerChecker />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/cookies" element={<Cookies />} />

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
            <Route path="notifications" element={<Notifications />} />
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
            <Route path="payment-settings" element={<PaymentSettings />} />
            <Route path="notifications" element={<Notifications />} />
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
            <Route path="disputes" element={<Disputes />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

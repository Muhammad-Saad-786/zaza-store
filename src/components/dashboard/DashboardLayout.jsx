import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineBell,
  HiOutlineMail,
  HiOutlineStar,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineEye,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import useBuyerDashboardStore from "../../stores/useBuyerDashboardStore";
import Logo from "../shared/Logo";
import Button from "../ui/Button";

const navItems = [
  { icon: HiOutlineHome, label: "Dashboard", path: "/dashboard" },
  { icon: HiOutlineShoppingBag, label: "My Orders", path: "/dashboard/orders" },
  { icon: HiOutlineHeart, label: "Wishlist", path: "/dashboard/wishlist" },
  { icon: HiOutlineMail, label: "Messages", path: "/dashboard/messages" },
  {
    icon: HiOutlineBell,
    label: "Notifications",
    path: "/dashboard/notifications",
  },
  { icon: HiOutlineStar, label: "Reviews", path: "/dashboard/reviews" },
  { icon: HiOutlineEye, label: "Recently Viewed", path: "/dashboard/recent" },
  { icon: HiOutlineUser, label: "Profile", path: "/dashboard/profile" },
  { icon: HiOutlineCog, label: "Settings", path: "/dashboard/settings" },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuthStore();
  const { stats } = useBuyerDashboardStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-brand-dark flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-card border-r border-glass-border flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-glass-border">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-purple/20 text-brand-purple"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-brand-purple" : ""}`}
                />
                <span>{item.label}</span>
                {item.label === "Wishlist" && stats.wishlistCount > 0 && (
                  <span className="ml-auto bg-brand-purple text-white text-xs rounded-full px-2 py-0.5">
                    {stats.wishlistCount}
                  </span>
                )}
                {item.label === "Messages" && stats.unreadMessages > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {stats.unreadMessages}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-glass-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center font-bold text-white">
              {profile?.username?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.username}
              </p>
              <p className="text-xs text-white/40 capitalize">
                {profile?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl transition-colors"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 glass-card border-b border-glass-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-white/60 hover:text-white"
          >
            {sidebarOpen ? (
              <HiOutlineX className="w-6 h-6" />
            ) : (
              <HiOutlineMenu className="w-6 h-6" />
            )}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <Link
              to="/marketplace"
              className="text-sm text-brand-purple hover:text-brand-gold transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

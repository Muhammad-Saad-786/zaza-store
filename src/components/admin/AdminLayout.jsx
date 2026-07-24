import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineCollection,
  HiOutlineShoppingBag,
  HiOutlineShieldCheck,
  HiOutlineFlag,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineExclamation,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import Logo from "../shared/Logo";

const navItems = [
  { icon: HiOutlineHome, label: "Overview", path: "/admin" },
  { icon: HiOutlineUsers, label: "Users", path: "/admin/users" },
  { icon: HiOutlineCollection, label: "Accounts", path: "/admin/accounts" },
  { icon: HiOutlineShoppingBag, label: "Orders", path: "/admin/orders" },
  {
    icon: HiOutlineShieldCheck,
    label: "Verifications",
    path: "/admin/verifications",
  },
  { icon: HiOutlineFlag, label: "Reports", path: "/admin/reports" },
  { icon: HiOutlineExclamation, label: "Disputes", path: "/admin/disputes" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-dark flex">
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-card border-r border-glass-border flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-glass-border">
          <Logo />
          <p className="text-xs text-red-400 mt-1 font-medium">Admin Panel</p>
        </div>

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
                    ? "bg-red-500/20 text-red-400"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-red-400" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-glass-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-brand-purple flex items-center justify-center font-bold text-white">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                profile?.username?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {profile?.username}
              </p>
              <p className="text-xs text-red-400">Admin</p>
            </div>
          </div>
          <button
            onClick={() => {
              signOut();
              navigate("/");
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl"
          >
            <HiOutlineLogout className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 glass-card border-b border-glass-border px-6 py-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-white/60 hover:text-white mr-4"
          >
            {sidebarOpen ? (
              <HiOutlineX className="w-6 h-6" />
            ) : (
              <HiOutlineMenu className="w-6 h-6" />
            )}
          </button>
          <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

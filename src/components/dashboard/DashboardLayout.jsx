import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineShoppingCart,
  HiOutlineHeart,
  HiOutlineChatAlt2,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineHome,
  HiOutlineExternalLink,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import useBuyerDashboardStore from "../../stores/useBuyerDashboardStore";

function NavLink({ to, icon: Icon, label, badge, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
        isActive
          ? "bg-[#f5a623] text-[#121217] shadow-lg shadow-[#f5a623]/20"
          : "text-white/80 hover:bg-[#1f1f29] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={`flex-shrink-0 ${isActive ? "text-[#121217]" : "text-[#f5a623]"}`}
          style={{ width: "18px", height: "18px" }}
        />
        <span className="text-sm">{label}</span>
      </div>
      {badge > 0 && (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
            isActive
              ? "bg-[#121217]/20 text-[#121217]"
              : "bg-[#f5a623] text-[#121217]"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function NavAccordion({ icon: Icon, label, isOpen, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-white/80 font-semibold hover:bg-[#1f1f29] hover:text-white transition-all"
      >
        <div className="flex items-center gap-3">
          <Icon
            className="text-[#f5a623] flex-shrink-0"
            style={{ width: "18px", height: "18px" }}
          />
          <span className="text-sm">{label}</span>
        </div>
        {isOpen ? (
          <HiOutlineChevronUp className="w-4 h-4 text-white/40" />
        ) : (
          <HiOutlineChevronDown className="w-4 h-4 text-white/40" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-5 pr-1 pt-1 pb-1 space-y-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubNavLink({ to, label, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
        isActive
          ? "bg-[#f5a623] text-[#121217] font-bold"
          : "text-white hover:bg-[#1f1f29]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(true);

  const { profile, signOut } = useAuthStore();
  const { stats } = useBuyerDashboardStore();
  const navigate = useNavigate();

  const close = () => setSidebarOpen(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const regDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      })
    : "—";

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── User Profile ── */}
      <div className="p-4 border-b border-[#262636] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1f1f29] border-2 border-[#f5a623]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/narutu.png"
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">
            {profile?.username || "Buyer"}
          </p>
          <p className="text-[11px] text-white/40">Registered: {regDate}</p>
        </div>
      </div>

      {/* ── Primary CTA ── */}
      <div className="px-4 py-3 border-b border-[#262636]">
        <Link
          to="/marketplace"
          onClick={close}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#f5a623] hover:bg-[#e0961f] text-[#121217] text-sm font-black rounded-xl transition-all shadow-lg shadow-[#f5a623]/20 active:scale-95"
        >
          Browse Marketplace
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {/* Overview */}
        <NavLink
          to="/dashboard"
          icon={HiOutlineHome}
          label="Overview"
          onClick={close}
        />

        {/* Orders Accordion */}
        <NavAccordion
          icon={HiOutlineShoppingCart}
          label="Orders"
          isOpen={ordersOpen}
          onToggle={() => setOrdersOpen(!ordersOpen)}
        >
          <SubNavLink
            to="/dashboard/orders"
            label="Purchased Orders"
            onClick={close}
          />
          <SubNavLink
            to="/seller-dashboard/orders"
            label="Sold Orders"
            onClick={close}
          />
        </NavAccordion>

        {/* Wishlist */}
        <NavLink
          to="/dashboard/wishlist"
          icon={HiOutlineHeart}
          label="Wishlist"
          onClick={close}
        />

        {/* Divider */}
        <div className="pt-2 pb-1">
          <div className="border-t border-[#262636]" />
        </div>

        {/* Messages */}
        <NavLink
          to="/dashboard/messages"
          icon={HiOutlineChatAlt2}
          label="Messages"
          badge={stats?.unreadMessages}
          onClick={close}
        />

        {/* Notifications */}
        <NavLink
          to="/dashboard/notifications"
          icon={HiOutlineBell}
          label="Notifications"
          onClick={close}
        />

        {/* Settings */}
        <NavLink
          to="/dashboard/profile"
          icon={HiOutlineCog}
          label="Settings"
          onClick={close}
        />
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-[#262636] space-y-1.5">
        {/* Become a Seller link */}
        <Link
          to="/seller-dashboard"
          onClick={close}
          className="flex items-center justify-between w-full px-3 py-2 bg-[#1f1f29] hover:bg-[#262636] rounded-xl border border-[#2e2e3e] hover:border-[#f5a623]/30 transition-all group"
        >
          <span className="text-xs font-semibold text-white/50 group-hover:text-white">
            Become a Seller
          </span>
          <HiOutlineExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-[#f5a623]" />
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors"
        >
          <HiOutlineLogout className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121217] text-white flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#16161e] border-r border-[#262636] flex-col flex-shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "tween", duration: 0.25 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-[#16161e] border-r border-[#262636] flex flex-col lg:hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-[#16161e] border-b border-[#262636] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white hover:text-[#f5a623] transition-colors"
          >
            {sidebarOpen ? (
              <HiOutlineX className="w-5 h-5" />
            ) : (
              <HiOutlineMenu className="w-5 h-5" />
            )}
          </button>
          <span className="text-sm font-bold text-white">My Dashboard</span>
          <Link to="/marketplace" className="text-xs font-bold text-[#f5a623]">
            Browse
          </Link>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

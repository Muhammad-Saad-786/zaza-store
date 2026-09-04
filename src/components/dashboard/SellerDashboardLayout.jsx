import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineShoppingCart,
  HiOutlineTag,
  HiOutlineShieldCheck,
  HiOutlineCash,
  HiOutlineChatAlt2,
  HiOutlineBell,
  HiOutlineStar,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlinePlus,
  HiOutlineChartBar,
  HiOutlineHome,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";

function NavLink({ to, icon: Icon, label, badge, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all group ${
        isActive
          ? "bg-[#f5a623] text-[#121217] shadow-lg shadow-[#f5a623]/20"
          : "text-white/80 hover:bg-[#1f1f29] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={`w-4.5 h-4.5 flex-shrink-0 ${
            isActive ? "text-[#121217]" : "text-[#f5a623]"
          }`}
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

function SubNavLink({ to, label, badge, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
        isActive
          ? "bg-[#f5a623] text-[#121217] font-bold"
          : "text-white hover:bg-[#1f1f29]"
      }`}
    >
      <span>{label}</span>
      {badge > 0 && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
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

export default function SellerDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(true);
  const [listingsOpen, setListingsOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const { profile, signOut } = useAuthStore();
  const { stats } = useSellerDashboardStore();
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
            {profile?.username || "ZAZA Seller"}
          </p>
          <p className="text-[11px] text-white/40">Registered: {regDate}</p>
        </div>
      </div>

      {/* ── Primary CTA ── */}
      <div className="px-4 py-3 border-b border-[#262636] space-y-2">
        <Link
          to="/sell"
          onClick={close}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#f5a623] hover:bg-[#e0961f] text-[#121217] text-sm font-black rounded-xl transition-all shadow-lg shadow-[#f5a623]/20 active:scale-95"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Create Listing
        </Link>
        <Link
          to="/marketplace"
          onClick={close}
          className="flex items-center justify-center gap-2 w-full py-2 bg-[#1f1f29] hover:bg-[#262636] text-white/70 hover:text-white text-xs font-semibold rounded-xl transition-all border border-[#2e2e3e]"
        >
          Browse Marketplace
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {/* Overview */}
        <NavLink
          to="/seller-dashboard"
          icon={HiOutlineHome}
          label="Overview"
          onClick={close}
        />

        {/* Orders */}
        <NavAccordion
          icon={HiOutlineShoppingCart}
          label="Orders"
          isOpen={ordersOpen}
          onToggle={() => setOrdersOpen(!ordersOpen)}
        >
          <SubNavLink
            to="/seller-dashboard/orders"
            label="Sold Orders"
            badge={stats.pendingOrders}
            onClick={close}
          />
          <SubNavLink
            to="/dashboard/orders"
            label="Purchased Orders"
            onClick={close}
          />
        </NavAccordion>

        {/* Listings */}
        <NavAccordion
          icon={HiOutlineTag}
          label="My Listings"
          isOpen={listingsOpen}
          onToggle={() => setListingsOpen(!listingsOpen)}
        >
          <SubNavLink
            to="/seller-dashboard/listings"
            label="Manage Listings"
            onClick={close}
          />
          <SubNavLink
            to="/seller-dashboard/automation"
            label="Auto-Replies"
            onClick={close}
          />
        </NavAccordion>

        {/* Wallet */}
        <NavAccordion
          icon={HiOutlineCash}
          label="Wallet"
          isOpen={walletOpen}
          onToggle={() => setWalletOpen(!walletOpen)}
        >
          <SubNavLink
            to="/seller-dashboard/revenue"
            label="Revenue & Payouts"
            onClick={close}
          />
          <SubNavLink
            to="/seller-dashboard/payment-settings"
            label="Payment Methods"
            onClick={close}
          />
        </NavAccordion>

        {/* Analytics */}
        <NavLink
          to="/seller-dashboard/analytics"
          icon={HiOutlineChartBar}
          label="Analytics"
          onClick={close}
        />

        {/* Verification */}
        <NavLink
          to="/seller-dashboard/verification"
          icon={HiOutlineShieldCheck}
          label="Verification"
          onClick={close}
        />

        {/* Divider */}
        <div className="pt-2 pb-1">
          <div className="border-t border-[#262636]" />
        </div>

        {/* Messages */}
        <NavLink
          to="/seller-dashboard/messages"
          icon={HiOutlineChatAlt2}
          label="Messages"
          onClick={close}
        />

        {/* Notifications */}
        <NavLink
          to="/dashboard/notifications"
          icon={HiOutlineBell}
          label="Notifications"
          onClick={close}
        />

        {/* Reviews */}
        <NavLink
          to="/seller-dashboard/reviews"
          icon={HiOutlineStar}
          label="Reviews"
          onClick={close}
        />

        {/* Settings */}
        <NavLink
          to="/seller-dashboard/settings"
          icon={HiOutlineCog}
          label="Settings"
          onClick={close}
        />
      </nav>

      {/* ── Footer: Balance + Logout ── */}
      <div className="px-4 py-3 border-t border-[#262636] space-y-2">
        {/* Quick balance + payout shortcut */}
        <Link
          to="/seller-dashboard/revenue"
          onClick={close}
          className="flex items-center justify-between w-full px-3 py-2.5 bg-[#1f1f29] hover:bg-[#262636] rounded-xl border border-[#2e2e3e] hover:border-green-500/30 transition-all group"
        >
          <div className="flex items-center gap-2">
            <HiOutlineCurrencyDollar className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold text-white/70 group-hover:text-white">
              Available
            </span>
          </div>
          <span className="text-sm font-black text-green-400">
            ${stats?.availableBalance?.toLocaleString() ?? "0"}
          </span>
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

      {/* Sidebar — desktop always visible, mobile slides in */}
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

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile only) */}
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
          <span className="text-sm font-bold text-white">Seller Dashboard</span>
          <Link
            to="/sell"
            className="text-xs font-black bg-[#f5a623] text-[#121217] px-3 py-1.5 rounded-lg"
          >
            + List
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

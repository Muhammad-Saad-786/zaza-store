import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineArrowRight,
} from "react-icons/hi";
import useBuyerDashboardStore from "../../stores/useBuyerDashboardStore";

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

const statCards = [
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: HiOutlineShoppingBag,
    color: "#f5a623",
    href: "/dashboard/orders",
    sub: "All time purchases",
  },
  {
    key: "pendingOrders",
    label: "Pending",
    icon: HiOutlineClock,
    color: "#facc15",
    href: "/dashboard/orders",
    sub: "Awaiting delivery",
  },
  {
    key: "completedOrders",
    label: "Completed",
    icon: HiOutlineCheck,
    color: "#4ade80",
    href: "/dashboard/orders",
    sub: "Successfully delivered",
  },
  {
    key: "wishlistCount",
    label: "Saved Items",
    icon: HiOutlineHeart,
    color: "#f87171",
    href: "/dashboard/wishlist",
    sub: "In your wishlist",
  },
];

export default function DashboardOverview() {
  const { stats, fetchStats, recentlyViewed, loadRecentlyViewed } =
    useBuyerDashboardStore();

  useEffect(() => {
    fetchStats();
    loadRecentlyViewed();
  }, []);

  const hasAnyActivity =
    (stats?.totalOrders ?? 0) > 0 || (stats?.wishlistCount ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-black text-white tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-white/40 mt-0.5">
          Your account at a glance
        </p>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.key}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="show"
          >
            <Link
              to={stat.href}
              className="flex flex-col gap-3 bg-[#1f1f29] border border-[#2e2e3e] hover:border-[#f5a623]/30 rounded-2xl p-5 transition-all group block"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                  {stat.label}
                </span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: `${stat.color}18` }}
                >
                  <stat.icon
                    style={{ color: stat.color, width: 18, height: 18 }}
                  />
                </div>
              </div>

              <div className="text-3xl font-black" style={{ color: stat.color }}>
                {stats[stat.key] || 0}
              </div>

              <div className="flex items-center justify-between border-t border-[#2e2e3e] pt-2.5">
                <span className="text-[11px] text-white/40">{stat.sub}</span>
                <HiOutlineArrowRight
                  className="w-3.5 h-3.5 text-white/20 group-hover:text-[#f5a623] transition-colors"
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Empty state (first time user) ── */}
      {!hasAnyActivity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1f1f29] border border-[#2e2e3e] rounded-2xl p-8 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#f5a623]/10 border border-[#f5a623]/20 flex items-center justify-center text-3xl mb-4">
            🎮
          </div>
          <h2 className="text-lg font-black text-white mb-1">
            Start your journey
          </h2>
          <p className="text-sm text-white/40 max-w-xs mb-5">
            Browse premium MLBB accounts in the marketplace and make your first
            purchase.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f5a623] text-[#121217] text-sm font-black rounded-xl hover:bg-[#e0961f] transition-all"
          >
            Browse Marketplace
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1f1f29] border border-[#2e2e3e] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Recently Viewed
            </h2>
            <Link
              to="/marketplace"
              className="flex items-center gap-1 text-xs text-[#f5a623] hover:underline font-bold"
            >
              Browse more <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentlyViewed.slice(0, 6).map((item, index) => (
              <Link
                key={index}
                to={`/account/${item.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#16161e] border border-[#2e2e3e] hover:border-[#f5a623]/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1f1f29] border border-[#2e2e3e] flex items-center justify-center text-lg flex-shrink-0">
                  🎮
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-semibold truncate group-hover:text-[#f5a623] transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-white/40 truncate">{item.rank}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

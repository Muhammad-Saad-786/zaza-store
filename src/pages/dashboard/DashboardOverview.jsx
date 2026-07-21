import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineBell,
  HiOutlineEye,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineClock,
} from "react-icons/hi";
import useBuyerDashboardStore from "../../stores/useBuyerDashboardStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";

const statCards = [
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: HiOutlineShoppingBag,
    color: "text-brand-purple",
    href: "/dashboard/orders",
  },
  {
    key: "pendingOrders",
    label: "Pending",
    icon: HiOutlineClock,
    color: "text-yellow-400",
    href: "/dashboard/orders",
  },
  {
    key: "completedOrders",
    label: "Completed",
    icon: HiOutlineCheck,
    color: "text-green-400",
    href: "/dashboard/orders",
  },
  {
    key: "wishlistCount",
    label: "Wishlist",
    icon: HiOutlineHeart,
    color: "text-red-400",
    href: "/dashboard/wishlist",
  },
];

export default function DashboardOverview() {
  const { stats, fetchStats, recentlyViewed, loadRecentlyViewed } =
    useBuyerDashboardStore();

  useEffect(() => {
    fetchStats();
    loadRecentlyViewed();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-extrabold text-white">
          Welcome back!
        </h1>
        <p className="text-white/40 mt-1">
          Here's what's happening with your account.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.href}>
              <GlassCard className="p-6 hover:border-brand-purple/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <HiOutlineArrowRight className="w-4 h-4 text-white/20" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {stats[stat.key] || 0}
                </div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/marketplace">
            <Button variant="primary" size="sm">
              Browse Accounts
            </Button>
          </Link>
          <Link to="/sell">
            <Button variant="gold" size="sm">
              Sell Account
            </Button>
          </Link>
          <Link to="/dashboard/wishlist">
            <Button variant="ghost" size="sm">
              View Wishlist
            </Button>
          </Link>
        </div>
      </GlassCard>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyViewed.slice(0, 6).map((item, index) => (
              <Link key={index} to={`/account/${item.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center text-lg">
                    🎮
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{item.title}</p>
                    <p className="text-xs text-white/40">{item.rank}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

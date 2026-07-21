import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineUsers,
  HiOutlineCollection,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import useAdminStore from "../../stores/useAdminStore";
import GlassCard from "../../components/ui/GlassCard";

const statCards = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: HiOutlineUsers,
    color: "text-blue-400",
    href: "/admin/users",
  },
  {
    key: "totalAccounts",
    label: "Total Accounts",
    icon: HiOutlineCollection,
    color: "text-brand-purple",
    href: "/admin/accounts",
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: HiOutlineShoppingBag,
    color: "text-cyber-neon",
    href: "/admin/orders",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: HiOutlineCurrencyDollar,
    color: "text-brand-gold",
    isCurrency: true,
  },
];

export default function AdminOverview() {
  const { stats, fetchStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Admin Overview
        </h1>
        <p className="text-white/40 mt-1">Platform management dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={stat.href}>
              <GlassCard className="p-6 hover:border-red-500/30 transition-all">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
                <div className="text-3xl font-extrabold text-white">
                  {stat.isCurrency ? "$" : ""}
                  {stats[stat.key]?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {stats.pendingVerifications > 0 && (
        <Link to="/admin/verifications">
          <GlassCard className="p-6 border border-yellow-500/30 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center gap-3">
              <HiOutlineShieldCheck className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-white font-semibold">
                  {stats.pendingVerifications} Pending Verifications
                </p>
                <p className="text-white/40 text-sm">
                  Seller verification requests need review
                </p>
              </div>
            </div>
          </GlassCard>
        </Link>
      )}
    </motion.div>
  );
}

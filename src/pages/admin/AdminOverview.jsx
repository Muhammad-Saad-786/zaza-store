import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCollection,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineShieldCheck,
  HiOutlineFlag,
  HiOutlineBan,
} from "react-icons/hi";
import useAdminStore from "../../stores/useAdminStore";
import GlassCard from "../../components/ui/GlassCard";

export default function AdminOverview() {
  const { stats, fetchStats } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: HiOutlineUsers,
      color: "text-blue-400",
      href: "/admin/users",
    },
    {
      label: "Buyers",
      value: stats.totalBuyers,
      icon: HiOutlineUserGroup,
      color: "text-cyan-400",
      href: "/admin/users",
    },
    {
      label: "Sellers",
      value: stats.totalSellers,
      icon: HiOutlineShieldCheck,
      color: "text-amber-400",
      href: "/admin/users",
    },
    {
      label: "Banned",
      value: stats.totalBanned,
      icon: HiOutlineBan,
      color: "text-red-400",
      href: "/admin/users",
    },
    {
      label: "Accounts",
      value: stats.totalAccounts,
      icon: HiOutlineCollection,
      color: "text-purple-400",
      href: "/admin/accounts",
    },
    {
      label: "Active",
      value: stats.activeAccounts,
      icon: HiOutlineCollection,
      color: "text-green-400",
      href: "/admin/accounts",
    },
    {
      label: "Orders",
      value: stats.totalOrders,
      icon: HiOutlineShoppingBag,
      color: "text-amber-400",
      href: "/admin/orders",
    },
    {
      label: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: HiOutlineCurrencyDollar,
      color: "text-green-400",
      href: "/admin/orders",
    },
  ];

  const alerts = [
    {
      label: "Pending Verifications",
      value: stats.pendingVerifications,
      color: "text-yellow-400",
      href: "/admin/verifications",
      icon: HiOutlineShieldCheck,
    },
    {
      label: "Pending Reports",
      value: stats.pendingReports,
      color: "text-red-400",
      href: "/admin/reports",
      icon: HiOutlineFlag,
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      color: "text-blue-400",
      href: "/admin/orders",
      icon: HiOutlineShoppingBag,
    },
  ];

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

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={alert.href}>
              <GlassCard className="p-5 hover:border-red-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <alert.icon className={`w-8 h-8 ${alert.color}`} />
                  <span className={`text-2xl font-extrabold ${alert.color}`}>
                    {alert.value}
                  </span>
                </div>
                <p className="text-white/40 text-sm mt-2">{alert.label}</p>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={card.href}>
              <GlassCard className="p-5 hover:border-white/10 transition-all">
                <card.icon className={`w-6 h-6 ${card.color} mb-3`} />
                <div className="text-2xl font-extrabold text-white">
                  {card.value}
                </div>
                <div className="text-white/40 text-sm mt-1">{card.label}</div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

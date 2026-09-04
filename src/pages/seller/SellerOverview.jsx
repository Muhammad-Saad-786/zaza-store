import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineCash,
  HiOutlineArrowRight,
  HiOutlineCreditCard,
  HiOutlineTrendingUp,
  HiOutlineUserGroup,
  HiOutlineEye,
} from "react-icons/hi";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import {
  RevenueTrendChart,
  OrdersBarChart,
} from "../../components/dashboard/SellerCharts";
import WithdrawalModal from "../../components/dashboard/WithdrawalModal";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }),
};

function StatCard({ label, value, sub, color, icon: Icon, action, i }) {
  return (
    <motion.div
      custom={i}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className="bg-[#1f1f29] border border-[#2e2e3e] rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
        </div>
      </div>
      <div className="text-2xl font-black" style={{ color }}>
        {value}
      </div>
      <div className="flex items-center justify-between border-t border-[#2e2e3e] pt-2.5">
        <span className="text-[11px] text-white/40">{sub}</span>
        {action && (
          <button
            onClick={action.onClick}
            className="text-[11px] font-bold text-[#f5a623] hover:underline"
          >
            {action.label} →
          </button>
        )}
        {action?.href && (
          <Link
            to={action.href}
            className="text-[11px] font-bold text-[#f5a623] hover:underline"
          >
            {action.label} →
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function MetricPill({ icon: Icon, label, value, sub, i }) {
  return (
    <motion.div
      custom={i}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className="bg-[#1f1f29] border border-[#2e2e3e] rounded-xl p-4"
    >
      <div className="flex items-center gap-2 text-[#f5a623] text-xs font-bold mb-1.5">
        <Icon style={{ width: 15, height: 15 }} />
        {label}
      </div>
      <div className="text-xl font-black text-white">{value}</div>
      <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>
    </motion.div>
  );
}

export default function SellerOverview() {
  const { stats, sellerOrders, initialize } = useSellerDashboardStore();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Your seller performance at a glance
          </p>
        </div>
      </motion.div>

      {/* ── Financial summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          i={0}
          label="Total Earnings"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          sub={`This month: $${stats.thisMonthRevenue.toLocaleString()}`}
          color="#f5a623"
          icon={HiOutlineCurrencyDollar}
        />
        <StatCard
          i={1}
          label="Available Balance"
          value={`$${stats.availableBalance.toLocaleString()}`}
          sub="Ready to withdraw"
          color="#4ade80"
          icon={HiOutlineCash}
          action={{ label: "Withdraw", onClick: () => setIsWithdrawModalOpen(true) }}
        />
        <StatCard
          i={2}
          label="In Escrow"
          value={`$${stats.pendingPayouts.toLocaleString()}`}
          sub={`${stats.inProgressOrders} order(s) in verification`}
          color="#facc15"
          icon={HiOutlineClock}
        />
        <StatCard
          i={3}
          label="Total Withdrawn"
          value={`$${stats.totalWithdrawn.toLocaleString()}`}
          sub="Processed payouts"
          color="#94a3b8"
          icon={HiOutlineCreditCard}
          action={{ label: "Ledger", href: "/seller-dashboard/revenue" }}
        />
      </div>

      {/* ── Performance metrics row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricPill
          i={4}
          icon={HiOutlineShoppingBag}
          label="Total Orders"
          value={stats.totalOrders}
          sub={`${stats.completedOrders} completed · ${stats.pendingOrders} pending`}
        />
        <MetricPill
          i={5}
          icon={HiOutlineTrendingUp}
          label="Conversion"
          value={`${stats.conversionRate}%`}
          sub="Views → purchase ratio"
        />
        <MetricPill
          i={6}
          icon={HiOutlineEye}
          label="Monthly Views"
          value={stats.monthlyViews?.toLocaleString() ?? "—"}
          sub={`~${stats.dailyViews ?? 0} daily clicks`}
        />
        <MetricPill
          i={7}
          icon={HiOutlineUserGroup}
          label="Repeat Buyers"
          value={`${stats.repeatCustomerRate}%`}
          sub="Loyal buyer volume"
        />
      </div>

      {/* ── Charts + Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-5">
          <RevenueTrendChart />
          <OrdersBarChart />
        </div>

        {/* Recent Orders */}
        <div className="bg-[#1f1f29] border border-[#2e2e3e] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Recent Orders
            </h2>
            <Link
              to="/seller-dashboard/orders"
              className="flex items-center gap-1 text-xs text-[#f5a623] hover:underline font-bold"
            >
              View all <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {sellerOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#16161e] border border-[#2e2e3e] flex items-center justify-center text-2xl mb-3">
                📦
              </div>
              <p className="text-sm font-bold text-white">No orders yet</p>
              <p className="text-xs text-white/40 mt-1 max-w-[160px]">
                Orders will appear here in real-time
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              {sellerOrders.slice(0, 6).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#16161e] border border-[#2e2e3e] hover:border-[#f5a623]/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#1f1f29] border border-[#2e2e3e] flex items-center justify-center text-sm flex-shrink-0">
                      🎮
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {order.account?.title || "MLBB Account"}
                      </p>
                      <p className="text-[10px] text-white/40 truncate">
                        {order.buyer?.username || "Guest"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-black text-[#f5a623]">
                      ${order.amount}
                    </p>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold capitalize ${
                        order.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : order.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Deep-link to full analytics */}
          <Link
            to="/seller-dashboard/analytics"
            className="mt-4 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#16161e] border border-[#2e2e3e] hover:border-[#f5a623]/30 text-xs font-bold text-white/60 hover:text-[#f5a623] transition-all"
          >
            Full Analytics <HiOutlineArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  );
}

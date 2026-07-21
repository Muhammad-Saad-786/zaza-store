import { useEffect } from "react";
import { motion } from "framer-motion";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

export default function Revenue() {
  const {
    transactions,
    transactionsLoading,
    fetchTransactions,
    stats,
    fetchStats,
  } = useSellerDashboardStore();

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  if (transactionsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Revenue
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassCard className="p-6">
          <p className="text-white/40 text-sm">Total Revenue</p>
          <p className="text-3xl font-extrabold text-gradient-gold mt-2">
            ${stats.totalRevenue.toLocaleString()}
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-white/40 text-sm">This Month</p>
          <p className="text-3xl font-extrabold text-cyber-neon mt-2">
            ${stats.thisMonthRevenue.toLocaleString()}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Transaction History
        </h2>
        {transactions.length === 0 ? (
          <p className="text-white/40 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5"
              >
                <div>
                  <p className="text-sm text-white">{tx.description}</p>
                  <p className="text-xs text-white/40">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-bold text-green-400">
                  +${tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

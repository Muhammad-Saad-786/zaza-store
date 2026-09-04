import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineCash,
  HiOutlineClock,
  HiOutlineCreditCard,
  HiOutlineDownload,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import Spinner from "../../components/ui/Spinner";
import WithdrawalModal from "../../components/dashboard/WithdrawalModal";
import { exportToCSV } from "../../lib/csvExport";

const withdrawalStatusBadge = {
  pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export default function Revenue() {
  const {
    stats,
    transactions,
    transactionsLoading,
    withdrawals,
    fetchTransactions,
    fetchWithdrawals,
    fetchStats,
  } = useSellerDashboardStore();

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchWithdrawals();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });

  const handleExportCSV = () => {
    const headers = [
      { key: "id", label: "Transaction ID" },
      { key: "created_at", label: "Date" },
      { key: "description", label: "Description" },
      { key: "type", label: "Type" },
      { key: "amount", label: "Amount ($)" },
      { key: "status", label: "Status" },
    ];
    exportToCSV("seller_revenue_transactions", filteredTransactions, headers);
  };

  if (transactionsLoading && !transactions.length) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Eldorado Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#f5a623] text-2xl font-black">︽</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Revenue & Payouts
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#1f1f29] border border-[#2e2e3e] hover:border-[#f5a623] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <HiOutlineDownload className="w-4 h-4 text-[#f5a623]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="px-5 py-2 bg-[#f5a623] hover:bg-[#e0961f] text-[#121217] text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md"
          >
            <HiOutlineCash className="w-4 h-4" />
            <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1f1f29] border border-[#2e2e3e] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70 font-bold uppercase tracking-wider">Available Balance</span>
            <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <HiOutlineCash className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-green-400 mt-2 block">
            ${stats.availableBalance?.toLocaleString()}
          </span>
          <p className="text-xs text-green-400 font-bold mt-2">Ready for withdrawal</p>
        </div>

        <div className="bg-[#1f1f29] border border-[#2e2e3e] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70 font-bold uppercase tracking-wider">Pending Escrow</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
              <HiOutlineClock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-yellow-400 mt-2 block">
            ${stats.pendingPayouts?.toLocaleString()}
          </span>
          <p className="text-xs text-white/60 mt-2">Awaiting buyer verification</p>
        </div>

        <div className="bg-[#1f1f29] border border-[#2e2e3e] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70 font-bold uppercase tracking-wider">Lifetime Total</span>
            <div className="w-8 h-8 rounded-xl bg-[#f5a623]/20 flex items-center justify-center text-[#f5a623]">
              <HiOutlineCurrencyDollar className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-[#f5a623] mt-2 block">
            ${stats.totalRevenue?.toLocaleString()}
          </span>
          <p className="text-xs text-white/60 mt-2">All completed transactions</p>
        </div>

        <div className="bg-[#1f1f29] border border-[#2e2e3e] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70 font-bold uppercase tracking-wider">Total Withdrawn</span>
            <div className="w-8 h-8 rounded-xl bg-[#16161e] border border-[#2e2e3e] flex items-center justify-center text-white">
              <HiOutlineCreditCard className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-white mt-2 block">
            ${stats.totalWithdrawn?.toLocaleString()}
          </span>
          <p className="text-xs text-white/60 mt-2">Processed payouts to date</p>
        </div>
      </div>

      {/* Withdrawal Requests History */}
      <div className="bg-[#1f1f29] border border-[#2e2e3e] p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Withdrawal History</h2>
            <p className="text-xs text-white/60">Recent payout requests and statuses</p>
          </div>
          <Link
            to="/seller-dashboard/payment-settings"
            className="text-xs text-[#f5a623] hover:underline font-bold"
          >
            Payment Settings ➔
          </Link>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-8 text-center bg-[#16161e] border border-[#2e2e3e] rounded-xl">
            <img
              src="/wallet.png"
              alt="No withdrawals"
              className="w-20 h-20 object-contain mx-auto mb-2"
              onError={(e) => {
                e.target.src = "/empty-orders.png";
              }}
            />
            <p className="text-xs font-bold text-white">No payout requests submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#16161e] text-white/60 border-b border-[#2e2e3e] uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Payout Method</th>
                  <th className="p-3">Gross Amount</th>
                  <th className="p-3">Fee (2%)</th>
                  <th className="p-3">Net Payout</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e3e]">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#16161e] transition-colors">
                    <td className="p-3 text-white/70">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-white capitalize">{w.payment_method?.replace(/_/g, " ")}</td>
                    <td className="p-3 text-white">${w.amount}</td>
                    <td className="p-3 text-red-400">-${w.fee}</td>
                    <td className="p-3 font-black text-green-400">${w.net_amount}</td>
                    <td className="p-3 text-right">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black ${withdrawalStatusBadge[w.status] || "bg-white/10"}`}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-[#1f1f29] border border-[#2e2e3e] p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Transactions Ledger</h2>
            <p className="text-xs text-white/60">Sales, refunds, and withdrawal records</p>
          </div>

          <div className="flex items-center gap-2">
            {["all", "sale", "withdrawal", "refund"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterType === type
                    ? "bg-[#f5a623] text-[#121217]"
                    : "bg-[#16161e] border border-[#2e2e3e] text-white hover:text-[#f5a623]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[#16161e] border border-[#2e2e3e] rounded-xl">
            <img
              src="/empty-orders.png"
              alt="No transactions"
              className="w-24 h-24 object-contain mb-2"
            />
            <p className="text-xs font-bold text-white">No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => {
              const isPositive = parseFloat(tx.amount) > 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#16161e] border border-[#2e2e3e] hover:border-[#f5a623]/40 transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{tx.description || "Transaction"}</p>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      {new Date(tx.created_at).toLocaleString()} • Type: <span className="capitalize font-semibold text-white">{tx.type}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isPositive ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
                    </span>
                    <span className="block text-[10px] text-white/50 uppercase font-bold">
                      {tx.status || "Completed"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </motion.div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineX,
  HiOutlineCash,
} from "react-icons/hi";
import Button from "../ui/Button";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  { id: "easypaisa", name: "Easypaisa", icon: "/Easypaisa.png", placeholder: "03XX-XXXXXXX" },
  { id: "jazzcash", name: "JazzCash", icon: "/Jazzcash.png", placeholder: "03XX-XXXXXXX" },
  { id: "bank_transfer", name: "Bank Transfer", icon: "/Bank.png", placeholder: "Account / IBAN Number" },
  { id: "sadapay", name: "SadaPay", icon: "/Sadapay.png", placeholder: "@sadapay_handle or 03XX" },
  { id: "nayapay", name: "NayaPay", icon: "/NayaPay.png", placeholder: "@nayapay_id or 03XX" },
  { id: "paypal", name: "PayPal", icon: "/Paypal.png", placeholder: "paypal_account@email.com" },
  { id: "binance_usdt", name: "Binance USDT (TRC20)", icon: "/Binance.png", placeholder: "TRC20 Wallet Address" },
];

export default function WithdrawalModal({ isOpen, onClose }) {
  const { stats, requestWithdrawal } = useSellerDashboardStore();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("easypaisa");
  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const fee = +(numAmount * 0.02).toFixed(2);
  const netPayout = Math.max(0, +(numAmount - fee).toFixed(2));
  const activeMethodObj = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numAmount < 10) {
      toast.error("Minimum withdrawal amount is $10");
      return;
    }
    if (numAmount > stats.availableBalance) {
      toast.error(`Amount exceeds your available balance ($${stats.availableBalance})`);
      return;
    }
    if (!accountNumber.trim()) {
      toast.error("Please enter account number or wallet address");
      return;
    }

    setIsSubmitting(true);
    const result = await requestWithdrawal({
      amount: numAmount,
      paymentMethod: selectedMethod,
      accountDetails: {
        title: accountTitle,
        number: accountNumber,
      },
    });
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass-modal rounded-3xl p-6 sm:p-8 border border-glass-border shadow-2xl relative space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center text-brand-gold">
              <HiOutlineCash className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-extrabold text-white">Request Payout</h2>
              <p className="text-xs text-white/40">Transfer available balance to your account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Status */}
        <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-white/40 block">Available for Withdrawal</span>
            <span className="text-2xl font-extrabold text-gradient-gold">
              ${stats.availableBalance?.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAmount(stats.availableBalance.toString())}
            className="px-3 py-1.5 rounded-lg bg-brand-gold/20 text-brand-gold text-xs font-bold hover:bg-brand-gold/30 transition-colors"
          >
            Withdraw All
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="text-xs font-semibold text-white/70 mb-1.5 block">Amount ($ USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold font-bold">$</span>
              <input
                type="number"
                min="10"
                step="any"
                max={stats.availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10.00"
                className="input-glass pl-8 pr-4 py-3 text-lg font-bold w-full"
                required
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-white/70 mb-1.5 block">Payout Method</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center gap-2 transition-all ${
                    selectedMethod === m.id
                      ? "border-brand-gold bg-brand-gold/10 text-white"
                      : "border-glass-border text-white/50 hover:border-white/20"
                  }`}
                >
                  <img src={m.icon} alt="" className="w-5 h-5 object-contain" onError={(e) => { e.target.style.display = "none"; }} />
                  <span className="truncate">{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1.5 block">Account Title / Full Name</label>
              <input
                type="text"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                placeholder="e.g. Muhammad Saad"
                className="input-glass px-4 py-2.5 text-xs w-full"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/70 mb-1.5 block">
                {activeMethodObj?.name} Number / Address
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={activeMethodObj?.placeholder}
                className="input-glass px-4 py-2.5 text-xs w-full"
                required
              />
            </div>
          </div>

          {/* Fee Breakdown Summary */}
          {numAmount > 0 && (
            <div className="p-3 bg-white/[0.02] border border-glass-border rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-white/50">
                <span>Requested Amount</span>
                <span>${numAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>Processing Fee (2%)</span>
                <span>-${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1.5 border-t border-glass-border">
                <span>Estimated Net Payout</span>
                <span className="text-green-400">${netPayout.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-glass-border">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              type="submit"
              disabled={isSubmitting || numAmount < 10 || numAmount > stats.availableBalance}
            >
              {isSubmitting ? "Processing..." : `Request $${netPayout.toFixed(2)} Payout`}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

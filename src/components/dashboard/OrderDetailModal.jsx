import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePhotograph,
  HiOutlineKey,
  HiOutlineChat,
} from "react-icons/hi";
import Button from "../ui/Button";
import GlassCard from "../ui/GlassCard";
import OnlineIndicator from "../ui/OnlineIndicator";
import { useNavigate } from "react-router-dom";
import { getPaymentProofUrl } from "../../lib/storage";
import toast from "react-hot-toast";

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onAccept,
  onReject,
  onVerifyPayment,
  onDeliverCredentials,
}) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState("");
  const [isDelivering, setIsDelivering] = useState(false);

  if (!isOpen || !order) return null;

  const timelineSteps = [
    { key: "awaiting_payment", label: "Order Placed", desc: "Buyer submitted order request" },
    { key: "payment_submitted", label: "Payment Submitted", desc: "Buyer transferred funds & uploaded proof" },
    { key: "payment_verified", label: "Payment Verified", desc: "Seller confirmed payment in escrow" },
    { key: "delivered", label: "Credentials Delivered", desc: "Account login details sent to buyer" },
    { key: "released", label: "Order Completed", desc: "Buyer confirmed & funds released" },
  ];

  const currentStepIdx = timelineSteps.findIndex(
    (s) => s.key === order.escrow_status
  );
  const activeIdx = currentStepIdx !== -1 ? currentStepIdx : order.status === "completed" ? 4 : 0;

  const handleDeliver = async () => {
    if (!credentials.trim()) {
      toast.error("Please enter account credentials (login ID & password)");
      return;
    }
    setIsDelivering(true);
    await onDeliverCredentials(order.id, credentials);
    setIsDelivering(false);
  };

  const openProof = async () => {
    if (!order.payment_proof) return;
    try {
      const url = await getPaymentProofUrl(order.payment_proof);
      if (url) {
        window.open(url, "_blank");
      }
    } catch (e) {
      toast.error("Failed to load payment screenshot");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl glass-modal rounded-3xl p-6 sm:p-8 my-8 border border-glass-border shadow-2xl relative space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-glass-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-extrabold text-white">Order Details</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-bold">
                #{order.id.slice(0, 8)}
              </span>
            </div>
            <p className="text-xs text-white/40 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Visual 5-Step Timeline */}
        <div className="p-4 bg-white/[0.02] border border-glass-border rounded-2xl">
          <h3 className="text-xs font-semibold text-white/60 mb-4 uppercase tracking-wider">
            Escrow Timeline
          </h3>
          <div className="relative flex items-center justify-between">
            {timelineSteps.map((st, i) => {
              const isPastOrCurrent = i <= activeIdx;
              const isCurrent = i === activeIdx;

              return (
                <div key={st.key} className="flex-1 flex flex-col items-center relative text-center">
                  {/* Connecting Line */}
                  {i < timelineSteps.length - 1 && (
                    <div
                      className={`absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 z-0 ${
                        i < activeIdx ? "bg-green-400" : "bg-white/10"
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-brand-gold text-brand-darker ring-4 ring-brand-gold/20 font-black"
                        : isPastOrCurrent
                        ? "bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {isPastOrCurrent && !isCurrent ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-2 font-medium max-w-[70px] leading-tight ${
                      isCurrent ? "text-brand-gold font-bold" : isPastOrCurrent ? "text-white/80" : "text-white/30"
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buyer & Account Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Buyer Card */}
          <GlassCard className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-semibold uppercase">Buyer Info</span>
              <OnlineIndicator userId={order.buyer_id} showText size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                {order.buyer?.avatar_url ? (
                  <img src={order.buyer.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  order.buyer?.username?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{order.buyer?.username || "Buyer"}</p>
                <p className="text-xs text-white/40 truncate">{order.buyer?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                navigate("/seller-dashboard/messages", {
                  state: { contactUser: { userId: order.buyer_id, username: order.buyer?.username } },
                });
              }}
            >
              <HiOutlineChat className="w-4 h-4 mr-1" /> Message Buyer
            </Button>
          </GlassCard>

          {/* Account Card */}
          <GlassCard className="p-4 space-y-3">
            <span className="text-xs text-white/40 font-semibold uppercase">Purchased Listing</span>
            <div>
              <p className="text-sm font-bold text-white line-clamp-1">{order.account?.title}</p>
              <p className="text-xs text-brand-gold mt-0.5">{order.account?.rank} • {order.account?.server}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-glass-border">
              <span className="text-xs text-white/50">Total Amount</span>
              <span className="text-lg font-extrabold text-gradient-gold">${order.amount}</span>
            </div>
          </GlassCard>
        </div>

        {/* Payment Verification & Escrow Proof */}
        {order.payment_proof && (
          <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiOutlinePhotograph className="w-6 h-6 text-cyber-neon" />
              <div>
                <p className="text-sm font-medium text-white">Buyer Payment Proof</p>
                <p className="text-xs text-white/40">Method: {order.payment_method?.replace(/_/g, " ") || "Bank / Wallet"}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={openProof}>
              View Proof Screenshot
            </Button>
          </div>
        )}

        {/* Credentials Delivery Form (When payment verified) */}
        {order.escrow_status === "payment_verified" && (
          <div className="p-4 bg-brand-purple/10 border border-brand-purple/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-brand-purple font-semibold text-sm">
              <HiOutlineKey className="w-5 h-5" />
              Deliver Account Credentials
            </div>
            <p className="text-xs text-white/60">
              Payment is secured in escrow. Provide login email, password, and bind details for the buyer.
            </p>
            <textarea
              rows={3}
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder="Moonton Email: example@mail.com&#10;Password: *******&#10;Recovery Info: ..."
              className="input-glass p-3 text-xs w-full resize-none"
            />
            <Button
              variant="gold"
              size="sm"
              disabled={isDelivering}
              onClick={handleDeliver}
              className="w-full"
            >
              {isDelivering ? "Delivering..." : "Deliver Credentials to Buyer 🚀"}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-glass-border">
          {order.status === "pending" && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onReject(order)}>
                <HiOutlineXCircle className="w-4 h-4 mr-1 text-red-400" /> Reject Order
              </Button>
              <Button variant="gold" size="sm" onClick={() => onAccept(order)}>
                <HiOutlineCheckCircle className="w-4 h-4 mr-1" /> Accept Order
              </Button>
            </>
          )}

          {order.escrow_status === "payment_submitted" && (
            <Button variant="gold" size="sm" onClick={() => onVerifyPayment(order.id)}>
              <HiOutlineCheckCircle className="w-4 h-4 mr-1" /> Verify Payment Received
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

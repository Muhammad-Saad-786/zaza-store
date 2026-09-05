import { useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import useOrderStore from "../stores/useOrderStore";
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineMail } from "react-icons/hi";

const EscrowStatus = ({ orderId }) => {
  const { user } = useAuthStore();
  const { currentOrder, fetchOrder } = useOrderStore();
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const loadPaymentStatus = async () => {
      try {
        // Try to fetch order with payment status from the order store
        if (currentOrder?.id === orderId) {
          setPaymentStatus(currentOrder.payment_status);
        } else {
          // Fetch order from Supabase to get latest payment status
          const { data: order } = await supabase
            .from("orders")
            .select("payment_status, status, escrow_status, account:accounts(title)")
            .eq("id", orderId)
            .single();

          if (order) {
            setPaymentStatus(order.payment_status);
          }
        }
      } catch (err) {
        console.warn("Failed to load payment status:", err);
      }
    };

    loadPaymentStatus();

    // Refresh when order store updates
    const unsub = currentOrder?.id !== orderId ? null : undefined;
  }, [orderId, currentOrder]);

  if (!orderId || !paymentStatus) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <HiOutlineClock className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-white/60">Loading payment status...</p>
      </div>
    );
  }

  // Determine status display based on Stripe payment_status
  const statusInfo = {
    paid: {
      title: "Payment Confirmed!",
      subtitle: "Stripe payment received and secured in escrow",
      icon: HiOutlineCheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
      action: null,
    },
    pending: {
      title: "Payment Pending",
      subtitle: "Awaiting payment confirmation",
      icon: HiOutlineClock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      action: null,
    },
    failed: {
      title: "Payment Failed",
      subtitle: "Payment could not be processed",
      icon: HiOutlineClock,
      color: "text-red-400",
      bg: "bg-red-500/10",
      action: null,
    },
  };

  const info = statusInfo[paymentStatus] || statusInfo.pending;

  return (
    <div className="bg-[#1f1f29] border border-white/5 rounded-2xl p-6 mb-6 text-left">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-white/60">Payment Status</span>
        <div className="flex items-center gap-1.5">
          <info.icon className={`w-3.5 h-3.5 text-${info.color.replace("text-", "")}`} />
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${info.bg}">
            <span className="text-xs font-semibold text-white">{info.title}</span>
          </span>
        </div>
      </div>

      <p className="text-white/40 mb-4">
        {info.subtitle}
      </p>

      {paymentStatus === "paid" && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
            <HiOutlineMail className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-400">
                Account Details Pending Delivery
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                The seller has been notified to deliver the account credentials to your orders dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-cyber-neon/5 border border-cyber-neon/10">
            <HiOutlineShieldCheck className="w-5 h-5 text-cyber-neon flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-cyber-neon">
                Escrow Protection Active
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                Your funds are held safely until you verify and confirm the account details.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowStatus;
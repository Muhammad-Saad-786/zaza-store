// src/pages/OrderConfirmation.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineArrowRight,
  HiOutlineCreditCard,
  HiOutlineClock,
} from "react-icons/hi";
import useOrderStore from "../stores/useOrderStore";
import { supabase } from "../lib/supabase";
import Button from "../components/ui/Button";
import SEO from "../components/ui/SEO";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { currentOrder, fetchOrder } = useOrderStore();
  const [verifying, setVerifying] = useState(!!sessionId);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (!orderId && !sessionId) return;

      let resolvedOrderId = orderId;

      // If returning from Stripe Checkout with session_id, verify immediately
      if (sessionId) {
        try {
          setVerifying(true);
          const { data, error } = await supabase.functions.invoke("create-checkout", {
            body: {
              action: "verify",
              session_id: sessionId,
              order_id: orderId || undefined,
            },
          });
          if (error) {
            console.warn("Session verification check warning:", error);
          } else {
            console.log("Session verified:", data);
            if (data?.order_id) {
              resolvedOrderId = data.order_id;
            }
          }
        } catch (err) {
          console.warn("Verification invoke error:", err);
        } finally {
          if (isMounted) setVerifying(false);
        }
      }

      // Fetch the updated order
      if (resolvedOrderId) {
        await fetchOrder(resolvedOrderId);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [orderId, sessionId, fetchOrder]);

  const isPaid = currentOrder?.payment_status === "paid";

  return (
    <div className="min-h-screen pt-24 pb-20">
      <SEO title="Order Confirmed" noindex={true} />

      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <HiOutlineCheckCircle className="w-12 h-12 text-green-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            {isPaid ? "Payment Confirmed!" : "Order Confirmed!"}
          </h1>
          <p className="text-white/40 mb-8">
            {isPaid
              ? "Your Stripe payment has been received and secured in Escrow"
              : "Your purchase is being processed securely"}
          </p>

          {/* Order Details */}
          <div className="bg-[#1f1f29] border border-white/5 rounded-2xl p-6 mb-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/60">Order ID</span>
              <span className="text-sm font-semibold text-white">
                #{currentOrder?.id || orderId}
              </span>
            </div>

            {/* Payment Status Badge */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <span className="text-sm text-white/60">Payment Status</span>
              <div className="flex items-center gap-1.5">
                {verifying ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                    <HiOutlineClock className="w-3.5 h-3.5 animate-spin" />
                    Verifying...
                  </span>
                ) : isPaid ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    Paid (Stripe)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    {currentOrder?.payment_status || "Pending"}
                  </span>
                )}
              </div>
            </div>

            {currentOrder?.amount && (
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <span className="text-sm text-white/60">Total Amount</span>
                <span className="text-sm font-semibold text-white">
                  ${Number(currentOrder.amount).toLocaleString()}
                </span>
              </div>
            )}

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
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/dashboard/orders")}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <div className="flex items-center gap-2 justify-center">
                View My Orders
                <HiOutlineArrowRight className="w-4 h-4" />
              </div>
            </Button>

            <Link
              to="/marketplace"
              className="block text-sm text-white/40 hover:text-white transition-colors py-2"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

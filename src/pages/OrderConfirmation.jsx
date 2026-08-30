// src/pages/OrderConfirmation.jsx
import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineArrowRight,
} from "react-icons/hi";
import useOrderStore from "../stores/useOrderStore";
import Button from "../components/ui/Button";
import SEO from "../components/ui/SEO";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { currentOrder, fetchOrder } = useOrderStore();

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

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
            Order Confirmed!
          </h1>
          <p className="text-white/40 mb-8">
            Your purchase is being processed securely
          </p>

          {/* Order Details */}
          <div className="bg-[#1f1f29] border border-white/5 rounded-2xl p-6 mb-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/60">Order ID</span>
              <span className="text-sm font-semibold text-white">
                #{currentOrder?.id || orderId}
              </span>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                <HiOutlineMail className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-400">
                    Account Details Sent
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Check your email for account credentials and instructions
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
                    Payment held securely until you verify the account
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

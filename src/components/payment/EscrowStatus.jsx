import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineUpload,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineCash,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
} from "react-icons/hi";
import useEscrowStore from "../../stores/useEscrowStore";

const steps = [
  {
    key: "awaiting_payment",
    icon: HiOutlineClock,
    label: "Awaiting Payment",
    color: "text-yellow-400",
  },
  {
    key: "payment_submitted",
    icon: HiOutlineUpload,
    label: "Payment Submitted",
    color: "text-blue-400",
  },
  {
    key: "payment_verified",
    icon: HiOutlineCheckCircle,
    label: "Payment Verified",
    color: "text-green-400",
  },
  {
    key: "delivered",
    icon: HiOutlineTruck,
    label: "Account Delivered",
    color: "text-purple-400",
  },
  {
    key: "released",
    icon: HiOutlineCash,
    label: "Payment Released",
    color: "text-green-400",
  },
];

export default function EscrowStatus({ order, userRole }) {
  const { escrowTimeline, fetchEscrowTimeline } = useEscrowStore();

  useEffect(() => {
    if (order?.id) fetchEscrowTimeline(order.id);
  }, [order?.id]);

  const currentStepIndex = steps.findIndex(
    (s) => s.key === order?.escrow_status,
  );
  const isDisputed = order?.escrow_status === "disputed";
  const isRefunded = order?.escrow_status === "refunded";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <HiOutlineShieldCheck className="w-5 h-5 text-green-400" />
        Escrow Protection
      </h3>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isCompleted =
            i <= currentStepIndex && !isDisputed && !isRefunded;
          const isCurrent =
            i === currentStepIndex && !isDisputed && !isRefunded;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? "bg-green-500/20"
                    : isCurrent
                      ? "bg-yellow-500/20"
                      : "bg-white/5"
                }`}
              >
                <StepIcon
                  className={`w-4 h-4 ${
                    isCompleted
                      ? "text-green-400"
                      : isCurrent
                        ? "text-yellow-400"
                        : "text-white/20"
                  }`}
                />
              </div>
              <span
                className={`text-sm ${
                  isCompleted
                    ? "text-green-400"
                    : isCurrent
                      ? "text-yellow-400"
                      : "text-white/30"
                }`}
              >
                {step.label}
              </span>
              {isCurrent && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-yellow-400"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Disputed State */}
      {isDisputed && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <HiOutlineExclamationCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-medium">
              Payment Frozen - Under Review
            </span>
          </div>
          <p className="text-red-400/60 text-xs mt-1">
            Admin is reviewing this dispute. Funds are held securely.
          </p>
        </div>
      )}

      {/* Refunded State */}
      {isRefunded && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <HiOutlineRefresh className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Refunded</span>
          </div>
          <p className="text-blue-400/60 text-xs mt-1">
            Payment has been returned to the buyer.
          </p>
        </div>
      )}

      {/* Escrow Timeline */}
      {escrowTimeline.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-white/30 uppercase tracking-wider mb-2">
            Activity Log
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {escrowTimeline.map((entry) => (
              <div
                key={entry.id}
                className="text-xs text-white/40 flex items-center gap-2"
              >
                <span className="text-white/20">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
                <span className="text-white/60">{entry.action}</span>
                <span className="text-white/20">
                  by {entry.performer?.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

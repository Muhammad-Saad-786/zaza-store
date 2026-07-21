import { useEffect } from "react";
import { motion } from "framer-motion";
import useAdminStore from "../../stores/useAdminStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

const statusColors = {
  pending: "badge-gold",
  completed: "badge-cyan",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
};

export default function AdminOrders() {
  const { orders, loading, fetchAllOrders } = useAdminStore();

  useEffect(() => {
    fetchAllOrders();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        All Orders ({orders.length})
      </h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <GlassCard key={order.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">
                  {order.account?.title || "Account"}
                </p>
                <p className="text-xs text-white/40">
                  Buyer: {order.buyer?.username} | Seller:{" "}
                  {order.seller?.username}
                </p>
                <p className="text-xs text-white/30">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-brand-gold font-semibold">${order.amount}</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";

const statusColors = {
  pending: "badge-gold",
  completed: "badge-cyan",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get orders
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get details
      const ordersWithDetails = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: account } = await supabase
            .from("accounts")
            .select("id, title, price, rank, status")
            .eq("id", order.account_id)
            .single();

          const { data: buyer } = await supabase
            .from("profiles")
            .select("username, email")
            .eq("id", order.buyer_id)
            .single();

          return {
            ...order,
            account: account || { title: "Unknown", price: 0, rank: "N/A" },
            buyer: buyer || { username: "Unknown", email: "" },
          };
        }),
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const handleAcceptOrder = async (order) => {
    const toastId = toast.loading("Processing order...");

    try {
      // 1. Update this order to completed
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", order.id);

      if (orderError) {
        toast.error("Failed to update order: " + orderError.message, {
          id: toastId,
        });
        return;
      }

      // 2. Cancel ALL OTHER pending orders for this account
      const { data: otherOrders, error: otherError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("account_id", order.account_id)
        .eq("status", "pending")
        .neq("id", order.id)
        .select("buyer_id");

      if (otherError) {
        console.error("Failed to cancel other orders:", otherError);
      } else {
        console.log("Cancelled other pending orders:", otherOrders);

        // Notify other buyers that their orders were cancelled
        if (otherOrders && otherOrders.length > 0) {
          for (const otherOrder of otherOrders) {
            await supabase.from("notifications").insert([
              {
                user_id: otherOrder.buyer_id,
                title: "Order Cancelled",
                message: `Your order for "${order.account?.title || "account"}" was cancelled because another buyer completed the purchase first.`,
                type: "order",
                link: "/dashboard/orders",
              },
            ]);
          }
        }
      }

      // 3. Mark account as sold
      const { error: accountError } = await supabase
        .from("accounts")
        .update({ status: "sold", updated_at: new Date().toISOString() })
        .eq("id", order.account_id);

      if (accountError) {
        console.error("Account update error:", accountError);
      }

      // 4. Create transaction
      const { error: txError } = await supabase.from("transactions").insert([
        {
          seller_id: user.id,
          order_id: order.id,
          amount: order.amount,
          type: "sale",
          status: "completed",
          description: `Sale of ${order.account?.title || "account"}`,
        },
      ]);

      if (txError) {
        console.error("Transaction error:", txError);
      }

      // 5. Update seller stats
      try {
        await supabase.rpc("increment_seller_sales", { seller_id: user.id });
      } catch (rpcError) {
        console.error("RPC error:", rpcError);
      }

      // 6. Notify the winning buyer
      await supabase.from("notifications").insert([
        {
          user_id: order.buyer_id,
          title: "Order Completed! 🎉",
          message: `Your order for "${order.account?.title || "account"}" has been completed! The account is now yours.`,
          type: "order",
          link: "/dashboard/orders",
        },
      ]);

      toast.success("Order completed! Other pending orders cancelled.", {
        id: toastId,
      });
      fetchOrders();
    } catch (error) {
      console.error("Accept error:", error);
      toast.error("Failed: " + error.message, { id: toastId });
    }
  };

  const handleRejectOrder = async (order) => {
    const toastId = toast.loading("Rejecting order...");

    try {
      // Update order to cancelled
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", order.id);

      if (orderError) {
        toast.error("Failed: " + orderError.message, { id: toastId });
        return;
      }

      // Check if there are other pending orders for this account
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("account_id", order.account_id)
        .eq("status", "pending");

      // Only reactivate if no other pending orders
      if (pendingCount === 0) {
        await supabase
          .from("accounts")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("id", order.account_id);
      }

      // Notify buyer
      await supabase.from("notifications").insert([
        {
          user_id: order.buyer_id,
          title: "Order Rejected",
          message: `Your order was rejected. ${pendingCount === 0 ? "The account is available again." : ""}`,
          type: "order",
          link: "/dashboard/orders",
        },
      ]);

      toast.success("Order rejected", { id: toastId });
      fetchOrders();
    } catch (error) {
      toast.error("Failed: " + error.message, { id: toastId });
    }
  };

  if (loading) {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-extrabold text-white">
          Orders
        </h1>
        <button
          onClick={fetchOrders}
          className="text-sm text-brand-purple hover:text-brand-gold"
        >
          🔄 Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-white">No orders yet</h3>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <GlassCard key={order.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[order.status] || "badge-purple"}`}
                  >
                    {order.status}
                  </span>

                  <h3 className="font-semibold text-white text-lg mt-2">
                    {order.account?.title}
                  </h3>
                  <p className="text-sm text-white/50 mt-1">
                    Buyer: {order.buyer?.username}
                  </p>
                  <p className="text-brand-gold font-semibold text-lg mt-1">
                    ${order.amount?.toLocaleString()}
                  </p>

                  {order.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleAcceptOrder(order)}
                        className="px-6 py-2.5 bg-green-500/20 text-green-400 rounded-xl text-sm font-medium hover:bg-green-500/30"
                      >
                        ✓ Accept & Complete
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order)}
                        className="px-6 py-2.5 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}

                  {order.status === "completed" && (
                    <p className="text-green-400 text-sm mt-2">
                      {
                        <HiOutlineCheckCircle className="inline-block mr-1 text-xl" />
                      }{" "}
                      Completed
                    </p>
                  )}
                  {order.status === "cancelled" && (
                    <p className="text-red-400 text-sm mt-2">
                      <HiOutlineXCircle className="inline-block mr-1 text-xl" />{" "}
                      Cancelled
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}

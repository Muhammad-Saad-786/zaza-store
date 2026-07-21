import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import { toast } from "react-hot-toast";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";

const statusColors = {
  pending: "badge-gold",
  completed: "badge-cyan",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
};

const statusMessages = {
  pending: "⏳ Waiting for seller to accept your order",
  completed: " Order completed! Account is yours!",
  cancelled: " Order cancelled - Another buyer completed the purchase first",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const submitReview = async () => {
    if (!reviewModal) return;

    try {
      const { error } = await supabase.from("reviews").insert([
        {
          reviewer_id: user.id,
          seller_id: reviewModal.seller_id,
          account_id: reviewModal.account_id,
          order_id: reviewModal.id,
          rating: reviewRating,
          comment: reviewComment,
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          toast.error("You already reviewed this order");
        } else {
          throw error;
        }
      } else {
        toast.success("Review submitted! Thank you!");
      }

      setReviewModal(null);
      setReviewRating(5);
      setReviewComment("");
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      console.log("Fetching orders for buyer:", user.id);

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Get account details with images for each order
      const ordersWithDetails = await Promise.all(
        (ordersData || []).map(async (order) => {
          // Get account info
          const { data: accountData } = await supabase
            .from("accounts")
            .select("id, title, price, rank, status")
            .eq("id", order.account_id)
            .single();

          // Get images for this account
          const { data: imagesData } = await supabase
            .from("account_images")
            .select("url, is_cover")
            .eq("account_id", order.account_id)
            .order("sort_order", { ascending: true });

          return {
            ...order,
            account: {
              ...(accountData || {
                title: "Unknown Account",
                price: 0,
                rank: "N/A",
              }),
              images: imagesData || [],
            },
          };
        }),
      );

      console.log("Orders with details:", ordersWithDetails);
      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount and auto-refresh every 30 seconds
  useEffect(() => {
    if (user) {
      fetchOrders();

      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-white/40">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-extrabold text-white">
          My Orders
        </h1>
        <button
          onClick={fetchOrders}
          className="text-sm text-brand-purple hover:text-brand-gold transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-white">No orders yet</h3>
          <p className="text-white/40 mt-1">
            Browse the marketplace to find your perfect account
          </p>
          <Link to="/marketplace" className="mt-4 inline-block">
            <button className="px-6 py-2 bg-brand-purple text-white rounded-xl font-medium hover:bg-brand-purple-deep transition-colors">
              Browse Accounts
            </button>
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <GlassCard key={order.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    {order.account?.images &&
                    order.account.images.length > 0 ? (
                      <img
                        src={order.account.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>🎮</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/account/${order.account?.id}`}
                      className="font-semibold text-white hover:text-brand-purple transition-colors"
                    >
                      {order.account?.title || "Account"}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-sm text-white/40">
                        {order.account?.rank || "N/A"}
                      </span>
                      <span className="text-sm text-brand-gold font-semibold">
                        ${order.amount?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-white/30 mt-1">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* Status Message */}
                    <div
                      className={`mt-3 p-3 rounded-xl ${
                        order.status === "completed"
                          ? "bg-green-500/10 border border-green-500/20"
                          : order.status === "cancelled"
                            ? "bg-red-500/10 border border-red-500/20"
                            : "bg-yellow-500/10 border border-yellow-500/20"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          order.status === "completed"
                            ? "text-green-400"
                            : order.status === "cancelled"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {statusMessages[order.status] || order.status}
                      </p>
                      {order.status === "pending" && (
                        <p className="text-yellow-400/60 text-xs mt-1">
                          The seller will review your order shortly. You'll be
                          notified when it's accepted.
                        </p>
                      )}
                      {order.status === "completed" && (
                        <p className="text-green-400/60 text-xs mt-1">
                          Congratulations! The account is now yours. Contact the
                          seller for account details.
                        </p>
                      )}
                      {order.status === "cancelled" && (
                        <p className="text-red-400/60 text-xs mt-1">
                          The seller rejected this order. The account is
                          available again in the marketplace.
                        </p>
                      )}
                      {order.status === "completed" && (
                        <div className="mt-3">
                          <button
                            onClick={() => setReviewModal(order)}
                            className="px-4 py-2 bg-brand-gold/20 text-brand-gold rounded-xl text-sm font-medium hover:bg-brand-gold/30 transition-colors"
                          >
                            ⭐ Write a Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border capitalize flex-shrink-0 ${
                    statusColors[order.status] || "badge-purple"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Write a Review
            </h3>

            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`text-2xl ${star <= reviewRating ? "text-brand-gold" : "text-white/20"}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="input-glass w-full resize-none mb-4 px-4 py-2"
            />

            <div className="flex gap-3">
              <button
                onClick={submitReview}
                className="flex-1 px-4 py-2 bg-brand-gold text-brand-darker rounded-xl font-semibold"
              >
                Submit Review
              </button>
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 px-4 py-2 glass-card text-white/60 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

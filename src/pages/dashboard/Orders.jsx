import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";
import useEscrowStore from "../../stores/useEscrowStore";
import EscrowStatus from "../../components/payment/EscrowStatus";
import usePaymentStore from "../../stores/usePaymentStore";
import {
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineStar,
  HiOutlineCube,
  HiOutlineRefresh,
} from "react-icons/hi";

const statusColors = {
  pending: "badge-gold",
  completed: "badge-cyan",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const { openPaymentModal } = usePaymentStore();
  // Escrow status
  const { submitPayment, confirmReceipt, fileDispute } = useEscrowStore();

  // Review modal
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Dispute modal
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeOrder, setDisputeOrder] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  const disputeReasons = [
    "Account not received",
    "Account details incorrect",
    "Account recovered by seller",
    "Account rank/skins don't match",
    "Other",
  ];

  const submitDispute = async () => {
    if (!disputeReason) {
      toast.error("Please select a reason");
      return;
    }

    setDisputeSubmitting(true);
    try {
      const { error } = await supabase.from("disputes").insert([
        {
          order_id: disputeOrder.id,
          buyer_id: user.id,
          seller_id: disputeOrder.seller_id,
          reason: disputeReason,
          description: disputeDescription,
        },
      ]);

      if (error) throw error;

      toast.success("Dispute filed. Admin will review within 24 hours.");
      setShowDisputeModal(false);
      setDisputeOrder(null);
      setDisputeReason("");
      setDisputeDescription("");
    } catch (error) {
      toast.error("Failed to file dispute: " + error.message);
    } finally {
      setDisputeSubmitting(false);
    }
  };

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
    setError(null);

    try {
      // Simple query - get orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Get account details and images for each order
      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          try {
            // Get account info
            const { data: accountData } = await supabase
              .from("accounts")
              .select("id, title, price, rank, status")
              .eq("id", order.account_id)
              .single();

            // Get images
            const { data: imagesData } = await supabase
              .from("account_images")
              .select("url, is_cover")
              .eq("account_id", order.account_id)
              .order("sort_order", { ascending: true })
              .limit(1);

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
          } catch (err) {
            return {
              ...order,
              account: {
                title: "Account",
                price: order.amount || 0,
                rank: "N/A",
                images: [],
              },
            };
          }
        }),
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setError(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

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

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-white">
            Failed to load orders
          </h3>
          <p className="text-white/40 text-sm mt-1">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            Try Again
          </button>
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
          className="text-sm text-purple-400 hover:text-amber-400 flex items-center gap-1"
        >
          <HiOutlineRefresh className="w-4 h-4" /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <HiOutlineCube className="text-6xl text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">No orders yet</h3>
          <p className="text-white/40 mt-1">
            Browse the marketplace to find your perfect account
          </p>
          <Link to="/marketplace" className="mt-4 inline-block">
            <button className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
              Browse Accounts
            </button>
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <GlassCard key={order.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1 min-w-0">
                  {/* Account Image */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-amber-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {order.account?.images?.length > 0 ? (
                      <img
                        src={order.account.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-2xl">🎮</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/account/${order.account?.id}`}
                      className="font-semibold text-white hover:text-purple-400 transition-colors line-clamp-1"
                    >
                      {order.account?.title || "Account"}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-sm text-white/40">
                        {order.account?.rank || "N/A"}
                      </span>
                      <span className="text-sm text-amber-400 font-semibold">
                        ${order.amount?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-white/30 mt-1">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    {/* Status Box */}
                    {/* Status Box */}
                    <div
                      className={`mt-3 p-3 rounded-xl ${
                        order.status === "completed"
                          ? "bg-green-500/10 border border-green-500/20"
                          : order.status === "cancelled"
                            ? "bg-red-500/10 border border-red-500/20"
                            : "bg-yellow-500/10 border border-yellow-500/20"
                      }`}
                    >
                      {/* Pending */}
                      {order.status === "pending" && (
                        <>
                          <p className="text-sm font-medium text-yellow-400 flex items-center gap-1">
                            <HiOutlineClock className="w-4 h-4" /> Waiting for
                            seller to accept
                          </p>
                          <p className="text-yellow-400/60 text-xs mt-1">
                            The seller will review your order shortly.
                          </p>
                        </>
                      )}

                      {/* Completed - Now shows escrow status */}
                      {order.status === "completed" && (
                        <>
                          {/* Escrow: Awaiting Payment */}
                          {order.escrow_status === "awaiting_payment" && (
                            <>
                              <p className="text-sm font-medium text-yellow-400 flex items-center gap-1">
                                <HiOutlineCheckCircle className="w-4 h-4" />{" "}
                                Order accepted!
                              </p>
                              <p className="text-yellow-400/60 text-xs mt-1">
                                Complete payment to secure your account. Payment
                                is held in escrow.
                              </p>
                              <button
                                onClick={() => openPaymentModal(order)}
                                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30 flex items-center gap-1 mt-2"
                              >
                                💳 Pay Now (Escrow Protected)
                              </button>
                            </>
                          )}

                          {/* Escrow: Payment Submitted */}
                          {order.escrow_status === "payment_submitted" && (
                            <>
                              <p className="text-sm font-medium text-blue-400 flex items-center gap-1">
                                <HiOutlineCheckCircle className="w-4 h-4" />{" "}
                                Payment submitted!
                              </p>
                              <p className="text-blue-400/60 text-xs mt-1">
                                Waiting for seller to verify your payment and
                                deliver the account.
                              </p>
                            </>
                          )}

                          {/* Escrow: Payment Verified */}
                          {order.escrow_status === "payment_verified" && (
                            <>
                              <p className="text-sm font-medium text-green-400 flex items-center gap-1">
                                <HiOutlineCheckCircle className="w-4 h-4" />{" "}
                                Payment verified!
                              </p>
                              <p className="text-green-400/60 text-xs mt-1">
                                Seller is preparing to deliver your account.
                                You'll be notified once delivered.
                              </p>
                            </>
                          )}

                          {/* Escrow: Delivered */}
                          {order.escrow_status === "delivered" && (
                            <>
                              <p className="text-sm font-medium text-purple-400 flex items-center gap-1">
                                <HiOutlineCheckCircle className="w-4 h-4" />{" "}
                                Account delivered!
                              </p>
                              <p className="text-purple-400/60 text-xs mt-1">
                                Verify the account within 48 hours. Payment will
                                be released to seller after confirmation.
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <button
                                  onClick={() => confirmReceipt(order.id)}
                                  className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl text-sm hover:bg-amber-500/30 flex items-center gap-1"
                                >
                                  Confirm & Release Payment
                                </button>
                                <button
                                  onClick={() => {
                                    setDisputeOrder(order);
                                    setShowDisputeModal(true);
                                  }}
                                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 flex items-center gap-1"
                                >
                                  🚨 Report Issue
                                </button>
                              </div>
                            </>
                          )}

                          {/* Escrow: Released */}
                          {order.escrow_status === "released" && (
                            <>
                              <p className="text-sm font-medium text-green-400 flex items-center gap-1">
                                <HiOutlineCheckCircle className="w-4 h-4" />{" "}
                                Payment released!
                              </p>
                              <p className="text-green-400/60 text-xs mt-1">
                                Enjoy your account! Payment has been released to
                                the seller.
                              </p>
                              <div className="mt-2">
                                <button
                                  onClick={() => setReviewModal(order)}
                                  className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl text-sm hover:bg-amber-500/30 flex items-center gap-1"
                                >
                                  <HiOutlineStar className="w-4 h-4" /> Write a
                                  Review
                                </button>
                              </div>
                            </>
                          )}

                          {/* Escrow: Disputed */}
                          {order.escrow_status === "disputed" && (
                            <>
                              <p className="text-sm font-medium text-red-400 flex items-center gap-1">
                                <HiOutlineXCircle className="w-4 h-4" /> Dispute
                                filed
                              </p>
                              <p className="text-red-400/60 text-xs mt-1">
                                Funds are frozen. Admin is reviewing your case.
                                You'll be notified of the decision.
                              </p>
                            </>
                          )}

                          {/* Escrow: Refunded */}
                          {order.escrow_status === "refunded" && (
                            <>
                              <p className="text-sm font-medium text-blue-400 flex items-center gap-1">
                                <HiOutlineCheckCircle className="w-4 h-4" />{" "}
                                Refunded
                              </p>
                              <p className="text-blue-400/60 text-xs mt-1">
                                Your payment has been refunded. The funds will
                                return to your account within 3-5 days.
                              </p>
                            </>
                          )}

                          {/* Fallback for old orders without escrow_status */}
                          {!order.escrow_status && (
                            <>
                              <p className="text-sm font-medium text-green-400 flex items-center gap-1">
                                <HiOutlineCheckCircle className="w-4 h-4" />{" "}
                                Order completed! Account is yours!
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <button
                                  onClick={() => setReviewModal(order)}
                                  className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl text-sm hover:bg-amber-500/30 flex items-center gap-1"
                                >
                                  <HiOutlineStar className="w-4 h-4" /> Write a
                                  Review
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* Cancelled */}
                      {order.status === "cancelled" && (
                        <p className="text-sm font-medium text-red-400 flex items-center gap-1">
                          <HiOutlineXCircle className="w-4 h-4" /> Order
                          cancelled
                        </p>
                      )}
                    </div>
                    {/* Escrow Progress Tracker */}
                    {order.escrow_status && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs">
                          {[
                            "awaiting_payment",
                            "payment_submitted",
                            "payment_verified",
                            "delivered",
                            "released",
                          ].map((step, i) => {
                            const stepIndex = [
                              "awaiting_payment",
                              "payment_submitted",
                              "payment_verified",
                              "delivered",
                              "released",
                            ].indexOf(order.escrow_status);
                            const isComplete =
                              i <= stepIndex &&
                              order.escrow_status !== "disputed" &&
                              order.escrow_status !== "refunded";
                            return (
                              <div
                                key={step}
                                className="flex items-center gap-1"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${isComplete ? "bg-green-400" : "bg-white/10"}`}
                                />
                                {i < 4 && (
                                  <div
                                    className={`w-4 h-px ${i < stepIndex ? "bg-green-400" : "bg-white/10"}`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-white/20 mt-1 capitalize">
                          Escrow: {order.escrow_status?.replace(/_/g, " ")}
                        </p>
                      </div>
                    )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-modal w-full max-w-md p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              Write a Review
            </h3>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`text-2xl ${star <= reviewRating ? "text-amber-400" : "text-white/20"}`}
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
              className="input-glass w-full resize-none mb-4 px-3 py-1"
            />
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                className="flex-1 px-4 py-2 bg-amber-500 text-black rounded-xl font-semibold"
              >
                Submit
              </button>
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 px-4 py-2 bg-white/5 text-white/60 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-modal w-full max-w-md p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              Report Issue with Order
            </h3>
            <div className="space-y-2 mb-4">
              {disputeReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setDisputeReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                    disputeReason === reason
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <label className="block text-sm text-white/60 mb-2">
              Description
            </label>
            <textarea
              value={disputeDescription}
              onChange={(e) => setDisputeDescription(e.target.value)}
              placeholder="Describe what went wrong..."
              rows={3}
              className="input-glass w-full resize-none mb-4 px-3"
            />
            <div className="flex gap-3">
              <button
                onClick={submitDispute}
                disabled={disputeSubmitting || !disputeReason}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50"
              >
                {disputeSubmitting ? "Filing..." : "File Dispute"}
              </button>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 text-white/60 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

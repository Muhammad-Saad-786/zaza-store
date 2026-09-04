import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";
import useEscrowStore from "../../stores/useEscrowStore";
import usePaymentStore from "../../stores/usePaymentStore";
import {
  HiOutlineChevronDown,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineStar,
  HiOutlineRefresh,
} from "react-icons/hi";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  const { user } = useAuthStore();
  const { openPaymentModal } = usePaymentStore();
  const { confirmReceipt } = useEscrowStore();

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
    } catch {
      toast.error("Failed to submit review");
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
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

      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          try {
            const { data: accountData } = await supabase
              .from("accounts")
              .select("id, title, price, rank, status")
              .eq("id", order.account_id)
              .single();

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
          } catch {
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
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Filter & Sort
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  }).sort((a, b) => {
    if (sortOrder === "recent") return new Date(b.created_at) - new Date(a.created_at);
    if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (sortOrder === "price_high") return (b.amount || 0) - (a.amount || 0);
    if (sortOrder === "price_low") return (a.amount || 0) - (b.amount || 0);
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-white font-medium">Loading your purchased orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-white">Failed to load orders</h3>
          <p className="text-white/70 text-sm mt-1">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 px-6 py-2 bg-[#f5a623] text-[#121217] font-bold rounded-xl hover:bg-[#e0961f]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Eldorado Header Style */}
      <div className="flex items-center gap-2">
        <span className="text-[#f5a623] text-2xl font-black">︽</span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Purchased orders
        </h1>
      </div>

      {/* Filter Toolbar (Eldorado style pills) */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-[#1f1f29] border border-[#2e2e3e] text-white text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-[#f5a623] cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <HiOutlineChevronDown className="w-4 h-4 text-white/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="appearance-none bg-[#1f1f29] border border-[#2e2e3e] text-white text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-[#f5a623] cursor-pointer"
          >
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
          </select>
          <HiOutlineChevronDown className="w-4 h-4 text-white/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          onClick={fetchOrders}
          className="ml-auto text-xs font-bold text-[#f5a623] hover:text-white flex items-center gap-1.5 px-3 py-2 bg-[#1f1f29] border border-[#2e2e3e] rounded-xl transition-colors"
        >
          <HiOutlineRefresh className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Empty State / Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <img
            src="/empty-orders.png"
            alt="Nothing found"
            className="w-36 h-36 object-contain mb-4"
          />
          <h2 className="text-xl font-black text-white">Nothing found</h2>
          <p className="text-sm text-white/60 mt-1">
            You have no purchased orders
          </p>
          <Link
            to="/marketplace"
            className="mt-5 px-6 py-2.5 bg-[#f5a623] text-[#121217] font-bold text-xs rounded-xl hover:bg-[#e0961f] transition-all shadow-md"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[#1f1f29] border border-[#2e2e3e] hover:border-[#f5a623]/50 rounded-2xl p-5 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex gap-4 flex-1 min-w-0">
                  {/* Account Image */}
                  <div className="w-16 h-16 rounded-xl bg-[#16161e] border border-[#2e2e3e] flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                      className="font-bold text-base text-white hover:text-[#f5a623] transition-colors line-clamp-1"
                    >
                      {order.account?.title || "MLBB Account"}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs">
                      <span className="text-white/70 font-semibold">
                        Rank: {order.account?.rank || "N/A"}
                      </span>
                      <span className="text-[#f5a623] font-black text-sm">
                        ${order.amount?.toLocaleString()}
                      </span>
                      <span className="text-white/40">
                        Order #{order.id?.slice(0, 8)}
                      </span>
                    </div>

                    {/* Escrow Status Box */}
                    <div className="mt-3 p-3 rounded-xl bg-[#16161e] border border-[#2e2e3e]">
                      {order.status === "pending" && (
                        <p className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                          <HiOutlineClock className="w-4 h-4" /> Waiting for seller to accept
                        </p>
                      )}

                      {order.status === "completed" && (
                        <>
                          {order.escrow_status === "awaiting_payment" && (
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                                <HiOutlineCheckCircle className="w-4 h-4" /> Order accepted! Submit payment.
                              </p>
                              <button
                                onClick={() => openPaymentModal(order)}
                                className="px-3 py-1.5 bg-[#f5a623] text-[#121217] font-bold text-xs rounded-lg hover:bg-[#e0961f]"
                              >
                                💳 Pay Now (Escrow)
                              </button>
                            </div>
                          )}

                          {order.escrow_status === "payment_submitted" && (
                            <p className="text-xs font-bold text-blue-400 flex items-center gap-1">
                              <HiOutlineCheckCircle className="w-4 h-4" /> Payment submitted. Awaiting seller confirmation.
                            </p>
                          )}

                          {order.escrow_status === "payment_verified" && (
                            <p className="text-xs font-bold text-green-400 flex items-center gap-1">
                              <HiOutlineCheckCircle className="w-4 h-4" /> Payment verified. Seller is dispatching credentials.
                            </p>
                          )}

                          {order.escrow_status === "delivered" && (
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-xs font-bold text-purple-400 flex items-center gap-1">
                                <HiOutlineCheckCircle className="w-4 h-4" /> Account delivered! Verify within 48h.
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => confirmReceipt(order.id)}
                                  className="px-3 py-1 bg-green-500 text-white font-bold text-xs rounded-lg hover:bg-green-600"
                                >
                                  Confirm & Release
                                </button>
                                <button
                                  onClick={() => {
                                    setDisputeOrder(order);
                                    setShowDisputeModal(true);
                                  }}
                                  className="px-3 py-1 bg-red-500/20 text-red-400 font-bold text-xs rounded-lg hover:bg-red-500/30"
                                >
                                  Report Issue
                                </button>
                              </div>
                            </div>
                          )}

                          {order.escrow_status === "released" && (
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-xs font-bold text-green-400 flex items-center gap-1">
                                <HiOutlineCheckCircle className="w-4 h-4" /> Order complete & payment released!
                              </p>
                              <button
                                onClick={() => setReviewModal(order)}
                                className="px-3 py-1 bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/40 font-bold text-xs rounded-lg hover:bg-[#f5a623]/30 flex items-center gap-1"
                              >
                                <HiOutlineStar className="w-3.5 h-3.5" /> Write Review
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {order.status === "cancelled" && (
                        <p className="text-xs font-bold text-red-400 flex items-center gap-1">
                          <HiOutlineXCircle className="w-4 h-4" /> Order cancelled
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-[#16161e] border border-[#2e2e3e] text-white">
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1f1f29] border border-[#2e2e3e] w-full max-w-md p-6 rounded-2xl">
            <h3 className="text-lg font-black text-white mb-4">Write a Review</h3>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`text-2xl ${star <= reviewRating ? "text-[#f5a623]" : "text-white/20"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your buying experience..."
              rows={4}
              className="w-full bg-[#16161e] border border-[#2e2e3e] text-white text-xs p-3 rounded-xl mb-4 focus:outline-none focus:border-[#f5a623]"
            />
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                className="flex-1 px-4 py-2.5 bg-[#f5a623] text-[#121217] font-bold text-xs rounded-xl hover:bg-[#e0961f]"
              >
                Submit Review
              </button>
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 px-4 py-2.5 bg-[#16161e] text-white font-semibold text-xs rounded-xl border border-[#2e2e3e]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1f1f29] border border-[#2e2e3e] w-full max-w-md p-6 rounded-2xl">
            <h3 className="text-lg font-black text-white mb-4">Report Issue with Order</h3>
            <div className="space-y-2 mb-4">
              {disputeReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setDisputeReason(reason)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    disputeReason === reason
                      ? "bg-red-500/20 text-red-400 border border-red-500/40 font-bold"
                      : "bg-[#16161e] text-white/80 border border-[#2e2e3e] hover:border-white/20"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <textarea
              value={disputeDescription}
              onChange={(e) => setDisputeDescription(e.target.value)}
              placeholder="Provide specific details about the issue..."
              rows={3}
              className="w-full bg-[#16161e] border border-[#2e2e3e] text-white text-xs p-3 rounded-xl mb-4 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-3">
              <button
                onClick={submitDispute}
                disabled={disputeSubmitting || !disputeReason}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold text-xs rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {disputeSubmitting ? "Filing..." : "File Dispute"}
              </button>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="flex-1 px-4 py-2.5 bg-[#16161e] text-white font-semibold text-xs rounded-xl border border-[#2e2e3e]"
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

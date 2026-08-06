import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";
import useEscrowStore from "../../stores/useEscrowStore";
import { Link } from "react-router-dom";
import { getPaymentProofUrl } from "../../lib/storage";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineCash,
  HiOutlineTruck,
  HiOutlineShieldCheck,
} from "react-icons/hi";

const statusColors = {
  pending: "badge-gold",
  completed: "badge-cyan",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { verifyPayment, markDelivered } = useEscrowStore();
  const [proofUrl, setProofUrl] = useState("");

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

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
    try {
      console.log("Accepting order:", order.id);

      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (orderError) {
        console.error("Order update error:", orderError);
        toast.error("Failed to accept order: " + orderError.message);
        return;
      }

      console.log("Order accepted, now awaiting payment");

      await supabase.from("notifications").insert([
        {
          user_id: order.buyer_id,
          title: "Order Accepted! 🎉",
          message:
            "Seller accepted your order. Please complete payment to secure your account.",
          type: "order",
          link: "/dashboard/orders",
        },
      ]);

      toast.success("Order accepted! Buyer will now submit payment.");
      fetchOrders();
    } catch (error) {
      console.error("Accept error:", error);
      toast.error("Failed to accept order");
    }
  };

  const handleRejectOrder = async (order) => {
    try {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", order.id);

      if (orderError) {
        toast.error("Failed: " + orderError.message);
        return;
      }

      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("account_id", order.account_id)
        .eq("status", "pending");

      if (pendingCount === 0) {
        await supabase
          .from("accounts")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("id", order.account_id);
      }

      await supabase.from("notifications").insert([
        {
          user_id: order.buyer_id,
          title: "Order Rejected",
          message: `Your order was rejected. ${pendingCount === 0 ? "The account is available again." : ""}`,
          type: "order",
          link: "/dashboard/orders",
        },
      ]);

      toast.success("Order rejected");
      fetchOrders();
    } catch (error) {
      toast.error("Failed: " + error.message);
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[order.status] || "badge-purple"}`}
                    >
                      {order.status}
                    </span>
                    {order.escrow_status && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.escrow_status === "released"
                            ? "bg-green-500/20 text-green-400"
                            : order.escrow_status === "disputed"
                              ? "bg-red-500/20 text-red-400"
                              : order.escrow_status === "refunded"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {order.escrow_status?.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-white text-lg mt-2">
                    {order.account?.title}
                  </h3>
                  <p className="text-sm text-white/50 mt-1">
                    Buyer: {order.buyer?.username}
                  </p>
                  <p className="text-brand-gold font-semibold text-lg mt-1">
                    ${order.amount?.toLocaleString()}
                  </p>

                  {/* Pending */}
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

                  {/* Completed - Escrow */}
                  {order.status === "completed" && (
                    <div className="mt-2 space-y-2">
                      {/* Awaiting Payment */}
                      {order.escrow_status === "awaiting_payment" && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                          <p className="text-yellow-400 text-sm font-medium">
                            <HiOutlineClock className="inline-block mr-1" />{" "}
                            Awaiting Buyer Payment
                          </p>
                          <p className="text-yellow-400/60 text-xs mt-1">
                            Order accepted. Waiting for buyer to submit payment
                            proof.
                          </p>
                        </div>
                      )}

                      {/* Payment Submitted */}
                      {order.escrow_status === "payment_submitted" && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <p className="text-blue-400 text-sm font-medium">
                            <HiOutlineCheckCircle className="inline-block mr-1" />{" "}
                            Payment Submitted!
                          </p>
                          <p className="text-blue-400/60 text-xs mt-1">
                            Buyer has uploaded payment proof. Verify the payment
                            and deliver the account.
                          </p>
                          {order.payment_proof && (
                            <button
                              onClick={async () => {
                                try {
                                  const url = await getPaymentProofUrl(
                                    order.payment_proof,
                                  );
                                  if (url) {
                                    window.open(url, "_blank");
                                  } else {
                                    toast.error(
                                      "Unable to load payment proof. Please try again.",
                                    );
                                  }
                                } catch (err) {
                                  toast.error("Failed to load payment proof");
                                }
                              }}
                              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm hover:bg-blue-500/30 flex items-center gap-1 mt-2"
                            >
                              📄 View Payment Proof
                            </button>
                          )}
                          {order.payment_method && (
                            <p className="text-white/30 text-xs mt-2">
                              Payment via:{" "}
                              <span className="text-white/50 capitalize">
                                {order.payment_method?.replace(/_/g, " ")}
                              </span>
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => verifyPayment(order.id)}
                              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30 flex items-center gap-1"
                            >
                              Verify Payment Received
                            </button>
                            <button
                              onClick={async () => {
                                if (
                                  confirm(
                                    "Reject this payment? Buyer will be notified to try again.",
                                  )
                                ) {
                                  await supabase
                                    .from("orders")
                                    .update({
                                      escrow_status: "awaiting_payment",
                                    })
                                    .eq("id", order.id);
                                  await supabase.from("notifications").insert([
                                    {
                                      user_id: order.buyer_id,
                                      title: "Payment Not Verified",
                                      message:
                                        "Seller could not verify your payment. Please check and try again.",
                                      type: "escrow",
                                      link: "/dashboard/orders",
                                    },
                                  ]);
                                  toast.success(
                                    "Payment rejected. Buyer notified.",
                                  );
                                  fetchOrders();
                                }
                              }}
                              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 flex items-center gap-1"
                            >
                              ✕ Reject Payment
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Payment Awaiting */}
                      {order.escrow_status === "awaiting_payment" && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                          <p className="text-yellow-400 text-sm font-medium">
                            <HiOutlineClock className="inline-block mr-1" />{" "}
                            Awaiting Buyer Payment
                          </p>
                          <p className="text-yellow-400/60 text-xs mt-1">
                            Waiting for buyer to submit payment proof. Make sure
                            your payment details are set up.
                          </p>
                          <Link
                            to="/seller-dashboard/payment-settings"
                            className="inline-block mt-2"
                          >
                            <button className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs hover:bg-yellow-500/30">
                              ⚙️ Payment Settings
                            </button>
                          </Link>
                        </div>
                      )}
                      {/* Payment Verified */}
                      {order.escrow_status === "payment_verified" && (
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                          <p className="text-purple-400 text-sm font-medium">
                            <HiOutlineCheckCircle className="inline-block mr-1" />{" "}
                            Payment Verified!
                          </p>
                          <p className="text-purple-400/60 text-xs mt-1">
                            Payment confirmed. Deliver the account credentials
                            to the buyer now.
                          </p>
                          <button
                            onClick={() => markDelivered(order.id)}
                            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-sm hover:bg-purple-500/30 flex items-center gap-1 mt-2"
                          >
                            <HiOutlineTruck className="w-4 h-4" /> Mark as
                            Delivered
                          </button>
                        </div>
                      )}

                      {/* Delivered */}
                      {order.escrow_status === "delivered" && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                          <p className="text-amber-400 text-sm font-medium">
                            <HiOutlineCheckCircle className="inline-block mr-1" />{" "}
                            Account Delivered!
                          </p>
                          <p className="text-amber-400/60 text-xs mt-1">
                            Waiting for buyer to confirm receipt. Payment will
                            be released within 48 hours.
                          </p>
                        </div>
                      )}

                      {/* Released */}
                      {order.escrow_status === "released" && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <p className="text-green-400 text-sm font-medium">
                            <HiOutlineCash className="inline-block mr-1" />{" "}
                            Payment Released! 🎉
                          </p>
                          <p className="text-green-400/60 text-xs mt-1">
                            Payment has been released to your account. Funds are
                            now available.
                          </p>
                        </div>
                      )}

                      {/* Disputed */}
                      {order.escrow_status === "disputed" && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-red-400 text-sm font-medium">
                            <HiOutlineExclamationCircle className="inline-block mr-1" />{" "}
                            Dispute Filed
                          </p>
                          <p className="text-red-400/60 text-xs mt-1">
                            Funds are frozen. Admin is reviewing this case.
                          </p>
                        </div>
                      )}

                      {/* Refunded */}
                      {order.escrow_status === "refunded" && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <p className="text-blue-400 text-sm font-medium">
                            <HiOutlineCheckCircle className="inline-block mr-1" />{" "}
                            Refunded to Buyer
                          </p>
                          <p className="text-blue-400/60 text-xs mt-1">
                            Payment has been refunded to the buyer.
                          </p>
                        </div>
                      )}

                      {/* Fallback */}
                      {!order.escrow_status && (
                        <p className="text-green-400 text-sm">
                          <HiOutlineCheckCircle className="inline-block mr-1" />{" "}
                          Completed
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cancelled */}
                  {order.status === "cancelled" && (
                    <p className="text-red-400 text-sm mt-2">
                      <HiOutlineXCircle className="inline-block mr-1" />{" "}
                      Cancelled
                    </p>
                  )}

                  {/* Escrow Progress Dots */}
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
                            <div key={step} className="flex items-center gap-1">
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
                        <HiOutlineShieldCheck className="inline-block w-3 h-3 mr-1" />
                        Escrow: {order.escrow_status?.replace(/_/g, " ")}
                      </p>
                    </div>
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

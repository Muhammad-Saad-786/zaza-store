import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import useEscrowStore from "../../stores/useEscrowStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";
import { getPaymentProofUrl } from "../../lib/storage";
import {
  HiOutlineShieldCheck,
  HiOutlineCash,
  HiOutlineRefresh,
  HiOutlineX,
} from "react-icons/hi";

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [showNotes, setShowNotes] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { resolveDispute: resolveEscrowDispute } = useEscrowStore();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from("disputes")
        .select(
          `*, buyer:profiles!disputes_buyer_id_fkey(username, email), seller:profiles!disputes_seller_id_fkey(username, email), order:orders(id, amount, escrow_status, account:accounts(title))`,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
    } catch (error) {
      console.error("Failed to fetch disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (dispute, resolution) => {
    setResolvingId(dispute.id);

    try {
      // Update dispute status
      const disputeStatus =
        resolution === "refund"
          ? "resolved_buyer"
          : resolution === "release"
            ? "resolved_seller"
            : "dismissed";

      await supabase
        .from("disputes")
        .update({
          status: disputeStatus,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", dispute.id);

      // Handle escrow resolution
      if (resolution === "refund") {
        await resolveEscrowDispute(
          dispute.order?.id,
          "refund",
          adminNotes || "Admin decision: Refund to buyer",
        );
      } else if (resolution === "release") {
        await resolveEscrowDispute(
          dispute.order?.id,
          "release",
          adminNotes || "Admin decision: Release to seller",
        );
      }

      // Notify both parties
      if (dispute.buyer?.id && dispute.seller?.id) {
        const winnerMsg =
          resolution === "refund" ? "refunded to you" : "released to seller";
        const buyerMsg =
          resolution === "refund"
            ? `Dispute resolved: Payment refunded. Funds will return within 3-5 days.`
            : `Dispute dismissed: Payment released to seller.`;
        const sellerMsg =
          resolution === "refund"
            ? `Dispute resolved: Payment refunded to buyer.`
            : `Dispute dismissed: Payment released to you!`;

        await supabase.from("notifications").insert([
          {
            user_id: dispute.buyer_id,
            title: "Dispute Resolved",
            message: buyerMsg,
            type: "dispute",
            link: "/dashboard/orders",
          },
          {
            user_id: dispute.seller_id,
            title: "Dispute Resolved",
            message: sellerMsg,
            type: "dispute",
            link: "/seller-dashboard/orders",
          },
        ]);
      }

      toast.success(
        `Dispute resolved: ${resolution === "refund" ? "Refunded buyer" : resolution === "release" ? "Released to seller" : "Dismissed"}`,
      );
      setShowNotes(null);
      setAdminNotes("");
      fetchDisputes();
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      toast.error("Failed to resolve dispute: " + error.message);
    } finally {
      setResolvingId(null);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white">
            Disputes ({disputes.length})
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Review and resolve buyer disputes
          </p>
        </div>
        <button
          onClick={fetchDisputes}
          className="text-sm text-purple-400 hover:text-amber-400"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Open",
            count: disputes.filter((d) => d.status === "open").length,
            color: "text-red-400",
          },
          {
            label: "Under Review",
            count: disputes.filter((d) => d.status === "under_review").length,
            color: "text-yellow-400",
          },
          {
            label: "Resolved",
            count: disputes.filter(
              (d) => d.status.includes("resolved") || d.status === "dismissed",
            ).length,
            color: "text-green-400",
          },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.count}
            </div>
            <div className="text-white/40 text-xs mt-1">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      {disputes.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <HiOutlineShieldCheck className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No disputes filed</p>
          <p className="text-white/20 text-xs mt-1">
            All transactions are running smoothly
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <GlassCard key={d.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      d.status === "open"
                        ? "text-red-400 bg-red-400/10 border-red-400/30"
                        : d.status === "under_review"
                          ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
                          : "text-green-400 bg-green-400/10 border-green-400/30"
                    }`}
                  >
                    {d.status?.replace(/_/g, " ")}
                  </span>

                  {/* Escrow Status */}
                  {d.order?.escrow_status && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded-full">
                      Funds Frozen
                    </span>
                  )}

                  {/* Reason */}
                  <h3 className="font-medium text-white mt-2">{d.reason}</h3>
                  <p className="text-sm text-white/50 mt-1">
                    {d.description || "No description provided"}
                  </p>

                  {/* Details */}
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/30">
                    <span>
                      👤 Buyer: {d.buyer?.username} ({d.buyer?.email})
                    </span>
                    <span>
                      🏪 Seller: {d.seller?.username} ({d.seller?.email})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-white/30">
                    <span>💰 Amount: ${d.order?.amount?.toLocaleString()}</span>
                    <span>🎮 {d.order?.account?.title}</span>
                  </div>
                  <div className="text-xs text-white/20 mt-1">
                    Filed: {new Date(d.created_at).toLocaleString()}
                  </div>

                  {/* Admin Notes Input */}
                  {showNotes === d.id && (
                    <div className="mt-3">
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add admin notes (optional)..."
                        rows={2}
                        className="input-glass w-full resize-none text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {(d.status === "open" || d.status === "under_review") && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleResolve(d, "refund")}
                      disabled={resolvingId === d.id}
                      className="px-4 py-2.5 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30 flex items-center gap-1 disabled:opacity-50"
                    >
                      <HiOutlineRefresh className="w-4 h-4" />
                      Refund Buyer
                    </button>
                    <button
                      onClick={() => handleResolve(d, "release")}
                      disabled={resolvingId === d.id}
                      className="px-4 py-2.5 bg-amber-500/20 text-amber-400 rounded-xl text-sm hover:bg-amber-500/30 flex items-center gap-1 disabled:opacity-50"
                    >
                      <HiOutlineCash className="w-4 h-4" />
                      Release to Seller
                    </button>
                    <button
                      onClick={() => handleResolve(d, "dismiss")}
                      disabled={resolvingId === d.id}
                      className="px-4 py-2.5 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 flex items-center gap-1 disabled:opacity-50"
                    >
                      <HiOutlineX className="w-4 h-4" />
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        setShowNotes(showNotes === d.id ? null : d.id);
                        setAdminNotes("");
                      }}
                      className="px-4 py-2 text-white/30 hover:text-white text-xs"
                    >
                      {showNotes === d.id ? "Hide Notes" : "Add Notes"}
                    </button>
                  </div>
                )}
                {d.order?.payment_proof && (
                  <button
                    onClick={async () => {
                      const url = await getPaymentProofUrl(
                        d.order.payment_proof,
                      );
                      if (url) window.open(url, "_blank");
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                  >
                    🔒 View Payment Proof
                  </button>
                )}

                {/* Resolved Status */}
                {d.status !== "open" && d.status !== "under_review" && (
                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        d.status === "resolved_buyer"
                          ? "bg-green-500/20 text-green-400"
                          : d.status === "resolved_seller"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-white/5 text-white/40"
                      }`}
                    >
                      {d.status === "resolved_buyer"
                        ? "Refunded"
                        : d.status === "resolved_seller"
                          ? "Released"
                          : "Dismissed"}
                    </span>
                    {d.resolved_at && (
                      <p className="text-xs text-white/20 mt-1">
                        {new Date(d.resolved_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}

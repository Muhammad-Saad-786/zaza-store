import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from("disputes")
        .select(
          `*, buyer:profiles!disputes_buyer_id_fkey(username), seller:profiles!disputes_seller_id_fkey(username), order:orders(amount, account:accounts(title))`,
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

  const resolveDispute = async (disputeId, resolution) => {
    try {
      await supabase
        .from("disputes")
        .update({ status: resolution, resolved_at: new Date().toISOString() })
        .eq("id", disputeId);

      toast.success(`Dispute ${resolution}`);
      fetchDisputes();
    } catch (error) {
      toast.error("Failed to resolve dispute");
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
      <h1 className="text-2xl font-display font-extrabold text-white">
        Disputes ({disputes.length})
      </h1>

      {disputes.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-white/40">No disputes filed</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <GlassCard key={d.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      d.status === "open"
                        ? "text-red-400 bg-red-400/10 border-red-400/30"
                        : d.status === "under_review"
                          ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
                          : "text-green-400 bg-green-400/10 border-green-400/30"
                    }`}
                  >
                    {d.status}
                  </span>

                  <h3 className="font-medium text-white mt-2">{d.reason}</h3>
                  <p className="text-sm text-white/50 mt-1">{d.description}</p>

                  <div className="flex gap-4 mt-2 text-xs text-white/30">
                    <span>Buyer: {d.buyer?.username}</span>
                    <span>Seller: {d.seller?.username}</span>
                    <span>Order: ${d.order?.amount}</span>
                    <span>{d.order?.account?.title}</span>
                  </div>
                </div>

                {(d.status === "open" || d.status === "under_review") && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => resolveDispute(d.id, "resolved_buyer")}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30"
                    >
                      Refund Buyer
                    </button>
                    <button
                      onClick={() => resolveDispute(d.id, "resolved_seller")}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm hover:bg-blue-500/30"
                    >
                      Release to Seller
                    </button>
                    <button
                      onClick={() => resolveDispute(d.id, "dismissed")}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30"
                    >
                      Dismiss
                    </button>
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

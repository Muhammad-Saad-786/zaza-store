import { useEffect } from "react";
import { motion } from "framer-motion";
import useAdminStore from "../../stores/useAdminStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

export default function Verifications() {
  const { verifications, loading, fetchVerifications, updateVerification } =
    useAdminStore();

  useEffect(() => {
    fetchVerifications();
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
        Seller Verifications
      </h1>

      {verifications.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-white/40">No verification requests</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {verifications.map((v) => (
            <GlassCard key={v.id} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{v.seller?.username}</p>
                  <p className="text-xs text-white/40">{v.seller?.email}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      v.status === "pending"
                        ? "bg-yellow-400/20 text-yellow-400"
                        : v.status === "approved"
                          ? "bg-green-400/20 text-green-400"
                          : "bg-red-400/20 text-red-400"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                {v.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateVerification(v.id, "approved", v.seller_id)
                      }
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        updateVerification(v.id, "rejected", v.seller_id)
                      }
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30"
                    >
                      Reject
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

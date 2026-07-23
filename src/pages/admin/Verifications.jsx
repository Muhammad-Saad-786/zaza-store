import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import useAdminStore from "../../stores/useAdminStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

export default function Verifications() {
  const {
    verifications,
    loading,
    fetchVerifications,
    approveVerification,
    rejectVerification,
  } = useAdminStore();

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
          <HiOutlineShieldCheck className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No verification requests</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {verifications.map((v) => (
            <GlassCard key={v.id} className="p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center font-bold text-white overflow-hidden flex-shrink-0">
                    {v.seller?.avatar_url ? (
                      <img
                        src={v.seller.avatar_url}
                        alt={v.seller?.username}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      v.seller?.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {v.seller?.username}
                    </p>
                    <p className="text-xs text-white/40">{v.seller?.email}</p>
                    <p className="text-xs text-white/30">
                      {v.seller?.total_sales || 0} sales •
                      {v.seller?.verified_seller
                        ? " Currently verified"
                        : " Not verified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      v.status === "pending"
                        ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
                        : v.status === "approved"
                          ? "text-green-400 bg-green-400/10 border-green-400/30"
                          : "text-red-400 bg-red-400/10 border-red-400/30"
                    }`}
                  >
                    {v.status}
                  </span>

                  {v.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveVerification(v.id, v.seller_id)}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30 flex items-center gap-1"
                      >
                        <HiOutlineCheck className="w-4 h-4" /> Approve & Give
                        Blue Tick
                      </button>
                      <button
                        onClick={() => rejectVerification(v.id, v.seller_id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 flex items-center gap-1"
                      >
                        <HiOutlineX className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}

                  {v.status === "approved" && (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <HiOutlineCheck className="w-4 h-4" /> Blue tick granted
                    </span>
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

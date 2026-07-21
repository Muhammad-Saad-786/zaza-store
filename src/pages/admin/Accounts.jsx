import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import useAdminStore from "../../stores/useAdminStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

export default function Accounts() {
  const {
    accounts,
    loading,
    fetchAllAccounts,
    updateAccountStatus,
    toggleFeatured,
    deleteAccount,
  } = useAdminStore();

  useEffect(() => {
    fetchAllAccounts();
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
        All Accounts ({accounts.length})
      </h1>

      <div className="space-y-3">
        {accounts.map((account) => (
          <GlassCard key={account.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {account.images?.[0]?.url ? (
                    <img
                      src={account.images[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "🎮"
                  )}
                </div>
                <div className="min-w-0">
                  <Link
                    to={`/account/${account.id}`}
                    className="text-sm font-medium text-white hover:text-brand-purple line-clamp-1"
                  >
                    {account.title}
                  </Link>
                  <p className="text-xs text-white/40">
                    Seller: {account.seller?.username} | ${account.price}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      account.status === "active"
                        ? "bg-green-400/20 text-green-400"
                        : account.status === "sold"
                          ? "bg-red-400/20 text-red-400"
                          : account.status === "pending"
                            ? "bg-yellow-400/20 text-yellow-400"
                            : "bg-white/10 text-white/40"
                    }`}
                  >
                    {account.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleFeatured(account.id, account.featured)}
                  className={`p-2 rounded-lg ${account.featured ? "text-brand-gold bg-brand-gold/10" : "text-white/30 hover:text-white"} transition-colors`}
                  title="Toggle Featured"
                >
                  <HiOutlineStar className="w-4 h-4" />
                </button>
                {account.status === "active" && (
                  <button
                    onClick={() => updateAccountStatus(account.id, "hidden")}
                    className="p-2 text-white/30 hover:text-white transition-colors"
                    title="Hide"
                  >
                    <HiOutlineEyeOff className="w-4 h-4" />
                  </button>
                )}
                {account.status === "hidden" && (
                  <button
                    onClick={() => updateAccountStatus(account.id, "active")}
                    className="p-2 text-white/30 hover:text-green-400 transition-colors"
                    title="Activate"
                  >
                    <HiOutlineEye className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteAccount(account.id)}
                  className="p-2 text-white/30 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}

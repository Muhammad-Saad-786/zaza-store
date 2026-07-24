import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlineEye,
} from "react-icons/hi";
import useAdminStore from "../../stores/useAdminStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function AdminAccounts() {
  const {
    accounts,
    loading,
    fetchAllAccounts,
    updateAccountStatus,
    toggleFeatured,
    deleteAccount,
  } = useAdminStore();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  const approveAccount = async (accountId) => {
    try {
      console.log("Approving account:", accountId);

      const { data, error } = await supabase
        .from("accounts")
        .update({
          approval_status: "approved",
          approved_at: new Date().toISOString(),
          status: "active", // Also set status to active
        })
        .eq("id", accountId)
        .select("id, approval_status, status")
        .single();

      if (error) {
        console.error("Approve error:", error);
        toast.error("Failed to approve: " + error.message);
        return;
      }

      console.log("Approve result:", data);
      toast.success("Account approved and now visible in marketplace! ");

      // Refresh the list
      fetchAllAccounts();
    } catch (err) {
      console.error("Approve catch error:", err);
      toast.error("Failed to approve");
    }
  };

  const rejectAccount = async (accountId) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      console.log("Rejecting account:", accountId, "Reason:", reason);

      const { data, error } = await supabase
        .from("accounts")
        .update({
          approval_status: "rejected",
          rejection_reason: reason,
          status: "hidden", // Hide rejected accounts
        })
        .eq("id", accountId)
        .select("id, approval_status")
        .single();

      if (error) {
        console.error("Reject error:", error);
        toast.error("Failed to reject: " + error.message);
        return;
      }

      console.log("Reject result:", data);
      toast.success("Account rejected");

      // Refresh the list
      fetchAllAccounts();
    } catch (err) {
      console.error("Reject catch error:", err);
      toast.error("Failed to reject");
    }
  };

  const filteredAccounts = accounts.filter((a) => {
    if (filter === "pending") return a.approval_status === "pending";
    if (filter === "approved") return a.approval_status === "approved";
    if (filter === "rejected") return a.approval_status === "rejected";
    return true;
  });

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
        Account Approvals ({filteredAccounts.length})
      </h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "All", count: accounts.length },
          {
            key: "pending",
            label: "Pending Review",
            count: accounts.filter((a) => a.approval_status === "pending")
              .length,
          },
          {
            key: "approved",
            label: "Approved",
            count: accounts.filter((a) => a.approval_status === "approved")
              .length,
          },
          {
            key: "rejected",
            label: "Rejected",
            count: accounts.filter((a) => a.approval_status === "rejected")
              .length,
          },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? f.key === "pending"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : f.key === "approved"
                    ? "bg-green-500/20 text-green-400"
                    : f.key === "rejected"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-purple-500/20 text-purple-400"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        {filteredAccounts.map((account) => (
          <GlassCard key={account.id} className="p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-amber-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                    className="text-sm font-medium text-white hover:text-purple-400 line-clamp-1"
                  >
                    {account.title}
                  </Link>
                  <p className="text-xs text-white/40">
                    Seller: {account.seller?.username} | ${account.price}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        account.approval_status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : account.approval_status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {account.approval_status}
                    </span>
                    {account.approval_status === "rejected" &&
                      account.rejection_reason && (
                        <span className="text-xs text-red-400/60">
                          {account.rejection_reason}
                        </span>
                      )}
                    <span className="text-xs text-white/20">
                      🖼️ {account.images?.length || 0}/5 images
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {account.approval_status === "pending" && (
                  <>
                    <button
                      onClick={() => approveAccount(account.id)}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30 flex items-center gap-1"
                    >
                      <HiOutlineCheck className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => rejectAccount(account.id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 flex items-center gap-1"
                    >
                      <HiOutlineX className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => toggleFeatured(account.id, account.featured)}
                  className={`p-2 rounded-lg ${account.featured ? "text-amber-400 bg-amber-400/10" : "text-white/30 hover:text-white"} transition-colors`}
                >
                  <HiOutlineStar className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteAccount(account.id)}
                  className="p-2 text-white/30 hover:text-red-400 transition-colors"
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

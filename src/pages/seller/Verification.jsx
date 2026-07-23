import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineCheck,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

export default function Verification() {
  const { user, profile } = useAuthStore();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchVerification();
  }, [user]);

  const fetchVerification = async () => {
    try {
      const { data, error } = await supabase
        .from("seller_verifications")
        .select("*")
        .eq("seller_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setVerification(data || null);
    } catch (error) {
      console.error("Failed to fetch verification:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitVerification = async () => {
    if ((profile?.total_sales || 0) < 1) {
      toast.error("You need at least 1 completed sale to request verification");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("seller_verifications")
        .insert([{ seller_id: user.id }]);

      if (error) {
        if (error.code === "23505") {
          toast("You already have a pending verification request");
        } else {
          throw error;
        }
      } else {
        toast.success(
          "Verification request submitted! Admin will review shortly.",
        );
        fetchVerification();
      }
    } catch (error) {
      toast.error("Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const hasMinSales = (profile?.total_sales || 0) >= 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Seller Verification
      </h1>
      {/* Status: Approved */}
      {verification?.status === "approved" && (
        <GlassCard className="p-8 text-center border-green-500/20">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
            <img
              src="/blue-verify-badge.png"
              alt="Verified Badge"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <h2 className="text-xl font-bold text-white mt-4">
            You're Verified!
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <img
              src="/blue-verify-badge.png"
              alt=""
              className="w-5 h-5 object-contain"
            />
            <span className="text-blue-400 font-semibold">
              Blue Tick Badge Active
            </span>
          </div>
          <p className="text-white/40 mt-2 max-w-md mx-auto">
            Your profile now shows a verified badge. Buyers trust verified
            sellers more!
          </p>
          <p className="text-xs text-white/20 mt-4">
            Verified on{" "}
            {new Date(verification.reviewed_at).toLocaleDateString()}
          </p>
        </GlassCard>
      )}
      {/* Status: Pending */}
      {verification?.status === "pending" && (
        <GlassCard className="p-8 text-center border-yellow-500/20">
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
            <HiOutlineClock className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white mt-4">
            Verification In Review
          </h2>
          <p className="text-white/40 mt-2 max-w-md mx-auto">
            Your request is being reviewed by our admin team. This usually takes
            24-48 hours. You'll receive a notification once it's processed.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-yellow-400/60">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Awaiting review
          </div>
        </GlassCard>
      )}
      {/* Status: Rejected */}
      {verification?.status === "rejected" && (
        <GlassCard className="p-8 text-center border-red-500/20">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <HiOutlineXCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mt-4">
            Verification Rejected
          </h2>
          <p className="text-white/40 mt-2 max-w-md mx-auto">
            Your verification was not approved. This could be due to
            insufficient sales history or account issues. You can apply again
            after completing more sales.
          </p>
          <Button
            onClick={submitVerification}
            variant="primary"
            className="mt-6"
            disabled={submitting || !hasMinSales}
          >
            {submitting ? "Submitting..." : "Apply Again"}
          </Button>
        </GlassCard>
      )}
      {/* // Status: Already Verified (badge granted but no verification record) */}
      {!verification && profile?.verified_seller && (
        <GlassCard className="p-8 text-center border-green-500/20">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
            <img
              src="/blue-verify-badge.png"
              alt="Verified Badge"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <h2 className="text-xl font-bold text-white mt-4">
            You're Verified! 🎉
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <img
              src="/blue-verify-badge.png"
              alt=""
              className="w-5 h-5 object-contain"
            />
            <span className="text-blue-400 font-semibold">
              Blue Tick Badge Active
            </span>
          </div>
          <p className="text-white/40 mt-2 max-w-md mx-auto">
            Your profile has the verified badge. Buyers trust verified sellers
            more!
          </p>
        </GlassCard>
      )}
      {/* Status: Not Applied */}
      {!verification && !profile?.verified_seller && (
        <GlassCard className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
            <HiOutlineShieldCheck className="w-10 h-10 text-white/30" />
          </div>
          <h2 className="text-xl font-bold text-white mt-4">Get Verified</h2>
          <p className="text-white/40 mt-2 max-w-md mx-auto">
            Verified sellers get a{" "}
            <img
              src="/blue-verify-badge.png"
              alt="blue tick"
              className="w-5 h-5 inline-block object-contain align-middle"
            />
            <span className="text-blue-400 font-semibold">
              {" "}
              blue tick badge
            </span>
            , appear more trustworthy to buyers, and typically sell accounts
            faster!
          </p>

          {/* Requirements Checklist */}
          <div className="mt-6 p-5 bg-white/[0.02] rounded-xl max-w-sm mx-auto text-left border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-3">
              Requirements:
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {hasMinSales ? (
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <HiOutlineCheck className="w-4 h-4 text-green-400" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                    <HiOutlineXCircle className="w-4 h-4 text-white/20" />
                  </div>
                )}
                <div>
                  <p
                    className={`text-sm ${hasMinSales ? "text-green-400" : "text-white/40"}`}
                  >
                    At least 1 completed sale
                  </p>
                  {!hasMinSales && (
                    <p className="text-xs text-white/20 mt-0.5">
                      You have {profile?.total_sales || 0} sales. Sell an
                      account first!
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <HiOutlineCheck className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-sm text-green-400">Active seller account</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <HiOutlineCheck className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-sm text-green-400">No active disputes</p>
              </div>
            </div>
          </div>

          {!hasMinSales ? (
            <div className="mt-6">
              <p className="text-white/40 text-sm mb-3">
                You need to complete at least 1 sale before requesting
                verification.
              </p>
              <Link to="/sell">
                <Button variant="gold">
                  <HiOutlineShoppingBag className="w-4 h-4" />
                  List an Account for Sale
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              onClick={submitVerification}
              variant="gold"
              className="mt-6"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <>
                  <HiOutlineShieldCheck className="w-5 h-5" />
                  Request Verification
                </>
              )}
            </Button>
          )}
        </GlassCard>
      )}
    </motion.div>
  );
}

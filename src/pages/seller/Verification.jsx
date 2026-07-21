import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineXCircle,
} from "react-icons/hi";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";

export default function Verification() {
  const { verification, fetchVerification, submitVerification } =
    useSellerDashboardStore();

  useEffect(() => {
    fetchVerification();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Seller Verification
      </h1>

      <GlassCard className="p-8 text-center">
        {verification?.status === "approved" ? (
          <>
            <HiOutlineShieldCheck className="w-20 h-20 text-cyber-neon mx-auto" />
            <h2 className="text-xl font-bold text-white mt-4">
              Verified Seller ✅
            </h2>
            <p className="text-white/40 mt-2">
              Your account is verified. Buyers trust verified sellers more!
            </p>
          </>
        ) : verification?.status === "pending" ? (
          <>
            <HiOutlineClock className="w-20 h-20 text-yellow-400 mx-auto" />
            <h2 className="text-xl font-bold text-white mt-4">
              Verification Pending
            </h2>
            <p className="text-white/40 mt-2">
              Your verification is under review. We'll notify you once it's
              approved.
            </p>
          </>
        ) : (
          <>
            <HiOutlineShieldCheck className="w-20 h-20 text-white/20 mx-auto" />
            <h2 className="text-xl font-bold text-white mt-4">Get Verified</h2>
            <p className="text-white/40 mt-2 max-w-md mx-auto">
              Verified sellers get more sales and buyer trust. Submit your
              verification request now.
            </p>
            <Button
              onClick={submitVerification}
              variant="gold"
              className="mt-6"
            >
              Request Verification
            </Button>
          </>
        )}
      </GlassCard>
    </motion.div>
  );
}

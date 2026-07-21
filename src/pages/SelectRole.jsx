import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineShoppingBag, HiOutlineCurrencyDollar } from "react-icons/hi";
import useAuthStore from "../stores/useAuthStore";
import Button from "../components/ui/Button";
import Logo from "../components/shared/Logo";
import toast from "react-hot-toast";

export default function SelectRole() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { profile, updateProfile } = useAuthStore();
  const navigate = useNavigate();

  // If user already has a role, redirect
  if (profile?.role && profile.role !== "buyer") {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);
    const result = await updateProfile({ role: selectedRole });
    setIsLoading(false);

    if (result.success) {
      toast.success(`You are now a ${selectedRole}!`);
      if (selectedRole === "seller") {
        navigate("/seller-dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/30 via-brand-gold/20 to-brand-purple/30 rounded-3xl blur-xl" />

        <div className="relative glass-modal p-8 sm:p-10 text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <h1 className="text-2xl font-display font-extrabold text-white mb-2">
            Welcome to ZAZA Store! 🎉
          </h1>
          <p className="text-white/40 text-sm mb-8">
            Choose how you want to use ZAZA Store
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setSelectedRole("buyer")}
              className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedRole === "buyer"
                  ? "border-brand-purple bg-brand-purple/10"
                  : "border-glass-border hover:border-white/20"
              }`}
            >
              <HiOutlineShoppingBag
                className={`w-10 h-10 ${
                  selectedRole === "buyer"
                    ? "text-brand-purple"
                    : "text-white/40"
                }`}
              />
              <div>
                <p
                  className={`font-semibold ${selectedRole === "buyer" ? "text-white" : "text-white/60"}`}
                >
                  Buyer
                </p>
                <p className="text-xs text-white/30 mt-1">
                  Browse & buy accounts
                </p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole("seller")}
              className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedRole === "seller"
                  ? "border-brand-gold bg-brand-gold/10"
                  : "border-glass-border hover:border-white/20"
              }`}
            >
              <HiOutlineCurrencyDollar
                className={`w-10 h-10 ${
                  selectedRole === "seller"
                    ? "text-brand-gold"
                    : "text-white/40"
                }`}
              />
              <div>
                <p
                  className={`font-semibold ${selectedRole === "seller" ? "text-white" : "text-white/60"}`}
                >
                  Seller
                </p>
                <p className="text-xs text-white/30 mt-1">
                  Sell accounts & earn
                </p>
              </div>
            </button>
          </div>

          <Button
            onClick={handleRoleSelect}
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading || !selectedRole}
          >
            {isLoading ? "Saving..." : "Continue"}
          </Button>

          <p className="text-xs text-white/20 mt-4">
            You can switch between buyer and seller anytime from settings
          </p>
        </div>
      </motion.div>
    </div>
  );
}

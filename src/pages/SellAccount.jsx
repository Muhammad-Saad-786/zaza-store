import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineCheck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import toast from "react-hot-toast";
import useSellAccountStore from "../stores/useSellAccountStore";
import useAuthStore from "../stores/useAuthStore";
import StepIndicator from "../components/sell/StepIndicator";
import BasicInfoStep from "../components/sell/BasicInfoStep";
import DetailsStep from "../components/sell/DetailsStep";
import ImagesStep from "../components/sell/ImagesStep";
import PreviewStep from "../components/sell/PreviewStep";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";

const stepNames = ["Basic Info", "Details", "Images", "Preview"];

export default function SellAccount() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    currentStep,
    totalSteps,
    isSubmitting,
    error,
    nextStep,
    prevStep,
    loadDraft,
    submitListing,
    resetForm,
  } = useSellAccountStore();

  useEffect(() => {
    // Check for saved draft
    const hasDraft = loadDraft();
    if (hasDraft) {
      toast("Draft loaded! Continue where you left off.", {
        icon: "📝",
      });
    }
  }, []);

  const handleSubmit = async () => {
    const result = await submitListing();
    if (result.success) {
      toast.success("Account listed successfully!", { icon: "🎉" });
      navigate(`/account/${result.accountId}`);
    } else {
      toast.error(result.error || "Failed to list account");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Login Required</h2>
          <p className="mt-2 text-white/40">Please login to sell an account</p>
          <button onClick={() => navigate("/login")} className="mt-4">
            <Button variant="primary">Go to Login</Button>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-display font-extrabold text-white">
            Sell Your <span className="text-gradient">Account</span>
          </h1>
          <p className="mt-2 text-white/40">
            Fill in the details below to list your MLBB account
          </p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator steps={stepNames} currentStep={currentStep} />

        {/* Form Card */}
        <GlassCard className="p-6 sm:p-8 mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <BasicInfoStep />}
              {currentStep === 2 && <DetailsStep />}
              {currentStep === 3 && <ImagesStep />}
              {currentStep === 4 && <PreviewStep />}
            </motion.div>
          </AnimatePresence>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-glass-border">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  variant="primary"
                  disabled={error ? true : false}
                >
                  Next
                  <HiOutlineChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant="gold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-brand-darker/30 border-t-brand-darker rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <HiOutlineCheck className="w-5 h-5" />
                      Publish Listing
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

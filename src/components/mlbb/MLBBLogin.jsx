// src/components/mlbb/MLBBLogin.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineServer,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiOutlineArrowLeft,
} from "react-icons/hi";
import useMLBBAuthStore from "../../stores/useMLBBAuthStore";
import Button from "../ui/Button";

export default function MLBBLogin({ onClose, onSuccess }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [roleId, setRoleId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [focused, setFocused] = useState(null);

  const {
    sendVC,
    loginWithVC,
    loading,
    error,
    verificationSent,
    resendTimer,
    clearError,
    isLoggedIn,
    mlbbUser,
  } = useMLBBAuthStore();

  // Watch for successful login
  useEffect(() => {
    if (isLoggedIn && mlbbUser?.name) {
      // User info fetched successfully
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose?.();
        // Navigate to home or dashboard
        navigate("/");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, mlbbUser?.name]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!roleId || !zoneId) return;

    const result = await sendVC(roleId, zoneId);
    if (result.success) {
      setStep(2);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode) return;

    const result = await loginWithVC(roleId, zoneId, verificationCode);
    if (result.success) {
      // Login successful, the useEffect will handle navigation
      console.log("MLBB Login successful");
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    await sendVC(roleId, zoneId);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSendCode}
            className="space-y-5"
          >
            {/* Role ID Input */}
            <div className="relative">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    focused === "roleId"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-white/[0.03] text-white/20"
                  }`}
                >
                  <HiOutlineUser className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-white/30 uppercase tracking-widest mb-1">
                    Role ID
                  </label>
                  <input
                    type="text"
                    value={roleId}
                    onChange={(e) =>
                      setRoleId(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    onFocus={() => setFocused("roleId")}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter your Role ID"
                    className="w-full bg-transparent border-b-2 border-white/10 text-white text-lg font-light pb-2 outline-none focus:border-purple-500/50 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
            </div>

            {/* Zone ID Input */}
            <div className="relative">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    focused === "zoneId"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-white/[0.03] text-white/20"
                  }`}
                >
                  <HiOutlineServer className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-white/30 uppercase tracking-widest mb-1">
                    Zone ID
                  </label>
                  <input
                    type="text"
                    value={zoneId}
                    onChange={(e) =>
                      setZoneId(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    onFocus={() => setFocused("zoneId")}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter your Zone ID"
                    className="w-full bg-transparent border-b-2 border-white/10 text-white text-lg font-light pb-2 outline-none focus:border-amber-500/50 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading || !roleId || !zoneId}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending Code...
                </div>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleVerify}
            className="space-y-5"
          >
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              Change ID
            </button>

            {/* Player Info */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-white/40 text-xs">
                Role ID: <span className="text-white">{roleId}</span>
              </p>
              <p className="text-white/40 text-xs mt-1">
                Zone ID: <span className="text-white">{zoneId}</span>
              </p>
            </div>

            {/* Verification Code */}
            <div className="relative">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    focused === "vc"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-white/[0.03] text-white/20"
                  }`}
                >
                  <HiOutlineKey className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-white/30 uppercase tracking-widest mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                      )
                    }
                    onFocus={() => setFocused("vc")}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-transparent border-b-2 border-white/10 text-white text-2xl font-light pb-2 outline-none focus:border-green-500/50 transition-all placeholder:text-white/10 tracking-widest"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Info about code location */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <HiOutlineShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-300/70 text-xs">
                Check your in-game mailbox for the verification code.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading || verificationCode.length < 4}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify & Login"
              )}
            </Button>

            {/* Resend Button */}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors text-sm disabled:opacity-30"
            >
              <HiOutlineRefresh className="w-4 h-4" />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import toast from "react-hot-toast";
import useAuthStore from "../stores/useAuthStore";
import Button from "../components/ui/Button";
import Logo from "../components/shared/Logo";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await resetPassword(data.password);

    if (result.success) {
      toast.success("Password updated! Please sign in.");
      navigate("/login");
    } else {
      toast.error(result.error || "Failed to reset password");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/30 to-brand-purple/30 rounded-3xl blur-xl" />

        <div className="relative glass-modal p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-extrabold text-white">
              Reset Password
            </h1>
            <p className="mt-2 text-white/40 text-sm">
              Enter your new password
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Minimum 8 characters"
                  className="input-glass pl-12 pr-12 py-3 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-400 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Re-enter password"
                  className="input-glass pl-12 pr-4 py-3 w-full"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-red-400 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

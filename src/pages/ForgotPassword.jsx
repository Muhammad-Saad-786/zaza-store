import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiOutlineMail, HiOutlineArrowLeft } from "react-icons/hi";
import toast from "react-hot-toast";
import useAuthStore from "../stores/useAuthStore";
import Button from "../components/ui/Button";
import Logo from "../components/shared/Logo";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { forgotPassword } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await forgotPassword(data.email);

    if (result.success) {
      setEmailSent(true);
      toast.success("Reset link sent to your email!");
    } else {
      toast.error(result.error || "Failed to send reset email");
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
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/30 via-brand-gold/20 to-brand-purple/30 rounded-3xl blur-xl" />

        <div className="relative glass-modal p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">📧</div>
              <h1 className="text-2xl font-display font-extrabold text-white">
                Check Your Email
              </h1>
              <p className="mt-3 text-white/50 text-sm">
                We've sent a password reset link to your email. Please check
                your inbox and follow the instructions.
              </p>
              <Link to="/login" className="block mt-6">
                <Button variant="ghost">
                  <HiOutlineArrowLeft className="w-4 h-4" />
                  Back to Login
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-display font-extrabold text-white">
                  Forgot Password
                </h1>
                <p className="mt-2 text-white/40 text-sm">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="you@example.com"
                      className="input-glass pl-12 pr-4 py-3 w-full"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-red-400 text-xs">
                      {errors.email.message}
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
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <p className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-brand-purple hover:text-brand-gold transition-colors inline-flex items-center gap-1"
                >
                  <HiOutlineArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

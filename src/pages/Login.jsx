import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiOutlineMail, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import useAuthStore from "../stores/useAuthStore";
import Button from "../components/ui/Button";
import Logo from "../components/shared/Logo";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, user, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    clearError();

    const result = await signIn(data.email, data.password);

    if (result.success) {
      toast.success("Welcome back!", {
        icon: "👋",
        style: {
          background: "rgba(10, 10, 10, 0.9)",
          color: "#fff",
          border: "1px solid rgba(139, 92, 246, 0.3)",
        },
      });
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || "Invalid email or password");
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    clearError();
    const result = await signInWithGoogle();
    if (!result.success) {
      toast.error(result.error || "Google sign in failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)",
          }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(245, 158, 11, 0.1), transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/30 via-brand-gold/20 to-brand-purple/30 rounded-3xl blur-xl" />

        {/* Login Card */}
        <div className="relative glass-modal p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-extrabold text-white">
              Welcome Back
            </h1>
            <p className="mt-2 text-white/40 text-sm">
              Sign in to your ZAZA Store account
            </p>
          </div>

          {/* Google Sign In */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 glass-card hover:border-brand-purple/30 transition-all duration-300 mb-6"
          >
            <FcGoogle className="w-5 h-5" />
            <span className="text-white/80 font-medium text-sm">
              Continue with Google
            </span>
          </motion.button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-brand-darker text-white/30">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
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
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-red-400 text-xs"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter your password"
                  className="input-glass pl-12 pr-12 py-3 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-red-400 text-xs"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-brand-purple hover:text-brand-gold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-white/40">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-brand-purple hover:text-brand-gold font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

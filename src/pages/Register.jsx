import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HiOutlineMail,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import useAuthStore from "../stores/useAuthStore";
import Button from "../components/ui/Button";
import Logo from "../components/shared/Logo";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  role: z.enum(["buyer", "seller"]),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle, user } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "buyer",
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await signUp(
      data.email,
      data.password,
      data.username,
      data.role,
    );

    if (result.success) {
      toast.success("Account created! Check your email to verify.", {
        icon: "🎉",
        duration: 5000,
      });
      navigate("/login");
    } else {
      toast.error(result.error || "Registration failed");
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      toast.error(result.error || "Google sign in failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/30 via-brand-gold/20 to-brand-purple/30 rounded-3xl blur-xl" />

        <div className="relative glass-modal p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-extrabold text-white">
              Create Account
            </h1>
            <p className="mt-2 text-white/40 text-sm">
              Join ZAZA Store and start trading
            </p>
          </div>

          {/* Google Sign Up */}
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

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-brand-darker text-white/30">
                or register with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Username
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  {...register("username")}
                  placeholder="Your username"
                  className="input-glass pl-12 pr-4 py-3 w-full"
                />
              </div>
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-red-400 text-xs"
                >
                  {errors.username.message}
                </motion.p>
              )}
            </div>

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
                  placeholder="Minimum 8 characters"
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

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedRole === "buyer"
                      ? "border-brand-purple bg-brand-purple/10"
                      : "border-glass-border hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    value="buyer"
                    {...register("role")}
                    className="sr-only"
                  />
                  <HiOutlineShoppingBag
                    className={`w-6 h-6 ${
                      selectedRole === "buyer"
                        ? "text-brand-purple"
                        : "text-white/40"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedRole === "buyer" ? "text-white" : "text-white/50"
                    }`}
                  >
                    Buy Accounts
                  </span>
                </label>

                <label
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedRole === "seller"
                      ? "border-brand-gold bg-brand-gold/10"
                      : "border-glass-border hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    value="seller"
                    {...register("role")}
                    className="sr-only"
                  />
                  <HiOutlineCurrencyDollar
                    className={`w-6 h-6 ${
                      selectedRole === "seller"
                        ? "text-brand-gold"
                        : "text-white/40"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedRole === "seller" ? "text-white" : "text-white/50"
                    }`}
                  >
                    Sell Accounts
                  </span>
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                {...register("agreeToTerms")}
                className="mt-1 w-4 h-4 rounded border-glass-border bg-white/5 text-brand-purple focus:ring-brand-purple focus:ring-offset-0"
              />
              <label className="text-sm text-white/40">
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-brand-purple hover:text-brand-gold transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-brand-purple hover:text-brand-gold transition-colors"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs"
              >
                {errors.agreeToTerms.message}
              </motion.p>
            )}

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
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-purple hover:text-brand-gold font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

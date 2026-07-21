import { motion } from "framer-motion";
import clsx from "clsx";

const variants = {
  primary: "btn-primary",
  gold: "btn-gold",
  ghost: "btn-ghost",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  magnetic = false,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: magnetic ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

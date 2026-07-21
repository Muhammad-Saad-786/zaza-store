import { motion } from "framer-motion";
import clsx from "clsx";

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  ...props
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      className={clsx(
        hover ? "glass-card-hover" : "glass-card",
        glow && "glow-purple",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

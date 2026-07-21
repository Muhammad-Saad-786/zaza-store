import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Logo({ size = "md" }) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      {/* Logo Icon */}
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative w-10 h-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple to-brand-purple-deep rounded-xl rotate-45 group-hover:rounded-2xl transition-all duration-300" />
        <div className="absolute inset-1 bg-brand-darker rounded-lg rotate-45" />
        <span className="absolute inset-0 flex items-center justify-center text-brand-gold font-bold text-lg font-display">
          Z
        </span>
      </motion.div>

      {/* Logo Text */}
      <div className="flex flex-col">
        <span
          className={`${sizes[size]} font-display font-extrabold tracking-tight`}
        >
          <span className="text-white">ZAZA</span>
          <span className="text-gradient">.</span>
        </span>
        {size === "lg" && (
          <span className="text-xs text-white/40 tracking-[0.2em] uppercase">
            Store
          </span>
        )}
      </div>
    </Link>
  );
}

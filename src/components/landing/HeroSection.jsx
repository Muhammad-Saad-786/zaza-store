import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineStar,
} from "react-icons/hi";
import Button from "../ui/Button";
import FloatingElements from "./FloatingElements";
import AnimatedBackground from "../ui/AnimatedBackground";

export default function HeroSection() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [stats, setStats] = useState([
    { value: 0, target: 12500, suffix: "+", label: "Accounts Sold" },
    { value: 0, target: 8500, suffix: "+", label: "Happy Buyers" },
    { value: 0, target: 3200, suffix: "+", label: "Verified Sellers" },
    { value: 0, target: 99.9, suffix: "%", label: "Secure Rate" },
  ]);

  // Animated counter
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    stats.forEach((stat, index) => {
      let current = 0;
      const increment = stat.target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.target) {
          current = stat.target;
          clearInterval(timer);
        }
        setStats((prev) => {
          const newStats = [...prev];
          newStats[index] = { ...newStats[index], value: Math.floor(current) };
          return newStats;
        });
      }, interval);
    });
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background */}
      <AnimatedBackground />

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)",
          }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(245, 158, 11, 0.1), transparent 70%)",
          }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold leading-[1.1]"
              >
                <span className="text-white">Buy & Sell</span>
                <br />
                <span className="text-gradient">MLBB Accounts</span>
                <br />
                <span className="text-white">Securely</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-lg text-white/50 max-w-lg leading-relaxed"
              >
                The ultimate marketplace for Mobile Legends accounts. Find your
                dream account with rare skins, high ranks, and verified sellers.
                Your next victory starts here.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link to="/marketplace">
                  <Button variant="primary" size="lg" magnetic>
                    <HiOutlineSearch className="w-5 h-5" />
                    Browse Accounts
                  </Button>
                </Link>
                <Link to="/sell">
                  <Button variant="gold" size="lg" magnetic>
                    <HiOutlineLightningBolt className="w-5 h-5" />
                    Sell Account
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 flex flex-wrap gap-6"
              >
                {[
                  { icon: HiOutlineShieldCheck, text: "Secure Escrow" },
                  { icon: HiOutlineStar, text: "Verified Sellers" },
                  { icon: HiOutlineLightningBolt, text: "Instant Delivery" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-white/40"
                  >
                    <item.icon className="w-5 h-5 text-brand-purple" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-10"
              >
                <div className="relative max-w-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-brand-gold/20 rounded-2xl blur-xl" />
                  <div className="relative flex items-center glass-card p-2">
                    <HiOutlineSearch className="w-5 h-5 text-white/30 ml-3" />
                    <input
                      type="text"
                      placeholder="Search by hero, rank, or skin..."
                      className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-white placeholder-white/30 text-sm"
                    />
                    <Button variant="primary" size="sm">
                      Search
                    </Button>
                  </div>
                </div>
                {/* Popular Searches */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    "Mythic Glory",
                    "Collector Skins",
                    "Legend",
                    "KOF",
                    "Sanrio",
                  ].map((tag) => (
                    <Link
                      key={tag}
                      to={`/marketplace?search=${tag.toLowerCase()}`}
                      className="px-3 py-1 text-xs text-white/40 hover:text-brand-purple bg-white/5 hover:bg-brand-purple/10 rounded-full border border-transparent hover:border-brand-purple/30 transition-all duration-300"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Side - 3D Card Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block relative"
            >
              <FloatingElements />

              {/* Main Preview Card */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                {/* Card Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple via-brand-gold to-brand-purple rounded-3xl blur-2xl opacity-30 animate-gradient" />

                {/* Card */}
                <div className="relative glass-modal p-6">
                  {/* Rank Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-brand-gold">
                        Mythical Glory
                      </span>
                    </div>
                    <span className="badge-purple">Verified</span>
                  </div>

                  {/* Heroes Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-white/5 rounded-xl border border-glass-border flex items-center justify-center"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple/30 to-brand-gold/30" />
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Heroes", value: "121" },
                      { label: "Skins", value: "342" },
                      { label: "Collector", value: "12" },
                      { label: "Legend", value: "5" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="text-center p-2 bg-white/5 rounded-lg"
                      >
                        <div className="text-brand-gold font-bold">
                          {stat.value}
                        </div>
                        <div className="text-xs text-white/40">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                    <div>
                      <div className="text-xs text-white/40">Price</div>
                      <div className="text-2xl font-bold text-gradient-gold">
                        $1,299
                      </div>
                    </div>
                    <Button variant="primary" size="sm">
                      View Account
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Floating Secondary Cards */}
              <motion.div
                animate={{
                  y: [10, -5, 10],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -top-8 -right-8 glass-card p-4 w-48"
              >
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-xs text-white/40">Collector Skins</div>
                    <div className="text-sm font-bold text-cyber-neon">
                      Premium Accounts
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [-5, 10, -5],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                className="absolute -bottom-6 -left-8 glass-card p-4 w-44"
              >
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-xs text-white/40">100% Secure</div>
                    <div className="text-sm font-bold text-brand-gold">
                      Escrow Protected
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-dark to-transparent pointer-events-none" />
    </section>
  );
}

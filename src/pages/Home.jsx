import { useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import HeroSection from "../components/landing/HeroSection";
import StatsSection from "../components/landing/StatsSection";
import FeaturedListings from "../components/landing/FeaturedListings";
import CategoriesSection from "../components/landing/CategoriesSection";
import FAQSection from "../components/landing/FAQSection";
import CTASection from "../components/landing/CTASection";

export default function Home() {
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative">
      {/* Progress Bar */}

      {/* Floating CTA (shows on scroll) */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: false, margin: "-100px" }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.a
          href="/sell"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-brand-purple text-white rounded-full shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 transition-shadow"
        >
          <span className="font-semibold">Sell Account</span>
          <span className="text-lg">💰</span>
        </motion.a>
      </motion.div>

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Listings */}
      <FeaturedListings />

      {/* Categories */}
      <CategoriesSection />

      {/* FAQ */}
      <FAQSection />

      {/* CTA */}
      <CTASection />
    </div>
  );
}

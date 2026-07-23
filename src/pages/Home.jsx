import { useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import HeroSection from "../components/landing/HeroSection";
import StatsSection from "../components/landing/StatsSection";
import FAQSection from "../components/landing/FAQSection";
import RippleDisplacementSlider from "../components/gsap/RippleDisplacementSlider";
import PixelatedImageTrail from "../components/gsap/PixelatedImageTrail";
import { HiOutlineLightningBolt } from "react-icons/hi";
export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative">
      {/* Hero Section - Video Background with Laptop Frame */}
      <HeroSection />

      {/* Stats Counter Section */}
      <StatsSection />

      {/* Skin Collection Showcase - Ripple Slider */}
      <section className="relative py-20 bg-black">
        <div className="text-center mb-12 px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
          >
            Exclusive{" "}
            <span className="text-transparent bg-clip-text bg-purple-600">
              Skin Collection
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-lg mt-3 max-w-xl mx-auto"
          >
            Browse accounts with the rarest and most sought-after skins in
            Mobile Legends
          </motion.p>
        </div>
        <div className="h-[600px] w-full">
          <RippleDisplacementSlider />
        </div>
      </section>

      {/* Interactive Skin Trail Section */}
      <section className="relative py-20 bg-black overflow-hidden">
        <div className="text-center mb-8 px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
          >
            Move Your Cursor{" "}
            <span className="text-transparent bg-clip-text bg-purple-600">
              & Explore
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-lg mt-3 max-w-xl mx-auto"
          >
            Hover over this section to reveal stunning skin portraits in an
            interactive trail
          </motion.p>
        </div>
        <div className="relative h-[500px]">
          <PixelatedImageTrail
            images={[
              "/Angelic-Agent-trail.jpg",
              "/gusion-kof.jpg",
              "/Chou-trail.jpg",
              "/Lesley-trail.jpg",
              "/Lunox-trail.jpg",
              "/Pharsa-trail.jpg",
            ]}
            imageSize={200}
            slices={5}
          />
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="relative py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              How It{" "}
              <span className="text-transparent bg-clip-text bg-purple-600">
                Works
              </span>
            </h2>
            <p className="text-white/40 text-lg mt-3 max-w-xl mx-auto">
              Buy and sell MLBB accounts in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: "🔍",
                title: "Browse Accounts",
                desc: "Search through verified listings with your favorite skins, heroes, and ranks.",
              },
              {
                step: "02",
                icon: "🛒",
                title: "Secure Purchase",
                desc: "Buy with confidence. Payment is held in escrow until you confirm the account.",
              },
              {
                step: "03",
                icon: "🎮",
                title: "Start Playing",
                desc: "Get your account details instantly and jump into the Land of Dawn.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group"
              >
                <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-300">
                  <span className="text-5xl font-black text-white/5 group-hover:text-purple-500/10 transition-colors absolute top-4 right-6">
                    {item.step}
                  </span>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="relative py-16 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Verified Sellers", value: "3,200+" },
              { label: "Accounts Sold", value: "12,500+" },
              { label: "Happy Buyers", value: "8,500+" },
              { label: "Secure Rate", value: "99.9%" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-white/30 text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Updated for ZAZA Store */}
      <FAQSection />

      {/* Floating CTA */}
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
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
        >
          <span className="font-semibold">Sell Account</span>
          <HiOutlineLightningBolt className="w-5 h-5" />
        </motion.a>
      </motion.div>
    </div>
  );
}

import { useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import HeroSection from "../components/landing/HeroSection";
import FAQSection from "../components/landing/FAQSection";
import { HiOutlineLightningBolt } from "react-icons/hi";
import SEO from "../components/ui/SEO";
import { pageSEO } from "../config/seo";
export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative">
      <SEO
        title={pageSEO.home.title}
        description={pageSEO.home.description}
        keywords={pageSEO.home.keywords}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "ZAZA Store",
          description: pageSEO.home.description,
          url: "https://zaza-store.vercel.app",
        }}
      />
      {/* Hero Section - Video Background with Laptop Frame */}
      <HeroSection />

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
                icon: "🔍",
                title: "Browse Accounts",
                desc: "Search through verified listings with your favorite skins, heroes, and ranks.",
              },
              {
                icon: "🛒",
                title: "Secure Purchase",
                desc: "Buy with confidence. Payment is held in escrow until you confirm the account.",
              },
              {
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
                <div className="p-8 rounded-xl bg-[#1f1f29]">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
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

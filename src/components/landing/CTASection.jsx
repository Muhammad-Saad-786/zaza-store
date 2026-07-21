import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineLightningBolt, HiOutlineShoppingBag } from "react-icons/hi";
import Button from "../ui/Button";

export default function CTASection() {
  return (
    <section className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-purple-deep via-brand-purple to-brand-purple-deep animate-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6TTM2IDI0djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

          {/* Content */}
          <div className="relative px-6 py-16 sm:px-12 sm:py-20 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white"
            >
              Ready to Find Your
              <br />
              <span className="text-brand-gold">Dream Account?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-white/60 text-lg max-w-xl mx-auto"
            >
              Join thousands of players who already found their perfect MLBB
              account on ZAZA Store.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <Link to="/marketplace">
                <Button variant="gold" size="lg" magnetic>
                  <HiOutlineShoppingBag className="w-5 h-5" />
                  Browse Marketplace
                </Button>
              </Link>
              <Link to="/sell">
                <Button
                  variant="ghost"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                  magnetic
                >
                  <HiOutlineLightningBolt className="w-5 h-5" />
                  Sell Your Account
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

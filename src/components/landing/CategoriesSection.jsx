import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";

const categories = [
  {
    title: "Mythical Glory",
    count: "2,340+",
    gradient: "from-brand-gold/20 to-brand-gold/5",
    border: "hover:border-brand-gold/50",
    href: "/marketplace?rank=mythical-glory",
  },
  {
    title: "Collector Skins",
    count: "1,890+",
    gradient: "from-brand-purple/20 to-brand-purple/5",
    border: "hover:border-brand-purple/50",
    href: "/marketplace?skin=collector",
  },
  {
    title: "Legend Skins",
    count: "950+",
    gradient: "from-cyber-neon/20 to-cyber-neon/5",
    border: "hover:border-cyber-neon/50",
    href: "/marketplace?skin=legend",
  },
  {
    title: "KOF Series",
    count: "420+",
    gradient: "from-red-500/20 to-red-500/5",
    border: "hover:border-red-500/50",
    href: "/marketplace?series=kof",
  },
  {
    title: "Sanrio Collection",
    count: "380+",
    gradient: "from-pink-500/20 to-pink-500/5",
    border: "hover:border-pink-500/50",
    href: "/marketplace?series=sanrio",
  },
  {
    title: "Aspirants",
    count: "560+",
    gradient: "from-yellow-500/20 to-yellow-500/5",
    border: "hover:border-yellow-500/50",
    href: "/marketplace?series=aspirant",
  },
  {
    title: "Zodiac Series",
    count: "720+",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    border: "hover:border-indigo-500/50",
    href: "/marketplace?series=zodiac",
  },
  {
    title: "Star Wars",
    count: "290+",
    gradient: "from-blue-500/20 to-blue-500/5",
    border: "hover:border-blue-500/50",
    href: "/marketplace?series=star-wars",
  },
];

export default function CategoriesSection() {
  return (
    <section className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Browse by <span className="text-gradient">Category</span>
          </h2>
          <p className="mt-2 text-white/40">
            Find accounts with your favorite skins and ranks
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link to={category.href}>
                <GlassCard
                  className={`p-5 cursor-pointer group ${category.border}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} border border-white/10 mb-4 flex items-center justify-center`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white/80 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-brand-purple transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-white/30 mt-1">
                    {category.count} accounts
                  </p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

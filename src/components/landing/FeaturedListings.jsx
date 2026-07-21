import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineHeart, HiHeart, HiOutlineEye } from "react-icons/hi";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { GiCrown, GiDiamondHard } from "react-icons/gi";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";

// Mock data
const featuredAccounts = [
  {
    id: 1,
    title: "Mythical Glory 1000★ | 342 Skins | 12 Collector",
    rank: "Mythical Glory",
    rankIcon: "👑",
    heroes: 121,
    skins: 342,
    collector: 12,
    legend: 5,
    price: 1299,
    image: null,
    seller: "ProSeller",
    verified: true,
    views: 2340,
    likes: 156,
  },
  {
    id: 2,
    title: "Mythical Honor | 280 Skins | KOF Complete",
    rank: "Mythical Honor",
    rankIcon: "⭐",
    heroes: 118,
    skins: 280,
    collector: 8,
    legend: 3,
    price: 899,
    image: null,
    seller: "MLShop",
    verified: true,
    views: 1890,
    likes: 98,
  },
  {
    id: 3,
    title: "Mythic 800★ | Sanrio + Aspirant | Rare",
    rank: "Mythic",
    rankIcon: "💎",
    heroes: 115,
    skins: 310,
    collector: 10,
    legend: 4,
    price: 1499,
    image: null,
    seller: "GameVault",
    verified: true,
    views: 3200,
    likes: 234,
  },
  {
    id: 4,
    title: "Legend V | 250 Skins | Zodiac Complete",
    rank: "Legend",
    rankIcon: "🏆",
    heroes: 110,
    skins: 250,
    collector: 6,
    legend: 2,
    price: 649,
    image: null,
    seller: "EliteDeals",
    verified: false,
    views: 1200,
    likes: 67,
  },
  {
    id: 5,
    title: "Mythical Immortal | 400+ Skins | Full Collection",
    rank: "Mythical Immortal",
    rankIcon: "🔥",
    heroes: 123,
    skins: 412,
    collector: 15,
    legend: 7,
    price: 2499,
    image: null,
    seller: "PremiumGG",
    verified: true,
    views: 5600,
    likes: 432,
  },
];

export default function FeaturedListings() {
  const scrollRef = useRef(null);
  const [likedIds, setLikedIds] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const toggleLike = (id) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <section className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              Featured <span className="text-gradient">Accounts</span>
            </h2>
            <p className="mt-2 text-white/40">
              Hand-picked premium accounts for you
            </p>
          </motion.div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("left")}
              className="p-3 glass-card hover:border-brand-purple/50 transition-all"
            >
              <FiChevronLeft className="w-5 h-5 text-white/70" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("right")}
              className="p-3 glass-card hover:border-brand-purple/50 transition-all"
            >
              <FiChevronRight className="w-5 h-5 text-white/70" />
            </motion.button>
          </div>
        </div>

        {/* Carousel */}
        <motion.div
          ref={scrollRef}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        >
          {featuredAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="min-w-[320px] sm:min-w-[350px]"
              onMouseEnter={() => setHoveredId(account.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <GlassCard className="p-5 relative group">
                {/* Featured Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="badge-gold text-xs">Featured</span>
                </div>

                {/* Like Button */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => toggleLike(account.id)}
                  className="absolute top-3 right-3 z-10 p-2 glass-card hover:border-brand-purple/50 transition-all"
                >
                  {likedIds.includes(account.id) ? (
                    <HiHeart className="w-5 h-5 text-red-500" />
                  ) : (
                    <HiOutlineHeart className="w-5 h-5 text-white/50 hover:text-red-400 transition-colors" />
                  )}
                </motion.button>

                {/* Image Placeholder */}
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <div className="aspect-[16/10] bg-gradient-to-br from-brand-purple/20 via-brand-darker to-brand-gold/10 flex items-center justify-center">
                    <div className="text-center">
                      <GiCrown
                        className="text-brand-gold/30 mx-auto"
                        size={48}
                      />
                      <div className="mt-2 text-white/20 text-sm">
                        Account Preview
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredId === account.id ? 1 : 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-brand-darker via-transparent to-transparent flex items-end justify-center p-4"
                  >
                    <Link to={`/account/${account.id}`}>
                      <Button variant="primary" size="sm">
                        <HiOutlineEye className="w-4 h-4" />
                        Quick View
                      </Button>
                    </Link>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  {/* Title */}
                  <h3 className="font-semibold text-white leading-snug line-clamp-2">
                    {account.title}
                  </h3>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Heroes", value: account.heroes },
                      { label: "Skins", value: account.skins },
                      { label: "Collector", value: account.collector },
                      { label: "Legend", value: account.legend },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg"
                      >
                        <span className="text-xs text-white/40">
                          {stat.label}
                        </span>
                        <span className="text-xs font-semibold text-white/80">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-glass-border">
                    <div>
                      <div className="text-xs text-white/40">Price</div>
                      <div className="text-xl font-bold text-gradient-gold">
                        ${account.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {account.verified && (
                          <span className="badge-cyan text-xs">✓ Verified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-white/30 text-xs">
                        <HiOutlineEye className="w-3 h-3" />
                        {account.views.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link to="/marketplace">
            <Button variant="ghost" size="lg">
              View All Accounts
              <FiChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

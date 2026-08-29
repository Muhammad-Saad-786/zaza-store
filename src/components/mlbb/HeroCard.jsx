// src/components/mlbb/HeroCard.jsx
import { motion } from "framer-motion";

export default function HeroCard({ hero, onClick, index = 0, size = "small" }) {
  const heroData = hero.data?.hero?.data || hero.data?.main_hero?.data || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] hover:border-purple-500/30 hover:bg-white/[0.04] transition-all cursor-pointer group"
    >
      {/* Hero Image - Smaller, centered */}
      <div className="relative flex flex-col items-center p-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center mb-3">
          {heroData.head || heroData.smallmap ? (
            <img
              src={heroData.head || heroData.smallmap}
              alt={heroData.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<span class="text-3xl">🎮</span>';
              }}
            />
          ) : (
            <span className="text-3xl">🎮</span>
          )}
        </div>

        {/* Hero Name */}
        <h3 className="text-white font-semibold text-sm truncate text-center w-full">
          {heroData.name || "Unknown Hero"}
        </h3>

        {/* Stats if available */}
        {hero.data?.main_hero_win_rate !== undefined && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-green-400 text-xs font-medium">
              {(hero.data.main_hero_win_rate * 100).toFixed(1)}% WR
            </span>
            {hero.data.main_hero_ban_rate > 0 && (
              <span className="text-red-400 text-xs">
                {(hero.data.main_hero_ban_rate * 100).toFixed(1)}% BR
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineEye,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { FiStar } from "react-icons/fi";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";
import useWishlistStore from "../../stores/useWishlistStore";

const rankColors = {
  "Mythical Immortal": "text-red-400",
  "Mythical Glory": "text-brand-gold",
  "Mythical Honor": "text-brand-purple",
  Mythic: "text-purple-400",
  Legend: "text-cyber-neon",
  Epic: "text-blue-400",
  Grandmaster: "text-green-400",
  Master: "text-yellow-400",
};

export default function AccountCard({ account, viewMode }) {
  const [isHovered, setIsHovered] = useState(false);
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const rankColor = rankColors[account.rank] || "text-white/60";
  const isSold = account.status === "sold";
  const isPending = account.status === "pending";

  if (viewMode === "list") {
    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/account/${account.id}`}>
          <GlassCard className="p-4 flex gap-6 relative">
            {/* Image */}
            <div className="w-48 h-32 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
              {account.images && account.images.length > 0 ? (
                <img
                  src={account.images[0].url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-3xl">🎮</div>
              )}
              {/* Status Badge */}
              {isSold && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-lg">
                  SOLD
                </div>
              )}
              {isPending && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 text-white text-xs font-bold rounded-lg">
                  PENDING
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white line-clamp-1">
                    {account.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs font-medium ${rankColor}`}>
                      {account.rank}
                    </span>
                    <span className="text-xs text-white/30">
                      {account.hero_count} Heroes
                    </span>
                    <span className="text-xs text-white/30">
                      {account.skin_count} Skins
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-gradient-gold">
                    {account.price.toLocaleString()} Rs
                  </div>
                  {account.featured && (
                    <span className="badge-gold text-xs">Featured</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <HiOutlineEye className="w-3 h-3" />
                  {account.views.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <FiStar className="w-3 h-3 text-brand-gold" />
                  {account.seller?.rating || "New"}
                </div>
                {account.seller?.verified_seller && (
                  <span className="badge-cyan text-xs">Verified</span>
                )}
              </div>
            </div>
          </GlassCard>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/account/${account.id}`}>
        <GlassCard className="p-4 h-full relative overflow-hidden">
          {/* Status Badge - Top Left */}
          {isSold && (
            <div className="absolute top-3 left-3 z-20 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
              SOLD
            </div>
          )}
          {isPending && (
            <div className="absolute top-3 left-3 z-20 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-lg">
              PENDING
            </div>
          )}

          {/* Featured Badge */}
          {account.featured && !isSold && !isPending && (
            <div className="absolute top-3 left-3 z-10">
              <span className="badge-gold text-xs">Featured</span>
            </div>
          )}

          {/* Like Button */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(account.id);
            }}
            className="absolute top-3 right-3 z-10 p-2 glass-card hover:border-brand-purple/30 transition-all"
          >
            {wishlistIds.includes(account.id) ? (
              <HiHeart className="w-5 h-5 text-red-500" />
            ) : (
              <HiOutlineHeart className="w-5 h-5 text-white/50 hover:text-red-400 transition-colors" />
            )}
          </motion.button>

          {/* Image */}
          <div className="relative overflow-hidden rounded-xl mb-4">
            <div
              className={`aspect-[16/10] bg-gradient-to-br from-brand-purple/20 via-brand-darker to-brand-gold/10 flex items-center justify-center ${isSold ? "opacity-70" : ""}`}
            >
              {account.images && account.images.length > 0 ? (
                <img
                  src={account.images[0].url}
                  alt={account.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl">🎮</div>
                  <p className="text-white/20 text-xs mt-1">{account.rank}</p>
                </div>
              )}
            </div>

            {/* Hover Overlay - Shows for all accounts */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-gradient-to-t from-brand-darker/90 via-transparent to-transparent flex items-end justify-center p-4"
            >
              <Button variant={isSold ? "ghost" : "primary"} size="sm">
                <HiOutlineEye className="w-4 h-4" />
                {isSold ? "View Details" : "Quick View"}
              </Button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white leading-snug line-clamp-2 text-sm">
              {account.title}
            </h3>

            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${rankColor}`}>
                {account.rank}
              </span>
              {account.seller?.verified_seller && (
                <HiOutlineShieldCheck className="w-4 h-4 text-cyber-neon" />
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
                <span className="text-xs text-white/40">Heroes</span>
                <span className="text-xs font-semibold text-white/80">
                  {account.hero_count}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
                <span className="text-xs text-white/40">Skins</span>
                <span className="text-xs font-semibold text-white/80">
                  {account.skin_count}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
                <span className="text-xs text-white/40">Collector</span>
                <span className="text-xs font-semibold text-brand-gold">
                  {account.collector_count}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
                <span className="text-xs text-white/40">Legend</span>
                <span className="text-xs font-semibold text-brand-purple">
                  {account.legend_count}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-glass-border">
              <div>
                <div className="text-xs text-white/40">Price</div>
                <div
                  className={`text-xl font-bold ${isSold ? "text-red-400" : "text-gradient-gold"}`}
                >
                  {isSold ? "SOLD" : `${account.price.toLocaleString()} Rs`}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-white/30">
                  <HiOutlineEye className="w-3 h-3" />
                  {account.views.toLocaleString()}
                </div>
                {account.seller && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-4 h-4 rounded-full bg-brand-purple/30 flex items-center justify-center text-[8px] text-white overflow-hidden">
                      {account.seller.avatar_url ? (
                        <img
                          src={account.seller.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        account.seller.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs text-white/40">
                      {account.seller.username}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

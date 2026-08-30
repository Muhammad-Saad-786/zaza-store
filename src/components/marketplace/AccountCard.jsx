// src/components/marketplace/AccountCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineEye,
  HiOutlineShieldCheck,
} from "react-icons/hi";
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

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link to={`/account/${account.id}`} className="block h-full">
        <div className="bg-[#1f1f29] border border-white/5 rounded-xl overflow-hidden hover:border-brand-purple/30 transition-all h-full flex flex-col relative">
          {/* Status Badge */}
          {isSold && (
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
              SOLD
            </div>
          )}
          {isPending && (
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded">
              PENDING
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(account.id);
            }}
            className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-all"
          >
            {wishlistIds.includes(account.id) ? (
              <HiHeart className="w-4 h-4 text-red-500" />
            ) : (
              <HiOutlineHeart className="w-4 h-4 text-white/70 hover:text-red-400 transition-colors" />
            )}
          </button>

          {/* Image - Smaller */}
          <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center overflow-hidden">
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
              <div className="text-3xl">🎮</div>
            )}
          </div>

          {/* Content - Compact */}
          <div className="p-3 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1.5">
              {account.title}
            </h3>

            <div className="flex items-center gap-1.5 mb-2">
              <span className={`text-xs font-medium ${rankColor}`}>
                {account.rank}
              </span>
              {account.seller?.verified_seller && (
                <HiOutlineShieldCheck className="w-3.5 h-3.5 text-cyber-neon" />
              )}
            </div>

            {/* Stats - Minimal */}
            <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
              <span>{account.hero_count} Heroes</span>
              <span>•</span>
              <span>{account.skin_count} Skins</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
              <div className="text-base font-bold text-gradient-gold">
                {isSold ? "SOLD" : `${account.price.toLocaleString()} Rs`}
              </div>
              <div className="flex items-center gap-1 text-xs text-white/30">
                <HiOutlineEye className="w-3 h-3" />
                {account.views?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

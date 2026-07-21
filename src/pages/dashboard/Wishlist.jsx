import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineHeart, HiHeart, HiOutlineTrash } from "react-icons/hi";
import toast from "react-hot-toast";
import useWishlistStore from "../../stores/useWishlistStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

export default function Wishlist() {
  const { wishlistItems, wishlistLoading, fetchWishlistItems, toggleWishlist } =
    useWishlistStore();

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  if (wishlistLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        My Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-6xl mb-4">💝</div>
          <h3 className="text-lg font-semibold text-white">
            Your wishlist is empty
          </h3>
          <p className="text-white/40 mt-1">Save accounts you like for later</p>
          <Link to="/marketplace" className="mt-4 inline-block">
            <button className="px-6 py-2 bg-brand-purple text-white rounded-xl font-medium hover:bg-brand-purple-deep transition-colors">
              Browse Accounts
            </button>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GlassCard className="p-4 relative group">
                {/* Remove button */}
                <button
                  onClick={() => {
                    toggleWishlist(item.account_id);
                    toast.success("Removed from wishlist");
                  }}
                  className="absolute top-3 right-3 z-10 p-2 glass-card opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>

                <Link to={`/account/${item.account?.id}`}>
                  <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center mb-4 overflow-hidden">
                    {item.account?.images?.[0]?.url ? (
                      <img
                        src={item.account.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🎮</span>
                    )}
                  </div>

                  <h3 className="font-semibold text-white text-sm line-clamp-2">
                    {item.account?.title}
                  </h3>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-white/40">
                      {item.account?.rank}
                    </span>
                    <span className="text-lg font-bold text-gradient-gold">
                      ${item.account?.price?.toLocaleString()}
                    </span>
                  </div>

                  {item.account?.status === "sold" && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <span className="px-4 py-2 bg-red-500/80 text-white rounded-xl font-semibold">
                        SOLD
                      </span>
                    </div>
                  )}
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

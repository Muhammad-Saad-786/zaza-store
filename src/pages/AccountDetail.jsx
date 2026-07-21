import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import useChatStore from "../stores/useChatStore.js";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineShare,
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineFlag,
  HiOutlineChevronRight,
  HiOutlineCheck,
  HiOutlineDeviceMobile,
  HiOutlineUser,
  HiOutlineColorSwatch,
} from "react-icons/hi";
import { FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import useAccountDetailStore from "../stores/useAccountDetailStore.js";
import useAuthStore from "../stores/useAuthStore.js";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import Spinner from "../components/ui/Spinner";
import useWishlistStore from "../stores/useWishlistStore";
import { useNavigate } from "react-router-dom";
import useOrderStore from "../stores/useOrderStore";
import BuyConfirmModal from "../components/marketplace/BuyConfirmModal";
import collector from "../../public/collector.png";
import legend from "../../public/legend.png";

const rankColors = {
  "Mythical Immortal": "text-red-400 bg-red-400/10 border-red-400/30",
  "Mythical Glory": "text-brand-gold bg-brand-gold/10 border-brand-gold/30",
  "Mythical Honor":
    "text-brand-purple bg-brand-purple/10 border-brand-purple/30",
  Mythic: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  Legend: "text-cyber-neon bg-cyber-neon/10 border-cyber-neon/30",
  Epic: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  Grandmaster: "text-green-400 bg-green-400/10 border-green-400/30",
};

export default function AccountDetail() {
  const { id } = useParams();
  const {
    account,
    loading,
    relatedAccounts,
    images,
    selectedImage,
    fetchAccount,
    setSelectedImage,
  } = useAccountDetailStore();
  const { user } = useAuthStore();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const { openBuyConfirm } = useOrderStore();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Add this state
  const [sellerRating, setSellerRating] = useState(null);
  const [sellerReviewCount, setSellerReviewCount] = useState(0);

  // Fetch seller rating on initial load
  useEffect(() => {
    if (account?.seller_id) {
      fetchSellerRating();
    }
  }, [account?.seller_id]);

  const fetchSellerRating = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("seller_id", account.seller_id);

      if (error) throw error;

      if (data && data.length > 0) {
        const avg = (
          data.reduce((sum, r) => sum + r.rating, 0) / data.length
        ).toFixed(1);
        setSellerRating(avg);
        setSellerReviewCount(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch seller rating:", error);
    }
  };
  // fetch reviews for the seller
  const fetchReviews = async () => {
    if (!account?.seller_id) return;
    setReviewsLoading(true);
    try {
      const { data } = await supabase
        .from("reviews")
        .select(
          `
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(username, avatar_url)
      `,
        )
        .eq("seller_id", account.seller_id)
        .order("created_at", { ascending: false });

      setReviews(data || []);

      // Update seller rating
      if (data && data.length > 0) {
        const avg = (
          data.reduce((sum, r) => sum + r.rating, 0) / data.length
        ).toFixed(1);
        setSellerRating(avg);
        setSellerReviewCount(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reviews" && account) {
      fetchReviews();
    }
  }, [activeTab, account]);

  useEffect(() => {
    if (id) {
      fetchAccount(id);
      window.scrollTo(0, 0);
    }
  }, [id]);

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-white/40">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white">Account Not Found</h2>
          <p className="mt-2 text-white/40">
            This listing may have been removed or sold.
          </p>
          <Link to="/marketplace" className="mt-6 inline-block">
            <Button variant="primary">Browse Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const rankStyle =
    rankColors[account.rank] || "text-white/60 bg-white/5 border-glass-border";
  const isSold = account.status === "sold";
  const isPending = account.status === "pending";

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-white/40 mb-6"
        >
          <Link
            to="/marketplace"
            className="hover:text-brand-purple transition-colors"
          >
            Marketplace
          </Link>
          <HiOutlineChevronRight className="w-4 h-4" />
          <span className="text-white/60 truncate">{account.title}</span>
        </motion.div>

        {/* Status Banner for Sold/Pending */}
        {isSold && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3"
          >
            <span className="text-2xl">🔴</span>
            <div>
              <p className="text-red-400 font-bold">
                This account has been SOLD
              </p>
              <p className="text-red-400/60 text-sm">
                This listing is for viewing purposes only.
              </p>
            </div>
          </motion.div>
        )}

        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center gap-3"
          >
            <span className="text-2xl">🟡</span>
            <div>
              <p className="text-yellow-400 font-bold">Pending Sale</p>
              <p className="text-yellow-400/60 text-sm">
                Someone is currently purchasing this account.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-purple/20 via-brand-darker to-brand-gold/10">
                  <div className="aspect-[16/10] flex items-center justify-center">
                    {images && images.length > 0 ? (
                      <img
                        src={images[selectedImage]?.url || images[0]?.url}
                        alt={account?.title || "Account"}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-8xl">🎮</div>
                        <p className="text-white/30 mt-2">
                          No images available
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Badge on Image */}
                  {isSold && (
                    <div className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white font-bold rounded-xl text-lg">
                      SOLD
                    </div>
                  )}
                  {isPending && (
                    <div className="absolute top-4 left-4 px-4 py-2 bg-yellow-500 text-white font-bold rounded-xl text-lg">
                      PENDING
                    </div>
                  )}
                  {account?.featured && !isSold && !isPending && (
                    <div className="absolute top-4 left-4">
                      <span className="badge-gold">⭐ Featured</span>
                    </div>
                  )}

                  {images && images.length > 1 && (
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white">
                      {selectedImage + 1} / {images.length}
                    </div>
                  )}
                </div>

                {images && images.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide pb-2">
                    {images.map((image, i) => (
                      <motion.button
                        key={image.id || i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedImage(i)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImage === i
                            ? "border-brand-purple shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                            : "border-glass-border hover:border-white/30 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`Thumbnail ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </motion.button>
                    ))}
                  </div>
                )}

                {images && images.length === 1 && (
                  <p className="text-center text-xs text-white/20 mt-2">
                    1 image
                  </p>
                )}
              </GlassCard>
            </motion.div>

            {/* Account Info Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex gap-1 mb-6 border-b border-glass-border pb-4 overflow-x-auto">
                  {["overview", "statistics", "reviews"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all ${
                        activeTab === tab
                          ? "bg-brand-purple/20 text-brand-purple"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h2 className="text-xl font-bold text-white mb-4">
                        Description
                      </h2>
                      <p
                        className={`text-white/60 leading-relaxed ${!showFullDescription && "line-clamp-4"}`}
                      >
                        {account.description || "No description provided."}
                      </p>
                      {account.description &&
                        account.description.length > 200 && (
                          <button
                            onClick={() =>
                              setShowFullDescription(!showFullDescription)
                            }
                            className="mt-2 text-sm text-brand-purple hover:text-brand-gold transition-colors"
                          >
                            {showFullDescription ? "Show Less" : "Read More"}
                          </button>
                        )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                        {[
                          {
                            label: "Heroes",
                            value: account.hero_count,
                            icon: (
                              <HiOutlineUser className="font-bold text-3xl" />
                            ),
                          },
                          {
                            label: "Skins",
                            value: account.skin_count,
                            icon: (
                              <HiOutlineColorSwatch className="font-bold text-3xl" />
                            ),
                          },
                          {
                            label: "Collector",
                            value: account.collector_count,
                            icon: (
                              <img
                                src={collector}
                                alt="Collector"
                                height="60"
                                width="60"
                              />
                            ),
                          },
                          {
                            label: "Legend",
                            value: account.legend_count,
                            icon: (
                              <img
                                src={legend}
                                alt="Legend"
                                height="60"
                                width="60"
                              />
                            ),
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="text-center p-4 bg-white/[0.02] rounded-xl"
                          >
                            <div className="text-2xl mb-1 flex justify-center  items-center">
                              {stat.icon}
                            </div>
                            <div className="text-xl font-bold text-white">
                              {stat.value}
                            </div>
                            <div className="text-xs text-white/40">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "statistics" && (
                    <motion.div
                      key="statistics"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h2 className="text-xl font-bold text-white mb-6">
                        Account Statistics
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Current Rank", value: account.rank },
                          {
                            label: "Highest Rank",
                            value: account.highest_rank,
                          },
                          { label: "Stars", value: `${account.stars}★` },
                          { label: "Win Rate", value: `${account.win_rate}%` },
                          { label: "Server", value: account.server },
                          { label: "Total Skins", value: account.skin_count },
                          {
                            label: "Collector Skins",
                            value: account.collector_count,
                          },
                          {
                            label: "Legend Skins",
                            value: account.legend_count,
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="flex justify-between items-center p-4 bg-white/[0.02] rounded-xl"
                          >
                            <span className="text-white/50 text-sm">
                              {stat.label}
                            </span>
                            <span className="text-white font-semibold text-sm">
                              {stat.value || "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "reviews" && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h2 className="text-xl font-bold text-white mb-6">
                        Reviews{" "}
                        {avgRating && (
                          <span className="text-brand-gold">
                            ({avgRating} ★)
                          </span>
                        )}
                      </h2>

                      {reviewsLoading ? (
                        <div className="flex justify-center py-8">
                          <Spinner size="md" />
                        </div>
                      ) : reviews.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-3">📝</div>
                          <p className="text-white/40">No reviews yet</p>
                          <p className="text-white/30 text-sm mt-1">
                            Be the first to review this seller
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.map((review) => (
                            <div
                              key={review.id}
                              className="p-4 bg-white/[0.02] rounded-xl"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-brand-purple/30 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                                  {review.reviewer?.avatar_url ? (
                                    <img
                                      src={review.reviewer.avatar_url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    review.reviewer?.username
                                      ?.charAt(0)
                                      .toUpperCase() || "?"
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">
                                    {review.reviewer?.username}
                                  </p>
                                  <div className="flex text-brand-gold text-sm">
                                    {"★".repeat(review.rating)}
                                    {"☆".repeat(5 - review.rating)}
                                  </div>
                                </div>
                                <span className="text-xs text-white/30">
                                  {new Date(
                                    review.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {review.comment && (
                                <p className="text-white/60 text-sm mt-2">
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>

            {/* Related Accounts */}
            {relatedAccounts && relatedAccounts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-display font-extrabold text-white mb-6">
                  Similar <span className="text-gradient">Accounts</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedAccounts.map((related) => (
                    <Link key={related.id} to={`/account/${related.id}`}>
                      <GlassCard className="p-4 flex gap-4 hover:border-brand-purple/30 transition-all">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          {related.images && related.images.length > 0 ? (
                            <img
                              src={related.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center text-2xl">
                              🎮
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-white text-sm line-clamp-2">
                            {related.title}
                          </h3>
                          <p className="text-xs text-white/40 mt-1">
                            {related.rank}
                          </p>
                          <p className="text-lg font-bold text-gradient-gold mt-2">
                            ${related.price}
                          </p>
                        </div>
                      </GlassCard>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
              {/* Seller Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
                    Seller
                  </h3>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0">
                      {account.seller?.avatar_url ? (
                        <img
                          src={account.seller.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        account.seller?.username?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {account.seller?.username}
                        </span>
                        {account.seller?.verified_seller && (
                          <HiOutlineShieldCheck className="w-5 h-5 text-cyber-neon" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <FiStar className="w-3 h-3 text-brand-gold fill-current" />
                        <span className="text-xs text-white/40">
                          {sellerRating || "New"}
                        </span>
                        <span className="text-xs text-white/20">•</span>
                        <span className="text-xs text-white/40">
                          {sellerReviewCount} review
                          {sellerReviewCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/seller/${account.seller_id}`)}
                      className="flex-1 px-4 py-2 glass-card hover:border-brand-purple/30 text-sm text-white/70 hover:text-white transition-all rounded-xl"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        if (account.seller) {
                          // Navigate with seller info as state
                          navigate("/dashboard/messages", {
                            state: {
                              contactUser: {
                                userId: account.seller_id,
                                username: account.seller.username,
                                avatar_url: account.seller.avatar_url,
                              },
                            },
                          });
                        }
                      }}
                      className="flex-1 px-4 py-2 glass-card hover:border-brand-purple/30 text-sm text-white/70 hover:text-white transition-all rounded-xl"
                    >
                      Contact
                    </button>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Price & Purchase Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <GlassCard className="p-6 glow-purple">
                  <div className="mb-6">
                    <div className="text-sm text-white/40 mb-1">Price</div>
                    <div
                      className={`text-3xl font-extrabold ${isSold ? "text-red-400" : "text-gradient-gold"}`}
                    >
                      {isSold ? "SOLD" : `$${account.price.toLocaleString()}`}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium border ${rankStyle}`}
                      >
                        {account.rank}
                      </span>
                      {isSold && (
                        <span className="badge-purple text-xs">Sold</span>
                      )}
                      {isPending && (
                        <span className="badge-gold text-xs">Pending</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="text-center p-3 bg-white/[0.02] rounded-xl">
                      <div className="text-lg font-bold text-white">
                        {account.hero_count}
                      </div>
                      <div className="text-xs text-white/40">Heroes</div>
                    </div>
                    <div className="text-center p-3 bg-white/[0.02] rounded-xl">
                      <div className="text-lg font-bold text-white">
                        {account.skin_count}
                      </div>
                      <div className="text-xs text-white/40">Skins</div>
                    </div>
                    <div className="text-center p-3 bg-white/[0.02] rounded-xl">
                      <div className="text-lg font-bold text-brand-gold">
                        {account.collector_count}
                      </div>
                      <div className="text-xs text-white/40">Collector</div>
                    </div>
                    <div className="text-center p-3 bg-white/[0.02] rounded-xl">
                      <div className="text-lg font-bold text-brand-purple">
                        {account.legend_count}
                      </div>
                      <div className="text-xs text-white/40">Legend</div>
                    </div>
                  </div>

                  {/* Action Buttons - Changes based on status */}
                  <div className="space-y-3">
                    {isSold ? (
                      <div className="w-full py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                        <span className="text-red-400 font-bold text-lg">
                          SOLD
                        </span>
                        <p className="text-red-400/50 text-xs mt-1">
                          This account has been sold
                        </p>
                      </div>
                    ) : isPending ? (
                      <div className="w-full py-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                        <span className="text-yellow-400 font-bold text-lg">
                          PENDING SALE
                        </span>
                        <p className="text-yellow-400/50 text-xs mt-1">
                          Purchase in progress
                        </p>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={() => openBuyConfirm(account)}
                      >
                        <HiOutlineCheck className="w-5 h-5" />
                        Buy Now
                      </Button>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="md"
                        className="flex-1"
                        onClick={() => toggleWishlist(account.id)}
                      >
                        {wishlistIds.includes(account.id) ? (
                          <HiHeart className="w-5 h-5 text-red-500" />
                        ) : (
                          <HiOutlineHeart className="w-5 h-5" />
                        )}
                        Wishlist
                      </Button>
                      <Button
                        variant="ghost"
                        size="md"
                        className="flex-1"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied!");
                        }}
                      >
                        <HiOutlineShare className="w-5 h-5" />
                        Share
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/30">
                    <HiOutlineShieldCheck className="w-4 h-4 text-cyber-neon" />
                    Secure Escrow Transaction
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/20">
                    <HiOutlineEye className="w-3 h-3" />
                    {account.views.toLocaleString()} views
                  </div>

                  <button className="flex items-center justify-center gap-1 mt-4 mx-auto text-xs text-white/20 hover:text-red-400 transition-colors">
                    <HiOutlineFlag className="w-3 h-3" />
                    Report Listing
                  </button>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <BuyConfirmModal />
    </div>
  );
}

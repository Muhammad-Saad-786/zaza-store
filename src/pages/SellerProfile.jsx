import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineShoppingBag,
  HiOutlineUserGroup,
  HiOutlineChat,
} from "react-icons/hi";
import { FiStar } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import useAuthStore from "../stores/useAuthStore";
import GlassCard from "../components/ui/GlassCard";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function SellerProfile() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchSellerData();
    fetchReviews();
  }, [id]);

  const fetchSellerData = async () => {
    try {
      const { data: sellerData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      setSeller(sellerData);

      // Fetch active listings
      const { data: listingsData } = await supabase
        .from("accounts")
        .select(`*, images:account_images(url, is_cover)`)
        .eq("seller_id", id)
        .eq("status", "active")
        .eq("approval_status", "approved")
        .order("created_at", { ascending: false });

      setListings(listingsData || []);
    } catch (error) {
      console.error("Failed to fetch seller:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from("reviews")
        .select(
          `*, reviewer:profiles!reviews_reviewer_id_fkey(username, avatar_url)`,
        )
        .eq("seller_id", id)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAvgRating(avg.toFixed(1));
        setTotalReviews(data.length);
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  // Calculate trust score color
  const getTrustColor = (score) => {
    if (!score) return "text-white/40";
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  // Format member since
  const memberSince = seller?.created_at
    ? new Date(seller.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Unknown";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  if (!seller)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Seller not found
      </div>
    );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Seller Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-3xl font-bold text-white overflow-hidden flex-shrink-0 relative">
                {seller.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  seller.username?.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                {/* Name & Badges */}
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">
                    {seller.username}
                  </h1>
                  {seller.verified_seller && (
                    <img
                      src="/blue-verify-badge.png"
                      alt="Verified"
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  {seller.role === "admin" && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 flex-wrap">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="text-white font-medium">
                      {avgRating || "New"}
                    </span>
                    <span className="text-white/30 text-sm">
                      ({totalReviews} reviews)
                    </span>
                  </div>

                  {/* Sales */}
                  <div className="flex items-center gap-1 text-white/50">
                    <HiOutlineShoppingBag className="w-4 h-4" />
                    <span className="text-sm">
                      {seller.total_sales || 0} sales
                    </span>
                  </div>

                  {/* Trust Score */}
                  <div className="flex items-center gap-1">
                    <HiOutlineShieldCheck
                      className={`w-4 h-4 ${getTrustColor(seller.trust_score)}`}
                    />
                    <span
                      className={`text-sm font-medium ${getTrustColor(seller.trust_score)}`}
                    >
                      Trust: {seller.trust_score || 100}%
                    </span>
                  </div>

                  {/* Member Since */}
                  <div className="flex items-center gap-1 text-white/30 text-sm">
                    <HiOutlineClock className="w-4 h-4" />
                    <span>Since {memberSince}</span>
                  </div>
                </div>

                {/* Bio */}
                {seller.bio && (
                  <p className="mt-3 text-white/50 text-sm max-w-lg">
                    {seller.bio}
                  </p>
                )}
              </div>

              {/* Contact Button */}
              {user && user.id !== seller.id && (
                <div className="flex-shrink-0">
                  <Button
                    onClick={() => {
                      navigate("/dashboard/messages", {
                        state: {
                          contactUser: {
                            userId: seller.id,
                            username: seller.username,
                            avatar_url: seller.avatar_url,
                          },
                        },
                      });
                    }}
                    variant="primary"
                    size="md"
                  >
                    <HiOutlineChat className="w-4 h-4" />
                    Contact Seller
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6"
        >
          {[
            {
              label: "Total Sales",
              value: seller.total_sales || 0,
              icon: HiOutlineShoppingBag,
              color: "text-amber-400",
            },
            {
              label: "Active Listings",
              value: listings.length,
              icon: HiOutlineCheckCircle,
              color: "text-green-400",
            },
            {
              label: "Avg Rating",
              value: avgRating || "New",
              icon: HiOutlineStar,
              color: "text-yellow-400",
            },
            {
              label: "Reviews",
              value: totalReviews,
              icon: HiOutlineUserGroup,
              color: "text-purple-400",
            },
          ].map((stat, i) => (
            <GlassCard key={stat.label} className="p-4 text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Active Listings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            Active Listings ({listings.length})
          </h2>
          {listings.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/40">No active listings at the moment</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listings.map((listing) => (
                <Link key={listing.id} to={`/account/${listing.id}`}>
                  <GlassCard className="p-4 flex gap-4 hover:border-purple-500/30 transition-all group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500/20 to-amber-500/10">
                      {listing.images?.[0]?.url ? (
                        <img
                          src={listing.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🎮
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-white text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-white/40 mt-1">
                        {listing.rank}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
                          ${listing.price?.toLocaleString()}
                        </p>
                        {listing.featured && (
                          <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            Reviews ({totalReviews})
          </h2>
          {reviews.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <HiOutlineStar className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No reviews yet</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <GlassCard key={review.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center font-bold text-white overflow-hidden flex-shrink-0">
                      {review.reviewer?.avatar_url ? (
                        <img
                          src={review.reviewer.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        review.reviewer?.username?.charAt(0).toUpperCase() ||
                        "?"
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white text-sm">
                          {review.reviewer?.username}
                        </p>
                        <span className="text-xs text-white/30">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex text-amber-400 text-sm mt-1">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                      {review.comment && (
                        <p className="text-white/50 text-sm mt-2">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

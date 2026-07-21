import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { FiStar } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import GlassCard from "../components/ui/GlassCard";
import Spinner from "../components/ui/Spinner";

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerData();
  }, [id]);

  const fetchSellerData = async () => {
    try {
      // Fetch seller profile
      const { data: sellerData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      setSeller(sellerData);

      // Fetch seller's active listings
      const { data: listingsData } = await supabase
        .from("accounts")
        .select(
          `
          *,
          images:account_images(url, is_cover)
        `,
        )
        .eq("seller_id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      setListings(listingsData || []);
    } catch (error) {
      console.error("Failed to fetch seller:", error);
    } finally {
      setLoading(false);
    }
  };

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
        {/* Seller Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center text-3xl font-bold text-white mx-auto overflow-hidden">
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
            <div className="flex items-center justify-center gap-2 mt-4">
              <h1 className="text-2xl font-bold text-white">
                {seller.username}
              </h1>
              {seller.verified_seller && (
                <HiOutlineShieldCheck className="w-6 h-6 text-cyber-neon" />
              )}
            </div>
            <div className="flex items-center justify-center gap-3 mt-2 text-sm text-white/40">
              <span>
                <FiStar className="w-4 h-4 text-brand-gold inline" />{" "}
                {seller.rating || "New"}
              </span>
              <span>{seller.total_sales || 0} sales</span>
            </div>
            {seller.bio && (
              <p className="mt-4 text-white/50 max-w-md mx-auto">
                {seller.bio}
              </p>
            )}
          </GlassCard>
        </motion.div>

        {/* Seller Listings */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Active Listings ({listings.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {listings.map((listing) => (
              <Link key={listing.id} to={`/account/${listing.id}`}>
                <GlassCard className="p-4 flex gap-4 hover:border-brand-purple/30">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    {listing.images?.[0]?.url ? (
                      <img
                        src={listing.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center text-2xl">
                        🎮
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">{listing.rank}</p>
                    <p className="text-lg font-bold text-gradient-gold mt-2">
                      ${listing.price}
                    </p>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

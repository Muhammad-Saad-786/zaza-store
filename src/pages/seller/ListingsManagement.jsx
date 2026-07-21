import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineTrash,
  HiOutlineCheck,
} from "react-icons/hi";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";

const statusColors = {
  active: "bg-green-400/20 text-green-400",
  pending: "bg-yellow-400/20 text-yellow-400",
  sold: "bg-brand-gold/20 text-brand-gold",
  hidden: "bg-white/10 text-white/40",
  rejected: "bg-red-400/20 text-red-400",
};

export default function ListingsManagement() {
  const {
    listings,
    listingsLoading,
    fetchListings,
    updateListingStatus,
    deleteListing,
  } = useSellerDashboardStore();
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings =
    filterStatus === "all"
      ? listings
      : listings.filter((l) => l.status === filterStatus);

  if (listingsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-extrabold text-white">
          My Listings
        </h1>
        <Link to="/sell">
          <Button variant="gold" size="sm">
            + New Listing
          </Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "active", "sold", "hidden", "pending"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filterStatus === status
                ? "bg-brand-purple/20 text-brand-purple"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {status} (
            {status === "all"
              ? listings.length
              : listings.filter((l) => l.status === status).length}
            )
          </button>
        ))}
      </div>

      {filteredListings.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-white">
            No listings found
          </h3>
          <p className="text-white/40 mt-1">
            Create your first listing to start selling
          </p>
          <Link to="/sell" className="mt-4 inline-block">
            <Button variant="primary">Create Listing</Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredListings.map((listing) => (
            <GlassCard key={listing.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                  {listing.images?.[0]?.url ? (
                    <img
                      src={listing.images[0].url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "🎮"
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/account/${listing.id}`}
                    className="font-semibold text-white hover:text-brand-purple line-clamp-1"
                  >
                    {listing.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/40">
                      {listing.rank}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[listing.status]}`}
                    >
                      {listing.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                    <span>🦸 {listing.hero_count} Heroes</span>
                    <span>🎨 {listing.skin_count} Skins</span>
                    <span>👁️ {listing.views} views</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-gradient-gold">
                    ${listing.price}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {listing.status === "active" && (
                      <>
                        <button
                          onClick={() =>
                            updateListingStatus(listing.id, "hidden")
                          }
                          className="p-1.5 text-white/40 hover:text-white transition-colors"
                          title="Hide"
                        >
                          <HiOutlineEyeOff className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            updateListingStatus(listing.id, "sold")
                          }
                          className="p-1.5 text-white/40 hover:text-green-400 transition-colors"
                          title="Mark as Sold"
                        >
                          <HiOutlineCheck className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {listing.status === "hidden" && (
                      <button
                        onClick={() =>
                          updateListingStatus(listing.id, "active")
                        }
                        className="p-1.5 text-white/40 hover:text-brand-purple transition-colors"
                        title="Publish"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Delete this listing?")) {
                          deleteListing(listing.id);
                        }
                      }}
                      className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}

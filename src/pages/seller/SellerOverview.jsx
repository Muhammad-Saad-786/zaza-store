import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineCollection,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineArrowRight,
} from "react-icons/hi";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";

const statCards = [
  {
    key: "activeListings",
    label: "Active Listings",
    icon: HiOutlineCollection,
    color: "text-brand-purple",
  },
  {
    key: "totalSold",
    label: "Total Sold",
    icon: HiOutlineShoppingBag,
    color: "text-cyber-neon",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: HiOutlineCurrencyDollar,
    color: "text-brand-gold",
    isCurrency: true,
  },
  {
    key: "pendingOrders",
    label: "Pending Orders",
    icon: HiOutlineClock,
    color: "text-orange-400",
  },
];

export default function SellerOverview() {
  const {
    stats,
    fetchStats,
    listings,
    fetchListings,
    sellerOrders,
    fetchSellerOrders,
  } = useSellerDashboardStore();

  useEffect(() => {
    fetchStats();
    fetchListings();
    fetchSellerOrders();
  }, []);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-extrabold text-white">
          Seller Dashboard
        </h1>
        <p className="text-white/40 mt-1">
          Manage your listings and track your earnings.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-6">
              <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
              <div className="text-3xl font-extrabold text-white">
                {stat.isCurrency ? "$" : ""}
                {stats[stat.key]?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-white/40 mt-1">{stat.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/sell">
            <Button variant="gold" size="sm">
              <HiOutlinePlus className="w-4 h-4" />
              New Listing
            </Button>
          </Link>
          <Link to="/seller-dashboard/listings">
            <Button variant="ghost" size="sm">
              Manage Listings
            </Button>
          </Link>
        </div>
      </GlassCard>

      {/* Recent Listings */}
      {listings.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Recent Listings
            </h2>
            <Link
              to="/seller-dashboard/listings"
              className="text-sm text-brand-purple hover:text-brand-gold flex items-center gap-1"
            >
              View All <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {listings.slice(0, 5).map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center text-xl overflow-hidden">
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
                  <div>
                    <p className="text-sm font-medium text-white line-clamp-1">
                      {listing.title}
                    </p>
                    <p className="text-xs text-white/40">{listing.rank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gradient-gold">
                    ${listing.price}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      listing.status === "active"
                        ? "bg-green-400/20 text-green-400"
                        : listing.status === "sold"
                          ? "bg-brand-gold/20 text-brand-gold"
                          : "bg-white/10 text-white/40"
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

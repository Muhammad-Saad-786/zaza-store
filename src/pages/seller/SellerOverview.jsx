import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineCollection,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineCreditCard,
  HiOutlineExclamation,
} from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
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
  const { user } = useAuthStore();
  const {
    stats,
    fetchStats,
    listings,
    fetchListings,
    sellerOrders,
    fetchSellerOrders,
  } = useSellerDashboardStore();

  const [hasPaymentDetails, setHasPaymentDetails] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchListings();
    fetchSellerOrders();
    checkPaymentDetails();
  }, []);

  const checkPaymentDetails = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select(
        "easypaisa_number, jazzcash_number, bank_account, paypal_email, binance_usdt",
      )
      .eq("id", user.id)
      .single();

    if (data) {
      const hasAny =
        data.easypaisa_number ||
        data.jazzcash_number ||
        data.bank_account ||
        data.paypal_email ||
        data.binance_usdt;
      setHasPaymentDetails(!!hasAny);
    }
  };

  // Count actual pending orders (status = pending)
  const pendingCount =
    sellerOrders?.filter((o) => o.status === "pending").length || 0;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-extrabold text-white">
          Seller Dashboard 👋
        </h1>
        <p className="text-white/40 mt-1">
          Manage your listings and track your earnings.
        </p>
      </motion.div>

      {/* Payment Settings Warning */}
      {!hasPaymentDetails && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <HiOutlineExclamation className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-yellow-400 font-medium">
                  Set up your payment details
                </p>
                <p className="text-yellow-400/60 text-sm">
                  Buyers need your payment info to complete purchases. Add at
                  least one payment method.
                </p>
              </div>
            </div>
            <Link to="/seller-dashboard/payment-settings">
              <Button variant="gold" size="sm">
                <HiOutlineCreditCard className="w-4 h-4" />
                Set Up Now
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

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
                {stat.key === "pendingOrders"
                  ? pendingCount.toLocaleString()
                  : stats[stat.key]?.toLocaleString() || 0}
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
          <Link to="/seller-dashboard/orders">
            <Button variant="ghost" size="sm">
              <HiOutlineShoppingBag className="w-4 h-4" />
              View Orders
              {pendingCount > 0 && (
                <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendingCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/seller-dashboard/payment-settings">
            <Button variant="ghost" size="sm">
              <HiOutlineCreditCard className="w-4 h-4" />
              Payment Settings
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

      {/* Pending Orders Alert */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/seller-dashboard/orders">
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between hover:bg-orange-500/20 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <HiOutlineClock className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-orange-400 font-medium">
                    {pendingCount} Pending Order{pendingCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-orange-400/60 text-sm">
                    Review and accept orders from buyers
                  </p>
                </div>
              </div>
              <HiOutlineArrowRight className="w-5 h-5 text-orange-400" />
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

// src/pages/Marketplace.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useMarketplaceStore from "../stores/useMarketplaceStore";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";
import AccountCard from "../components/marketplace/AccountCard";
import Pagination from "../components/marketplace/Pagination";
import SortBar from "../components/marketplace/SortBar";
import Spinner from "../components/ui/Spinner";
import { useLocation } from "react-router-dom";
import SEO from "../components/ui/SEO";
import { pageSEO } from "../config/seo";
import { HiOutlineFilter, HiOutlineX } from "react-icons/hi";

export default function Marketplace() {
  const {
    accounts,
    loading,
    totalCount,
    currentPage,
    pageSize,
    fetchAccounts,
  } = useMarketplaceStore();

  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    if (searchQuery) {
      setFilter("search", searchQuery);
      fetchAccounts();
    }
    window.scrollTo(0, 0);
  }, [searchQuery]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen pt-20 pb-20">
      <SEO
        title={pageSEO.marketplace.title}
        description={pageSEO.marketplace.description}
        keywords={pageSEO.marketplace.keywords}
        type="website"
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="mt-1 text-white/40 text-sm">
            {totalCount.toLocaleString()} accounts available
          </p>
        </motion.div>

        {/* Filters - Top (Eldorado Style) */}
        <div className="mb-6">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1f1f29] border border-white/5 text-white/70 hover:text-white transition-all mb-4"
          >
            <HiOutlineFilter className="w-5 h-5" />
            Filters
            {showMobileFilters && <HiOutlineX className="w-5 h-5" />}
          </button>

          {/* Filters Container */}
          <div className={showMobileFilters ? "block" : "hidden lg:block"}>
            <MarketplaceFilters />
          </div>
        </div>

        {/* Sort Bar */}
        <SortBar viewMode={viewMode} setViewMode={setViewMode} />

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-white/40 text-sm">Loading accounts...</p>
            </div>
          </div>
        ) : accounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white">
              No accounts found
            </h3>
            <p className="mt-2 text-white/40 text-sm">
              Try adjusting your filters or search terms
            </p>
          </motion.div>
        ) : (
          <>
            {/* Results Count */}
            <p className="text-sm text-white/30 mb-4">
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalCount)} of{" "}
              {totalCount.toLocaleString()} results
            </p>

            {/* Account Grid - More compact */}
            <motion.div
              layout
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : "grid-cols-1"
              }`}
            >
              <AnimatePresence mode="popLayout">
                {accounts.map((account, index) => (
                  <motion.div
                    key={account.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <AccountCard account={account} viewMode={viewMode} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

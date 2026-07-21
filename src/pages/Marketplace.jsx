import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useMarketplaceStore from "../stores/useMarketplaceStore";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";
import AccountCard from "../components/marketplace/AccountCard";
import Pagination from "../components/marketplace/Pagination";
import SortBar from "../components/marketplace/SortBar";
import Spinner from "../components/ui/Spinner";
import { useLocation } from "react-router-dom";

export default function Marketplace() {
  const {
    accounts,
    loading,
    totalCount,
    currentPage,
    pageSize,
    fetchAccounts,
  } = useMarketplaceStore();

  const [viewMode, setViewMode] = useState("grid"); // grid | list

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
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="mt-2 text-white/40">
            {totalCount.toLocaleString()} accounts available
          </p>
        </motion.div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <MarketplaceFilters />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort Bar */}
            <SortBar viewMode={viewMode} setViewMode={setViewMode} />

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-4 text-white/40">Loading accounts...</p>
                </div>
              </div>
            ) : accounts.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white">
                  No accounts found
                </h3>
                <p className="mt-2 text-white/40">
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

                {/* Account Grid */}
                <motion.div
                  layout
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
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
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <AccountCard account={account} viewMode={viewMode} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

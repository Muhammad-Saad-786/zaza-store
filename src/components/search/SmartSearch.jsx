import { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSearch, HiOutlineX, HiOutlineClock } from "react-icons/hi";
import useSearchStore from "../../stores/useSearchStore";

const rankColors = {
  "Mythical Immortal": "text-red-400",
  "Mythical Glory": "text-brand-gold",
  "Mythical Honor": "text-brand-purple",
  Mythic: "text-purple-400",
  Legend: "text-cyber-neon",
  Epic: "text-blue-400",
  Grandmaster: "text-green-400",
};

export default function SmartSearch() {
  const {
    query,
    results,
    loading,
    showResults,
    setQuery,
    clearSearch,
    closeResults,
  } = useSearchStore();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeResults();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        closeResults();
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(query.trim())}`);
      closeResults();
      inputRef.current?.blur();
    }
  };

  const handleResultClick = () => {
    closeResults();
    clearSearch();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setQuery(query)}
            placeholder="Search accounts, heroes, ranks..."
            className="input-glass pl-12 pr-10 py-2.5 w-full text-sm focus:border-brand-purple/50"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/60 transition-colors"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          )}
          {/* Keyboard shortcut hint */}
          {!query && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
              <kbd className="px-2 py-0.5 text-[10px] text-white/20 bg-white/5 rounded-md border border-glass-border">
                Ctrl+K
              </kbd>
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 glass-modal p-2 z-50 max-h-[400px] overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mx-auto" />
                <p className="text-white/30 text-xs mt-2">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center">
                <HiOutlineSearch className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No results found</p>
                <p className="text-white/20 text-xs mt-1">
                  Try different keywords
                </p>
              </div>
            ) : (
              <>
                {/* Results */}
                {results.map((account) => (
                  <Link
                    key={account.id}
                    to={`/account/${account.id}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    {/* Image */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {account.images && account.images.length > 0 ? (
                        <img
                          src={account.images[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <HiOutlineSearch className="w-5 h-5 text-white/20" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-brand-purple transition-colors">
                        {account.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs font-medium ${rankColors[account.rank] || "text-white/40"}`}
                        >
                          {account.rank}
                        </span>
                        <span className="text-xs text-white/30">
                          {account.hero_count} Heroes • {account.skin_count}{" "}
                          Skins
                        </span>
                      </div>
                    </div>

                    {/* Price or Status */}
                    <div className="text-right flex-shrink-0">
                      {account.status === "sold" ? (
                        <span className="text-xs text-red-400 font-medium">
                          SOLD
                        </span>
                      ) : account.status === "pending" ? (
                        <span className="text-xs text-yellow-400 font-medium">
                          PENDING
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-gradient-gold">
                          ${account.price?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}

                {/* View All Results */}
                <Link
                  to={`/marketplace?search=${encodeURIComponent(query)}`}
                  onClick={handleResultClick}
                  className="flex items-center justify-center gap-2 p-3 mt-2 rounded-xl bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition-colors text-sm font-medium"
                >
                  View all results for "{query}"
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeResults}
            className="fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

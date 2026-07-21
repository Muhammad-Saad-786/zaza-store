import { motion } from "framer-motion";
import { HiOutlineX, HiOutlineFilter } from "react-icons/hi";
import useMarketplaceStore from "../../stores/useMarketplaceStore";
import Button from "../ui/Button";

const ranks = [
  "Mythical Immortal",
  "Mythical Glory",
  "Mythical Honor",
  "Mythic",
  "Legend",
  "Epic",
  "Grandmaster",
];

const skinTiers = [
  "Collector",
  "Legend",
  "Zodiac",
  "KOF",
  "Sanrio",
  "Aspirant",
  "Star Wars",
];

const regions = ["SEA Server", "EU Server", "NA Server", "MENA Server"];

export default function MarketplaceFilters() {
  const { filters, setFilter, resetFilters, fetchAccounts } =
    useMarketplaceStore();

  const handleFilterChange = (key, value) => {
    setFilter(key, value);
    // Auto-fetch after filter change
    setTimeout(() => fetchAccounts(), 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-6 sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HiOutlineFilter className="w-5 h-5 text-brand-purple" />
          <h2 className="font-semibold text-white">Filters</h2>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-brand-purple hover:text-brand-gold transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/60 mb-2">
          Search
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          placeholder="Search accounts..."
          className="input-glass w-full text-sm h-11 px-4 rounded-xl"
        />
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/60 mb-2">
          Price Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            placeholder="Min"
            className="input-glass w-full text-sm rounded-xl h-8 px-4"
          />
          <span className="text-white/30 self-center">-</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            placeholder="Max"
            className="input-glass w-full text-sm h-8 px-4 rounded-xl"
          />
        </div>
      </div>

      {/* Rank */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/60 mb-2">
          Rank
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          <button
            onClick={() => handleFilterChange("rank", "")}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              !filters.rank
                ? "bg-brand-purple/20 text-brand-purple"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            All Ranks
          </button>
          {ranks.map((rank) => (
            <button
              key={rank}
              onClick={() => handleFilterChange("rank", rank)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                filters.rank === rank
                  ? "bg-brand-purple/20 text-brand-purple"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {rank}
            </button>
          ))}
        </div>
      </div>

      {/* Skin Tier */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/60 mb-2">
          Skin Collection
        </label>
        <div className="flex flex-wrap gap-2">
          {skinTiers.map((tier) => (
            <button
              key={tier}
              onClick={() =>
                handleFilterChange(
                  "skinTier",
                  filters.skinTier === tier ? "" : tier,
                )
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.skinTier === tier
                  ? "bg-brand-gold/20 text-brand-gold border border-brand-gold/30"
                  : "bg-white/5 text-white/50 border border-glass-border hover:border-white/20"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Region */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/60 mb-2">
          Region
        </label>
        <div className="space-y-1">
          <button
            onClick={() => handleFilterChange("region", "")}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              !filters.region
                ? "bg-brand-purple/20 text-brand-purple"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            All Regions
          </button>
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => handleFilterChange("region", region)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                filters.region === region
                  ? "bg-brand-purple/20 text-brand-purple"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Only */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.featured}
            onChange={(e) => handleFilterChange("featured", e.target.checked)}
            className="w-4 h-4 rounded border-glass-border bg-white/5 text-brand-purple focus:ring-brand-purple"
          />
          <span className="text-sm text-white/60">Featured Only</span>
        </label>
      </div>

      {/* Apply Button */}
      <Button
        onClick={() => fetchAccounts()}
        variant="primary"
        className="w-full"
      >
        Apply Filters
      </Button>
    </motion.div>
  );
}

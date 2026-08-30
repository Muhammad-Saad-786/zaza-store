// src/components/marketplace/MarketplaceFilters.jsx
import { motion } from "framer-motion";
import {
  HiOutlineX,
  HiOutlineFilter,
  HiOutlineChevronDown,
} from "react-icons/hi";
import useMarketplaceStore from "../../stores/useMarketplaceStore";
import Button from "../ui/Button";
import { useState } from "react";

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
  const [expandedSection, setExpandedSection] = useState(null);

  const handleFilterChange = (key, value) => {
    setFilter(key, value);
    setTimeout(() => fetchAccounts(), 100);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1f1f29] border border-white/5 rounded-xl p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineFilter className="w-4 h-4 text-brand-purple" />
          <h2 className="text-sm font-semibold text-white">Filters</h2>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-brand-purple hover:text-brand-gold transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Search */}
        <div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Search accounts..."
            className="w-full h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-white text-sm placeholder:text-white/40 focus:border-brand-purple/50 outline-none"
          />
        </div>

        {/* Price Range */}
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            placeholder="Min Price"
            className="w-full h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-white text-sm placeholder:text-white/40 focus:border-brand-purple/50 outline-none"
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            placeholder="Max Price"
            className="w-full h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-white text-sm placeholder:text-white/40 focus:border-brand-purple/50 outline-none"
          />
        </div>

        {/* Rank Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleSection("rank")}
            className="w-full h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-white/70 text-sm flex items-center justify-between hover:border-white/20 transition-all"
          >
            <span className="truncate">{filters.rank || "All Ranks"}</span>
            <HiOutlineChevronDown
              className={`w-4 h-4 transition-transform ${expandedSection === "rank" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "rank" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1f1f29] border border-white/10 rounded-lg p-1 z-50 max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  handleFilterChange("rank", "");
                  toggleSection("rank");
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                All Ranks
              </button>
              {ranks.map((rank) => (
                <button
                  key={rank}
                  onClick={() => {
                    handleFilterChange("rank", rank);
                    toggleSection("rank");
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                    filters.rank === rank
                      ? "bg-brand-purple/20 text-brand-purple"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {rank}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Skin Tier Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleSection("skin")}
            className="w-full h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-white/70 text-sm flex items-center justify-between hover:border-white/20 transition-all"
          >
            <span className="truncate">
              {filters.skinTier || "Skin Collection"}
            </span>
            <HiOutlineChevronDown
              className={`w-4 h-4 transition-transform ${expandedSection === "skin" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "skin" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1f1f29] border border-white/10 rounded-lg p-1 z-50 max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  handleFilterChange("skinTier", "");
                  toggleSection("skin");
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                All Skins
              </button>
              {skinTiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    handleFilterChange("skinTier", tier);
                    toggleSection("skin");
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                    filters.skinTier === tier
                      ? "bg-brand-gold/20 text-brand-gold"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Region Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleSection("region")}
            className="w-full h-10 px-3 rounded-lg bg-black/30 border border-white/10 text-white/70 text-sm flex items-center justify-between hover:border-white/20 transition-all"
          >
            <span className="truncate">{filters.region || "All Regions"}</span>
            <HiOutlineChevronDown
              className={`w-4 h-4 transition-transform ${expandedSection === "region" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "region" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1f1f29] border border-white/10 rounded-lg p-1 z-50 max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  handleFilterChange("region", "");
                  toggleSection("region");
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                All Regions
              </button>
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => {
                    handleFilterChange("region", region);
                    toggleSection("region");
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                    filters.region === region
                      ? "bg-brand-purple/20 text-brand-purple"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Only */}
      <div className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          checked={filters.featured}
          onChange={(e) => handleFilterChange("featured", e.target.checked)}
          className="w-4 h-4 rounded border-white/10 bg-black/30 text-brand-purple focus:ring-brand-purple"
        />
        <span className="text-xs text-white/50">Featured Only</span>
      </div>
    </motion.div>
  );
}

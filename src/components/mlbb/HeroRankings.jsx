// src/components/mlbb/HeroRankings.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineFilter,
} from "react-icons/hi";
import useMLBBHeroesStore from "../../stores/useMLBBHeroesStore";
import MLBBToolsLayout from "./MLBBToolsLayout";
import Spinner from "../ui/Spinner";

export default function HeroRankings() {
  const { heroRankings, loading, error, fetchRankings, filters, setFilters } =
    useMLBBHeroesStore();

  useEffect(() => {
    fetchRankings();
  }, [filters.days, filters.rank, filters.sortField, filters.sortOrder]);

  const rankOptions = ["all", "mythic", "legend", "epic"];
  const dayOptions = [1, 7, 30];
  const sortOptions = [
    { value: "win_rate", label: "Win Rate" },
    { value: "ban_rate", label: "Ban Rate" },
    { value: "appearance_rate", label: "Pick Rate" },
  ];

  return (
    <MLBBToolsLayout>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {/* Rank Filter */}
        <div className="flex gap-2">
          {rankOptions.map((rank) => (
            <button
              key={rank}
              onClick={() => setFilters({ rank })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.rank === rank
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "text-white/40 hover:text-white/60 bg-white/[0.02] border border-transparent"
              }`}
            >
              {rank.charAt(0).toUpperCase() + rank.slice(1)}
            </button>
          ))}
        </div>

        {/* Days Filter */}
        <div className="flex gap-2">
          {dayOptions.map((days) => (
            <button
              key={days}
              onClick={() => setFilters({ days })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.days === days
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "text-white/40 hover:text-white/60 bg-white/[0.02] border border-transparent"
              }`}
            >
              {days}D
            </button>
          ))}
        </div>

        {/* Sort Filter */}
        <div className="flex gap-2">
          {sortOptions.map((sort) => (
            <button
              key={sort.value}
              onClick={() => setFilters({ sortField: sort.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.sortField === sort.value
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "text-white/40 hover:text-white/60 bg-white/[0.02] border border-transparent"
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="text-white/30 text-sm mt-4">Loading rankings...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            Failed to load rankings
          </h3>
          <p className="text-red-400/60 text-sm mt-2">{error}</p>
          <button
            onClick={fetchRankings}
            className="mt-4 px-4 py-2 rounded-xl bg-white/[0.05] text-white/60 hover:text-white transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Rankings List */}
      {!loading && !error && (
        <div className="space-y-3">
          {heroRankings.map((hero, index) => {
            const heroData = hero.data?.main_hero?.data || {};
            const winRate = hero.data?.main_hero_win_rate || 0;
            const banRate = hero.data?.main_hero_ban_rate || 0;
            const appearanceRate = hero.data?.main_hero_appearance_rate || 0;

            return (
              <motion.div
                key={hero.data?.main_heroid || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-purple-500/30 transition-all"
              >
                {/* Rank Number */}
                <div
                  className={`w-8 text-center font-black text-lg ${
                    index === 0
                      ? "text-yellow-400"
                      : index === 1
                        ? "text-gray-400"
                        : index === 2
                          ? "text-amber-600"
                          : "text-white/30"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Hero Image */}
                {heroData.head && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={heroData.head}
                      alt={heroData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Hero Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">
                    {heroData.name}
                  </h3>
                  <div className="flex gap-3 text-xs mt-1">
                    <span className="text-green-400">
                      WR: {(winRate * 100).toFixed(1)}%
                    </span>
                    <span className="text-red-400">
                      BR: {(banRate * 100).toFixed(1)}%
                    </span>
                    <span className="text-blue-400">
                      PR: {(appearanceRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Win Rate Bar */}
                <div className="hidden sm:block w-32">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                      style={{ width: `${(winRate * 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </MLBBToolsLayout>
  );
}

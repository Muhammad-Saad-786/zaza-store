// src/components/mlbb/HeroPositions.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiOutlineFilter, HiOutlineX } from "react-icons/hi";
import useMLBBHeroesStore from "../../stores/useMLBBHeroesStore";
import HeroCard from "./HeroCard";
import MLBBToolsLayout from "./MLBBToolsLayout";
import Spinner from "../ui/Spinner";

export default function HeroPositions() {
  const navigate = useNavigate();
  const { heroPositions, loading, error, fetchPositions, filters, setFilters } =
    useMLBBHeroesStore();

  useEffect(() => {
    fetchPositions();
  }, [filters.roles, filters.lanes]);

  const roles = [
    { id: "assassin", label: "Assassin", icon: "🗡️" },
    { id: "fighter", label: "Fighter", icon: "⚔️" },
    { id: "mage", label: "Mage", icon: "🔮" },
    { id: "marksman", label: "Marksman", icon: "🏹" },
    { id: "support", label: "Support", icon: "🛡️" },
    { id: "tank", label: "Tank", icon: "🛡️" },
  ];

  const lanes = [
    { id: "exp", label: "Exp Lane", icon: "⚔️" },
    { id: "jungle", label: "Jungle", icon: "🌲" },
    { id: "gold", label: "Gold Lane", icon: "💰" },
    { id: "mid", label: "Mid Lane", icon: "🎯" },
    { id: "roam", label: "Roam", icon: "🚶" },
  ];

  const toggleFilter = (type, value) => {
    const current = filters[type] || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setFilters({ [type]: updated });
  };

  const handleHeroClick = (hero) => {
    const heroName = hero.data?.hero?.data?.name;
    if (heroName) {
      navigate(`/tools/mlbb/hero/${heroName}`);
    }
  };

  return (
    <MLBBToolsLayout>
      {/* Filters */}
      <div className="space-y-6 mb-8">
        {/* Roles */}
        <div>
          <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3 text-center">
            Filter by Role
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => toggleFilter("roles", role.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filters.roles?.includes(role.id)
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "text-white bg-white/[0.02] border border-transparent hover:border-white/10"
                }`}
              >
                <span>{role.icon}</span>
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lanes */}
        <div>
          <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3 text-center">
            Filter by Lane
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {lanes.map((lane) => (
              <button
                key={lane.id}
                onClick={() => toggleFilter("lanes", lane.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filters.lanes?.includes(lane.id)
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "text-white bg-white/[0.02] border border-transparent hover:border-white/10"
                }`}
              >
                <span>{lane.icon}</span>
                {lane.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(filters.roles?.length > 0 || filters.lanes?.length > 0) && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setFilters({ roles: [], lanes: [] })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] text-white/60 hover:text-white transition-all text-sm"
            >
              <HiOutlineX className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="text-white/30 text-sm mt-4">Loading heroes...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            Failed to load heroes
          </h3>
          <p className="text-red-400/60 text-sm mt-2">{error}</p>
          <button
            onClick={fetchPositions}
            className="mt-4 px-4 py-2 rounded-xl bg-white/[0.05] text-white/60 hover:text-white transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Heroes Grid */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {heroPositions.map((hero, index) => (
            <HeroCard
              key={hero.id || index}
              hero={hero}
              index={index}
              onClick={() => handleHeroClick(hero)}
            />
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && heroPositions.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
            <HiOutlineFilter className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white">No heroes found</h3>
          <p className="text-white/30 text-sm mt-2">
            Try adjusting your filters
          </p>
        </div>
      )}
    </MLBBToolsLayout>
  );
}

// src/components/mlbb/HeroesList.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import useMLBBHeroesStore from "../../stores/useMLBBHeroesStore";
import HeroCard from "./HeroCard";
import MLBBToolsLayout from "./MLBBToolsLayout";
import Spinner from "../ui/Spinner";
import SEO from "../ui/SEO";
import { pageSEO } from "../../config/seo";
export default function HeroesList() {
  const navigate = useNavigate();
  const {
    heroes,
    loading,
    error,
    fetchHeroesList,
    fetchAllHeroesForMap,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalHeroes,
    hasMore,
  } = useMLBBHeroesStore();
  const [filteredHeroes, setFilteredHeroes] = useState([]);

  useEffect(() => {
    fetchHeroesList(1);
    fetchAllHeroesForMap(); // Fetch all heroes for name resolution
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredHeroes(
        heroes.filter((hero) => {
          const heroName = hero.data?.hero?.data?.name?.toLowerCase() || "";
          return heroName.includes(query);
        }),
      );
    } else {
      setFilteredHeroes(heroes);
    }
  }, [heroes, searchQuery]);

  const handleHeroClick = (hero) => {
    const heroName = hero.data?.hero?.data?.name;
    if (heroName) {
      navigate(`/tools/mlbb/hero/${heroName}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchHeroesList(page);
  };

  return (
    <MLBBToolsLayout>
      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <SEO
          title={pageSEO.heroes.title}
          description={pageSEO.heroes.description}
          keywords={pageSEO.heroes.keywords}
        />
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl transition-all duration-500 bg-purple-500/10 blur-xl opacity-0 group-hover:opacity-100" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center flex-shrink-0">
              <HiOutlineSearch className="w-6 h-6 text-white/30" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search heroes..."
              className="flex-1 bg-transparent border-b-2 border-white/10 text-white text-xl font-light pb-2 outline-none focus:border-purple-500/50 transition-all placeholder:text-white/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-2 text-white/30 hover:text-white/60 transition-colors"
              >
                <HiOutlineRefresh className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && !searchQuery && (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="text-white/30 text-sm mt-4">Loading heroes...</p>
        </div>
      )}

      {/* Error State */}
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
            onClick={() => fetchHeroesList(currentPage)}
            className="mt-4 px-4 py-2 rounded-xl bg-white/[0.05] text-white/60 hover:text-white transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Heroes Grid */}
      {!loading && !error && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"
          >
            {filteredHeroes.map((hero, index) => (
              <HeroCard
                key={hero.data?.hero_id || index}
                hero={hero}
                index={index}
                onClick={() => handleHeroClick(hero)}
              />
            ))}
          </motion.div>

          {/* Pagination */}
          {!searchQuery && totalHeroes > 20 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-white/60 text-sm px-4">
                Page {currentPage} of {Math.ceil(totalHeroes / 20)}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasMore}
                className="p-2 rounded-xl bg-white/[0.02] text-white/60 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && filteredHeroes.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
            <HiOutlineSearch className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white">No heroes found</h3>
          <p className="text-white/30 text-sm mt-2">
            Try adjusting your search query
          </p>
        </div>
      )}
    </MLBBToolsLayout>
  );
}

// src/stores/useMLBBHeroesStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import {
  fetchAllHeroes,
  fetchHeroRank,
  fetchHeroPositions,
  fetchHeroDetails,
  fetchHeroSkillCombos,
  fetchHeroRelations,
  fetchHeroCounters,
  fetchHeroCompatibility,
  fetchHeroTrends,
  fetchHeroStats,
} from "../lib/mlbbHeroesApi";

const useMLBBHeroesStore = create((set, get) => ({
  // State
  heroes: [],
  allHeroesMap: {}, // Store all heroes by ID for quick lookup
  heroRankings: [],
  heroPositions: [],
  selectedHero: null,
  heroStats: null,
  heroSkillCombos: [],
  heroTrends: null,
  heroRelations: null,
  heroCounters: [],
  heroCompatibility: [],
  loading: false,
  error: null,
  searchQuery: "",
  currentPage: 1,
  totalHeroes: 0,
  hasMore: true,
  filters: {
    roles: [],
    lanes: [],
    rank: "all",
    days: 1,
    sortField: "win_rate",
    sortOrder: "desc",
  },

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCurrentPage: (page) => set({ currentPage: page }),

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  // Build hero map for quick lookups
  buildHeroMap: (heroesList) => {
    const heroMap = {};
    heroesList.forEach((hero) => {
      const heroId = hero.data?.hero_id;
      const heroName = hero.data?.hero?.data?.name;
      const heroImage =
        hero.data?.hero?.data?.head || hero.data?.hero?.data?.smallmap;
      if (heroId && heroName) {
        heroMap[heroId] = {
          id: heroId,
          name: heroName,
          image: heroImage,
        };
      }
    });
    return heroMap;
  },

  fetchHeroesList: async (page = 1, append = false) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchAllHeroes({ size: 20, index: page });
      if (data.code === 0) {
        const records = data.data.records || [];
        const totalRecords = data.data.total || 0;

        // Build hero map from all records
        const heroMap = get().buildHeroMap(records);

        set((state) => ({
          heroes: append ? [...state.heroes, ...records] : records,
          allHeroesMap: { ...state.allHeroesMap, ...heroMap },
          loading: false,
          totalHeroes: totalRecords,
          hasMore: state.heroes.length + records.length < totalRecords,
        }));
      } else {
        throw new Error(data.message || "Failed to fetch heroes");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  fetchAllHeroesForMap: async () => {
    try {
      // Fetch first page to get total count
      const firstPage = await fetchAllHeroes({ size: 100, index: 1 });
      if (firstPage.code === 0) {
        const records = firstPage.data.records || [];
        const total = firstPage.data.total || records.length;
        const heroMap = get().buildHeroMap(records);

        set((state) => ({
          allHeroesMap: { ...state.allHeroesMap, ...heroMap },
        }));

        // If there are more heroes, fetch them in chunks
        const totalPages = Math.ceil(total / 100);
        const fetchPromises = [];

        for (let page = 2; page <= totalPages; page++) {
          fetchPromises.push(fetchAllHeroes({ size: 100, index: page }));
        }

        const results = await Promise.all(fetchPromises);
        let fullHeroMap = { ...heroMap };

        results.forEach((result) => {
          if (result.code === 0) {
            const pageHeroMap = get().buildHeroMap(result.data.records || []);
            fullHeroMap = { ...fullHeroMap, ...pageHeroMap };
          }
        });

        set({ allHeroesMap: fullHeroMap });
      }
    } catch (error) {
      console.error("Failed to fetch all heroes for map:", error);
    }
  },

  fetchRankings: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const data = await fetchHeroRank({
        days: filters.days,
        rank: filters.rank,
        sortField: filters.sortField,
        sortOrder: filters.sortOrder,
        size: 20,
      });
      if (data.code === 0) {
        set({ heroRankings: data.data.records, loading: false });
      } else {
        throw new Error(data.message || "Failed to fetch rankings");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  fetchPositions: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const data = await fetchHeroPositions({
        roles: filters.roles,
        lanes: filters.lanes,
        size: 50,
      });
      if (data.code === 0) {
        set({ heroPositions: data.data.records, loading: false });
      } else {
        throw new Error(data.message || "Failed to fetch positions");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  fetchHeroDetail: async (heroIdentifier) => {
    set({ loading: true, error: null, selectedHero: null });
    try {
      const data = await fetchHeroDetails(heroIdentifier);
      if (data.code === 0 && data.data.records?.length > 0) {
        set({ selectedHero: data.data.records[0], loading: false });
      } else {
        throw new Error("Hero not found");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  fetchSkillCombos: async (heroIdentifier) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchHeroSkillCombos(heroIdentifier);
      if (data.code === 0) {
        set({ heroSkillCombos: data.data.records, loading: false });
      } else {
        throw new Error(data.message || "Failed to fetch skill combos");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  fetchRelations: async (heroIdentifier) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchHeroRelations(heroIdentifier);
      if (data.code === 0) {
        set({ heroRelations: data.data.records[0], loading: false });
      } else {
        throw new Error(data.message || "Failed to fetch relations");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  fetchCounters: async (heroIdentifier) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const data = await fetchHeroCounters(heroIdentifier, {
        days: filters.days,
        rank: filters.rank,
        size: 20,
      });
      if (data.code === 0) {
        set({ heroCounters: data.data.records, loading: false });
      } else {
        throw new Error(data.message || "Failed to fetch counters");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  fetchCompatibility: async (heroIdentifier) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const data = await fetchHeroCompatibility(heroIdentifier, {
        days: filters.days,
        rank: filters.rank,
        size: 20,
      });
      if (data.code === 0) {
        set({ heroCompatibility: data.data.records, loading: false });
      } else {
        throw new Error(data.message || "Failed to fetch compatibility");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  fetchTrends: async (heroIdentifier) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchHeroTrends(heroIdentifier, { days: 7 });
      if (data.code === 0) {
        set({ heroTrends: data.data.records, loading: false });
      } else {
        throw new Error(data.message || "Failed to fetch trends");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  fetchStats: async (heroIdentifier) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchHeroStats(heroIdentifier);
      if (data.code === 0) {
        set({ heroStats: data.data.records[0], loading: false });
      } else {
        throw new Error(data.message || "Failed to fetch stats");
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(error.message);
    }
  },

  clearHeroData: () => {
    set({
      selectedHero: null,
      heroStats: null,
      heroSkillCombos: [],
      heroTrends: null,
      heroRelations: null,
      heroCounters: [],
      heroCompatibility: [],
    });
  },
}));

export default useMLBBHeroesStore;

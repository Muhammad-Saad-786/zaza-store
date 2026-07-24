import { create } from "zustand";
import toast from "react-hot-toast";
import { checkPlayerName } from "../lib/mlbbApi";

const useMLBBStore = create((set, get) => ({
  playerData: null,
  loading: false,
  error: null,
  searchHistory: [],

  // Fetch player info
  fetchPlayerInfo: async (playerId, zoneId) => {
    if (!playerId || !zoneId) {
      toast.error("Please enter Player ID and Server ID");
      return;
    }

    // Validate numeric
    if (!/^\d+$/.test(playerId) || !/^\d+$/.test(zoneId)) {
      toast.error("Player ID and Server ID should contain only numbers");
      return;
    }

    set({ loading: true, error: null, playerData: null });

    try {
      const result = await checkPlayerName(playerId, zoneId);

      if (result.success) {
        set({ playerData: result, loading: false });

        // Add to history
        const history = get().searchHistory;
        const newEntry = {
          id: `${playerId}-${zoneId}`,
          username: result.username,
          playerId,
          zoneId,
          timestamp: Date.now(),
        };

        const filtered = history.filter((h) => h.id !== newEntry.id);
        filtered.unshift(newEntry);

        set({ searchHistory: filtered.slice(0, 10) });
        toast.success(`Found: ${result.username}`);
      } else {
        set({ error: result.error, loading: false });
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to check player");
    }
  },

  // Load history from localStorage
  loadHistory: () => {
    try {
      const saved = localStorage.getItem("mlbb_search_history");
      if (saved) {
        set({ searchHistory: JSON.parse(saved) });
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  },

  // Save history to localStorage
  saveHistory: () => {
    try {
      localStorage.setItem(
        "mlbb_search_history",
        JSON.stringify(get().searchHistory),
      );
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  },

  clearPlayerData: () => set({ playerData: null, error: null }),

  clearHistory: () => {
    set({ searchHistory: [] });
    localStorage.removeItem("mlbb_search_history");
  },

  removeFromHistory: (id) => {
    set((state) => ({
      searchHistory: state.searchHistory.filter((h) => h.id !== id),
    }));
    get().saveHistory();
  },
}));

export default useMLBBStore;

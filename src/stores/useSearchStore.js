import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useSearchStore = create((set, get) => ({
  query: "",
  results: [],
  loading: false,
  showResults: false,

  setQuery: (query) => {
    set({ query });
    if (query.length >= 2) {
      get().search();
    } else {
      set({ results: [], showResults: false });
    }
  },

  search: async () => {
    const { query } = get();
    if (!query || query.length < 2) return;

    set({ loading: true, showResults: true });

    try {
      const { data, error } = await supabase
        .from("accounts")
        .select(
          `
          id,
          title,
          price,
          rank,
          hero_count,
          skin_count,
          status,
          images:account_images(url, is_cover)
        `,
        )
        .in("status", ["active", "pending", "sold"])
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,rank.ilike.%${query}%`,
        )
        .order("views", { ascending: false })
        .limit(5);

      if (error) throw error;

      set({ results: data || [], loading: false });
    } catch (error) {
      console.error("Search error:", error);
      set({ results: [], loading: false });
    }
  },

  clearSearch: () => {
    set({ query: "", results: [], showResults: false });
  },

  closeResults: () => {
    set({ showResults: false });
  },
}));

export default useSearchStore;

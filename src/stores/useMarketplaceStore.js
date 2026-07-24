import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useMarketplaceStore = create((set, get) => ({
  accounts: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 12,

  // Filters
  filters: {
    search: "",
    minPrice: "",
    maxPrice: "",
    rank: "",
    skinTier: "",
    region: "",
    sortBy: "newest",
    featured: false,
    verified: false,
  },

  // Set filters
  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      currentPage: 1, // Reset to page 1 when filter changes
    }));
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        search: "",
        minPrice: "",
        maxPrice: "",
        rank: "",
        skinTier: "",
        region: "",
        sortBy: "newest",
        featured: false,
        verified: false,
      },
      currentPage: 1,
    });
  },

  // Set page
  setPage: (page) => set({ currentPage: page }),

  // Fetch accounts
  fetchAccounts: async () => {
    set({ loading: true, error: null });

    try {
      const { filters, currentPage, pageSize } = get();

      let query = supabase
        .from("accounts")
        .select(
          `
    *,
    seller:profiles!accounts_seller_id_fkey (
      username,
      avatar_url,
      verified_seller,
      rating
    ),
    images:account_images(url, is_cover)
  `,
          { count: "exact" },
        )
        .in("status", ["active", "pending", "sold"])
        .eq("approval_status", "approved");

      // Apply search
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        );
      }

      // Apply price filter
      if (filters.minPrice) {
        query = query.gte("price", filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte("price", filters.maxPrice);
      }

      // Apply rank filter
      if (filters.rank) {
        query = query.eq("rank", filters.rank);
      }

      // Apply region filter
      if (filters.region) {
        query = query.eq("server", filters.region);
      }

      // Apply featured filter
      if (filters.featured) {
        query = query.eq("featured", true);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        case "popular":
          query = query.order("views", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      // DETAILED ERROR LOGGING
      if (error) {
        console.error("Error message:", error.message);
        throw error;
      }

      set({
        accounts: data || [],
        totalCount: count || 0,
        loading: false,
      });
    } catch (error) {
      console.error("Catch error:", error.message || error);
      set({ error: error.message || "Failed to fetch", loading: false });
    }
  },

  // Toggle wishlist (placeholder - will integrate with DB later)
  toggleWishlist: (accountId) => {
    // Will be implemented with wishlist table
    console.log("Toggle wishlist for:", accountId);
  },
}));

export default useMarketplaceStore;

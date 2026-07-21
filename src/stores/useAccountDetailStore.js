import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useAccountDetailStore = create((set, get) => ({
  account: null,
  loading: false,
  error: null,
  relatedAccounts: [],
  selectedImage: 0,
  images: [], // Separate images array

  fetchAccount: async (id) => {
    set({ loading: true, error: null });

    try {
      // Fetch account with seller info
      const { data: account, error } = await supabase
        .from("accounts")
        .select(
          `
    *,
    seller:profiles (
      username,
      avatar_url,
      verified_seller,
      rating,
      total_sales,
      created_at,
      bio
    )
  `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch images separately
      const { data: images, error: imageError } = await supabase
        .from("account_images")
        .select("*")
        .eq("account_id", id)
        .order("sort_order", { ascending: true });

      if (imageError) {
        console.error("Failed to fetch images:", imageError);
      }

      console.log("Account:", account);
      console.log("Images:", images);

      set({
        account: account,
        images: images || [],
        loading: false,
      });

      // Increment view count
      await supabase
        .from("accounts")
        .update({ views: (account.views || 0) + 1 })
        .eq("id", id);

      // Fetch related accounts
      get().fetchRelated(account.rank, id);
    } catch (error) {
      console.error("Fetch account error:", error);
      set({ error: error.message, loading: false });
    }
  },

  fetchRelated: async (rank, excludeId) => {
    try {
      const { data } = await supabase
        .from("accounts")
        .select(
          `
        *,
        seller:profiles (
          username,
          verified_seller
        ),
        images:account_images (
          url,
          is_cover
        )
      `,
        )
        .in("status", ["active", "pending", "sold"]) // Show all statuses
        .neq("id", excludeId)
        .order("views", { ascending: false })
        .limit(4);

      set({ relatedAccounts: data || [] });
    } catch (error) {
      console.error("Failed to fetch related accounts:", error);
    }
  },

  setSelectedImage: (index) => set({ selectedImage: index }),
}));

export default useAccountDetailStore;

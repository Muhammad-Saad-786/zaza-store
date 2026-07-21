import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const useWishlistStore = create((set, get) => ({
  wishlistIds: [],
  wishlistItems: [],
  loading: false,
  count: 0,

  // Fetch wishlist IDs only (for quick checks)
  fetchWishlistIds: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select("account_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const ids = (data || []).map((item) => item.account_id);
      set({ wishlistIds: ids, count: ids.length });
    } catch (error) {
      console.error("Failed to fetch wishlist IDs:", error);
    }
  },

  // Fetch full wishlist items
  fetchWishlistItems: async () => {
    set({ loading: true });
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(
          `
          *,
          account:accounts (
            id,
            title,
            price,
            rank,
            hero_count,
            skin_count,
            status,
            images:account_images(url, is_cover)
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ wishlistItems: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch wishlist items:", error);
      set({ loading: false });
    }
  },

  // Toggle wishlist
  toggleWishlist: async (accountId) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }

    const { wishlistIds } = get();
    const isWishlisted = wishlistIds.includes(accountId);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const { data: existing } = await supabase
          .from("wishlist")
          .select("id")
          .eq("user_id", user.id)
          .eq("account_id", accountId)
          .single();

        if (existing) {
          await supabase.from("wishlist").delete().eq("id", existing.id);
        }

        set({
          wishlistIds: wishlistIds.filter((id) => id !== accountId),
          count: get().count - 1,
        });
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        await supabase.from("wishlist").insert([
          {
            user_id: user.id,
            account_id: accountId,
          },
        ]);

        set({
          wishlistIds: [...wishlistIds, accountId],
          count: get().count + 1,
        });
        toast.success("Added to wishlist!", { icon: "❤️" });
      }
    } catch (error) {
      console.error("Toggle wishlist error:", error);
      toast.error("Failed to update wishlist");
    }
  },

  // Check if account is in wishlist
  isWishlisted: (accountId) => {
    return get().wishlistIds.includes(accountId);
  },
  // clear wishlist store (for example, on logout)
  clearWishlist: () => {
    set({ wishlistIds: [], wishlistItems: [], count: 0, loading: false });
  },
}));

export default useWishlistStore;

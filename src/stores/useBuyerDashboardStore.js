import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";

const useBuyerDashboardStore = create((set, get) => ({
  // Dashboard stats
  stats: {
    totalOrders: 0,
    wishlistCount: 0,
    unreadMessages: 0,
    recentViews: 0,
  },

  // Orders
  orders: [],
  ordersLoading: false,

  // Wishlist
  wishlist: [],
  wishlistLoading: false,

  // Messages
  messages: [],
  messagesLoading: false,

  // Notifications
  notifications: [],
  notificationsLoading: false,

  // Recently viewed
  recentlyViewed: [],

  // Active tab
  activeTab: "dashboard",

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Fetch dashboard stats
  fetchStats: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      // Get total orders
      const { count: ordersCount, error: ordersError } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("buyer_id", user.id);

      if (ordersError) console.error("Orders count error:", ordersError);

      // Get pending orders
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("buyer_id", user.id)
        .eq("status", "pending");

      // Get completed orders
      const { count: completedCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("buyer_id", user.id)
        .eq("status", "completed");

      // Get wishlist count
      const { count: wishlistCount } = await supabase
        .from("wishlist")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

      // Get unread messages
      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact" })
        .eq("receiver_id", user.id)
        .eq("read", false);

      console.log("Stats:", {
        ordersCount,
        pendingCount,
        completedCount,
        wishlistCount,
        messagesCount,
      });

      set({
        stats: {
          totalOrders: ordersCount || 0,
          pendingOrders: pendingCount || 0,
          completedOrders: completedCount || 0,
          wishlistCount: wishlistCount || 0,
          unreadMessages: messagesCount || 0,
          recentViews: JSON.parse(
            localStorage.getItem("recentlyViewed") || "[]",
          ).length,
        },
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  },

  // Fetch orders
  fetchOrders: async () => {
    set({ ordersLoading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

      console.log("Fetching orders for user:", user.id);

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
        *,
        account:accounts (
          id,
          title,
          price,
          rank,
          status
        )
      `,
        )
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch orders error:", error);
        throw error;
      }

      console.log("Orders fetched:", data);
      set({ orders: data || [], ordersLoading: false });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      set({ ordersLoading: false });
    }
  },

  // Fetch wishlist
  fetchWishlist: async () => {
    set({ wishlistLoading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

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
      set({ wishlist: data || [], wishlistLoading: false });
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      set({ wishlistLoading: false });
    }
  },

  // Toggle wishlist
  toggleWishlist: async (accountId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("account_id", accountId)
        .single();

      if (existing) {
        // Remove from wishlist
        await supabase.from("wishlist").delete().eq("id", existing.id);
      } else {
        // Add to wishlist
        await supabase.from("wishlist").insert([
          {
            user_id: user.id,
            account_id: accountId,
          },
        ]);
      }

      // Refresh wishlist
      get().fetchWishlist();
      get().fetchStats();
    } catch (error) {
      console.error("Toggle wishlist error:", error);
    }
  },

  // Fetch messages
  fetchMessages: async () => {
    set({ messagesLoading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:profiles!messages_sender_id_fkey(username, avatar_url)
        `,
        )
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      set({ messages: data || [], messagesLoading: false });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      set({ messagesLoading: false });
    }
  },

  // Fetch notifications
  fetchNotifications: async () => {
    set({ notificationsLoading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      set({ notifications: data || [], notificationsLoading: false });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({ notificationsLoading: false });
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      get().fetchNotifications();
      get().fetchStats();
    } catch (error) {
      console.error("Failed to mark notification:", error);
    }
  },

  // Load recently viewed from localStorage
  loadRecentlyViewed: () => {
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    set({ recentlyViewed: viewed });
  },

  // Initialize dashboard
  initialize: () => {
    get().fetchStats();
    get().loadRecentlyViewed();
  },
}));

export default useBuyerDashboardStore;

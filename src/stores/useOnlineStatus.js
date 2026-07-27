import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";

const useOnlineStatus = create((set, get) => ({
  onlineUsers: {}, // { userId: { isOnline: true, lastSeen: timestamp } }

  // Set user as online
  setOnline: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq("id", user.id);
    } catch (error) {
      console.error("Failed to set online:", error);
    }
  },

  // Set user as offline
  setOffline: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq("id", user.id); // ← Only current user

      if (error) {
        console.error("Failed to set offline:", error);
      }
    } catch (error) {
      console.error("Failed to set offline:", error);
    }
  },

  // Update last seen (heartbeat)
  updateLastSeen: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", user.id); // ← This MUST be here - only updates current user

      if (error) {
        console.error("Failed to update last seen:", error);
      }
    } catch (error) {
      console.error("Failed to update last seen:", error);
    }
  },

  // Subscribe to online status changes
  subscribeToOnlineUsers: () => {
    const channel = supabase
      .channel("online-users")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          const { id, is_online, last_seen } = payload.new;
          set((state) => ({
            onlineUsers: {
              ...state.onlineUsers,
              [id]: { isOnline: is_online, lastSeen: last_seen },
            },
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Fetch online users
  fetchOnlineUsers: async (userIds) => {
    if (!userIds || userIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, is_online, last_seen")
        .in("id", userIds);

      if (error) throw error;

      const users = {};
      data?.forEach((user) => {
        users[user.id] = {
          isOnline: user.is_online,
          lastSeen: user.last_seen,
        };
      });

      set({ onlineUsers: { ...get().onlineUsers, ...users } });
    } catch (error) {
      console.error("Failed to fetch online users:", error);
    }
  },

  // Check if a user is online
  isUserOnline: (userId) => {
    return get().onlineUsers[userId]?.isOnline || false;
  },

  // Get last seen text
  getLastSeen: (userId) => {
    const user = get().onlineUsers[userId];
    if (!user?.lastSeen) return "Offline";

    if (user.isOnline) return "Online now";

    const lastSeen = new Date(user.lastSeen);
    const now = new Date();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return lastSeen.toLocaleDateString();
  },
}));

export default useOnlineStatus;

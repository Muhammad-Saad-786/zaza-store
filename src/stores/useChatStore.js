import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  sending: false,

  // Fetch all conversations (users you've chatted with)
  fetchConversations: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });

    try {
      // Get unique conversations from messages
      const { data: sentMessages } = await supabase
        .from("messages")
        .select("receiver_id")
        .eq("sender_id", user.id);

      const { data: receivedMessages } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", user.id);

      // Combine unique user IDs
      const userIds = new Set();
      sentMessages?.forEach((msg) => userIds.add(msg.receiver_id));
      receivedMessages?.forEach((msg) => userIds.add(msg.sender_id));

      // Also add the active conversation if it exists
      const activeConv = get().activeConversation;
      if (activeConv) {
        userIds.add(activeConv.userId);
      }

      // Fetch profiles for each user
      const conversations = [];
      for (const userId of userIds) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url, verified_seller")
          .eq("id", userId)
          .single();

        if (profile) {
          // Get unread count
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact" })
            .eq("sender_id", userId)
            .eq("receiver_id", user.id)
            .eq("read", false);

          conversations.push({
            userId,
            username: profile.username,
            avatar_url: profile.avatar_url,
            verified_seller: profile.verified_seller,
            unread: count || 0,
          });
        }
      }

      set({ conversations, loading: false });
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      set({ loading: false });
    }
  },
  // Open a conversation with a specific user
  openConversation: async (userId, username, avatar_url) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    set({
      activeConversation: { userId, username, avatar_url },
      messages: [],
    });

    await get().fetchMessages(userId);

    // Mark messages as read - this triggers the real-time UPDATE event
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", userId)
      .eq("receiver_id", currentUser.id)
      .eq("read", false);

    if (error) {
      console.error("Error marking messages as read:", error);
    }

    await get().fetchConversations();
  },

  // Fetch messages for active conversation
  fetchMessages: async (otherUserId) => {
    const user = useAuthStore.getState().user;
    if (!user || !otherUserId) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Filter only messages between these two users
      const filteredMessages = (data || []).filter(
        (msg) =>
          (msg.sender_id === user.id && msg.receiver_id === otherUserId) ||
          (msg.sender_id === otherUserId && msg.receiver_id === user.id),
      );

      set({ messages: filteredMessages });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  },

  // Send a message
  sendMessage: async (content) => {
    const user = useAuthStore.getState().user;
    const { activeConversation } = get();
    if (!user || !activeConversation || !content.trim()) return;

    set({ sending: true });

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            sender_id: user.id,
            receiver_id: activeConversation.userId,
            content: content.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add message to state
      set((state) => ({
        messages: [...state.messages, data],
        sending: false,
      }));
    } catch (error) {
      console.error("Failed to send message:", error);
      set({ sending: false });
    }
  },

  // Subscribe to real-time messages
  subscribeToMessages: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const newMessage = payload.new;
          const { activeConversation, messages } = get();

          // If this message is from the active conversation, add it
          if (
            activeConversation &&
            newMessage.sender_id === activeConversation.userId
          ) {
            set({ messages: [...messages, newMessage] });
            // Mark as read
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", newMessage.id);
          }

          // Refresh conversations to update unread counts
          get().fetchConversations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },

  // Cleanup
  closeConversation: () => {
    set({ activeConversation: null, messages: [] });
  },
}));

export default useChatStore;

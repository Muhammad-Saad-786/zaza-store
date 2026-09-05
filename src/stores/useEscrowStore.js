import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const useEscrowStore = create((set, get) => ({
  // Kept for backward compatibility - logs actions to escrow_transactions table
  // but manual escrow flow is replaced by Stripe webhook automation
  loading: false,

  // Log escrow action for audit trail (kept for historical data)
  logEscrowAction: async (orderId, action, details = "") => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    await supabase.from("escrow_transactions").insert([
      {
        order_id: orderId,
        action: action,
        performed_by: user.id,
        details: details,
      },
    ]);
  },

  // Fetch escrow timeline (kept for backward compatibility)
  fetchEscrowTimeline: async (orderId) => {
    try {
      const { data, error } = await supabase
        .from("escrow_transactions")
        .select(`*, performer:profiles(username)`)
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      set({ escrowTimeline: data || [] });
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    }
  },

  // escrowTimeline state removed - manual escrow flow replaced by Stripe webhook
}));

export default useEscrowStore;
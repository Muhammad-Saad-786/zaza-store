import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const useOrderStore = create((set, get) => ({
  isProcessing: false,
  showConfirmModal: false,
  selectedAccount: null,

  openBuyConfirm: (account) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      toast.error("Please login to purchase");
      return;
    }
    if (user.id === account.seller_id) {
      toast.error("You can't buy your own account!");
      return;
    }
    if (account.status !== "active") {
      toast.error("This account is no longer available");
      return;
    }

    set({
      showConfirmModal: true,
      selectedAccount: {
        ...account,
        // Ensure images array exists
        images: account.images || [],
      },
    });
  },

  closeBuyConfirm: () => {
    set({ showConfirmModal: false, selectedAccount: null });
  },

  processPurchase: async () => {
    const { selectedAccount } = get();
    const user = useAuthStore.getState().user;
    if (!user || !selectedAccount) return;

    set({ isProcessing: true });

    try {
      console.log("Creating order...");

      // Check if account is still active
      const { data: accountCheck, error: checkError } = await supabase
        .from("accounts")
        .select("status")
        .eq("id", selectedAccount.id)
        .single();

      if (checkError) throw checkError;

      if (accountCheck.status !== "active") {
        toast.error("This account is no longer available");
        set({ isProcessing: false, showConfirmModal: false });
        return { success: false, error: "Account not available" };
      }

      // Mark account as pending FIRST to prevent other orders
      const { error: pendingError } = await supabase
        .from("accounts")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .eq("id", selectedAccount.id)
        .eq("status", "active"); // Only update if still active

      if (pendingError) {
        console.error("Failed to mark as pending:", pendingError);
        toast.error("This account just became unavailable");
        set({ isProcessing: false, showConfirmModal: false });
        return { success: false, error: "Account unavailable" };
      }

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            buyer_id: user.id,
            seller_id: selectedAccount.seller_id,
            account_id: selectedAccount.id,
            amount: selectedAccount.price,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) {
        // Rollback - make account active again
        await supabase
          .from("accounts")
          .update({ status: "active" })
          .eq("id", selectedAccount.id);

        console.error("Order creation error:", orderError);
        throw new Error(orderError.message);
      }

      console.log("Order created successfully:", order);

      // Notify seller
      await supabase.from("notifications").insert([
        {
          user_id: selectedAccount.seller_id,
          title: "New Order! 🎉",
          message: `Someone wants to buy "${selectedAccount.title}" for $${selectedAccount.price}`,
          type: "order",
          link: "/seller-dashboard/orders",
        },
      ]);

      toast.success("Order placed! Waiting for seller to accept.");
      set({
        showConfirmModal: false,
        selectedAccount: null,
        isProcessing: false,
      });

      setTimeout(() => {
        window.location.href = "/dashboard/orders";
      }, 1500);

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to place order");
      set({ isProcessing: false });
      return { success: false, error: error.message };
    }
  },
}));

export default useOrderStore;

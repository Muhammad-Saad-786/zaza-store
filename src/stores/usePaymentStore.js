import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import { uploadPaymentProof } from "../lib/storage";
import toast from "react-hot-toast";

const usePaymentStore = create((set, get) => ({
  loading: false,
  showPaymentModal: false,
  selectedOrder: null,

  openPaymentModal: (order) => {
    set({ showPaymentModal: true, selectedOrder: order });
  },

  closePaymentModal: () => {
    set({ showPaymentModal: false, selectedOrder: null });
  },

  submitPaymentProof: async (orderId, paymentMethod, proofFile) => {
    set({ loading: true });
    const user = useAuthStore.getState().user;

    try {
      // Upload to private bucket - returns file path only
      const filePath = await uploadPaymentProof(user.id, proofFile);

      // Store the file PATH in database (not full URL)
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          escrow_status: "payment_submitted",
          payment_method: paymentMethod,
          payment_proof: filePath, // Store path only
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Notify seller
      const { data: order } = await supabase
        .from("orders")
        .select("seller_id, account:accounts(title)")
        .eq("id", orderId)
        .single();

      if (order) {
        await supabase.from("notifications").insert([
          {
            user_id: order.seller_id,
            title: "💰 Payment Submitted!",
            message: `Buyer has submitted payment for "${order.account?.title}". Please verify.`,
            type: "escrow",
            link: "/seller-dashboard/orders",
          },
        ]);
      }

      toast.success("Payment proof submitted securely!");
      set({ loading: false, showPaymentModal: false, selectedOrder: null });
      return { success: true };
    } catch (error) {
      console.error("Submit payment error:", error);
      toast.error("Failed to submit payment: " + error.message);
      set({ loading: false });
      return { success: false };
    }
  },
}));

export default usePaymentStore;

import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const useEscrowStore = create((set, get) => ({
  loading: false,
  escrowTimeline: [],

  // Log escrow action for audit trail
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

  // Buyer submits payment proof
  submitPayment: async (orderId, paymentMethod, proofFile, note = "") => {
    set({ loading: true });
    const user = useAuthStore.getState().user;

    try {
      // Upload proof
      let proofUrl = null;
      if (proofFile) {
        const fileName = `payments/${user.id}/${Date.now()}.${proofFile.name.split(".").pop()}`;
        const { data: upload } = await supabase.storage
          .from("account-images")
          .upload(fileName, proofFile);

        if (upload) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("account-images").getPublicUrl(upload.path);
          proofUrl = publicUrl;
        }
      }

      // Update order
      const { error } = await supabase
        .from("orders")
        .update({
          escrow_status: "payment_submitted",
          payment_method: paymentMethod,
          payment_proof: proofUrl,
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("buyer_id", user.id);

      if (error) throw error;

      // Log action
      await get().logEscrowAction(
        orderId,
        "payment_submitted",
        `Payment submitted via ${paymentMethod}. Note: ${note}`,
      );

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
            message: `Buyer has submitted payment for "${order.account?.title}". Please verify and deliver the account.`,
            type: "escrow",
            link: "/seller-dashboard/orders",
          },
        ]);
      }

      toast.success("Payment proof submitted! Seller will verify and deliver.");
      set({ loading: false });
      return { success: true };
    } catch (error) {
      toast.error("Failed to submit payment: " + error.message);
      set({ loading: false });
      return { success: false };
    }
  },

  // Seller verifies payment received
  verifyPayment: async (orderId) => {
    const user = useAuthStore.getState().user;
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          escrow_status: "payment_verified",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("seller_id", user.id);

      if (error) throw error;

      await get().logEscrowAction(
        orderId,
        "payment_verified",
        "Seller confirmed payment received",
      );

      // Notify buyer
      const { data: order } = await supabase
        .from("orders")
        .select("buyer_id, account:accounts(title)")
        .eq("id", orderId)
        .single();

      if (order) {
        await supabase.from("notifications").insert([
          {
            user_id: order.buyer_id,
            title: " Payment Verified!",
            message: `Seller has confirmed your payment. They will deliver the account shortly.`,
            type: "escrow",
            link: "/dashboard/orders",
          },
        ]);
      }

      toast.success("Payment verified! Please deliver the account now.");
      return { success: true };
    } catch (error) {
      toast.error("Failed to verify payment");
      return { success: false };
    }
  },

  // Seller marks account as delivered
  markDelivered: async (orderId, deliveryNote = "") => {
    const user = useAuthStore.getState().user;
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          escrow_status: "delivered",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("seller_id", user.id);

      if (error) throw error;

      await get().logEscrowAction(orderId, "account_delivered", deliveryNote);

      // Notify buyer
      const { data: order } = await supabase
        .from("orders")
        .select("buyer_id, account:accounts(title)")
        .eq("id", orderId)
        .single();

      if (order) {
        await supabase.from("notifications").insert([
          {
            user_id: order.buyer_id,
            title: "📦 Account Delivered!",
            message: `The account "${order.account?.title}" has been delivered. Please verify within 48 hours.`,
            type: "escrow",
            link: "/dashboard/orders",
          },
        ]);
      }

      toast.success(
        "Account marked as delivered. Buyer has 48 hours to verify.",
      );
      return { success: true };
    } catch (error) {
      toast.error("Failed to mark as delivered");
      return { success: false };
    }
  },

  // Buyer confirms receipt - releases payment to seller
  confirmReceipt: async (orderId) => {
    const user = useAuthStore.getState().user;
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          escrow_status: "released",
          escrow_released_at: new Date().toISOString(),
          delivery_confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("buyer_id", user.id);

      if (error) throw error;

      // Create transaction for seller
      const { data: order } = await supabase
        .from("orders")
        .select("seller_id, amount, account:accounts(title)")
        .eq("id", orderId)
        .single();

      if (order) {
        await supabase.from("transactions").insert([
          {
            seller_id: order.seller_id,
            order_id: orderId,
            amount: order.amount,
            type: "sale",
            status: "completed",
            description: `Escrow released for ${order.account?.title}`,
          },
        ]);

        await supabase.from("notifications").insert([
          {
            user_id: order.seller_id,
            title: "🎉 Payment Released!",
            message: `$${order.amount} has been released to your account for "${order.account?.title}".`,
            type: "escrow",
            link: "/seller-dashboard/revenue",
          },
        ]);
      }

      await get().logEscrowAction(
        orderId,
        "payment_released",
        "Buyer confirmed receipt",
      );

      toast.success("Payment released to seller! Enjoy your account!");
      return { success: true };
    } catch (error) {
      toast.error("Failed to confirm receipt");
      return { success: false };
    }
  },

  // Buyer files dispute
  fileDispute: async (orderId, reason, description) => {
    const user = useAuthStore.getState().user;
    try {
      // Update order
      await supabase
        .from("orders")
        .update({
          escrow_status: "disputed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("buyer_id", user.id);

      // Create dispute
      const { data: order } = await supabase
        .from("orders")
        .select("seller_id, account:accounts(title)")
        .eq("id", orderId)
        .single();

      await supabase.from("disputes").insert([
        {
          order_id: orderId,
          buyer_id: user.id,
          seller_id: order.seller_id,
          reason: reason,
          description: description,
        },
      ]);

      await get().logEscrowAction(
        orderId,
        "dispute_filed",
        `Reason: ${reason}`,
      );

      // Notify seller and admin
      await supabase.from("notifications").insert([
        {
          user_id: order.seller_id,
          title: "🚨 Dispute Filed!",
          message: `A dispute has been filed for "${order.account?.title}". Funds are frozen pending review.`,
          type: "escrow",
          link: "/seller-dashboard/orders",
        },
      ]);

      toast.success("Dispute filed. Funds are frozen pending admin review.");
      return { success: true };
    } catch (error) {
      toast.error("Failed to file dispute");
      return { success: false };
    }
  },

  // Admin resolves dispute
  resolveDispute: async (orderId, resolution, notes = "") => {
    try {
      if (resolution === "refund") {
        await supabase
          .from("orders")
          .update({
            escrow_status: "refunded",
            escrow_refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        await get().logEscrowAction(orderId, "dispute_resolved_refund", notes);
        toast.success("Dispute resolved: Buyer refunded");
      } else {
        await supabase
          .from("orders")
          .update({
            escrow_status: "released",
            escrow_released_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        await get().logEscrowAction(orderId, "dispute_resolved_release", notes);
        toast.success("Dispute resolved: Payment released to seller");
      }

      return { success: true };
    } catch (error) {
      toast.error("Failed to resolve dispute");
      return { success: false };
    }
  },

  // Get escrow timeline for an order
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
}));

export default useEscrowStore;

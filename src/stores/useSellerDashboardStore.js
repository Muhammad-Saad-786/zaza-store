import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const useSellerDashboardStore = create((set, get) => ({
  // Stats
  stats: {
    totalListings: 0,
    activeListings: 0,
    totalSold: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    thisMonthRevenue: 0,
  },

  // Listings
  listings: [],
  listingsLoading: false,

  // Orders (as seller)
  sellerOrders: [],
  sellerOrdersLoading: false,

  // Transactions
  transactions: [],
  transactionsLoading: false,

  // Verification
  verification: null,
  verificationLoading: false,

  // Active tab
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Fetch dashboard stats
  fetchStats: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      // Get listing counts
      const { count: totalListings } = await supabase
        .from("accounts")
        .select("*", { count: "exact" })
        .eq("seller_id", user.id);

      const { count: activeListings } = await supabase
        .from("accounts")
        .select("*", { count: "exact" })
        .eq("seller_id", user.id)
        .eq("status", "active");

      const { count: totalSold } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("seller_id", user.id)
        .eq("status", "completed");

      // Get revenue
      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount")
        .eq("seller_id", user.id)
        .eq("status", "completed");

      const totalRevenue = (transactions || []).reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0,
      );

      // This month revenue
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthTransactions } = await supabase
        .from("transactions")
        .select("amount")
        .eq("seller_id", user.id)
        .eq("status", "completed")
        .gte("created_at", startOfMonth.toISOString());

      const thisMonthRevenue = (monthTransactions || []).reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0,
      );

      // Pending orders
      const { count: pendingOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("seller_id", user.id)
        .eq("status", "pending");

      set({
        stats: {
          totalListings: totalListings || 0,
          activeListings: activeListings || 0,
          totalSold: totalSold || 0,
          totalRevenue,
          pendingOrders: pendingOrders || 0,
          thisMonthRevenue,
        },
      });
    } catch (error) {
      console.error("Failed to fetch seller stats:", error);
    }
  },

  // Fetch seller's listings
  fetchListings: async () => {
    set({ listingsLoading: true });
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("accounts")
        .select(
          `
          *,
          images:account_images(url, is_cover)
        `,
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ listings: data || [], listingsLoading: false });
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      set({ listingsLoading: false });
    }
  },

  // Update listing status
  updateListingStatus: async (listingId, status) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .update({ status })
        .eq("id", listingId);

      if (error) throw error;

      toast.success(`Listing ${status === "active" ? "published" : status}`);
      get().fetchListings();
      get().fetchStats();
    } catch (error) {
      toast.error("Failed to update listing");
    }
  },

  // Delete listing
  deleteListing: async (listingId) => {
    if (
      !confirm(
        "Delete this listing permanently? All related data will be deleted. This cannot be undone.",
      )
    )
      return;

    try {
      console.log("Deleting listing:", listingId);

      // Step 1: Delete ALL child records in correct order
      // 1a. Delete reviews for this account
      await supabase.from("reviews").delete().eq("account_id", listingId);

      // 1b. Find and delete orders (with their children)
      const { data: orders } = await supabase
        .from("orders")
        .select("id")
        .eq("account_id", listingId);

      if (orders && orders.length > 0) {
        const orderIds = orders.map((o) => o.id);

        // Delete disputes
        await supabase.from("disputes").delete().in("order_id", orderIds);
        // Delete transactions
        await supabase.from("transactions").delete().in("order_id", orderIds);
        // Delete reviews linked to orders
        await supabase.from("reviews").delete().in("order_id", orderIds);
        // Finally delete orders
        await supabase.from("orders").delete().in("id", orderIds);
      }

      // 1c. Delete remaining related records
      await supabase
        .from("account_images")
        .delete()
        .eq("account_id", listingId);
      await supabase.from("wishlist").delete().eq("account_id", listingId);
      await supabase
        .from("reports")
        .delete()
        .eq("reported_account_id", listingId);
      await supabase
        .from("notifications")
        .delete()
        .eq("link", `/account/${listingId}`);

      // Step 2: NOW delete the account
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", listingId);

      if (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete: " + error.message);
        return;
      }

      toast.success("Listing deleted permanently");
      get().fetchListings();
      get().fetchStats();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  },

  // Fetch seller orders
  fetchSellerOrders: async () => {
    set({ sellerOrdersLoading: true });
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      console.log("Fetching seller orders for user:", user.id);

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
        *,
        account:accounts(title, price, rank, status),
        buyer:profiles!orders_buyer_id_fkey(username, email)
      `,
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch seller orders error:", error);
        throw error;
      }

      console.log("Seller orders fetched:", data);
      set({ sellerOrders: data || [], sellerOrdersLoading: false });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      set({ sellerOrdersLoading: false });
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) {
        console.error("Update order error:", error);
        toast.error("Failed to update order");
        return { success: false, error: error.message };
      }

      // If completed, create transaction
      if (status === "completed") {
        const order = get().sellerOrders.find((o) => o.id === orderId);
        if (order) {
          await supabase.from("transactions").insert([
            {
              seller_id: order.seller_id,
              order_id: orderId,
              amount: order.amount,
              type: "sale",
              status: "completed",
              description: `Sale of ${order.account?.title || "account"}`,
            },
          ]);

          // Update seller total sales
          await supabase.rpc("increment_seller_sales", {
            seller_id: order.seller_id,
          });

          // Notify buyer
          await supabase.from("notifications").insert([
            {
              user_id: order.buyer_id,
              title: "Order Completed! 🎉",
              message: `Your order for "${order.account?.title}" has been completed!`,
              type: "order",
              link: "/dashboard/orders",
            },
          ]);
        }
      }

      // If cancelled, reactivate the account
      if (status === "cancelled") {
        const order = get().sellerOrders.find((o) => o.id === orderId);
        if (order) {
          await supabase
            .from("accounts")
            .update({ status: "active" })
            .eq("id", order.account_id);
        }
      }

      toast.success(`Order ${status}`);
      get().fetchSellerOrders();
      get().fetchStats();
      return { success: true };
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order");
      return { success: false, error: error.message };
    }
  },

  // Fetch transactions
  fetchTransactions: async () => {
    set({ transactionsLoading: true });
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ transactions: data || [], transactionsLoading: false });
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      set({ transactionsLoading: false });
    }
  },

  // Fetch verification status
  fetchVerification: async () => {
    set({ verificationLoading: true });
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("seller_verifications")
        .select("*")
        .eq("seller_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      set({ verification: data || null, verificationLoading: false });
    } catch (error) {
      console.error("Failed to fetch verification:", error);
      set({ verificationLoading: false });
    }
  },

  // Submit verification request
  submitVerification: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { error } = await supabase.from("seller_verifications").insert([
        {
          seller_id: user.id,
          status: "pending",
          documents: [],
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          toast("Verification already submitted");
        } else {
          throw error;
        }
      } else {
        toast.success("Verification request submitted!");
      }

      get().fetchVerification();
    } catch (error) {
      toast.error("Failed to submit verification");
    }
  },

  // Initialize
  initialize: () => {
    get().fetchStats();
  },
}));

export default useSellerDashboardStore;

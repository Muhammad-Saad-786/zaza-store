import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const useOrderStore = create((set, get) => ({
  isProcessing: false,
  selectedAccount: null,
  currentOrder: null,
  orders: [],
  loadingOrders: false,

  // Set selected account for checkout
  setSelectedAccount: (account) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      toast.error("Please login to purchase");
      return { success: false };
    }
    if (user.id === account.seller_id) {
      toast.error("You can't buy your own account!");
      return { success: false };
    }
    if (account.status !== "active") {
      toast.error("This account is no longer available");
      return { success: false };
    }

    // Debug: Log the account structure
    console.log("Setting selected account:", {
      id: account.id,
      title: account.title,
      images: account.images,
      image_urls: account.image_urls,
      image_url: account.image_url,
      image: account.image,
      main_image: account.main_image,
      allKeys: Object.keys(account),
      fullAccount: account,
    });

    // Collect all possible image URLs
    let images = [];

    // Check different image formats
    if (Array.isArray(account.images)) {
      images = account.images
        .map((img) => {
          if (typeof img === "string") return { url: img };
          if (img?.url) return { url: img.url };
          if (img?.image_url) return { url: img.image_url };
          return null;
        })
        .filter(Boolean);
    }

    if (images.length === 0 && Array.isArray(account.image_urls)) {
      images = account.image_urls.map((url) => ({ url }));
    }

    if (images.length === 0 && account.image_url) {
      images = [{ url: account.image_url }];
    }

    if (images.length === 0 && account.image) {
      images = [{ url: account.image }];
    }

    if (images.length === 0 && account.main_image) {
      images = [{ url: account.main_image }];
    }

    // If images is a JSON string, try to parse it
    if (images.length === 0 && typeof account.images === "string") {
      try {
        const parsedImages = JSON.parse(account.images);
        if (Array.isArray(parsedImages)) {
          images = parsedImages
            .map((img) => {
              if (typeof img === "string") return { url: img };
              if (img?.url) return { url: img.url };
              return null;
            })
            .filter(Boolean);
        }
      } catch (e) {
        // Not JSON, might be a direct URL
        if (account.images.startsWith("http")) {
          images = [{ url: account.images }];
        }
      }
    }

    console.log("Processed images:", images);

    set({
      selectedAccount: {
        ...account,
        images: images,
      },
    });

    return { success: true };
  },

  // Clear selected account
  clearSelectedAccount: () => {
    set({ selectedAccount: null });
  },

  // Process purchase
  processPurchase: async (paymentMethod = "card") => {
    const { selectedAccount } = get();
    const user = useAuthStore.getState().user;

    if (!user || !selectedAccount) {
      toast.error("No account selected");
      return { success: false, error: "No account selected" };
    }

    set({ isProcessing: true });

    try {
      console.log("Processing purchase for account:", selectedAccount.id);

      // Step 1: Check if account is still active
      const { data: accountCheck, error: checkError } = await supabase
        .from("accounts")
        .select("status, seller_id")
        .eq("id", selectedAccount.id)
        .single();

      if (checkError) throw checkError;

      if (accountCheck.status !== "active") {
        toast.error("This account is no longer available");
        set({ isProcessing: false, selectedAccount: null });
        return { success: false, error: "Account not available" };
      }

      // Step 2: Mark account as pending
      const { error: pendingError } = await supabase
        .from("accounts")
        .update({
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedAccount.id)
        .eq("status", "active");

      if (pendingError) {
        console.error("Failed to mark as pending:", pendingError);
        toast.error("This account just became unavailable");
        set({ isProcessing: false, selectedAccount: null });
        return { success: false, error: "Account unavailable" };
      }

      // Step 3: Create the order with valid status
      // Use "pending" instead of "pending_payment"
      const orderData = {
        buyer_id: user.id,
        seller_id: selectedAccount.seller_id,
        account_id: selectedAccount.id,
        amount: selectedAccount.price || selectedAccount.amount || 0,
        status: "pending", // Use "pending" which is likely valid
        payment_method: paymentMethod,
      };

      console.log("Creating order with data:", orderData);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (orderError) {
        // Rollback
        await supabase
          .from("accounts")
          .update({ status: "active" })
          .eq("id", selectedAccount.id);

        console.error("Order creation error:", orderError);
        throw new Error(orderError.message);
      }

      console.log("Order created successfully:", order);

      // Step 4: Notify seller
      if (selectedAccount.seller_id) {
        await supabase.from("notifications").insert([
          {
            user_id: selectedAccount.seller_id,
            title: "New Order! 🎉",
            message: `Someone wants to buy "${selectedAccount.title}" for $${selectedAccount.price || selectedAccount.amount}`,
            type: "order",
            link: "/seller-dashboard/orders",
          },
        ]);
      }

      set({
        currentOrder: order,
        selectedAccount: null,
        isProcessing: false,
      });

      toast.success("Order placed successfully!");

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Failed to place order");
      set({ isProcessing: false });
      return { success: false, error: error.message };
    }
  },

  // Fetch single order by ID
  fetchOrder: async (orderId) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          account:accounts(*)
        `,
        )
        .eq("id", orderId)
        .single();

      if (error) throw error;
      set({ currentOrder: data });
      return { success: true, order: data };
    } catch (error) {
      console.error("Failed to fetch order:", error);
      return { success: false, error: error.message };
    }
  },

  // Fetch all orders
  fetchOrders: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loadingOrders: true });

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          account:accounts(*)
        `,
        )
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({
        orders: data || [],
        loadingOrders: false,
      });

      return { success: true, orders: data };
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      set({ loadingOrders: false });
      return { success: false, error: error.message };
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("status", "pending");

      if (orderError) throw orderError;

      const { data: order } = await supabase
        .from("orders")
        .select("account_id")
        .eq("id", orderId)
        .single();

      if (order?.account_id) {
        await supabase
          .from("accounts")
          .update({ status: "active" })
          .eq("id", order.account_id);
      }

      toast.success("Order cancelled successfully");
      await get().fetchOrders();
      return { success: true };
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order");
      return { success: false, error: error.message };
    }
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },
}));

export default useOrderStore;

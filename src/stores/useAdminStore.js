import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const useAdminStore = create((set, get) => ({
  // Platform stats
  stats: {
    totalUsers: 0,
    totalAccounts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
  },

  // Data
  users: [],
  accounts: [],
  orders: [],
  reports: [],
  verifications: [],

  loading: false,
  activeTab: "overview",

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Fetch platform stats
  fetchStats: async () => {
    try {
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact" });
      const { count: totalAccounts } = await supabase
        .from("accounts")
        .select("*", { count: "exact" });
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact" });
      const { count: pendingVerifications } = await supabase
        .from("seller_verifications")
        .select("*", { count: "exact" })
        .eq("status", "pending");

      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount")
        .eq("status", "completed");
      const totalRevenue = (transactions || []).reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0,
      );

      set({
        stats: {
          totalUsers: totalUsers || 0,
          totalAccounts: totalAccounts || 0,
          totalOrders: totalOrders || 0,
          totalRevenue,
          pendingVerifications: pendingVerifications || 0,
        },
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  },

  // Fetch users
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ users: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set({ loading: false });
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      toast.success(`User role updated to ${role}`);
      get().fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  },

  // Ban/Unban user (using verified_seller as ban flag - or add banned column)
  toggleUserBan: async (userId, currentStatus) => {
    try {
      // Using a workaround - we'll set role to 'banned'
      const newRole = currentStatus === "banned" ? "buyer" : "banned";
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      toast.success(newRole === "banned" ? "User banned" : "User unbanned");
      get().fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  },

  // Fetch all accounts
  fetchAllAccounts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select(
          `
          *,
          seller:profiles(username),
          images:account_images(url, is_cover)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ accounts: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      set({ loading: false });
    }
  },

  // Update account status
  updateAccountStatus: async (accountId, status) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", accountId);

      if (error) throw error;
      toast.success(`Account ${status}`);
      get().fetchAllAccounts();
      get().fetchStats();
    } catch (error) {
      toast.error("Failed to update account");
    }
  },

  // Toggle featured
  toggleFeatured: async (accountId, featured) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .update({ featured: !featured })
        .eq("id", accountId);

      if (error) throw error;
      toast.success(featured ? "Removed from featured" : "Marked as featured");
      get().fetchAllAccounts();
    } catch (error) {
      toast.error("Failed to update");
    }
  },

  // Delete account
  deleteAccount: async (accountId) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;
      toast.success("Account deleted");
      get().fetchAllAccounts();
      get().fetchStats();
    } catch (error) {
      toast.error("Failed to delete account");
    }
  },

  // Fetch all orders
  fetchAllOrders: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          account:accounts(title),
          buyer:profiles!orders_buyer_id_fkey(username),
          seller:profiles!orders_seller_id_fkey(username)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ orders: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      set({ loading: false });
    }
  },

  // Fetch verifications
  fetchVerifications: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("seller_verifications")
        .select(
          `
          *,
          seller:profiles(username, email)
        `,
        )
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      set({ verifications: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch verifications:", error);
      set({ loading: false });
    }
  },

  // Approve/Reject verification
  updateVerification: async (verificationId, status, sellerId) => {
    try {
      const { error } = await supabase
        .from("seller_verifications")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", verificationId);

      if (error) throw error;

      if (status === "approved") {
        await supabase
          .from("profiles")
          .update({ verified_seller: true })
          .eq("id", sellerId);
      }

      toast.success(`Verification ${status}`);
      get().fetchVerifications();
      get().fetchStats();
    } catch (error) {
      toast.error("Failed to update verification");
    }
  },

  // Initialize
  initialize: () => {
    get().fetchStats();
  },
}));

export default useAdminStore;

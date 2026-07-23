import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const useAdminStore = create((set, get) => ({
  // Platform Stats
  stats: {
    totalUsers: 0,
    totalBuyers: 0,
    totalSellers: 0,
    totalBanned: 0,
    totalAccounts: 0,
    activeAccounts: 0,
    soldAccounts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    pendingReports: 0,
  },

  // Data
  users: [],
  accounts: [],
  orders: [],
  reports: [],
  verifications: [],

  loading: false,
  activeTab: "overview",
  searchQuery: "",

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // ============ STATS ============
  fetchStats: async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalBuyers },
        { count: totalSellers },
        { count: totalBanned },
        { count: totalAccounts },
        { count: activeAccounts },
        { count: soldAccounts },
        { count: totalOrders },
        { count: pendingOrders },
        { count: completedOrders },
        { count: pendingVerifications },
        { count: pendingReports },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("role", "buyer"),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("role", "seller"),
        supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .eq("banned", true),
        supabase.from("accounts").select("*", { count: "exact" }),
        supabase
          .from("accounts")
          .select("*", { count: "exact" })
          .eq("status", "active"),
        supabase
          .from("accounts")
          .select("*", { count: "exact" })
          .eq("status", "sold"),
        supabase.from("orders").select("*", { count: "exact" }),
        supabase
          .from("orders")
          .select("*", { count: "exact" })
          .eq("status", "pending"),
        supabase
          .from("orders")
          .select("*", { count: "exact" })
          .eq("status", "completed"),
        supabase
          .from("seller_verifications")
          .select("*", { count: "exact" })
          .eq("status", "pending"),
        supabase
          .from("reports")
          .select("*", { count: "exact" })
          .eq("status", "pending"),
      ]);

      const { data: transactions } = await supabase
        .from("transactions")
        .select("amount")
        .eq("status", "completed");
      const totalRevenue = (transactions || []).reduce(
        (s, t) => s + parseFloat(t.amount),
        0,
      );

      set({
        stats: {
          totalUsers: totalUsers || 0,
          totalBuyers: totalBuyers || 0,
          totalSellers: totalSellers || 0,
          totalBanned: totalBanned || 0,
          totalAccounts: totalAccounts || 0,
          activeAccounts: activeAccounts || 0,
          soldAccounts: soldAccounts || 0,
          totalOrders: totalOrders || 0,
          pendingOrders: pendingOrders || 0,
          completedOrders: completedOrders || 0,
          totalRevenue,
          pendingVerifications: pendingVerifications || 0,
          pendingReports: pendingReports || 0,
        },
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  },

  // ============ USERS ============
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

  updateUserRole: async (userId, role) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;
      toast.success(`Role updated to ${role}`);
      get().fetchUsers();
      get().fetchStats();
    } catch (error) {
      toast.error("Failed to update user");
    }
  },

  toggleBanUser: async (userId, currentlyBanned) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          banned: !currentlyBanned,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("banned")
        .single();

      if (error) throw error;

      console.log("Ban toggle result:", data);
      toast.success(currentlyBanned ? "User unbanned" : "User banned");
      get().fetchUsers();
      get().fetchStats();
    } catch (error) {
      console.error("Ban error:", error);
      toast.error("Failed to update user: " + error.message);
    }
  },

  // Direct verify (from Users page)
  verifySeller: async (sellerId) => {
    try {
      // Check if verification record exists
      const { data: existing } = await supabase
        .from("seller_verifications")
        .select("id")
        .eq("seller_id", sellerId)
        .single();

      if (!existing) {
        // Create verification record
        await supabase.from("seller_verifications").insert([
          {
            seller_id: sellerId,
            status: "approved",
            submitted_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString(),
          },
        ]);
      } else {
        // Update existing
        await supabase
          .from("seller_verifications")
          .update({ status: "approved", reviewed_at: new Date().toISOString() })
          .eq("id", existing.id);
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({ verified_seller: true, updated_at: new Date().toISOString() })
        .eq("id", sellerId);

      if (error) throw error;

      await supabase.from("notifications").insert([
        {
          user_id: sellerId,
          title: "Verification Approved! 🎉",
          message: "You are now a verified seller with the blue tick badge!",
          type: "verification",
          link: "/seller-dashboard",
        },
      ]);

      toast.success("Seller verified with blue tick! ");
      get().fetchUsers();
      get().fetchVerifications();
    } catch (error) {
      console.error("Failed to verify seller:", error);
      toast.error("Failed to verify seller: " + error.message);
    }
  },

  removeVerification: async (sellerId) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          verified_seller: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sellerId);

      if (error) throw error;
      toast.success("Verification badge removed");
      get().fetchUsers();
    } catch (error) {
      toast.error("Failed to remove verification");
    }
  },

  // ============ ACCOUNTS ============
  fetchAllAccounts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select(
          `*, seller:profiles(username, email), images:account_images(url, is_cover)`,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ accounts: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      set({ loading: false });
    }
  },

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

  toggleFeatured: async (accountId, featured) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .update({ featured: !featured })
        .eq("id", accountId);

      if (error) throw error;
      toast.success(
        featured ? "Removed from featured" : "Marked as featured ⭐",
      );
      get().fetchAllAccounts();
    } catch (error) {
      toast.error("Failed to update");
    }
  },

  deleteAccount: async (accountId) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
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

  // ============ ORDERS ============
  fetchAllOrders: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `*, account:accounts(title, price), buyer:profiles!orders_buyer_id_fkey(username), seller:profiles!orders_seller_id_fkey(username)`,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ orders: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      set({ loading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
      toast.success(`Order ${status}`);
      get().fetchAllOrders();
      get().fetchStats();
    } catch (error) {
      toast.error("Failed to update order");
    }
  },

  // ============ VERIFICATIONS ============
  fetchVerifications: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("seller_verifications")
        .select(
          `*, seller:profiles!seller_verifications_seller_id_fkey(username, email, total_sales, verified_seller, avatar_url)`,
        )
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      set({ verifications: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch verifications:", error);
      set({ loading: false });
    }
  },

  approveVerification: async (verificationId, sellerId) => {
    try {
      console.log(
        "Approving verification:",
        verificationId,
        "for seller:",
        sellerId,
      );

      // Update verification status
      const { error: verifyError } = await supabase
        .from("seller_verifications")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", verificationId);

      if (verifyError) throw verifyError;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ verified_seller: true, updated_at: new Date().toISOString() })
        .eq("id", sellerId);

      if (profileError) throw profileError;

      // Send notification
      await supabase.from("notifications").insert([
        {
          user_id: sellerId,
          title: "Verification Approved! 🎉",
          message:
            "Congratulations! You are now a verified seller with the blue tick badge!",
          type: "verification",
          link: "/seller-dashboard",
        },
      ]);

      toast.success("Verification approved! Blue tick granted ✅");
      get().fetchVerifications();
      get().fetchStats();
      get().fetchUsers();
    } catch (error) {
      console.error("Approve verification error:", error);
      toast.error("Failed to approve verification: " + error.message);
    }
  },

  rejectVerification: async (verificationId, sellerId) => {
    try {
      await supabase
        .from("seller_verifications")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", verificationId);

      await supabase.from("notifications").insert([
        {
          user_id: sellerId,
          title: "Verification Rejected",
          message:
            "Your verification request was rejected. Please contact support.",
          type: "verification",
          link: "/seller-dashboard/verification",
        },
      ]);

      toast.success("Verification rejected");
      get().fetchVerifications();
      get().fetchStats();
    } catch (error) {
      toast.error("Failed to reject verification");
    }
  },

  // ============ REPORTS ============
  fetchReports: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(
          `*, reporter:profiles!reports_reported_by_fkey(username), reported_user:profiles!reports_reported_user_id_fkey(username)`,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ reports: data || [], loading: false });
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      set({ loading: false });
    }
  },

  resolveReport: async (reportId, resolution, notes = "") => {
    try {
      await supabase
        .from("reports")
        .update({
          status: resolution,
          admin_notes: notes,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      toast.success(`Report ${resolution}`);
      get().fetchReports();
      get().fetchStats();
    } catch (error) {
      toast.error("Failed to resolve report");
    }
  },

  // ============ INIT ============
  initialize: () => {
    get().fetchStats();
  },
}));

export default useAdminStore;

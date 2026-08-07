import { create } from "zustand";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const useReportHandlerStore = create((set, get) => ({
  // Resolve report with action
  resolveReport: async (
    reportId,
    action,
    details = "",
    buyerId = null,
    sellerId = null,
  ) => {
    try {
      // Only update reports table, skip report_actions for now
      const { error } = await supabase
        .from("reports")
        .update({
          status: "resolved",
          action_taken: action,
          action_details: details,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) {
        console.error("Resolve error:", error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error("Resolve error:", error);
      return { success: false };
    }
  },

  // Warn seller - notify both
  warnSeller: async (reportId, sellerId, buyerId, note = "") => {
    const message =
      note ||
      "You received a warning for a reported listing. Please ensure your listings are accurate and follow platform rules.";

    // Notify seller
    await supabase.from("notifications").insert([
      {
        user_id: sellerId,
        title: "⚠️ Warning from Admin",
        message: message,
        type: "warning",
        link: "/seller-dashboard/listings",
      },
    ]);

    // Notify buyer that action was taken
    if (buyerId) {
      await supabase.from("notifications").insert([
        {
          user_id: buyerId,
          title: " Report Reviewed",
          message:
            "Admin has reviewed your report and issued a warning to the seller. Thank you for helping keep ZAZA Store safe.",
          type: "report_update",
          link: "/dashboard/orders",
        },
      ]);
    }

    await get().resolveReport(
      reportId,
      "warn_seller",
      message,
      buyerId,
      sellerId,
    );
    toast.success("Warning sent to seller. Buyer notified.");
  },

  // Warn buyer (false report)
  warnBuyer: async (reportId, buyerId, sellerId, note = "") => {
    const message =
      note ||
      "Your report was found to be invalid. Please only report genuine issues.";

    await supabase.from("notifications").insert([
      {
        user_id: buyerId,
        title: "⚠️ Warning from Admin",
        message: message,
        type: "warning",
        link: "/dashboard",
      },
    ]);

    if (sellerId) {
      await supabase.from("notifications").insert([
        {
          user_id: sellerId,
          title: " False Report Dismissed",
          message: "A false report against you has been dismissed by admin.",
          type: "report_update",
          link: "/seller-dashboard/listings",
        },
      ]);
    }

    await get().resolveReport(
      reportId,
      "warn_buyer",
      message,
      buyerId,
      sellerId,
    );
    toast.success("Warning sent to buyer. Seller notified.");
  },

  // Ban user - notify both
  banUser: async (
    reportId,
    bannedUserId,
    otherUserId,
    note = "",
    isSeller = true,
  ) => {
    const message =
      note || "Your account has been banned for violating platform terms.";

    // Ban the user
    await supabase
      .from("profiles")
      .update({ banned: true })
      .eq("id", bannedUserId);

    // Notify banned user
    await supabase.from("notifications").insert([
      {
        user_id: bannedUserId,
        title: "🚫 Account Banned",
        message: message,
        type: "ban",
      },
    ]);

    // Notify the other party
    if (otherUserId) {
      const otherMessage = isSeller
        ? "Admin has banned the seller you reported. Thank you for helping keep ZAZA Store safe."
        : "Admin has banned the buyer who filed a false report.";

      await supabase.from("notifications").insert([
        {
          user_id: otherUserId,
          title: " Report Resolved",
          message: otherMessage,
          type: "report_update",
          link: "/dashboard",
        },
      ]);
    }

    await get().resolveReport(
      reportId,
      "ban_user",
      message,
      bannedUserId,
      otherUserId,
    );
    toast.success("User banned. Both parties notified.");
  },

  // Remove listing - notify both
  removeListing: async (reportId, accountId, sellerId, buyerId, note = "") => {
    const message =
      note || "Your listing has been removed for violating platform rules.";

    await supabase
      .from("accounts")
      .update({ status: "hidden" })
      .eq("id", accountId);

    // Notify seller
    await supabase.from("notifications").insert([
      {
        user_id: sellerId,
        title: "👁️ Listing Removed",
        message: message,
        type: "warning",
        link: "/seller-dashboard/listings",
      },
    ]);

    // Notify buyer
    if (buyerId) {
      await supabase.from("notifications").insert([
        {
          user_id: buyerId,
          title: " Report Resolved",
          message:
            "Admin has reviewed your report and removed the listing. Thank you for reporting.",
          type: "report_update",
          link: "/dashboard",
        },
      ]);
    }

    await get().resolveReport(
      reportId,
      "remove_listing",
      message,
      sellerId,
      buyerId,
    );
    toast.success("Listing removed. Both parties notified.");
  },

  // Refund buyer - notify both
  refundBuyer: async (reportId, orderId, buyerId, sellerId, note = "") => {
    const message = note || "A refund has been processed for this order.";

    if (orderId) {
      await supabase
        .from("orders")
        .update({ escrow_status: "refunded" })
        .eq("id", orderId);
    }

    // Notify buyer
    await supabase.from("notifications").insert([
      {
        user_id: buyerId,
        title: "💰 Refund Processed",
        message:
          "Your refund has been processed. Funds will return within 3-5 business days.",
        type: "refund",
        link: "/dashboard/orders",
      },
    ]);

    // Notify seller
    if (sellerId) {
      await supabase.from("notifications").insert([
        {
          user_id: sellerId,
          title: "💰 Refund Issued to Buyer",
          message: message,
          type: "warning",
          link: "/seller-dashboard/orders",
        },
      ]);
    }

    await get().resolveReport(
      reportId,
      "refund_buyer",
      message,
      buyerId,
      sellerId,
    );
    toast.success("Refund processed. Both parties notified.");
  },

  // Dismiss report - notify both
  dismissReport: async (reportId, buyerId, sellerId, note = "") => {
    const message = note || "This report was reviewed and dismissed.";

    // Notify buyer
    if (buyerId) {
      await supabase.from("notifications").insert([
        {
          user_id: buyerId,
          title: "📋 Report Reviewed",
          message: "Your report has been reviewed by admin. " + message,
          type: "report_update",
          link: "/dashboard",
        },
      ]);
    }

    // Notify seller if they were reported
    if (sellerId) {
      await supabase.from("notifications").insert([
        {
          user_id: sellerId,
          title: " Report Dismissed",
          message:
            "A report against you has been reviewed and dismissed by admin.",
          type: "report_update",
          link: "/seller-dashboard",
        },
      ]);
    }

    await supabase
      .from("reports")
      .update({
        status: "dismissed",
        action_details: message,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    toast.success("Report dismissed. Both parties notified.");
  },
}));

export default useReportHandlerStore;

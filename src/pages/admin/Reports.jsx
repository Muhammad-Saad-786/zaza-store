import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import useReportHandlerStore from "../../stores/useReportHandlerStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";
import {
  HiOutlineShieldCheck,
  HiOutlineBan,
  HiOutlineEyeOff,
  HiOutlineCash,
  HiOutlineExclamation,
  HiOutlineCheck,
} from "react-icons/hi";

const actions = [
  {
    id: "warn_seller",
    label: "⚠️ Warn Seller",
    icon: HiOutlineExclamation,
    color: "text-yellow-400",
    desc: "Send warning notification to seller",
  },
  {
    id: "warn_buyer",
    label: "⚠️ Warn Buyer",
    icon: HiOutlineExclamation,
    color: "text-yellow-400",
    desc: "Send warning notification to buyer",
  },
  {
    id: "ban_user",
    label: "🚫 Ban User",
    icon: HiOutlineBan,
    color: "text-red-400",
    desc: "Permanently ban reported user",
  },
  {
    id: "remove_listing",
    label: "👁️ Hide Listing",
    icon: HiOutlineEyeOff,
    color: "text-orange-400",
    desc: "Remove listing from marketplace",
  },
  {
    id: "refund_buyer",
    label: "💰 Refund Buyer",
    icon: HiOutlineCash,
    color: "text-green-400",
    desc: "Process full refund to buyer",
  },
  {
    id: "dismiss",
    label: "✓ Dismiss Report",
    icon: HiOutlineCheck,
    color: "text-gray-400",
    desc: "Report is invalid, no action needed",
  },
];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const {
    warnSeller,
    warnBuyer,
    banUser,
    removeListing,
    refundBuyer,
    dismissReport,
  } = useReportHandlerStore();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(
          `*, reporter:profiles!reports_reported_by_fkey(username), reported_user:profiles!reports_reported_user_id_fkey(username, email, banned)`,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedAction) {
      toast.error("Please select an action");
      return;
    }

    setProcessing(true);
    const report = selectedReport;

    try {
      switch (selectedAction) {
        case "warn_seller":
          await warnSeller(
            report.id,
            report.reported_user_id,
            report.reported_by,
            actionNote ||
              "Your listing was reported. Please ensure accurate descriptions.",
          );
          break;

        case "warn_buyer":
          await warnBuyer(
            report.id,
            report.reported_by,
            report.reported_user_id,
            actionNote || "Your report was found to be invalid.",
          );
          break;

        case "ban_user":
          await banUser(
            report.id,
            report.reported_user_id,
            report.reported_by,
            actionNote || "Account banned for violating platform terms.",
            true,
          );
          break;

        case "remove_listing":
          await removeListing(
            report.id,
            report.reported_account_id,
            report.reported_user_id,
            report.reported_by,
            actionNote || "Listing removed for violating platform rules.",
          );
          break;

        case "refund_buyer": {
          const { data: orders } = await supabase
            .from("orders")
            .select("id")
            .eq("account_id", report.reported_account_id)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1);

          await refundBuyer(
            report.id,
            orders?.[0]?.id,
            report.reported_by,
            report.reported_user_id,
            actionNote || "Refund processed due to reported issue.",
          );
          break;
        }

        case "dismiss":
          await dismissReport(
            report.id,
            report.reported_by,
            report.reported_user_id,
            actionNote || "Report reviewed and no action was needed.",
          );
          break;
      }

      toast.success("Action completed!");
      setSelectedReport(null);
      setSelectedAction("");
      setActionNote("");
      fetchReports();
    } catch (error) {
      console.error("Action error:", error);
      toast.error("Failed to process action");
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  const pendingReports = reports.filter((r) => r.status === "pending");
  const resolvedReports = reports.filter((r) => r.status !== "pending");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Reports ({pendingReports.length} pending)
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Review and take action on reported listings and users
        </p>
      </div>

      {/* Pending Reports */}
      {pendingReports.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <HiOutlineShieldCheck className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No pending reports</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {pendingReports.map((report) => (
            <GlassCard key={report.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                      Pending
                    </span>
                    <span className="text-white/30 text-xs">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-medium text-white">{report.reason}</h3>
                  <p className="text-sm text-white/50 mt-1">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-white/30">
                    <span>Reported by: {report.reporter?.username}</span>
                    {report.reported_user && (
                      <span>
                        Reported user: {report.reported_user?.username} (
                        {report.reported_user?.email})
                      </span>
                    )}
                    {report.reported_account_id && (
                      <span>
                        Listing ID:{" "}
                        {report.reported_account_id?.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedReport(
                      selectedReport?.id === report.id ? null : report,
                    )
                  }
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-sm hover:bg-purple-500/30 flex-shrink-0"
                >
                  {selectedReport?.id === report.id ? "Cancel" : "Handle"}
                </button>
              </div>

              {/* Action Panel */}
              {selectedReport?.id === report.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-white/5"
                >
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Choose Action:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => setSelectedAction(action.id)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          selectedAction === action.id
                            ? `${action.color} border-current bg-white/5`
                            : "border-white/5 text-white/50 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <action.icon
                            className={`w-4 h-4 ${selectedAction === action.id ? action.color : ""}`}
                          />
                          <span className="text-sm font-medium">
                            {action.label}
                          </span>
                        </div>
                        <p className="text-xs text-white/30 mt-1">
                          {action.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                  <label className="block text-xs text-white/40 mb-2">
                    Note (optional):
                  </label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Add details about this action..."
                    rows={2}
                    className="input-glass w-full resize-none text-sm mb-3 px-3"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleAction}
                      disabled={processing || !selectedAction}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
                    >
                      {processing ? "Processing..." : "Execute Action"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReport(null);
                        setSelectedAction("");
                        setActionNote("");
                      }}
                      className="px-4 py-2 bg-white/5 text-white/50 rounded-xl text-sm hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            Resolved ({resolvedReports.length})
          </h2>
          <div className="space-y-2">
            {resolvedReports.slice(0, 10).map((report) => (
              <GlassCard key={report.id} className="p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        report.status === "resolved"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-white/50 text-sm ml-2">
                      {report.reason}
                    </span>
                    {report.action_taken && (
                      <span className="text-white/30 text-xs ml-2">
                        • {report.action_taken}
                      </span>
                    )}
                  </div>
                  <span className="text-white/20 text-xs">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

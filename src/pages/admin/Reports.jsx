import { useEffect } from "react";
import { motion } from "framer-motion";
import { HiOutlineCheck, HiOutlineX, HiOutlineFlag } from "react-icons/hi";
import useAdminStore from "../../stores/useAdminStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

export default function Reports() {
  const { reports, loading, fetchReports, resolveReport } = useAdminStore();

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Reports ({reports.length})
      </h1>

      {reports.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <HiOutlineFlag className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No reports to review</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <GlassCard key={report.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        report.status === "pending"
                          ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
                          : report.status === "resolved"
                            ? "text-green-400 bg-green-400/10 border-green-400/30"
                            : "text-white/40 bg-white/5 border-white/10"
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-sm text-white/40">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white font-medium">{report.reason}</p>
                  <p className="text-white/50 text-sm mt-1">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                    <span>Reported by: {report.reporter?.username}</span>
                    {report.reported_user && (
                      <span>User: {report.reported_user?.username}</span>
                    )}
                  </div>
                </div>

                {report.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => resolveReport(report.id, "resolved")}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30 flex items-center gap-1"
                    >
                      <HiOutlineCheck className="w-4 h-4" /> Resolve
                    </button>
                    <button
                      onClick={() => resolveReport(report.id, "dismissed")}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 flex items-center gap-1"
                    >
                      <HiOutlineX className="w-4 h-4" /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}

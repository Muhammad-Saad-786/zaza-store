import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import Spinner from "../../components/ui/Spinner";
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiOutlineBan,
  HiOutlineCash,
  HiOutlineShieldCheck,
  HiOutlineShoppingBag,
  HiOutlineChat,
  HiOutlineStar,
  HiOutlineChevronDown,
} from "react-icons/hi";
import toast from "react-hot-toast";

const typeConfig = {
  warning: {
    icon: HiOutlineExclamation,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
  },
  ban: {
    icon: HiOutlineBan,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
  },
  refund: {
    icon: HiOutlineCash,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
  },
  escrow: {
    icon: HiOutlineShieldCheck,
    color: "text-[#f5a623]",
    bg: "bg-[#f5a623]/10 border-[#f5a623]/30",
  },
  order: {
    icon: HiOutlineShoppingBag,
    color: "text-[#f5a623]",
    bg: "bg-[#f5a623]/10 border-[#f5a623]/30",
  },
  message: {
    icon: HiOutlineChat,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
  },
  review: {
    icon: HiOutlineStar,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  verification: {
    icon: HiOutlineShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
  report_update: {
    icon: HiOutlineCheck,
    color: "text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/30",
  },
  default: {
    icon: HiOutlineBell,
    color: "text-white",
    bg: "bg-[#1f1f29] border-[#2e2e3e]",
  },
};

export default function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setLoading(false);
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setMarkingAll(false);
    toast.success("All notifications marked as read");
  };

  const markAsRead = async (id) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const deleteNotification = async (id) => {
    setDeletingId(id);
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setDeletingId(null);
    toast.success("Notification deleted");
  };

  const deleteAll = async () => {
    if (!confirm("Delete all notifications?")) return;
    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
    toast.success("All notifications deleted");
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getNotificationLink = (n) => {
    if (n.link) return n.link;
    switch (n.type) {
      case "order":
      case "escrow":
      case "refund":
      case "review":
        return "/dashboard/orders";
      case "message":
        return "/dashboard/messages";
      case "verification":
        return "/seller-dashboard/verification";
      default:
        return null;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "all") return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl"
    >
      {/* Eldorado Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#f5a623] text-2xl font-black">︽</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-[#f5a623] text-[#121217] font-black text-xs rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="px-3 py-1.5 bg-[#1f1f29] border border-[#2e2e3e] hover:border-[#f5a623] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
            >
              <HiOutlineCheck className="w-4 h-4 text-[#f5a623]" />
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={deleteAll}
              className="px-3 py-1.5 bg-[#1f1f29] border border-[#2e2e3e] hover:border-red-500 text-red-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "unread", "order", "warning"].map((tab) => {
          const count =
            tab === "all"
              ? notifications.length
              : tab === "unread"
                ? unreadCount
                : notifications.filter((n) => n.type === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                activeFilter === tab
                  ? "bg-[#f5a623] text-[#121217] shadow-sm"
                  : "bg-[#1f1f29] border border-[#2e2e3e] text-white hover:border-white/20"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Notifications List / Empty State */}
      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#1f1f29] border border-[#2e2e3e] rounded-2xl p-10">
          <img
            src="/notifications.png"
            alt="No notifications"
            className="w-32 h-32 object-contain mb-4"
            onError={(e) => {
              e.target.src = "/empty-orders.png";
            }}
          />
          <h2 className="text-xl font-black text-white">Nothing found</h2>
          <p className="text-sm text-white/60 mt-1">
            {activeFilter === "unread"
              ? "You are all caught up!"
              : "You have no notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filteredNotifications.map((n) => {
              const config = typeConfig[n.type] || typeConfig.default;
              const IconComponent = config.icon;
              const link = getNotificationLink(n);

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className={`relative p-4 rounded-xl border transition-all ${
                    n.read
                      ? "bg-[#1f1f29] border-[#2e2e3e]"
                      : "bg-[#252533] border-[#f5a623]/40"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#16161e] border border-[#2e2e3e]`}
                    >
                      <IconComponent className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-white truncate">
                          {n.title}
                        </p>
                        <span className="text-xs text-white/40 flex-shrink-0">
                          {getTimeAgo(n.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 mt-1 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-2.5">
                        {link && (
                          <Link
                            to={link}
                            className="text-xs font-bold text-[#f5a623] hover:underline"
                          >
                            View Details ➔
                          </Link>
                        )}
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-xs text-white/60 hover:text-white"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n.id)}
                          disabled={deletingId === n.id}
                          className="text-xs text-white/40 hover:text-red-400 transition-colors ml-auto"
                        >
                          <HiOutlineTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

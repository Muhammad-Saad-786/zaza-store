import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
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
  HiOutlineClock,
  HiOutlineFilter,
} from "react-icons/hi";
import toast from "react-hot-toast";

const typeConfig = {
  warning: {
    icon: HiOutlineExclamation,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  ban: {
    icon: HiOutlineBan,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  refund: {
    icon: HiOutlineCash,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  escrow: {
    icon: HiOutlineShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  order: {
    icon: HiOutlineShoppingBag,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  message: {
    icon: HiOutlineChat,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  review: {
    icon: HiOutlineStar,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  verification: {
    icon: HiOutlineShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  report_update: {
    icon: HiOutlineCheck,
    color: "text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/20",
  },
  default: {
    icon: HiOutlineBell,
    color: "text-white/50",
    bg: "bg-white/5 border-white/10",
  },
};

const filterTabs = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "warning", label: "Warnings" },
  { key: "order", label: "Orders" },
];

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
        return "/dashboard/orders";
      case "escrow":
        return "/dashboard/orders";
      case "warning":
        return "/dashboard";
      case "refund":
        return "/dashboard/orders";
      case "message":
        return "/dashboard/messages";
      case "review":
        return "/dashboard/orders";
      case "verification":
        return "/seller-dashboard/verification";
      default:
        return null;
    }
  };

  // Filter notifications
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-purple-500 text-white text-sm rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Stay updated with your orders and account activity
          </p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              size="sm"
              disabled={markingAll}
            >
              <HiOutlineCheck className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button onClick={deleteAll} variant="ghost" size="sm">
              <HiOutlineTrash className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((tab) => {
          const count =
            tab.key === "all"
              ? notifications.length
              : tab.key === "unread"
                ? unreadCount
                : notifications.filter((n) => n.type === tab.key).length;

          if (count === 0 && tab.key !== "all") return null;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === tab.key
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <HiOutlineBell className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {activeFilter === "unread"
              ? "No unread notifications"
              : "No notifications yet"}
          </h3>
          <p className="text-white/40 text-sm mt-1">
            {activeFilter === "unread"
              ? "You're all caught up!"
              : "Notifications about your orders and account will appear here"}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredNotifications.map((n) => {
              const config = typeConfig[n.type] || typeConfig.default;
              const IconComponent = config.icon;
              const link = getNotificationLink(n);

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`relative p-4 rounded-xl border transition-all ${config.bg} ${!n.read ? "ring-1 ring-purple-500/20" : "opacity-70"}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}
                      >
                        <IconComponent className={`w-5 h-5 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-white truncate">
                            {n.title}
                          </p>
                          <span className="text-xs text-white/20 flex-shrink-0">
                            {getTimeAgo(n.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mt-1 line-clamp-2">
                          {n.message}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-2">
                          {link && (
                            <Link
                              to={link}
                              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              View Details →
                            </Link>
                          )}
                          {!n.read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              className="text-xs text-white/30 hover:text-white transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(n.id)}
                            disabled={deletingId === n.id}
                            className="text-xs text-white/20 hover:text-red-400 transition-colors ml-auto"
                          >
                            {deletingId === n.id ? (
                              <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            ) : (
                              <HiOutlineTrash className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Unread Dot */}
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State for Filter */}
      {filteredNotifications.length === 0 && notifications.length > 0 && (
        <GlassCard className="p-8 text-center">
          <HiOutlineFilter className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            No notifications match this filter
          </p>
          <button
            onClick={() => setActiveFilter("all")}
            className="text-purple-400 text-sm mt-1"
          >
            Show all notifications
          </button>
        </GlassCard>
      )}
    </motion.div>
  );
}

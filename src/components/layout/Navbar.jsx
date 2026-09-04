import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../stores/useAuthStore";
import useWishlistStore from "../../stores/useWishlistStore";
import { supabase } from "../../lib/supabase.js";
import SmartSearch from "../search/SmartSearch";
import useMLBBAuthStore from "../../stores/useMLBBAuthStore";
import {
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiMenu,
  HiX,
  HiOutlineMail,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineShieldCheck,
  HiOutlineBell,
  HiOutlineChevronRight,
  HiOutlineUsers,
  HiOutlineTrendingUp,
  HiOutlineMap,
  HiOutlineSearch,
  HiOutlineChevronDown,
  HiOutlineCurrencyDollar,
  HiOutlineStar,
  HiOutlineExternalLink,
  HiOutlineTag,
} from "react-icons/hi";
import { FiChevronDown } from "react-icons/fi";
import Logo from "../shared/Logo";
import Button from "../ui/Button";
import clsx from "clsx";

const navLinks = [
  {
    label: "Marketplace",
    href: "/marketplace",
  },
  {
    label: "Sell Account",
    href: "/sell",
  },
  {
    label: "Player Checker",
    href: "/player-checker",
  },
  {
    label: "Other Tools",
    href: "/tools",
    dropdown: [
      {
        label: "MLBB Heroes",
        href: "/tools/mlbb/heroes",
        icon: HiOutlineUsers,
        description: "Browse all Mobile Legends heroes",
      },
      {
        label: "Hero Rankings",
        href: "/tools/mlbb/rankings",
        icon: HiOutlineTrendingUp,
        description: "View hero tier lists and win rates",
      },
      {
        label: "Hero Positions",
        href: "/tools/mlbb/positions",
        icon: HiOutlineMap,
        description: "Filter heroes by role and lane",
      },
      {
        label: "Hero Search",
        href: "/tools/mlbb/hero-search",
        icon: HiOutlineSearch,
        description: "Search for specific hero details",
      },
    ],
  },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const { user, profile, signOut } = useAuthStore();
  const location = useLocation();
  const { count: wishlistCount } = useWishlistStore();
  const [ordersCount, setOrdersCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const {
    isLoggedIn: isMLBBLoggedIn,
    mlbbUser,
    initializeMLBB,
    logoutMLBB,
  } = useMLBBAuthStore();

  const isAnyUserLoggedIn = user || isMLBBLoggedIn;

  useEffect(() => {
    initializeMLBB();
  }, []);

  // Real-time message subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("navbar-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          setUnreadMessages((prev) => prev + 1);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.read === true && payload.old.read === false) {
            setUnreadMessages((prev) => Math.max(0, prev - 1));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchOrdersCount();

      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchOrdersCount();
      }, 60000);

      return () => clearInterval(interval);
    } else {
      setUnreadMessages(0);
      setOrdersCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("navbar-unread")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          setUnreadMessages((prev) => prev + 1);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.read === true && payload.old.read === false) {
            setUnreadMessages((prev) => Math.max(0, prev - 1));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact" })
        .eq("receiver_id", user.id)
        .eq("read", false);
      if (!error) setUnreadMessages(count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const fetchOrdersCount = async () => {
    try {
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("buyer_id", user.id)
        .eq("status", "pending");
      if (!error) setOrdersCount(count || 0);
    } catch (err) {
      console.error("Failed to fetch orders count:", err);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
    setMobileDropdown(null);
  }, [location]);

  const handleSignOut = () => {
    if (user) {
      signOut();
    }
    if (isMLBBLoggedIn) {
      logoutMLBB();
    }
    setUserMenuOpen(false);
    setIsMobileOpen(false);
  };

  const fetchNotificationCount = async () => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotificationCount(count || 0);
  };

  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }

    fetchNotificationCount();

    const channel = supabase
      .channel("navbar-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setNotificationCount((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleDropdown = (label) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const toggleMobileDropdown = (label) => {
    setMobileDropdown(mobileDropdown === label ? null : label);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-[#1f1f29] backdrop-blur-2xl border-b border-glass-border shadow-2xl"
            : "bg-[#1f1f29]",
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Logo />

            {/* Desktop Navigation */}
            <div
              className="hidden lg:flex items-center gap-0.5"
              ref={dropdownRef}
            >
              {navLinks.map((link) => (
                <div key={link.label} className="relative">
                  {link.dropdown ? (
                    <button
                      onClick={() => toggleDropdown(link.label)}
                      className={clsx(
                        "flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                        activeDropdown === link.label
                          ? "text-white bg-white/10"
                          : "text-white hover:bg-white/5",
                      )}
                    >
                      {link.label}
                      <FiChevronDown
                        className={clsx(
                          "w-4 h-4 transition-transform duration-300",
                          activeDropdown === link.label && "rotate-180",
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className={clsx(
                        "flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                        location.pathname === link.href
                          ? "text-white bg-white/10"
                          : "text-white hover:bg-white/5",
                      )}
                    >
                      {link.label}
                    </Link>
                  )}

                  <AnimatePresence>
                    {link.dropdown && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-72 glass-modal rounded-xl overflow-hidden shadow-2xl"
                      >
                        <div className="p-2">
                          {/* Dropdown Header */}
                          <div className="px-4 py-2 border-b border-glass-border mb-1">
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                              {link.label}
                            </p>
                          </div>

                          {/* Dropdown Items */}
                          {link.dropdown.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                              <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className={clsx(
                                  "flex items-start gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 group relative",
                                  "hover:bg-white/5",
                                  index !== link.dropdown.length - 1 &&
                                    "mb-0.5",
                                )}
                              >
                                {IconComponent && (
                                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/10 transition-all">
                                    <IconComponent className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white/80 group-hover:text-white transition-colors truncate">
                                    {item.label}
                                  </p>
                                  {item.description && (
                                    <p className="text-xs text-white/40 mt-0.5 line-clamp-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <HiOutlineChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
              <SmartSearch />
            </div>

            {/* Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-1.5">
              {isAnyUserLoggedIn ? (
                <>
                  {user && (
                    <>
                      <Link to="/dashboard/wishlist" className="relative group">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative p-2.5 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                          title="Wishlist"
                        >
                          <HiOutlineHeart className="w-5 h-5" />
                          {wishlistCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-brand-purple text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-brand-darker"
                            >
                              {wishlistCount}
                            </motion.span>
                          )}
                        </motion.button>
                      </Link>

                      <Link
                        to={
                          profile?.role === "seller" ||
                          profile?.role === "admin"
                            ? "/seller-dashboard/orders"
                            : "/dashboard/orders"
                        }
                        className="relative group"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative p-2.5 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                          title="Orders"
                        >
                          <HiOutlineShoppingBag className="w-5 h-5" />
                          {ordersCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-brand-gold text-brand-darker text-[10px] rounded-full flex items-center justify-center font-bold border border-brand-darker"
                            >
                              {ordersCount}
                            </motion.span>
                          )}
                        </motion.button>
                      </Link>

                      <Link to="/dashboard/messages" className="relative group">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative p-2.5 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                          title="Messages"
                        >
                          <HiOutlineMail className="w-5 h-5" />
                          {unreadMessages > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-cyber-neon text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-brand-darker"
                            >
                              {unreadMessages}
                            </motion.span>
                          )}
                        </motion.button>
                      </Link>

                      <Link
                        to="/dashboard/notifications"
                        className="relative group"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative p-2.5 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                          title="Notifications"
                        >
                          <HiOutlineBell className="w-5 h-5" />
                          {notificationCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-brand-darker"
                            >
                              {notificationCount}
                            </motion.span>
                          )}
                        </motion.button>
                      </Link>
                    </>
                  )}

                  {/* User Menu */}
                  <div className="relative ml-1">
                    <div
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-11 h-11 cursor-pointer rounded-full  flex items-center justify-center text-sm font-bold text-white overflow-hidden"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : mlbbUser?.avatar ? (
                        <img
                          src={mlbbUser.avatar}
                          alt="MLBB Avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : mlbbUser?.name ? (
                        mlbbUser.name.charAt(0).toUpperCase()
                      ) : (
                        profile?.username?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setUserMenuOpen(false)}
                            className="fixed inset-0 z-40"
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-64 bg-[#16161e] border border-[#262636] rounded-xl overflow-hidden shadow-2xl z-50"
                          >
                            {/* ── User Header ── */}
                            <div className="px-4 py-4 border-b border-[#262636] flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#1f1f29] border-2 border-[#f5a623]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {profile?.avatar_url ? (
                                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : mlbbUser?.avatar ? (
                                  <img src={mlbbUser.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <span className="text-sm font-black text-[#f5a623]">
                                    {(profile?.username || mlbbUser?.name || "U").charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">
                                  {profile?.username || mlbbUser?.name || "User"}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <HiOutlineCurrencyDollar className="w-3 h-3 text-green-400" />
                                  <span className="text-xs text-green-400 font-semibold">
                                    $0.00
                                  </span>
                                </div>
                                {profile?.rank && (
                                  <p className="text-[11px] text-[#f5a623] font-semibold mt-0.5">{profile.rank}</p>
                                )}
                              </div>
                            </div>

                            {/* ── MLBB badge ── */}
                            {isMLBBLoggedIn && mlbbUser && (
                              <Link
                                to="/mlbb-profile"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 border-b border-[#262636] hover:bg-[#1f1f29] transition-colors group"
                              >
                                <HiOutlineShieldCheck className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-semibold text-purple-300 group-hover:text-purple-200">
                                  {mlbbUser.name} · Lv.{mlbbUser.level}
                                </span>
                                <HiOutlineChevronRight className="w-3.5 h-3.5 text-white/20 ml-auto" />
                              </Link>
                            )}

                            {/* ── Nav items ── */}
                            <div className="py-1.5">
                              {user && profile && (
                                <>
                                  {/* Orders */}
                                  <Link
                                    to={profile?.role === "seller" || profile?.role === "admin" ? "/seller-dashboard/orders" : "/dashboard/orders"}
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#1f1f29] transition-all group"
                                  >
                                    <HiOutlineShoppingBag className="w-4 h-4 text-[#f5a623]" />
                                    <span>Orders</span>
                                    {ordersCount > 0 && (
                                      <span className="ml-auto bg-[#f5a623] text-[#121217] text-[10px] font-black px-1.5 py-0.5 rounded-full">{ordersCount}</span>
                                    )}
                                  </Link>

                                  {/* Offers / Wishlist */}
                                  <Link
                                    to="/dashboard/wishlist"
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#1f1f29] transition-all"
                                  >
                                    <HiOutlineTag className="w-4 h-4 text-[#f5a623]" />
                                    <span>Offers</span>
                                  </Link>

                                  {/* Wallet */}
                                  <Link
                                    to={profile?.role === "seller" || profile?.role === "admin" ? "/seller-dashboard/revenue" : "/dashboard"}
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#1f1f29] transition-all"
                                  >
                                    <HiOutlineCurrencyDollar className="w-4 h-4 text-[#f5a623]" />
                                    <span>Wallet</span>
                                  </Link>

                                  {/* Become a Seller (only for buyers) */}
                                  {profile?.role !== "seller" && profile?.role !== "admin" && (
                                    <Link
                                      to="/seller-dashboard"
                                      onClick={() => setUserMenuOpen(false)}
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#1f1f29] transition-all"
                                    >
                                      <HiOutlineExternalLink className="w-4 h-4 text-[#f5a623]" />
                                      <span>Become a Seller</span>
                                    </Link>
                                  )}

                                  {/* Seller Dashboard link (for sellers) */}
                                  {(profile?.role === "seller" || profile?.role === "admin") && (
                                    <Link
                                      to="/seller-dashboard"
                                      onClick={() => setUserMenuOpen(false)}
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#f5a623] hover:text-[#e0961f] hover:bg-[#1f1f29] transition-all"
                                    >
                                      <HiOutlineExternalLink className="w-4 h-4" />
                                      <span>Seller Dashboard</span>
                                    </Link>
                                  )}

                                  <div className="my-1 mx-3 border-t border-[#262636]" />

                                  {/* Messages */}
                                  <Link
                                    to="/dashboard/messages"
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#1f1f29] transition-all"
                                  >
                                    <HiOutlineMail className="w-4 h-4 text-[#f5a623]" />
                                    <span>Messages</span>
                                    {unreadMessages > 0 && (
                                      <span className="ml-auto bg-[#f5a623] text-[#121217] text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadMessages}</span>
                                    )}
                                  </Link>

                                  {/* Notifications */}
                                  <Link
                                    to="/dashboard/notifications"
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#1f1f29] transition-all"
                                  >
                                    <HiOutlineBell className="w-4 h-4 text-[#f5a623]" />
                                    <span>Notifications</span>
                                    {notificationCount > 0 && (
                                      <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{notificationCount}</span>
                                    )}
                                  </Link>

                                  {/* Feedback / Reviews */}
                                  <Link
                                    to="/dashboard/reviews"
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#1f1f29] transition-all"
                                  >
                                    <HiOutlineStar className="w-4 h-4 text-[#f5a623]" />
                                    <span>Feedback</span>
                                  </Link>

                                  {/* Account Settings */}
                                  <Link
                                    to={profile?.role === "seller" || profile?.role === "admin" ? "/seller-dashboard/settings" : "/dashboard/profile"}
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-[#1f1f29] transition-all"
                                  >
                                    <HiOutlineCog className="w-4 h-4 text-[#f5a623]" />
                                    <span>Account settings</span>
                                  </Link>

                                  {/* Admin panel */}
                                  {profile?.role === "admin" && (
                                    <Link
                                      to="/admin"
                                      onClick={() => setUserMenuOpen(false)}
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-[#1f1f29] transition-all"
                                    >
                                      <HiOutlineShieldCheck className="w-4 h-4" />
                                      <span>Admin Panel</span>
                                    </Link>
                                  )}

                                  <div className="my-1 mx-3 border-t border-[#262636]" />
                                </>
                              )}

                              {/* Log out */}
                              <button
                                onClick={handleSignOut}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-white hover:bg-red-500/20 transition-all"
                              >
                                <HiOutlineLogout className="w-4 h-4" />
                                <span>{user && isMLBBLoggedIn ? "Sign Out All" : "Log out"}</span>
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="!px-4 !py-2">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" className="!px-4 !py-2">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 text-white/80"
            >
              {isMobileOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Animated Bottom Border */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isScrolled ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-brand-darker/95 backdrop-blur-2xl border-l border-glass-border z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6 pt-20 space-y-4">
                <SmartSearch />

                {/* MLBB User Info */}
                {isMLBBLoggedIn && mlbbUser && (
                  <Link
                    to="/mlbb-profile"
                    onClick={() => setIsMobileOpen(false)}
                    className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 block"
                  >
                    <div className="flex items-center gap-3">
                      {mlbbUser.avatar ? (
                        <img
                          src={mlbbUser.avatar}
                          alt={mlbbUser.name}
                          className="w-10 h-10 rounded-lg object-cover border border-purple-500/30"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <HiOutlineShieldCheck className="w-5 h-5 text-purple-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium flex items-center gap-2">
                          <HiOutlineShieldCheck className="w-4 h-4 text-purple-400" />
                          {mlbbUser.name || "MLBB Player"}
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          Lv.{mlbbUser.level} • Rank {mlbbUser.rank_level}
                        </p>
                      </div>
                      <HiOutlineChevronRight className="w-5 h-5 text-white/30" />
                    </div>
                  </Link>
                )}

                {/* Mobile Navigation with Expandable Dropdowns */}
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <div key={link.label}>
                      {link.dropdown ? (
                        <>
                          <button
                            onClick={() => toggleMobileDropdown(link.label)}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-white hover:bg-white/5 transition-all"
                          >
                            <span className="font-medium">{link.label}</span>
                            <HiOutlineChevronDown
                              className={`w-5 h-5 transition-transform ${mobileDropdown === link.label ? "rotate-180" : ""}`}
                            />
                          </button>

                          <AnimatePresence>
                            {mobileDropdown === link.label && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 pr-2 py-1 space-y-0.5">
                                  {link.dropdown.map((item) => (
                                    <Link
                                      key={item.label}
                                      to={item.href}
                                      onClick={() => setIsMobileOpen(false)}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white hover:bg-white/5 transition-all"
                                    >
                                      {item.icon && (
                                        <item.icon className="w-4 h-4" />
                                      )}
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          to={link.href}
                          onClick={() => setIsMobileOpen(false)}
                          className="flex items-center justify-between px-4 py-3 rounded-xl text-white hover:bg-white/5 transition-all"
                        >
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Rest of mobile menu */}
                {isAnyUserLoggedIn ? (
                  <>
                    {user && profile && (
                      <div className="border-t border-[#262636] pt-3 space-y-0.5">
                        {/* Mobile user header */}
                        <div className="flex items-center gap-3 px-4 py-3 mb-1">
                          <div className="w-10 h-10 rounded-full bg-[#1f1f29] border-2 border-[#f5a623]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-sm font-black text-[#f5a623]">{(profile?.username || "U").charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{profile?.username || "User"}</p>
                            <p className="text-xs text-green-400 font-semibold">$0.00</p>
                          </div>
                        </div>

                        <Link to={profile?.role === "seller" || profile?.role === "admin" ? "/seller-dashboard/orders" : "/dashboard/orders"} onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5">
                          <HiOutlineShoppingBag className="w-5 h-5 text-[#f5a623]" />
                          Orders
                        </Link>
                        <Link to="/dashboard/wishlist" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5">
                          <HiOutlineTag className="w-5 h-5 text-[#f5a623]" />
                          Offers
                        </Link>
                        <Link to={profile?.role === "seller" || profile?.role === "admin" ? "/seller-dashboard/revenue" : "/dashboard"} onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5">
                          <HiOutlineCurrencyDollar className="w-5 h-5 text-[#f5a623]" />
                          Wallet
                        </Link>
                        {profile?.role !== "seller" && profile?.role !== "admin" && (
                          <Link to="/seller-dashboard" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5">
                            <HiOutlineExternalLink className="w-5 h-5 text-[#f5a623]" />
                            Become a Seller
                          </Link>
                        )}
                        {(profile?.role === "seller" || profile?.role === "admin") && (
                          <Link to="/seller-dashboard" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#f5a623] hover:bg-white/5">
                            <HiOutlineExternalLink className="w-5 h-5" />
                            Seller Dashboard
                          </Link>
                        )}
                        <Link to="/dashboard/messages" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5">
                          <HiOutlineMail className="w-5 h-5 text-[#f5a623]" />
                          Messages
                          {unreadMessages > 0 && <span className="ml-auto bg-[#f5a623] text-[#121217] text-xs font-black px-1.5 py-0.5 rounded-full">{unreadMessages}</span>}
                        </Link>
                        <Link to="/dashboard/notifications" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5">
                          <HiOutlineBell className="w-5 h-5 text-[#f5a623]" />
                          Notifications
                          {notificationCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full">{notificationCount}</span>}
                        </Link>
                        <Link to="/dashboard/reviews" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5">
                          <HiOutlineStar className="w-5 h-5 text-[#f5a623]" />
                          Feedback
                        </Link>
                        <Link to={profile?.role === "seller" || profile?.role === "admin" ? "/seller-dashboard/settings" : "/dashboard/profile"} onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5">
                          <HiOutlineCog className="w-5 h-5 text-[#f5a623]" />
                          Account settings
                        </Link>
                        {profile?.role === "admin" && (
                          <Link to="/admin" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/5">
                            <HiOutlineShieldCheck className="w-5 h-5" />
                            Admin Panel
                          </Link>
                        )}
                      </div>
                    )}
                    <div className="border-t border-[#262636] pt-2 mt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20"
                      >
                        <HiOutlineLogout className="w-5 h-5" />
                        {user && isMLBBLoggedIn ? "Sign Out All" : "Log out"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-glass-border pt-6 space-y-3">
                    <Link
                      to="/login"
                      className="block w-full"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Button variant="primary" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

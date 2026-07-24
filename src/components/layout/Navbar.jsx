import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../stores/useAuthStore";
import useWishlistStore from "../../stores/useWishlistStore";
import { supabase } from "../../lib/supabase.js";
import SmartSearch from "../search/SmartSearch";
import {
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiMenu,
  HiX,
  HiOutlineMail,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { FiChevronDown } from "react-icons/fi";
import Logo from "../shared/Logo";
import Button from "../ui/Button";
import clsx from "clsx";

const navLinks = [
  {
    label: "Marketplace",
    href: "/marketplace",
    dropdown: [
      { label: "All Accounts", href: "/marketplace" },
      { label: "Featured", href: "/marketplace?filter=featured" },
      { label: "Trending", href: "/marketplace?filter=trending" },
      { label: "Mythic Glory", href: "/marketplace?rank=mythic-glory" },
      { label: "Collector Skins", href: "/marketplace?skin=collector" },
    ],
  },
  {
    label: "Sell Account",
    href: "/sell",
  },
  {
    label: "Player Checker",
    href: "/player-checker",
  },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user, profile, signOut } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { count: wishlistCount } = useWishlistStore();
  const [ordersCount, setOrdersCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

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
          // New message received - increment count
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
          // Message was marked as read
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

  // Initial fetch + periodic refresh as backup
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchOrdersCount();

      // Refresh every 60 seconds as fallback
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

  // Real-time subscription for instant updates
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

  // Scroll Detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [location]);

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
    setIsMobileOpen(false);
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
            ? "bg-brand-darker/80 backdrop-blur-2xl border-b border-glass-border shadow-2xl"
            : "bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Logo />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() =>
                    link.dropdown && setActiveDropdown(link.label)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.href}
                    className={clsx(
                      "flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                      location.pathname === link.href
                        ? "text-white bg-white/10"
                        : "text-white/60 hover:text-white hover:bg-white/5",
                    )}
                  >
                    {link.label}
                    {link.dropdown && (
                      <FiChevronDown
                        className={clsx(
                          "w-4 h-4 transition-transform duration-300",
                          activeDropdown === link.label && "rotate-180",
                        )}
                      />
                    )}
                  </Link>

                  <AnimatePresence>
                    {link.dropdown && activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 glass-modal p-2"
                      >
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <SmartSearch />
            </div>

            {/* Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  {/* Wishlist */}
                  <Link to="/dashboard/wishlist">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative p-2 text-white/60 hover:text-white transition-colors"
                    >
                      <HiOutlineHeart className="w-6 h-6" />
                      {wishlistCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-brand-purple text-white text-xs rounded-full flex items-center justify-center font-medium"
                        >
                          {wishlistCount}
                        </motion.span>
                      )}
                    </motion.button>
                  </Link>

                  {/* Orders */}
                  <Link
                    to={
                      profile?.role === "seller" || profile?.role === "admin"
                        ? "/seller-dashboard/orders"
                        : "/dashboard/orders"
                    }
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative p-2 text-white/60 hover:text-white transition-colors"
                    >
                      <HiOutlineShoppingBag className="w-6 h-6" />
                      {ordersCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold text-brand-darker text-xs rounded-full flex items-center justify-center font-bold"
                        >
                          {ordersCount}
                        </motion.span>
                      )}
                    </motion.button>
                  </Link>

                  {/* Messages */}
                  <Link to="/dashboard/messages">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative p-2 text-white/60 hover:text-white transition-colors"
                    >
                      <HiOutlineMail className="w-6 h-6" />
                      {unreadMessages > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-cyber-neon text-white text-xs rounded-full flex items-center justify-center font-bold"
                        >
                          {unreadMessages}
                        </motion.span>
                      )}
                    </motion.button>
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-2 glass-card hover:border-brand-purple/30 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center text-sm font-bold text-white overflow-hidden">
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
                        ) : (
                          profile?.username?.charAt(0).toUpperCase() || "U"
                        )}
                      </div>
                      <FiChevronDown
                        className={`w-4 h-4 text-white/50 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                      />
                    </motion.button>

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
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.18 }}
                            className="absolute right-0 top-full mt-2 w-56 glass-modal p-2 z-50"
                          >
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-glass-border mb-2">
                              <p className="text-sm font-medium text-white truncate">
                                {profile?.username}
                              </p>
                              <p className="text-xs text-white/40 truncate">
                                {profile?.email}
                              </p>
                            </div>

                            <Link
                              to={
                                profile?.role === "seller" ||
                                profile?.role === "admin"
                                  ? "/seller-dashboard"
                                  : "/dashboard"
                              }
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                            >
                              <HiOutlineUser className="w-4 h-4" />
                              Dashboard
                            </Link>
                            {profile?.role === "admin" && (
                              <>
                                <Link
                                  to="/admin"
                                  onClick={() => setUserMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-white/5"
                                >
                                  <HiOutlineShieldCheck className="w-4 h-4" />
                                  Admin Panel
                                </Link>
                                <hr className="my-2 border-glass-border" />
                              </>
                            )}

                            <Link
                              to="/dashboard/messages"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                            >
                              <HiOutlineMail className="w-4 h-4" />
                              Messages
                              {unreadMessages > 0 && (
                                <span className="ml-auto bg-cyber-neon text-white text-xs rounded-full px-2 py-0.5">
                                  {unreadMessages}
                                </span>
                              )}
                            </Link>

                            <Link
                              to="/dashboard/wishlist"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                            >
                              <HiOutlineHeart className="w-4 h-4" />
                              Wishlist
                            </Link>

                            <Link
                              to="/dashboard/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                            >
                              <HiOutlineCog className="w-4 h-4" />
                              Profile & Settings
                            </Link>

                            <hr className="my-2 border-glass-border" />

                            <button
                              onClick={handleSignOut}
                              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-white/5"
                            >
                              <HiOutlineLogout className="w-4 h-4" />
                              Sign Out
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
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
                <HiX className="w-7 h-7" />
              ) : (
                <HiMenu className="w-7 h-7" />
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
              <div className="p-6 pt-24 space-y-6">
                {/* Mobile Search */}
                <SmartSearch />

                {/* Mobile Links */}
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <span className="font-medium">{link.label}</span>
                      {link.dropdown && <FiChevronDown className="w-5 h-5" />}
                    </Link>
                  ))}
                </div>

                {user ? (
                  <>
                    <div className="border-t border-glass-border pt-4 space-y-1">
                      <p className="px-4 text-xs text-white/30 uppercase tracking-wider">
                        Account
                      </p>

                      <Link
                        to={
                          profile?.role === "seller" ||
                          profile?.role === "admin"
                            ? "/seller-dashboard"
                            : "/dashboard"
                        }
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5"
                      >
                        <HiOutlineUser className="w-5 h-5" />
                        Dashboard
                      </Link>

                      <Link
                        to="/dashboard/messages"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <HiOutlineMail className="w-5 h-5" />
                          Messages
                        </div>
                        {unreadMessages > 0 && (
                          <span className="bg-cyber-neon text-white text-xs rounded-full px-2 py-0.5">
                            {unreadMessages}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/dashboard/wishlist"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <HiOutlineHeart className="w-5 h-5" />
                          Wishlist
                        </div>
                        {wishlistCount > 0 && (
                          <span className="bg-brand-purple text-white text-xs rounded-full px-2 py-0.5">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to={
                          profile?.role === "seller" ||
                          profile?.role === "admin"
                            ? "/seller-dashboard/orders"
                            : "/dashboard/orders"
                        }
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <HiOutlineShoppingBag className="w-5 h-5" />
                          Orders
                        </div>
                        {ordersCount > 0 && (
                          <span className="bg-brand-gold text-brand-darker text-xs rounded-full px-2 py-0.5 font-bold">
                            {ordersCount}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="border-t border-glass-border pt-4">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-white/5"
                      >
                        <HiOutlineLogout className="w-5 h-5" />
                        Sign Out
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

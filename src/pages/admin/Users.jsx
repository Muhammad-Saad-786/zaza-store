import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineBan,
  HiOutlineCheck,
  HiOutlineSearch,
} from "react-icons/hi";
import useAdminStore from "../../stores/useAdminStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

const roleColors = {
  admin: "text-red-400 bg-red-400/10 border-red-400/30",
  seller: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  buyer: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
};

export default function Users() {
  const {
    users,
    loading,
    fetchUsers,
    updateUserRole,
    toggleBanUser,
    verifySeller,
    removeVerification,
  } = useAdminStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    // Banned filter - show only banned users
    if (filter === "banned") return u.banned === true;

    // All filter - show non-banned users
    if (filter === "all") return !u.banned;

    // Role filter - show users with that role who aren't banned
    if (filter !== "all" && filter !== "banned") {
      return u.role === filter && !u.banned;
    }

    // Search filter
    if (
      search &&
      !u.username?.toLowerCase().includes(search.toLowerCase()) &&
      !u.email?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-display font-extrabold text-white">
          Users ({filteredUsers.length})
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white w-48"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          {
            key: "all",
            label: "All",
            count: users.filter((u) => !u.banned).length,
          },
          {
            key: "buyer",
            label: "Buyer",
            count: users.filter((u) => u.role === "buyer" && !u.banned).length,
          },
          {
            key: "seller",
            label: "Seller",
            count: users.filter((u) => u.role === "seller" && !u.banned).length,
          },
          {
            key: "admin",
            label: "Admin",
            count: users.filter((u) => u.role === "admin").length,
          },
          {
            key: "banned",
            label: "Banned",
            count: users.filter((u) => u.banned).length,
          },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f.key
                ? f.key === "banned"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-purple-500/20 text-purple-400"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <GlassCard key={user.id} className="p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center font-bold text-white overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">
                      {user.username}
                    </p>
                    {user.verified_seller && (
                      <HiOutlineShieldCheck
                        className="w-4 h-4 text-blue-400"
                        title="Verified Seller"
                      />
                    )}
                    {user.banned && (
                      <HiOutlineBan
                        className="w-4 h-4 text-red-400"
                        title="Banned"
                      />
                    )}
                  </div>
                  <p className="text-xs text-white/40">{user.email}</p>
                  <p className="text-xs text-white/30">
                    {user.total_sales || 0} sales
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${roleColors[user.role] || "text-white/40"}`}
                >
                  {user.role}
                </span>
                {/* Role Change */}
                <select
                  value={user.role}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value="buyer" className="bg-black">
                    Buyer
                  </option>
                  <option value="seller" className="bg-black">
                    Seller
                  </option>
                  <option value="admin" className="bg-black">
                    Admin
                  </option>
                </select>

                {user.role === "seller" && (
                  <button
                    onClick={async () => {
                      if (user.verified_seller) {
                        await removeVerification(user.id);
                      } else {
                        // Directly verify without going through verification table
                        await verifySeller(user.id);
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      user.verified_seller
                        ? "text-blue-400 bg-blue-400/10 hover:bg-blue-400/20"
                        : "text-white/30 hover:text-blue-400 hover:bg-white/5"
                    }`}
                    title={
                      user.verified_seller
                        ? "Remove verification"
                        : "Verify seller"
                    }
                  >
                    <img
                      src="/blue-verify-badge.png"
                      alt=""
                      className={`w-5 h-5 object-contain ${!user.verified_seller && "opacity-30"}`}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </button>
                )}
                {/* Ban/Unban */}
                <button
                  onClick={() => toggleBanUser(user.id, user.banned)}
                  className={`p-2 rounded-lg transition-colors ${user.banned ? "text-green-400 bg-green-400/10" : "text-red-400/50 hover:text-red-400 hover:bg-red-400/10"}`}
                  title={user.banned ? "Unban user" : "Ban user"}
                >
                  <HiOutlineBan className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}

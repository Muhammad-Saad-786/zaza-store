import { useEffect } from "react";
import { motion } from "framer-motion";
import useAdminStore from "../../stores/useAdminStore";
import GlassCard from "../../components/ui/GlassCard";
import Spinner from "../../components/ui/Spinner";

const roleColors = {
  admin: "text-red-400 bg-red-400/10",
  seller: "text-brand-gold bg-brand-gold/10",
  buyer: "text-cyber-neon bg-cyber-neon/10",
  banned: "text-gray-400 bg-gray-400/10 line-through",
};

export default function Users() {
  const { users, loading, fetchUsers, updateUserRole, toggleUserBan } =
    useAdminStore();

  useEffect(() => {
    fetchUsers();
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
        Users ({users.length})
      </h1>

      <div className="space-y-3">
        {users.map((user) => (
          <GlassCard key={user.id} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center font-bold text-white overflow-hidden">
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
                  <p className="text-sm font-medium text-white">
                    {user.username}
                  </p>
                  <p className="text-xs text-white/40">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${roleColors[user.role] || "text-white/40 bg-white/5"}`}
                >
                  {user.role}
                </span>

                {user.role !== "admin" && (
                  <div className="flex gap-1">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="bg-white/5 border border-glass-border rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="buyer" className="bg-brand-darker">
                        Buyer
                      </option>
                      <option value="seller" className="bg-brand-darker">
                        Seller
                      </option>
                      <option value="banned" className="bg-brand-darker">
                        Banned
                      </option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}

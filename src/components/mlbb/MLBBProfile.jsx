// src/components/mlbb/MLBBProfile.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineServer,
  HiOutlineGlobe,
  HiOutlineTrendingUp,
  HiOutlineStar,
  HiOutlineLogout,
  HiOutlineRefresh,
  HiOutlineChevronRight,
  HiOutlineAcademicCap,
} from "react-icons/hi";
import useMLBBAuthStore from "../../stores/useMLBBAuthStore";
import Spinner from "../ui/Spinner";
import Button from "../ui/Button";
import mlbbLogo from "/mobile-legends.png";
export default function MLBBProfile() {
  const navigate = useNavigate();
  const { mlbbUser, isLoggedIn, loading, fetchMLBBUserInfo, logoutMLBB } =
    useMLBBAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMLBBUserInfo();
    setRefreshing(false);
  };

  const handleLogout = () => {
    logoutMLBB();
    navigate("/");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-white/40">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      {/* Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter">
            MLBB{" "}
            <span className="text-transparent bg-clip-text bg-purple-600">
              Profile
            </span>
          </h1>
          <p className="text-white/40 text-lg mt-3">
            Your Mobile Legends account details
          </p>
        </motion.div>

        {mlbbUser ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Profile Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-amber-500/10" />

              <div className="relative p-6 sm:p-8">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/30 to-amber-500/30 flex items-center justify-center border border-white/10">
                      {mlbbUser.avatar ? (
                        <img
                          src={mlbbUser.avatar}
                          alt={mlbbUser.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <img
                          src={mlbbLogo}
                          alt="MLBB"
                          className="w-12 h-12 object-contain"
                        />
                      )}
                    </div>
                    {/* Verified Badge */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-black">
                      <HiOutlineShieldCheck className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Name and Stats */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {mlbbUser.name || "MLBB Player"}
                    </h2>

                    {/* Level and Rank Badges */}
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10">
                        <HiOutlineStar className="w-4 h-4 text-yellow-400" />
                        <span className="text-white/70 text-sm">
                          Level {mlbbUser.level}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10">
                        <HiOutlineAcademicCap className="w-4 h-4 text-amber-400" />
                        <span className="text-white/70 text-sm">
                          Rank {mlbbUser.rank_level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="p-2 rounded-xl bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
                      title="Refresh"
                    >
                      <HiOutlineRefresh
                        className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-white/5" />

                {/* Account Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Role ID */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <HiOutlineUser className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">
                          Role ID
                        </p>
                        <p className="text-white font-semibold text-lg">
                          {mlbbUser.roleId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Zone ID */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <HiOutlineServer className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">
                          Zone ID
                        </p>
                        <p className="text-white font-semibold text-lg">
                          {mlbbUser.zoneId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Region */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <HiOutlineGlobe className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">
                          Region
                        </p>
                        <p className="text-white font-semibold text-lg uppercase">
                          {mlbbUser.reg_country || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <HiOutlineStar className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">
                          Account Level
                        </p>
                        <p className="text-white font-semibold text-lg">
                          {mlbbUser.level}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Current Rank */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                        <HiOutlineAcademicCap className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">
                          Current Rank
                        </p>
                        <p className="text-white font-semibold text-lg">
                          {mlbbUser.rank_level}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highest Rank */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <HiOutlineTrendingUp className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider">
                          Highest Rank
                        </p>
                        <p className="text-white font-semibold text-lg">
                          {mlbbUser.history_rank_level || mlbbUser.rank_level}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <div className="text-3xl mb-2">🎮</div>
                <div className="text-2xl font-bold text-white">
                  {mlbbUser.level}
                </div>
                <div className="text-white/40 text-sm mt-1">Account Level</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-amber-400">
                  {mlbbUser.rank_level}
                </div>
                <div className="text-white/40 text-sm mt-1">Current Rank</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-2xl font-bold text-purple-400">
                  {mlbbUser.history_rank_level || mlbbUser.rank_level}
                </div>
                <div className="text-white/40 text-sm mt-1">Highest Rank</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => navigate("/tools/mlbb/heroes")}
              >
                <span className="flex items-center gap-2 justify-center">
                  Explore Heroes
                  <HiOutlineChevronRight className="w-4 h-4" />
                </span>
              </Button>

              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => navigate("/player-checker")}
              >
                <span className="flex items-center gap-2 justify-center">
                  Check Another Player
                </span>
              </Button>
            </div>

            {/* Logout Button */}
            <div className="text-center">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                <HiOutlineLogout className="w-5 h-5" />
                Disconnect MLBB Account
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}
      </div>
    </div>
  );
}

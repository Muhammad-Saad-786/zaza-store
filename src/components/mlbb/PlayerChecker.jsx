import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineServer,
} from "react-icons/hi";
import useMLBBStore from "../../stores/useMLBBStore";
import Button from "../ui/Button";

// MLBB character images for decoration
const characterImages = [
  "/hirara.jfif",
  "/angela.jfif",
  "/bendeta.jfif",
  "/anime-girl-1.jfif",
  "/anime-girl-2.jfif",
  "/anime-girl-3.jfif",
  "anime-girl-4.jfif",
  "/anime-girl-5.jfif",
];

const backgroundImages = [
  "/Angelic-Agent-trail.jpg",
  "/gusion-kof.jpg",
  "/Chou-trail.jpg",
  "/Lesley-trail.jpg",
];

export default function PlayerChecker() {
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [currentBg, setCurrentBg] = useState(0);
  const resultRef = useRef(null);
  const [focused, setFocused] = useState(null);

  const {
    playerData,
    loading,
    error,
    searchHistory,
    fetchPlayerInfo,
    clearPlayerData,
    clearHistory,
    removeFromHistory,
    loadHistory,
    saveHistory,
  } = useMLBBStore();

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    saveHistory();
  }, [searchHistory]);

  // Cycle background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!playerId.trim() || !zoneId.trim()) return;
    await fetchPlayerInfo(playerId, zoneId);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 200);
  };

  const handleHistoryClick = (item) => {
    setPlayerId(item.playerId);
    setZoneId(item.zoneId);
    fetchPlayerInfo(item.playerId, item.zoneId);
  };

  const handleClear = () => {
    setPlayerId("");
    setZoneId("");
    clearPlayerData();
    setFocused(null);
  };

  // Random character image for results
  const randomCharImage =
    characterImages[Math.floor(Math.random() * characterImages.length)];

  return (
    <div className="min-h-screen w-full relative">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter">
            Player{" "}
            <span className="text-transparent bg-clip-text bg-purple-600">
              Checker
            </span>
          </h1>
          <p className="text-white/40 text-lg mt-4 max-w-lg mx-auto">
            Verify MLBB accounts by checking player name with ID & Server
          </p>
        </motion.div>

        {/* Search Form - Clean & Direct */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
          className="space-y-5"
        >
          {/* Player ID Input */}
          <div className="relative group">
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                focused === "playerId"
                  ? "bg-purple-500/10 blur-xl"
                  : "bg-transparent"
              }`}
            />
            <div className="relative flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                  focused === "playerId"
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-white/[0.03] text-white/20"
                }`}
              >
                <HiOutlineUser className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-white/30 uppercase tracking-widest mb-2">
                  Player ID (User ID)
                </label>
                <input
                  id="playerId"
                  type="text"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  onFocus={() => setFocused("playerId")}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter User ID"
                  className="w-full bg-transparent border-b-2 border-white/10 text-white text-2xl sm:text-3xl font-light pb-3 outline-none focus:border-purple-500/50 transition-all placeholder:text-white/10"
                  autoFocus
                  required
                />
              </div>
            </div>
          </div>

          {/* Server ID Input */}
          <div className="relative group">
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                focused === "zoneId"
                  ? "bg-amber-500/10 blur-xl"
                  : "bg-transparent"
              }`}
            />
            <div className="relative flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                  focused === "zoneId"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-white/[0.03] text-white/20"
                }`}
              >
                <HiOutlineServer className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-white/30 uppercase tracking-widest mb-2">
                  Server ID (Zone ID)
                </label>
                <input
                  id="zoneId"
                  type="text"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  onFocus={() => setFocused("zoneId")}
                  onBlur={() => setFocused(null)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                  placeholder="Zone ID"
                  className="w-full bg-transparent border-b-2 border-white/10 text-white text-2xl sm:text-3xl font-light pb-3 outline-none focus:border-amber-500/50 transition-all placeholder:text-white/10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1 text-base"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <HiOutlineSearch className="w-5 h-5" />
                  Check Player
                </span>
              )}
            </Button>
            {(playerId || zoneId) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-3 text-white/30 hover:text-white/60 transition-colors"
              >
                <HiOutlineRefresh className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.form>

        {/* Search History */}
        {searchHistory.length > 0 && !playerData && !error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/20 uppercase tracking-widest">
                Recent Searches
              </p>
              <button
                onClick={clearHistory}
                className="text-xs text-white/20 hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all"
                >
                  <HiOutlineClock className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-400 transition-colors" />
                  <span className="text-white/60 text-sm group-hover:text-white transition-colors">
                    {item.username}
                  </span>
                  <span className="text-white/15 text-xs">
                    ({item.playerId})
                  </span>
                  <HiOutlineX
                    className="w-3.5 h-3.5 text-white/10 hover:text-red-400 transition-all ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(item.id);
                    }}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {playerData && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-12"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                {/* Decorative Image */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                  <img
                    src={randomCharImage}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>

                <div className="relative p-8 sm:p-10">
                  {/* Player Avatar & Name */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/30 to-amber-500/30 flex items-center justify-center flex-shrink-0 border border-white/5">
                      <img
                        src={randomCharImage}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">
                        {playerData.username}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <HiOutlineShieldCheck className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">
                          Verified Player
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Player Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-white/30 text-xs uppercase tracking-wider">
                        Player ID
                      </span>
                      <p className="text-white font-semibold text-lg mt-1">
                        {playerData.userId}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <span className="text-white/30 text-xs uppercase tracking-wider">
                        Server ID
                      </span>
                      <p className="text-white font-semibold text-lg mt-1">
                        {playerData.zoneId}
                      </p>
                    </div>
                  </div>

                  {/* Check Another */}
                  <button
                    onClick={handleClear}
                    className="mt-6 text-sm text-white/30 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <HiOutlineRefresh className="w-4 h-4" />
                    Check Another Player
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12"
            >
              <div className="relative overflow-hidden rounded-3xl border border-red-500/10 bg-red-500/[0.02] p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Player Not Found
                </h3>
                <p className="text-red-400/60 text-sm mt-2 max-w-sm mx-auto">
                  {error}
                </p>
                <p className="text-white/15 text-xs mt-3">
                  Double-check the Player ID and Server ID
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

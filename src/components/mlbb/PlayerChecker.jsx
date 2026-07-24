import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import useMLBBStore from "../../stores/useMLBBStore";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";

export default function PlayerChecker() {
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const resultRef = useRef(null);

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

  const handleSearch = async (e) => {
    e.preventDefault();
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

  const handleKeyPress = (e, nextRef) => {
    if (e.key === "Enter" && nextRef) {
      e.preventDefault();
      document.getElementById(nextRef)?.focus();
    }
  };

  const handleClear = () => {
    setPlayerId("");
    setZoneId("");
    clearPlayerData();
    document.getElementById("playerId")?.focus();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Card */}
      <GlassCard className="p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-extrabold text-white">
            MLBB Player{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
              Checker
            </span>
          </h2>
          <p className="text-white/40 text-sm mt-2">
            Verify account by checking player name with ID & Server
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Player ID (User ID)
              </label>
              <input
                id="playerId"
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, "zoneId")}
                placeholder="e.g. 123456789"
                className="input-glass w-full px-4 py-3 text-white text-lg tracking-wider"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Server ID (Zone ID)
              </label>
              <input
                id="zoneId"
                type="text"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                placeholder="e.g. 12345"
                className="input-glass w-full px-4 py-3 text-white text-lg tracking-wider"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
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
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 text-white/40 hover:text-white transition-colors"
            >
              <HiOutlineRefresh className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && !playerData && !error && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/30 uppercase tracking-wider">
                Recent Searches
              </p>
              <button
                onClick={clearHistory}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-1">
              {searchHistory.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <HiOutlineClock className="w-4 h-4 text-white/20" />
                    <span className="text-white/70 text-sm">
                      {item.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/20 text-xs">
                      {item.playerId} ({item.zoneId})
                    </span>
                    <HiOutlineX
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.id);
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Results */}
      <AnimatePresence>
        {playerData && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <GlassCard className="p-6 sm:p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎮</span>
              </div>

              <h3 className="text-2xl font-bold text-white">
                {playerData.username}
              </h3>

              <div className="flex items-center justify-center gap-2 mt-2">
                <HiOutlineShieldCheck className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  Player Found Successfully
                </span>
              </div>

              <div className="mt-4 p-4 bg-white/[0.02] rounded-xl inline-block">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/40">Player ID</span>
                    <p className="text-white font-medium">
                      {playerData.userId}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/40">Server ID</span>
                    <p className="text-white font-medium">
                      {playerData.zoneId}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClear}
                className="mt-6 text-sm text-white/30 hover:text-white transition-colors"
              >
                Check Another Player
              </button>
            </GlassCard>
          </motion.div>
        )}

        {/* Error */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <GlassCard className="p-6 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-white">
                Player Not Found
              </h3>
              <p className="text-red-400/80 text-sm mt-1">{error}</p>
              <p className="text-white/20 text-xs mt-2">
                Check the Player ID and Server ID and try again
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

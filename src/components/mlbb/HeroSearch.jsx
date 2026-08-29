// src/components/mlbb/HeroSearch.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiOutlineSearch, HiOutlineLightningBolt } from "react-icons/hi";
import MLBBToolsLayout from "./MLBBToolsLayout";
import Button from "../ui/Button";

export default function HeroSearch() {
  const navigate = useNavigate();
  const [heroName, setHeroName] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (heroName.trim()) {
      navigate(`/tools/mlbb/hero/${heroName.trim()}`);
    }
  };

  return (
    <MLBBToolsLayout>
      <div className="max-w-xl mx-auto">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearch}
          className="space-y-6"
        >
          {/* Hero Name Input */}
          <div className="relative group">
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                focused ? "bg-purple-500/10 blur-xl" : "bg-transparent"
              }`}
            />
            <div className="relative flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                  focused
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-white/[0.03] text-white/20"
                }`}
              >
                <HiOutlineSearch className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-white/30 uppercase tracking-widest mb-2">
                  Hero Name
                </label>
                <input
                  type="text"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Enter hero name (e.g., Gusion, Hirara)"
                  className="w-full bg-transparent border-b-2 border-white/10 text-white text-2xl font-light pb-3 outline-none focus:border-purple-500/50 transition-all placeholder:text-white/10"
                  autoFocus
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full text-base"
          >
            <span className="flex items-center gap-2 justify-center">
              <HiOutlineLightningBolt className="w-5 h-5" />
              Search Hero
            </span>
          </Button>
        </motion.form>

        {/* Popular Heroes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h3 className="text-white/30 text-xs uppercase tracking-wider text-center mb-4">
            Popular Heroes
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Gusion", "Hirara", "Marcel", "Sora", "Lancelot", "Chou"].map(
              (hero) => (
                <button
                  key={hero}
                  onClick={() => navigate(`/tools/mlbb/hero/${hero}`)}
                  className="px-4 py-2 rounded-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all text-white/60 hover:text-white text-sm"
                >
                  {hero}
                </button>
              ),
            )}
          </div>
        </motion.div>
      </div>
    </MLBBToolsLayout>
  );
}

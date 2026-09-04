// src/components/mlbb/MLBBToolsLayout.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineUsers,
  HiOutlineTrendingUp,
  HiOutlineMap,
  HiOutlineSearch,
  HiOutlineChevronRight,
} from "react-icons/hi";

const toolsNav = [
  {
    label: "All Heroes",
    path: "/tools/mlbb/heroes",
    icon: HiOutlineUsers,
    description: "Browse complete hero roster",
  },
  {
    label: "Hero Rankings",
    path: "/tools/mlbb/rankings",
    icon: HiOutlineTrendingUp,
    description: "Win rates and performance stats",
  },
  {
    label: "Hero Positions",
    path: "/tools/mlbb/positions",
    icon: HiOutlineMap,
    description: "Filter by role and lane",
  },
  {
    label: "Hero Search",
    path: "/tools/mlbb/hero-search",
    icon: HiOutlineSearch,
    description: "Find specific hero details",
  },
];

export default function MLBBToolsLayout({ children }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="min-h-screen w-full relative">
        {/* Background */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tighter">
              MLBB{" "}
              <span className="text-transparent bg-clip-text bg-purple-600">
                Tools
              </span>
            </h1>
            <p className="text-white/40 text-lg mt-4 max-w-lg mx-auto">
              Explore heroes, rankings, counters, and more
            </p>
          </motion.div>

          {/* Tools Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 justify-center mb-12"
          >
            {toolsNav.map((tool) => {
              const isActive = location.pathname === tool.path;
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <tool.icon className="w-4 h-4" />
                  {tool.label}
                </Link>
              );
            })}
          </motion.div>

          {/* Content */}
          {children}
        </div>
      </div>
    </>
  );
}

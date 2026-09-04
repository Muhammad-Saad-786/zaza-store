import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../ui/GlassCard";

/**
 * 1. Revenue Trend Line / Area Chart
 */
export function RevenueTrendChart({ timeframe = "30D", onTimeframeChange }) {
  const [activeRange, setActiveRange] = useState(timeframe);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const ranges = ["7D", "30D", "90D", "1Y"];

  // Sample data points scaled for timeframes
  const dataSets = {
    "7D": [
      { label: "Mon", value: 120 },
      { label: "Tue", value: 340 },
      { label: "Wed", value: 210 },
      { label: "Thu", value: 580 },
      { label: "Fri", value: 450 },
      { label: "Sat", value: 890 },
      { label: "Sun", value: 720 },
    ],
    "30D": [
      { label: "W1", value: 1450 },
      { label: "W2", value: 2800 },
      { label: "W3", value: 2100 },
      { label: "W4", value: 3950 },
    ],
    "90D": [
      { label: "Month 1", value: 4800 },
      { label: "Month 2", value: 7200 },
      { label: "Month 3", value: 9600 },
    ],
    "1Y": [
      { label: "Q1", value: 12400 },
      { label: "Q2", value: 18900 },
      { label: "Q3", value: 24500 },
      { label: "Q4", value: 31200 },
    ],
  };

  const points = dataSets[activeRange] || dataSets["30D"];
  const maxVal = Math.max(...points.map((p) => p.value), 100);

  // SVG coordinate calculation
  const width = 500;
  const height = 180;
  const paddingX = 35;
  const paddingY = 25;

  const getX = (index) =>
    paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
  const getY = (val) =>
    height - paddingY - (val / maxVal) * (height - paddingY * 2);

  // Generate SVG path string (smooth Bezier curve)
  const pathD = points.reduce((acc, point, i, arr) => {
    const x = getX(i);
    const y = getY(point.value);
    if (i === 0) return `M ${x} ${y}`;
    const prevX = getX(i - 1);
    const prevY = getY(arr[i - 1].value);
    const cpX1 = prevX + (x - prevX) / 2;
    const cpY1 = prevY;
    const cpX2 = prevX + (x - prevX) / 2;
    const cpY2 = y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
  }, "");

  // Area path for gradient fill
  const areaD = `${pathD} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  return (
    <GlassCard className="p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse"></span>
            <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            Earnings performance over time
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-glass-border">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => {
                setActiveRange(r);
                if (onTimeframeChange) onTimeframeChange(r);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeRange === r
                  ? "bg-brand-gold text-brand-darker shadow-md"
                  : "text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[200px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient
              id="revenueGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((pct, i) => (
            <line
              key={i}
              x1={paddingX}
              y1={height - paddingY - pct * (height - paddingY * 2)}
              x2={width - paddingX}
              y2={height - paddingY - pct * (height - paddingY * 2)}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineStroke)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Interactive points */}
          {points.map((pt, i) => {
            const cx = getX(i);
            const cy = getY(pt.value);
            const isHovered = hoveredPoint?.index === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({ ...pt, index: i, cx, cy })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  className="fill-brand-dark stroke-brand-gold"
                  strokeWidth="2.5"
                />
                <text
                  x={cx}
                  y={height - 6}
                  textAnchor="middle"
                  className="text-[10px] fill-white/40 font-medium"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-1.5 bg-brand-dark/95 border border-brand-gold/40 rounded-xl shadow-xl backdrop-blur-md text-xs transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(hoveredPoint.cx / width) * 100}%`,
              top: `${(hoveredPoint.cy / height) * 100}%`,
            }}
          >
            <p className="text-white/60 text-[10px] font-medium">
              {hoveredPoint.label}
            </p>
            <p className="text-brand-gold font-bold text-sm">
              ${hoveredPoint.value.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/**
 * 2. Orders Volume Bar Chart
 */
export function OrdersBarChart({ data }) {
  const defaultBars = [
    { label: "Mon", count: 4 },
    { label: "Tue", count: 7 },
    { label: "Wed", count: 5 },
    { label: "Thu", count: 12 },
    { label: "Fri", count: 9 },
    { label: "Sat", count: 15 },
    { label: "Sun", count: 11 },
  ];

  const bars = data || defaultBars;
  const maxCount = Math.max(...bars.map((b) => b.count), 1);

  return (
    <GlassCard className="p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-neon animate-pulse"></span>
            <h3 className="text-lg font-semibold text-white">Orders Volume</h3>
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            Order activity count by day
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/20">
          Weekly
        </span>
      </div>

      <div className="flex items-end justify-between gap-2 h-44 pt-6 px-2">
        {bars.map((bar, i) => {
          const heightPct = Math.max(12, (bar.count / maxCount) * 100);
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
            >
              <span className="text-[11px] font-bold text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.count}
              </span>
              <div className="w-full max-w-[28px] bg-white/5 rounded-t-lg overflow-hidden flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="w-full bg-gradient-to-t from-brand-purple to-cyber-neon rounded-t-lg group-hover:brightness-125 transition-all shadow-lg"
                />
              </div>
              <span className="text-[10px] text-white/40 font-medium">
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

/**
 * 3. Popular Ranks / Categories Donut Chart
 */
export function CategoryDistributionChart({ items = [] }) {
  // Rank distribution counts
  const rankCounts = {
    "Mythic Glory": 0,
    Mythic: 0,
    Legend: 0,
    Epic: 0,
    "Collector Spec": 0,
  };

  items.forEach((item) => {
    if (item.collector_count > 0) rankCounts["Collector Spec"]++;
    else if (item.rank?.includes("Glory")) rankCounts["Mythic Glory"]++;
    else if (item.rank?.includes("Mythic")) rankCounts["Mythic"]++;
    else if (item.rank?.includes("Legend")) rankCounts["Legend"]++;
    else rankCounts["Epic"]++;
  });

  const categories = [
    {
      name: "Mythic Glory",
      count: rankCounts["Mythic Glory"] || 12,
      color: "#f59e0b",
    },
    { name: "Mythic", count: rankCounts["Mythic"] || 18, color: "#8b5cf6" },
    { name: "Legend", count: rankCounts["Legend"] || 8, color: "#06b6d4" },
    {
      name: "Collector Spec",
      count: rankCounts["Collector Spec"] || 6,
      color: "#ec4899",
    },
    { name: "Epic / Other", count: rankCounts["Epic"] || 4, color: "#10b981" },
  ];

  const total = categories.reduce((sum, c) => sum + c.count, 0);

  // SVG Donut calculation
  const size = 150;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Categories & Ranks
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            Distribution of listed inventory
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 justify-around py-2">
        {/* Donut graphic */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {categories.map((cat, i) => {
              const strokeDasharray = `${(cat.count / total) * circumference} ${circumference}`;
              const strokeDashoffset = -currentAngle;
              currentAngle += (cat.count / total) * circumference;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all hover:opacity-80 cursor-pointer"
                />
              );
            })}
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-white">{total}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1 max-w-[200px]">
          {categories.map((cat, i) => {
            const pct = Math.round((cat.count / total) * 100);
            return (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-white/70 font-medium truncate">
                    {cat.name}
                  </span>
                </div>
                <span className="text-white font-bold">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

/**
 * 4. Performance Heatmap (Activity Intensity)
 */
export function PerformanceHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const times = ["Morning", "Afternoon", "Evening", "Night"];

  // Mock intensity grid 0 - 4
  const grid = [
    [1, 2, 3, 2],
    [2, 3, 4, 3],
    [1, 2, 2, 1],
    [3, 4, 4, 4],
    [2, 3, 4, 4],
    [4, 4, 4, 3],
    [3, 3, 4, 2],
  ];

  const getColor = (level) => {
    switch (level) {
      case 4:
        return "bg-brand-gold text-brand-darker shadow-[0_0_12px_rgba(245,158,11,0.5)]";
      case 3:
        return "bg-brand-purple text-white";
      case 2:
        return "bg-brand-purple/40 text-white/70";
      case 1:
        return "bg-white/10 text-white/40";
      default:
        return "bg-white/5 text-transparent";
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Sales Activity Heatmap
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            Peak traffic and checkout timings
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/40">
          <span>Low</span>
          <span className="w-2 h-2 rounded bg-white/10" />
          <span className="w-2 h-2 rounded bg-brand-purple/40" />
          <span className="w-2 h-2 rounded bg-brand-purple" />
          <span className="w-2 h-2 rounded bg-brand-gold" />
          <span>High</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-1 text-[11px] font-medium text-white/30 text-left">
                Day
              </th>
              {times.map((t) => (
                <th
                  key={t}
                  className="p-1 text-[11px] font-medium text-white/40"
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((d, dayIdx) => (
              <tr key={d}>
                <td className="p-1.5 text-xs text-white/50 font-medium text-left">
                  {d}
                </td>
                {times.map((_, timeIdx) => {
                  const level = grid[dayIdx][timeIdx];
                  return (
                    <td key={timeIdx} className="p-1">
                      <div
                        className={`w-full h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-105 ${getColor(
                          level,
                        )}`}
                      >
                        {level > 2 ? `${level * 3}` : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

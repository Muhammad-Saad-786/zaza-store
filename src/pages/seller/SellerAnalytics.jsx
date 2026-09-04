import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineCurrencyDollar,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineFire,
  HiOutlineLightBulb,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import GlassCard from "../../components/ui/GlassCard";
import {
  RevenueTrendChart,
  CategoryDistributionChart,
  PerformanceHeatmap,
} from "../../components/dashboard/SellerCharts";

export default function SellerAnalytics() {
  const { stats, listings, fetchStats, fetchListings } = useSellerDashboardStore();

  useEffect(() => {
    fetchStats();
    fetchListings();
  }, []);

  const marketTrends = [
    { rank: "Mythical Immortal", avgPrice: "$140", demand: "Extremely High (98%)", gap: "Low Supply - High Premium" },
    { rank: "Mythical Glory", avgPrice: "$85", demand: "Very High (92%)", gap: "Optimal Liquidity" },
    { rank: "Mythic", avgPrice: "$38", demand: "High (84%)", gap: "Competitive Pricing Needed" },
    { rank: "Legend", avgPrice: "$22", demand: "Moderate (65%)", gap: "Fast Turnaround" },
    { rank: "Collector Spec", avgPrice: "$175+", demand: "Surging (95%)", gap: "Collectors Paying Premium" },
  ];

  const trendingHeroes = [
    { name: "Fanny", popularity: "98%", role: "Assassin", tag: "Skylark / Lightborn" },
    { name: "Gusion", popularity: "94%", role: "Assassin/Mage", tag: "Legend / KOF" },
    { name: "Chou", popularity: "92%", role: "Fighter", tag: "Iori Yagami / Echo" },
    { name: "Ling", popularity: "89%", role: "Assassin", tag: "Collector / M-World" },
    { name: "Hayabusa", popularity: "86%", role: "Assassin", tag: "Shura / Shadow of Obscurity" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-display font-extrabold text-white">
            Analytics & Market Intelligence
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple text-xs font-bold border border-brand-purple/30">
            Live AI Feed
          </span>
        </div>
        <p className="text-xs text-white/40 mt-1">
          Deep sales analytics, competitive pricing benchmarks, and buyer demand trends.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-brand-gold text-xs font-semibold mb-1">
            <HiOutlineTrendingUp className="w-4 h-4" /> Sales Velocity
          </div>
          <div className="text-2xl font-black text-white">{stats.salesVelocityDays} Days</div>
          <p className="text-[10px] text-green-400 mt-1">⚡ Top 10% on platform</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-cyber-neon text-xs font-semibold mb-1">
            <HiOutlineCurrencyDollar className="w-4 h-4" /> Avg Order Value
          </div>
          <div className="text-2xl font-black text-white">${stats.averageOrderValue}</div>
          <p className="text-[10px] text-white/40 mt-1">Per completed sale</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-brand-purple text-xs font-semibold mb-1">
            <HiOutlineSparkles className="w-4 h-4" /> Listing CTR
          </div>
          <div className="text-2xl font-black text-white">{stats.clickThroughRate}%</div>
          <p className="text-[10px] text-green-400 mt-1">+1.4% vs last week</p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-pink-400 text-xs font-semibold mb-1">
            <HiOutlineUserGroup className="w-4 h-4" /> Repeat Buyer Rate
          </div>
          <div className="text-2xl font-black text-white">{stats.repeatCustomerRate}%</div>
          <p className="text-[10px] text-white/40 mt-1">High customer trust</p>
        </GlassCard>
      </div>

      {/* Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart />
        <CategoryDistributionChart items={listings} />
      </div>

      {/* Market Intelligence & Rank Pricing Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Pricing Benchmarks */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <HiOutlineFire className="w-5 h-5 text-brand-gold" />
                  Live Rank Pricing & Demand Index
                </h2>
                <p className="text-xs text-white/40">Market benchmarks derived from platform sales</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-white/5 text-white/40 border-b border-glass-border">
                  <tr>
                    <th className="p-2.5">Tier / Rank</th>
                    <th className="p-2.5">Market Avg Price</th>
                    <th className="p-2.5">Buyer Demand</th>
                    <th className="p-2.5">Market Opportunity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                  {marketTrends.map((trend) => (
                    <tr key={trend.rank} className="hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-bold text-white">{trend.rank}</td>
                      <td className="p-2.5 font-black text-gradient-gold">{trend.avgPrice}</td>
                      <td className="p-2.5 text-cyber-neon font-semibold">{trend.demand}</td>
                      <td className="p-2.5 text-green-400 font-medium">{trend.gap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Trending In-Demand Heroes & Skins */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <HiOutlineSparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Trending Meta Heroes</h2>
          </div>
          <p className="text-xs text-white/40">Accounts containing these hero skins sell 2.4x faster</p>

          <div className="space-y-3 pt-1">
            {trendingHeroes.map((hero) => (
              <div
                key={hero.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-glass-border"
              >
                <div>
                  <p className="text-xs font-bold text-white">{hero.name}</p>
                  <p className="text-[10px] text-brand-gold">{hero.tag}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-purple-400">{hero.popularity}</span>
                  <span className="block text-[9px] text-white/40">Demand</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Heatmap & Gap Analysis Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceHeatmap />

        {/* Actionable Strategy Box */}
        <GlassCard className="p-6 flex flex-col justify-between space-y-4 border-brand-gold/30">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-gold font-bold text-sm">
              <HiOutlineLightBulb className="w-5 h-5" />
              AI Market Gap Recommendation
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Based on buyer search volumes in the last 7 days, there is a <strong>38% supply deficit</strong> for 
              <strong> Mythic Glory accounts with 3+ Collector skins</strong> in the <strong>$75 - $110</strong> price bracket.
            </p>
            <p className="text-xs text-white/50">
              Accounts listed within this range receive an average of 4.8 offers within the first 48 hours of publication.
            </p>
          </div>

          <div className="p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-xl text-xs text-brand-gold flex items-center justify-between">
            <span>Ready to capitalize on this niche?</span>
            <button
              onClick={() => window.location.assign("/sell")}
              className="px-3 py-1 bg-brand-gold text-brand-darker font-bold rounded-lg shadow-sm hover:bg-brand-gold/90"
            >
              List Account Now
            </button>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}

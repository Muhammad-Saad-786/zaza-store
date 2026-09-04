import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineAdjustments,
  HiOutlineDownload,
  HiOutlineLightningBolt,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineTrendingDown,
  HiOutlineRefresh,
} from "react-icons/hi";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import { exportToCSV } from "../../lib/csvExport";
import toast from "react-hot-toast";

export default function SellerAutomation() {
  const {
    listings,
    sellerOrders,
    transactions,
    automationRules,
    toggleAutomationRule,
    addAutomationRule,
  } = useSellerDashboardStore();

  const [scheduledReports, setScheduledReports] = useState({
    dailySummary: true,
    weeklyDigest: true,
    monthlyTax: false,
  });

  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [ruleType, setRuleType] = useState("auto_pricing");
  const [ruleTitle, setRuleTitle] = useState("");

  const handleExportSalesReport = () => {
    const headers = [
      { key: "id", label: "Order ID" },
      { key: "created_at", label: "Date" },
      { key: "amount", label: "Amount ($)" },
      { key: "status", label: "Status" },
    ];
    exportToCSV("sales_report", sellerOrders, headers);
  };

  const handleExportInventory = () => {
    const headers = [
      { key: "id", label: "Listing ID" },
      { key: "title", label: "Title" },
      { key: "rank", label: "Rank" },
      { key: "price", label: "Price ($)" },
      { key: "views", label: "Views" },
      { key: "status", label: "Status" },
    ];
    exportToCSV("inventory_report", listings, headers);
  };

  const handleExportRevenue = () => {
    const headers = [
      { key: "id", label: "Transaction ID" },
      { key: "created_at", label: "Date" },
      { key: "description", label: "Description" },
      { key: "amount", label: "Amount ($)" },
      { key: "status", label: "Status" },
    ];
    exportToCSV("revenue_ledger", transactions, headers);
  };

  const handleCreateRule = (e) => {
    e.preventDefault();
    if (!ruleTitle.trim()) {
      toast.error("Please enter a rule title");
      return;
    }
    addAutomationRule({
      type: ruleType,
      title: ruleTitle,
      enabled: true,
      settings: { createdAt: new Date().toISOString() },
    });
    setRuleTitle("");
    setIsAddRuleOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Automation & Reports Suite
        </h1>
        <p className="text-xs text-white/40 mt-1">
          Rule-based auto-pricing, auto-relisting triggers, and scheduled report downloads.
        </p>
      </div>

      {/* Automation Rules Section */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HiOutlineLightningBolt className="w-5 h-5 text-brand-gold" />
              Automated Business Rules
            </h2>
            <p className="text-xs text-white/40">Auto-execute actions on listings to maximize sales velocity</p>
          </div>
          <Button variant="gold" size="sm" onClick={() => setIsAddRuleOpen(true)}>
            <HiOutlinePlus className="w-4 h-4 mr-1" /> New Rule
          </Button>
        </div>

        {/* Add Rule Form Modal / Inline */}
        {isAddRuleOpen && (
          <form onSubmit={handleCreateRule} className="p-4 bg-white/5 rounded-2xl border border-brand-gold/30 space-y-3">
            <h3 className="text-xs font-bold text-white">Configure Automation Rule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={ruleTitle}
                  onChange={(e) => setRuleTitle(e.target.value)}
                  placeholder="e.g. Drop 5% after 14 days"
                  className="input-glass px-3 py-2 text-xs w-full"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Rule Category</label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value)}
                  className="input-glass px-3 py-2 text-xs w-full bg-brand-dark"
                >
                  <option value="auto_pricing">Auto-Pricing (Price Drop)</option>
                  <option value="auto_relisting">Auto-Relisting (Renew Expiry)</option>
                  <option value="competitor_tracking">Competitor Price Match</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddRuleOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Rule
              </Button>
            </div>
          </form>
        )}

        {/* Rules List */}
        <div className="space-y-3">
          {automationRules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-glass-border flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    rule.enabled ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/30"
                  }`}
                >
                  <HiOutlineAdjustments className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{rule.title}</p>
                  <p className="text-[10px] text-white/40 capitalize">
                    Type: {rule.type.replace(/_/g, " ")} • Status: {rule.enabled ? "Active" : "Paused"}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleAutomationRule(rule.id)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                  rule.enabled ? "bg-brand-gold" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    rule.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Reports & Data Export */}
      <GlassCard className="p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HiOutlineDownload className="w-5 h-5 text-cyber-neon" />
            Instant Data & Report Exports
          </h2>
          <p className="text-xs text-white/40">Download structured CSV spreadsheets for accounting and analysis</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-glass-border flex flex-col justify-between space-y-3">
            <div>
              <p className="text-xs font-bold text-white">Sales & Orders Report</p>
              <p className="text-[10px] text-white/40 mt-0.5">Order IDs, buyer usernames, escrow status, amounts</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleExportSalesReport} className="w-full text-xs">
              <HiOutlineDownload className="w-4 h-4 mr-1" /> Export Sales CSV
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-glass-border flex flex-col justify-between space-y-3">
            <div>
              <p className="text-xs font-bold text-white">Inventory Status Report</p>
              <p className="text-[10px] text-white/40 mt-0.5">Active listings, ranks, prices, view count records</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleExportInventory} className="w-full text-xs">
              <HiOutlineDownload className="w-4 h-4 mr-1" /> Export Inventory CSV
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-glass-border flex flex-col justify-between space-y-3">
            <div>
              <p className="text-xs font-bold text-white">Revenue & Payouts Ledger</p>
              <p className="text-[10px] text-white/40 mt-0.5">Full financial audit ledger including fees & payouts</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleExportRevenue} className="w-full text-xs">
              <HiOutlineDownload className="w-4 h-4 mr-1" /> Export Revenue CSV
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Scheduled Email Reports */}
      <GlassCard className="p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HiOutlineMail className="w-5 h-5 text-purple-400" />
            Scheduled Email Summaries
          </h2>
          <p className="text-xs text-white/40">Receive automated performance snapshots directly in your email</p>
        </div>

        <div className="space-y-3 pt-2">
          {[
            { key: "dailySummary", title: "Daily Sales Summary", desc: "Sent at 23:59 UTC with day's views and orders" },
            { key: "weeklyDigest", title: "Weekly Market & Revenue Digest", desc: "Sent every Monday with rank benchmark changes" },
            { key: "monthlyTax", title: "Monthly Payout & Tax Breakdown", desc: "Sent on 1st of each month with complete statement" },
          ].map((item) => {
            const isChecked = scheduledReports[item.key];
            return (
              <div
                key={item.key}
                onClick={() => {
                  setScheduledReports((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                  toast.success("Notification preferences updated");
                }}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-glass-border flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-white">{item.title}</p>
                  <p className="text-[10px] text-white/40">{item.desc}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                    isChecked ? "bg-brand-gold border-brand-gold text-brand-darker" : "border-white/20 bg-white/5"
                  }`}
                >
                  {isChecked && <HiOutlineCheck className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </motion.div>
  );
}

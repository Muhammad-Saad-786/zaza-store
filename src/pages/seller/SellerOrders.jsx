import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineChevronDown,
} from "react-icons/hi";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import useEscrowStore from "../../stores/useEscrowStore";
import Spinner from "../../components/ui/Spinner";
import OrderDetailModal from "../../components/dashboard/OrderDetailModal";

const orderStatusBadge = {
  pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  completed: "bg-green-500/20 text-green-400 border border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border border-red-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  disputed: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
};

export default function SellerOrders() {
  const {
    sellerOrders,
    sellerOrdersLoading,
    fetchSellerOrders,
    updateOrderStatus,
    deliverCredentials,
  } = useSellerDashboardStore();
  const { verifyPayment } = useEscrowStore();

  const [activeTab, setActiveTab] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleAccept = async (order) => {
    await updateOrderStatus(order.id, "completed", { escrow_status: "awaiting_payment" });
    setIsDetailModalOpen(false);
  };

  const handleReject = async (order) => {
    if (!confirm("Reject this order?")) return;
    await updateOrderStatus(order.id, "cancelled");
    setIsDetailModalOpen(false);
  };

  const handleVerifyPayment = async (orderId) => {
    await verifyPayment(orderId);
    fetchSellerOrders();
    setIsDetailModalOpen(false);
  };

  const filteredOrders = sellerOrders
    .filter((order) => {
      if (activeTab === "pending" && order.status !== "pending") return false;
      if (activeTab === "in_progress" && (order.status !== "in_progress" && order.escrow_status !== "payment_submitted" && order.escrow_status !== "payment_verified")) return false;
      if (activeTab === "completed" && (order.status !== "completed" || (order.escrow_status && order.escrow_status !== "released"))) return false;
      if (activeTab === "cancelled" && order.status !== "cancelled") return false;
      if (activeTab === "disputed" && order.escrow_status !== "disputed" && order.status !== "disputed") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBuyer = order.buyer?.username?.toLowerCase().includes(q);
        const matchTitle = order.account?.title?.toLowerCase().includes(q);
        const matchId = order.id?.toLowerCase().includes(q);
        if (!matchBuyer && !matchTitle && !matchId) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "recent") return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sortOrder === "price_high") return (b.amount || 0) - (a.amount || 0);
      if (sortOrder === "price_low") return (a.amount || 0) - (b.amount || 0);
      return 0;
    });

  if (sellerOrdersLoading && !sellerOrders.length) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Eldorado Header Style */}
      <div className="flex items-center gap-2">
        <span className="text-[#f5a623] text-2xl font-black">︽</span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Sold orders
        </h1>
      </div>

      {/* Filter Toolbar (Pill dropdowns & search) */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="appearance-none bg-[#1f1f29] border border-[#2e2e3e] text-white text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-[#f5a623] cursor-pointer"
          >
            <option value="all">All statuses ({sellerOrders.length})</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress (Escrow)</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="disputed">Disputed</option>
          </select>
          <HiOutlineChevronDown className="w-4 h-4 text-white/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="appearance-none bg-[#1f1f29] border border-[#2e2e3e] text-white text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-[#f5a623] cursor-pointer"
          >
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
          </select>
          <HiOutlineChevronDown className="w-4 h-4 text-white/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by buyer, title, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1f1f29] border border-[#2e2e3e] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#f5a623]"
          />
        </div>

        <button
          onClick={fetchSellerOrders}
          className="ml-auto text-xs font-bold text-[#f5a623] hover:text-white flex items-center gap-1.5 px-3 py-2 bg-[#1f1f29] border border-[#2e2e3e] rounded-xl transition-colors"
        >
          <HiOutlineRefresh className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <img
            src="/empty-orders.png"
            alt="Nothing found"
            className="w-36 h-36 object-contain mb-4"
          />
          <h2 className="text-xl font-black text-white">Nothing found</h2>
          <p className="text-sm text-white/60 mt-1">
            You have no sold orders in this view
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[#1f1f29] border border-[#2e2e3e] hover:border-[#f5a623]/50 rounded-2xl p-5 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Account Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-[#16161e] border border-[#2e2e3e] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {order.account?.images?.[0]?.url ? (
                      <img
                        src={order.account.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🎮</span>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black ${
                          orderStatusBadge[order.status] || "bg-[#16161e] text-white"
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.escrow_status && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#16161e] text-[#f5a623] border border-[#f5a623]/30 font-bold capitalize">
                          Escrow: {order.escrow_status.replace(/_/g, " ")}
                        </span>
                      )}
                      <span className="text-xs text-white/40">
                        Order #{order.id?.slice(0, 8)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white truncate">
                      {order.account?.title || "MLBB Game Account"}
                    </h3>

                    <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                      <span className="text-white/70">
                        Buyer: <strong className="text-white font-bold">{order.buyer?.username || "Guest Buyer"}</strong>
                      </span>
                      <span className="text-white/40">|</span>
                      <span className="text-white/70">
                        Date: {new Date(order.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-white/40">|</span>
                      <span className="text-[#f5a623] font-black text-sm">
                        Payout: ${order.amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-center">
                  <button
                    onClick={() => handleOpenDetail(order)}
                    className="px-4 py-2 bg-[#f5a623] text-[#121217] font-bold text-xs rounded-xl hover:bg-[#e0961f] transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <HiOutlineEye className="w-4 h-4" />
                    <span>Manage Order</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail & Escrow Timeline Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
        onAccept={handleAccept}
        onReject={handleReject}
        onVerifyPayment={handleVerifyPayment}
        onDeliverCredentials={deliverCredentials}
      />
    </motion.div>
  );
}

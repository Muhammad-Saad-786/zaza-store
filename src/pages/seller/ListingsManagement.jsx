import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineTrash,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineChevronDown,
} from "react-icons/hi";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import Spinner from "../../components/ui/Spinner";
import CreateEditListingModal from "../../components/dashboard/CreateEditListingModal";

const statusColors = {
  active: "bg-green-400/20 text-green-400 border border-green-400/30",
  pending: "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30",
  sold: "bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/30",
  hidden: "bg-white/10 text-white/60 border border-white/10",
  draft: "bg-purple-400/20 text-purple-300 border border-purple-400/30",
};

export default function ListingsManagement() {
  const {
    listings,
    listingsLoading,
    fetchListings,
    updateListingStatus,
    deleteListing,
    selectedListingIds,
    toggleSelectListing,
    selectAllListings,
    clearSelectedListings,
    bulkUpdateStatus,
    bulkAdjustPrice,
    bulkDeleteListings,
  } = useSellerDashboardStore();

  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterServer, setFilterServer] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [showPriceAdjustModal, setShowPriceAdjustModal] = useState(false);
  const [priceAdjustType, setPriceAdjustType] = useState("percent");
  const [priceAdjustValue, setPriceAdjustValue] = useState(10);

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings
    .filter((l) => {
      if (filterStatus !== "all" && l.status !== filterStatus) return false;
      if (filterServer !== "all" && l.server !== filterServer) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = l.title?.toLowerCase().includes(query);
        const matchesRank = l.rank?.toLowerCase().includes(query);
        const matchesId = l.id?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesRank && !matchesId) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "views") return (b.views || 0) - (a.views || 0);
      return 0;
    });

  const allFilteredIds = filteredListings.map((l) => l.id);
  const isAllSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.every((id) => selectedListingIds.includes(id));

  const handleEdit = (listing) => {
    setEditingListing(listing);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingListing(null);
    setIsModalOpen(true);
  };

  const handleApplyPriceAdjust = () => {
    bulkAdjustPrice(priceAdjustType, parseFloat(priceAdjustValue));
    setShowPriceAdjustModal(false);
  };

  if (listingsLoading && !listings.length) {
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
      {/* Eldorado Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[#f5a623] text-2xl font-black">︽</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My listings
          </h1>
          <span className="ml-2 px-2.5 py-0.5 rounded-full bg-[#1f1f29] border border-[#2e2e3e] text-white text-xs font-bold">
            {listings.length} total
          </span>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-5 py-2.5 bg-[#f5a623] hover:bg-[#e0961f] text-[#121217] font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md self-start sm:self-auto"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>+ Create New Listing</span>
        </button>
      </div>

      {/* Filter Toolbar (Pill dropdowns) */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status Filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none bg-[#1f1f29] border border-[#2e2e3e] text-white text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-[#f5a623] cursor-pointer"
          >
            <option value="all">All statuses ({listings.length})</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="hidden">Hidden</option>
            <option value="draft">Drafts</option>
          </select>
          <HiOutlineChevronDown className="w-4 h-4 text-white/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Server Filter */}
        <div className="relative">
          <select
            value={filterServer}
            onChange={(e) => setFilterServer(e.target.value)}
            className="appearance-none bg-[#1f1f29] border border-[#2e2e3e] text-white text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-[#f5a623] cursor-pointer"
          >
            <option value="all">All servers</option>
            <option value="Asia / SEA">Asia / SEA</option>
            <option value="Europe">Europe</option>
            <option value="North America">North America</option>
            <option value="Middle East">Middle East</option>
          </select>
          <HiOutlineChevronDown className="w-4 h-4 text-white/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-[#1f1f29] border border-[#2e2e3e] text-white text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-[#f5a623] cursor-pointer"
          >
            <option value="newest">Recent</option>
            <option value="oldest">Oldest</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="views">Most Views</option>
          </select>
          <HiOutlineChevronDown className="w-4 h-4 text-white/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by title, rank, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1f1f29] border border-[#2e2e3e] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#f5a623]"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-[#1f1f29] border border-[#2e2e3e] rounded-xl p-1 ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === "grid" ? "bg-[#f5a623] text-[#121217]" : "text-white"
            }`}
          >
            <HiOutlineViewGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === "list" ? "bg-[#f5a623] text-[#121217]" : "text-white"
            }`}
          >
            <HiOutlineViewList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk Actions Floating Toolbar */}
      <AnimatePresence>
        {selectedListingIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 bg-[#262636] border border-[#f5a623]/40 rounded-xl flex items-center justify-between gap-3 flex-wrap shadow-xl"
          >
            <span className="text-xs font-bold text-white">
              {selectedListingIds.length} listings selected
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => bulkUpdateStatus("active")}
                className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30"
              >
                Set Active
              </button>
              <button
                onClick={() => bulkUpdateStatus("hidden")}
                className="px-3 py-1 rounded-lg bg-[#1f1f29] text-white text-xs font-bold hover:bg-[#16161e]"
              >
                Hide
              </button>
              <button
                onClick={() => setShowPriceAdjustModal(true)}
                className="px-3 py-1 rounded-lg bg-[#f5a623]/20 text-[#f5a623] text-xs font-bold hover:bg-[#f5a623]/30"
              >
                Adjust Price
              </button>
              <button
                onClick={bulkDeleteListings}
                className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30"
              >
                Delete Selected
              </button>
              <button
                onClick={clearSelectedListings}
                className="text-xs text-white/60 hover:text-white ml-2"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listings Render: Grid or List */}
      {filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <img
            src="/empty-orders.png"
            alt="Nothing found"
            className="w-36 h-36 object-contain mb-4"
          />
          <h2 className="text-xl font-black text-white">Nothing found</h2>
          <p className="text-sm text-white/60 mt-1">
            You have no listings matching this filter
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-5 px-6 py-2.5 bg-[#f5a623] text-[#121217] font-black text-xs rounded-xl hover:bg-[#e0961f] transition-all shadow-md"
          >
            + Create New Listing
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map((listing) => {
            const isSelected = selectedListingIds.includes(listing.id);
            const coverImage =
              listing.images?.find((i) => i.is_cover)?.url ||
              listing.images?.[0]?.url;

            return (
              <div
                key={listing.id}
                className={`p-4 rounded-2xl bg-[#1f1f29] border border-[#2e2e3e] flex flex-col justify-between group transition-all relative ${
                  isSelected
                    ? "border-[#f5a623] bg-[#f5a623]/5"
                    : "hover:border-[#f5a623]/50"
                }`}
              >
                {/* Select Checkbox */}
                <div className="absolute top-6 left-6 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectListing(listing.id)}
                    className="w-4 h-4 accent-[#f5a623] rounded cursor-pointer"
                  />
                </div>

                <div>
                  {/* Thumbnail */}
                  <div className="w-full aspect-video rounded-xl bg-[#16161e] border border-[#2e2e3e] overflow-hidden relative mb-3">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🎮
                      </div>
                    )}
                    <span
                      className={`absolute top-2 right-2 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-black tracking-wider ${
                        statusColors[listing.status] || "bg-white/10 text-white"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </div>

                  {/* Info */}
                  <Link
                    to={`/account/${listing.id}`}
                    className="font-bold text-sm text-white hover:text-[#f5a623] line-clamp-1"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-xs text-[#f5a623] font-bold mt-1">
                    {listing.rank} •{" "}
                    <span className="text-white/60">{listing.server}</span>
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-white/70">
                    <span>🦸 {listing.hero_count} Heroes</span>
                    <span>🎨 {listing.skin_count} Skins</span>
                    <span>👁️ {listing.views || 0}</span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2e2e3e]">
                  <span className="text-lg font-black text-[#f5a623]">
                    ${listing.price}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(listing)}
                      className="p-2 rounded-lg text-white hover:text-[#f5a623] hover:bg-[#16161e]"
                      title="Edit"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    {listing.status === "active" ? (
                      <button
                        onClick={() =>
                          updateListingStatus(listing.id, "hidden")
                        }
                        className="p-2 rounded-lg text-white hover:text-yellow-400 hover:bg-[#16161e]"
                        title="Hide"
                      >
                        <HiOutlineEyeOff className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          updateListingStatus(listing.id, "active")
                        }
                        className="p-2 rounded-lg text-white hover:text-green-400 hover:bg-[#16161e]"
                        title="Publish"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Delete this listing?"))
                          deleteListing(listing.id);
                      }}
                      className="p-2 rounded-lg text-white hover:text-red-400 hover:bg-[#16161e]"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-[#1f1f29] border border-[#2e2e3e] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#16161e] text-white/60 border-b border-[#2e2e3e] uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5 pl-4">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={() =>
                        isAllSelected
                          ? clearSelectedListings()
                          : selectAllListings(allFilteredIds)
                      }
                      className="w-4 h-4 accent-[#f5a623] rounded cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Listing</th>
                  <th className="p-3.5">Rank & Specs</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Views</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e2e3e]">
                {filteredListings.map((listing) => {
                  const isSelected = selectedListingIds.includes(listing.id);
                  const coverImage =
                    listing.images?.find((i) => i.is_cover)?.url ||
                    listing.images?.[0]?.url;

                  return (
                    <tr
                      key={listing.id}
                      className={`hover:bg-[#16161e] transition-colors ${
                        isSelected ? "bg-[#f5a623]/10" : ""
                      }`}
                    >
                      <td className="p-3.5 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectListing(listing.id)}
                          className="w-4 h-4 accent-[#f5a623] rounded cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#16161e] border border-[#2e2e3e] overflow-hidden flex-shrink-0">
                            {coverImage ? (
                              <img
                                src={coverImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                🎮
                              </div>
                            )}
                          </div>
                          <Link
                            to={`/account/${listing.id}`}
                            className="font-bold text-white hover:text-[#f5a623] truncate max-w-[200px]"
                          >
                            {listing.title}
                          </Link>
                        </div>
                      </td>
                      <td className="p-3.5 text-white/80">
                        <strong className="text-white">{listing.rank}</strong> •{" "}
                        {listing.server} ({listing.hero_count}H /{" "}
                        {listing.skin_count}S)
                      </td>
                      <td className="p-3.5 font-black text-[#f5a623]">
                        ${listing.price}
                      </td>
                      <td className="p-3.5 text-white/80">
                        {listing.views || 0}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-black ${
                            statusColors[listing.status] ||
                            "bg-white/10 text-white"
                          }`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(listing)}
                            className="p-1.5 text-white hover:text-[#f5a623]"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this listing?"))
                                deleteListing(listing.id);
                            }}
                            className="p-1.5 text-white hover:text-red-400"
                            title="Delete"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Price Adjust Modal */}
      {showPriceAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1f1f29] border border-[#2e2e3e] w-full max-w-sm p-6 rounded-2xl">
            <h3 className="text-base font-black text-white mb-3">
              Bulk Adjust Price
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Apply pricing changes to {selectedListingIds.length} selected
              listings.
            </p>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPriceAdjustType("percent")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl ${
                  priceAdjustType === "percent"
                    ? "bg-[#f5a623] text-[#121217]"
                    : "bg-[#16161e] border border-[#2e2e3e] text-white"
                }`}
              >
                Percentage (%)
              </button>
              <button
                onClick={() => setPriceAdjustType("fixed")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl ${
                  priceAdjustType === "fixed"
                    ? "bg-[#f5a623] text-[#121217]"
                    : "bg-[#16161e] border border-[#2e2e3e] text-white"
                }`}
              >
                Fixed Amount ($)
              </button>
            </div>
            <input
              type="number"
              value={priceAdjustValue}
              onChange={(e) => setPriceAdjustValue(e.target.value)}
              className="w-full bg-[#16161e] border border-[#2e2e3e] text-white text-xs px-3 py-2 rounded-xl mb-4 focus:outline-none focus:border-[#f5a623]"
              placeholder={
                priceAdjustType === "percent"
                  ? "e.g. -10 for 10% discount"
                  : "e.g. 5 to add $5"
              }
            />
            <div className="flex gap-3">
              <button
                onClick={handleApplyPriceAdjust}
                className="flex-1 py-2.5 bg-[#f5a623] text-[#121217] font-black text-xs rounded-xl hover:bg-[#e0961f]"
              >
                Apply
              </button>
              <button
                onClick={() => setShowPriceAdjustModal(false)}
                className="flex-1 py-2.5 bg-[#16161e] text-white font-semibold text-xs rounded-xl border border-[#2e2e3e]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Wizard Modal */}
      <CreateEditListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingListing}
        onSaved={() => fetchListings()}
      />
    </motion.div>
  );
}

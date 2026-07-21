import { HiOutlineViewGrid, HiOutlineViewList } from "react-icons/hi";
import useMarketplaceStore from "../../stores/useMarketplaceStore";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rank", label: "Highest Rank" },
];

export default function SortBar({ viewMode, setViewMode }) {
  const { filters, setFilter, fetchAccounts } = useMarketplaceStore();

  const handleSortChange = (value) => {
    setFilter("sortBy", value);
    setTimeout(() => fetchAccounts(), 100);
  };

  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/40 hidden sm:inline">Sort by:</span>
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="input-glass text-sm py-2 px-3"
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-brand-darker text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg transition-all ${
            viewMode === "grid"
              ? "bg-brand-purple/20 text-brand-purple"
              : "text-white/40 hover:text-white hover:bg-white/5"
          }`}
        >
          <HiOutlineViewGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-lg transition-all ${
            viewMode === "list"
              ? "bg-brand-purple/20 text-brand-purple"
              : "text-white/40 hover:text-white hover:bg-white/5"
          }`}
        >
          <HiOutlineViewList className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

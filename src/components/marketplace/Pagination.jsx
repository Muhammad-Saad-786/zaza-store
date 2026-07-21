import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import useMarketplaceStore from "../../stores/useMarketplaceStore";

export default function Pagination({ currentPage, totalPages }) {
  const { setPage, fetchAccounts } = useMarketplaceStore();

  const handlePageChange = (page) => {
    setPage(page);
    setTimeout(() => fetchAccounts(), 100);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {/* Previous */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 glass-card hover:border-brand-purple/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <HiOutlineChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && handlePageChange(page)}
          disabled={page === "..."}
          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
            page === currentPage
              ? "bg-brand-purple text-white"
              : page === "..."
                ? "text-white/30 cursor-default"
                : "glass-card hover:border-brand-purple/30 text-white/60 hover:text-white"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 glass-card hover:border-brand-purple/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <HiOutlineChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

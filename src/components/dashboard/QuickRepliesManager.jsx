import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineX,
  HiOutlineChatAlt2,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineDuplicate,
} from "react-icons/hi";
import Button from "../ui/Button";
import GlassCard from "../ui/GlassCard";
import useSellerDashboardStore from "../../stores/useSellerDashboardStore";
import toast from "react-hot-toast";

export default function QuickRepliesManager({ isOpen, onClose, onSelectReply }) {
  const { savedReplies, addSavedReply, deleteSavedReply } = useSellerDashboardStore();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [content, setContent] = useState("");

  if (!isOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter both title and response content");
      return;
    }
    addSavedReply(title, content, shortcut || title.toLowerCase().replace(/\s+/g, ""));
    setTitle("");
    setShortcut("");
    setContent("");
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl glass-modal rounded-3xl p-6 sm:p-8 border border-glass-border shadow-2xl relative space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple">
              <HiOutlineChatAlt2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-extrabold text-white">Saved Quick Replies</h2>
              <p className="text-xs text-white/40">1-Click canned responses for fast buyer support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        {!isAdding && (
          <div className="flex justify-end">
            <Button variant="gold" size="sm" onClick={() => setIsAdding(true)}>
              <HiOutlinePlus className="w-4 h-4 mr-1" /> New Quick Reply
            </Button>
          </div>
        )}

        {/* Add Template Form */}
        {isAdding && (
          <form onSubmit={handleCreate} className="p-4 bg-white/5 rounded-2xl space-y-3 border border-brand-purple/30">
            <h3 className="text-sm font-bold text-white">Create Response Template</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Account Delivered"
                  className="input-glass px-3 py-2 text-xs w-full"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Shortcut (optional)</label>
                <input
                  type="text"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  placeholder="e.g. /sent"
                  className="input-glass px-3 py-2 text-xs w-full"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-white/60 block mb-1">Message Body</label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type the message template here..."
                className="input-glass p-3 text-xs w-full resize-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Template
              </Button>
            </div>
          </form>
        )}

        {/* Template List */}
        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {savedReplies.length === 0 ? (
            <p className="text-center py-8 text-white/40 text-xs">No saved replies yet.</p>
          ) : (
            savedReplies.map((reply) => (
              <GlassCard key={reply.id} className="p-3.5 flex items-start justify-between gap-3 hover:border-brand-purple/30 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{reply.title}</span>
                    {reply.shortcut && (
                      <span className="px-1.5 py-0.5 rounded bg-brand-purple/20 text-brand-purple text-[10px] font-mono">
                        {reply.shortcut}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">{reply.content}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {onSelectReply && (
                    <Button
                      variant="gold"
                      size="sm"
                      className="text-xs px-2.5 py-1"
                      onClick={() => {
                        onSelectReply(reply.content);
                        onClose();
                      }}
                    >
                      Use
                    </Button>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(reply.content);
                      toast.success("Copied to clipboard!");
                    }}
                    className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5"
                    title="Copy"
                  >
                    <HiOutlineDuplicate className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSavedReply(reply.id)}
                    className="p-1.5 text-white/40 hover:text-red-400 rounded-lg hover:bg-white/5"
                    title="Delete"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

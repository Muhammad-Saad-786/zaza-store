// src/components/mlbb/MLBBLoginModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineX, HiOutlineShieldCheck } from "react-icons/hi";
import MLBBLogin from "./MLBBLogin";
// Import MLBB logo image
import mlbbLogo from "/mobile-legends.png";

export default function MLBBLoginModal({ isOpen, onClose, onSuccess }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 top-20 bottom-auto mx-auto max-w-md z-50 px-4"
          >
            <div className="relative glass-modal p-6 sm:p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-4 overflow-hidden border border-white/10">
                  <img
                    src={mlbbLogo}
                    alt="Mobile Legends"
                    className="w-14 h-14 object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<span class="text-3xl">🎮</span>';
                    }}
                  />
                </div>
                <h2 className="text-2xl font-bold text-white">MLBB Login</h2>
                <p className="text-white/40 text-sm mt-2">
                  Verify your Mobile Legends account
                </p>
              </div>

              {/* Login Form */}
              <MLBBLogin onClose={onClose} onSuccess={onSuccess} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

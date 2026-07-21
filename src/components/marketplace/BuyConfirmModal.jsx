import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineShieldCheck, HiOutlineX } from "react-icons/hi";
import useOrderStore from "../../stores/useOrderStore.js";
import Button from "../ui/Button";

export default function BuyConfirmModal() {
  const {
    showConfirmModal,
    selectedAccount,
    isProcessing,
    closeBuyConfirm,
    processPurchase,
  } = useOrderStore();

  if (!selectedAccount) return null;

  return (
    <AnimatePresence>
      {showConfirmModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBuyConfirm}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-modal w-full max-w-md p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Confirm Purchase
                </h2>
                <button
                  onClick={closeBuyConfirm}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Account Info */}
              <div className="glass-card p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center text-xl">
                    🎮
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white line-clamp-1">
                      {selectedAccount.title}
                    </h3>
                    <p className="text-xs text-white/40">
                      {selectedAccount.rank}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-glass-border">
                  <span className="text-sm text-white/60">Price</span>
                  <span className="text-xl font-bold text-gradient-gold">
                    ${selectedAccount.price?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Info */}
              <div className="flex items-center gap-3 p-4 bg-cyber-neon/5 border border-cyber-neon/20 rounded-xl mb-6">
                <HiOutlineShieldCheck className="w-6 h-6 text-cyber-neon flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-cyber-neon">
                    Secure Escrow Payment
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Payment is held securely until you confirm the account is as
                    described.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={processPurchase}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Confirm Purchase - $${selectedAccount.price?.toLocaleString()}`
                  )}
                </Button>
                <button
                  onClick={closeBuyConfirm}
                  className="w-full text-center text-sm text-white/40 hover:text-white transition-colors py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

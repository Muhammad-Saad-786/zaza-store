import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HiOutlineShieldCheck, HiOutlineX } from "react-icons/hi";
import useCookieConsent from "../../stores/useCookieConsent";

export default function CookieBanner() {
  const { showBanner, acceptAll, acceptEssential, declineAll } =
    useCookieConsent();

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50"
        >
          <div className="glass-modal p-5 sm:p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🍪</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  We use cookies
                </h3>
                <p className="text-white/50 text-xs mt-1 leading-relaxed">
                  We use essential cookies for authentication and security. Read
                  our{" "}
                  <Link
                    to="/cookies"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={acceptAll}
                className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Accept All
              </button>
              <div className="flex gap-2">
                <button
                  onClick={acceptEssential}
                  className="flex-1 px-4 py-2.5 bg-white/5 text-white/70 rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={declineAll}
                  className="flex-1 px-4 py-2.5 bg-white/5 text-white/50 rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

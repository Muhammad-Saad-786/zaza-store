import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import {
  HiOutlineShieldCheck,
  HiOutlineCog,
  HiOutlineBan,
} from "react-icons/hi";

export default function Cookies() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-2">
            Cookie <span className=" text-purple-600">Policy</span>
          </h1>
          <p className="text-white/40 mb-8">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: HiOutlineShieldCheck,
                title: "Essential Only",
                desc: "We use minimal cookies for core functionality",
                color: "text-green-400",
              },
              {
                icon: HiOutlineCog,
                title: "No Tracking",
                desc: "We don't sell or share your data",
                color: "text-purple-400",
              },
              {
                icon: HiOutlineBan,
                title: "You Control",
                desc: "Disable cookies in browser settings",
                color: "text-amber-400",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <GlassCard className="p-5 text-center">
                  <card.icon className={`w-8 h-8 ${card.color} mx-auto mb-3`} />
                  <h3 className="text-white font-semibold text-sm">
                    {card.title}
                  </h3>
                  <p className="text-white/40 text-xs mt-1">{card.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Policy Sections */}
          <div className="space-y-6">
            {[
              {
                title: "1. What Are Cookies",
                content:
                  "Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences, login status, and improve your browsing experience. Cookies can be 'session' (temporary) or 'persistent' (remain on your device).",
              },
              {
                title: "2. How We Use Cookies",
                content:
                  "ZAZA Store uses only essential cookies for: Authentication (keeping you logged in), Session management (maintaining your browsing session), Security (protecting against fraud), and User preferences (remembering your settings). We do NOT use tracking cookies, advertising cookies, or third-party analytics cookies.",
              },
              {
                title: "3. Types of Cookies We Use",
                content:
                  "Essential/Authentication Cookies: Required for the platform to function. These allow you to log in, stay logged in, and access protected features. Without these cookies, you cannot use ZAZA Store. Session Cookies: Temporary cookies that expire when you close your browser. They help maintain your session state while browsing.",
              },
              {
                title: "4. Third-Party Cookies",
                content:
                  "We use Google OAuth for authentication, which may set its own cookies when you sign in with Google. Supabase, our backend provider, uses essential session cookies for authentication. Codashop API (for player verification) does not set cookies on our site.",
              },
              {
                title: "5. Cookie Duration",
                content:
                  "Authentication cookies persist for the duration of your session or until you log out. 'Remember me' functionality may store a longer-lasting token. Session cookies are deleted when you close your browser. You can manually clear cookies at any time through your browser settings.",
              },
              {
                title: "6. Managing Cookies",
                content:
                  "You can control and delete cookies through your browser settings. Here's how: Chrome: Settings → Privacy → Cookies. Firefox: Options → Privacy & Security → Cookies. Safari: Preferences → Privacy → Cookies. Edge: Settings → Privacy → Cookies. Disabling essential cookies will prevent you from using ZAZA Store.",
              },
              {
                title: "7. Cookie Consent",
                content:
                  "By using ZAZA Store, you consent to the use of essential cookies required for platform functionality. Since we only use essential cookies (no tracking or marketing cookies), we do not require a cookie consent banner under most privacy regulations.",
              },
              {
                title: "8. Changes to Cookie Policy",
                content:
                  "We may update this Cookie Policy from time to time. If we add new types of cookies (especially non-essential ones), we will notify users and obtain consent where required. Continued use of the platform constitutes acceptance of the updated policy.",
              },
              {
                title: "9. Contact Us",
                content:
                  "If you have questions about our Cookie Policy, please contact us through our Discord server or GitHub repository. We're happy to provide more information about our data practices.",
              },
            ].map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.3 }}
              >
                <GlassCard className="p-6">
                  <h2 className="text-lg font-bold text-white mb-3">
                    {section.title}
                  </h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {section.content}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

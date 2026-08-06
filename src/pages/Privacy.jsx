import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";

export default function Privacy() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-2">
            Privacy <span className="text-purple-600">Policy</span>
          </h1>
          <p className="text-white/40 mb-8">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div className="space-y-6">
            {[
              {
                title: "1. Information We Collect",
                content:
                  "We collect information you provide when registering: email address, username, and profile information. If you use Google Sign-In, we receive your Google email and profile picture. We also collect transaction data including purchase history and payment information.",
              },
              {
                title: "2. How We Use Your Information",
                content:
                  "Your information is used to: Create and manage your account, process transactions, facilitate communication between buyers and sellers, provide customer support, improve our platform, and send important notifications about your orders.",
              },
              {
                title: "3. Data Storage & Security",
                content:
                  "Your data is stored securely on Supabase servers with encryption at rest and in transit. We use industry-standard security measures including SSL/TLS encryption, secure authentication tokens, and Row Level Security (RLS) policies.",
              },
              {
                title: "4. Payment Information",
                content:
                  "ZAZA Store does not directly process or store payment card details. All payment processing is handled by our trusted payment partners. We only store transaction records including amount, date, and payment status.",
              },
              {
                title: "5. Cookies",
                content:
                  "We use essential cookies for authentication and session management. We may also use analytics cookies to understand how users interact with our platform. You can disable cookies in your browser settings.",
              },
              {
                title: "6. Third-Party Services",
                content:
                  "We use the following third-party services: Supabase (database & authentication), Google (OAuth authentication), and Codashop API (player verification). Each service has its own privacy policy governing data handling.",
              },
              {
                title: "7. Data Sharing",
                content:
                  "We do not sell your personal information to third parties. Limited information (username, profile picture, verification status) is visible to other users for marketplace functionality. We may share data if required by law.",
              },
              {
                title: "8. Your Rights",
                content:
                  "You have the right to: Access your personal data, request data correction or deletion, export your data, withdraw consent for data processing, and delete your account. Contact us to exercise these rights.",
              },
              {
                title: "9. Data Retention",
                content:
                  "We retain your data as long as your account is active. Upon account deletion, personal information is removed within 30 days. Transaction records may be retained for legal and accounting purposes.",
              },
              {
                title: "10. Changes to Policy",
                content:
                  "We may update this Privacy Policy from time to time. Users will be notified of significant changes via email or platform notification. Continued use of ZAZA Store constitutes acceptance of the updated policy.",
              },
            ].map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
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

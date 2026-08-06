import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";

export default function Terms() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-2">
            Terms of <span className="text-purple-600">Service</span>
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
                title: "1. Acceptance of Terms",
                content:
                  "By accessing or using ZAZA Store, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time without prior notice.",
              },
              {
                title: "2. Account Registration",
                content:
                  "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials. You must be at least 13 years old to use ZAZA Store. One person may only have one account unless explicitly authorized.",
              },
              {
                title: "3. Buying Accounts",
                content:
                  "When you purchase an account through ZAZA Store, you agree to pay the listed price plus any applicable fees. All payments are held in our secure escrow system until you confirm receipt of the account. You have 48 hours to verify the account details and report any discrepancies.",
              },
              {
                title: "4. Selling Accounts",
                content:
                  "Sellers must provide accurate information about their accounts including rank, heroes, skins, and screenshots. Misrepresentation of account details may result in account suspension and forfeiture of payment. Sellers must deliver account credentials within 24 hours of payment confirmation.",
              },
              {
                title: "5. Payment & Escrow",
                content:
                  "All transactions are protected by our escrow system. Payment is held securely until the buyer confirms account delivery. If a dispute arises, our admin team will review evidence from both parties and make a binding decision. Refunds are processed within 3-5 business days.",
              },
              {
                title: "6. Prohibited Activities",
                content:
                  "The following activities are strictly prohibited: Fraudulent listings, selling stolen or hacked accounts, account recovery after sale, harassment of other users, spamming, using bots or automated tools, circumventing security measures, and any illegal activities.",
              },
              {
                title: "7. Account Security",
                content:
                  "Sellers must not attempt to recover sold accounts through game support. Any attempt to reclaim a sold account will result in a permanent ban from ZAZA Store. Buyers should change all account credentials immediately upon receipt.",
              },
              {
                title: "8. Limitation of Liability",
                content:
                  "ZAZA Store acts as a marketplace connecting buyers and sellers. We are not responsible for the actions of individual users. Our maximum liability is limited to the transaction amount. We are not liable for any game account bans imposed by Moonton.",
              },
              {
                title: "9. Termination",
                content:
                  "We reserve the right to suspend or terminate accounts that violate these terms. Users may delete their accounts at any time. Upon termination, completed transactions remain valid, but pending transactions may be cancelled.",
              },
              {
                title: "10. Contact",
                content:
                  "For questions about these Terms of Service, please contact us through our Discord server or GitHub repository.",
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

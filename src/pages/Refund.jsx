import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import {
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

export default function Refund() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-2">
            Refund <span className="text-purple-600">Policy</span>
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
                icon: HiOutlineClock,
                title: "48-Hour Window",
                desc: "Report issues within 48 hours of delivery",
                color: "text-amber-400",
              },
              {
                icon: HiOutlineShieldCheck,
                title: "Escrow Protected",
                desc: "Payment held until you confirm",
                color: "text-green-400",
              },
              {
                icon: HiOutlineExclamationCircle,
                title: "Fair Resolution",
                desc: "Admin reviews all disputes",
                color: "text-purple-400",
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
                title: "1. Our Escrow Protection",
                content:
                  "All payments on ZAZA Store are protected by our escrow system. When you purchase an account, your payment is securely held and NOT released to the seller until you confirm that the account matches the description. This protects you from scams and misrepresentation.",
              },
              {
                title: "2. When You Qualify for a Refund",
                content:
                  "You are eligible for a full refund if: The account details don't match the listing description, the seller fails to deliver account credentials within 24 hours, the account is recovered by the seller after sale, the account gets banned within 7 days of purchase (not due to your actions), or the account rank/heroes/skins are significantly different from what was advertised.",
              },
              {
                title: "3. How to Request a Refund",
                content:
                  "To request a refund: Go to your Orders page, find the completed order, click 'Report Issue', select the appropriate reason, provide evidence (screenshots, chat logs), and submit the dispute. Our admin team will review your case within 48 hours.",
              },
              {
                title: "4. Refund Process Timeline",
                content:
                  "Step 1: File dispute within 48 hours of delivery. Step 2: Admin reviews evidence (24-48 hours). Step 3: If approved, refund is processed. Step 4: Funds return to your original payment method within 3-5 business days.",
              },
              {
                title: "5. What is NOT Eligible for Refund",
                content:
                  "Refunds are not available if: You simply changed your mind after purchase, you violated the game's terms of service causing a ban, you shared account credentials with others, you waited more than 48 hours to report issues, or the account details match the listing description.",
              },
              {
                title: "6. Seller Protection",
                content:
                  "Sellers are also protected. If a buyer falsely claims an issue, we review all evidence including chat logs, delivery proof, and account history. False claims may result in buyer account restrictions.",
              },
              {
                title: "7. Dispute Resolution",
                content:
                  "Our admin team reviews all disputes impartially. We examine: Listing description vs actual account, chat history between buyer and seller, payment proof, delivery confirmation, screenshots from both parties, and account login history. The decision is final and binding.",
              },
              {
                title: "8. Contact for Refund Issues",
                content:
                  "If you have questions about a refund, please contact us through our Discord server or file a support ticket through the dispute system. We aim to resolve all refund requests fairly and quickly.",
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

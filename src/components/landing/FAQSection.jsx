import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqs = [
  {
    question: "How does buying an account work?",
    answer:
      'Browse our marketplace, find the account you love, and click "Buy Now". Payment is held in escrow until you receive and verify the account details. Our secure system ensures a safe transaction for both buyers and sellers.',
  },
  {
    question: "Is it safe to buy MLBB accounts?",
    answer:
      "Yes! ZAZA Store uses secure escrow payments, verifies all sellers, and provides buyer protection. We hold the payment until you confirm the account is as described. All transactions are encrypted and secure.",
  },
  {
    question: "How do I sell my account?",
    answer:
      'Click "Sell Account", fill out the multi-step form with your account details, upload screenshots, and set your price. Our team reviews the listing and publishes it once approved. You get paid once the buyer confirms the account.',
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept credit/debit cards, PayPal, GCash, PayMaya, bank transfers, and various cryptocurrency payments. All payments are processed securely through our payment partners.",
  },
  {
    question: "How long does it take to receive the account?",
    answer:
      "Most accounts are delivered instantly after payment confirmation. The seller will provide all login details, and our system facilitates a smooth handover. In rare cases, it may take up to 24 hours.",
  },
  {
    question: "What if the account is not as described?",
    answer:
      "ZAZA Store offers buyer protection. If the account doesn't match the listing description, you can open a dispute within 48 hours. Our support team will investigate and ensure you get a refund if necessary.",
  },
  {
    question: "Can I get a refund after purchase?",
    answer:
      "Refunds are available within 48 hours if the account doesn't match the description or if there are access issues. Our escrow system protects your payment until you confirm satisfaction.",
  },
  {
    question: "How does seller verification work?",
    answer:
      "Sellers submit identification documents and proof of previous sales. Our team manually reviews each application. Verified sellers get a badge that builds trust with buyers and typically sell accounts faster.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="relative py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="mt-2 text-white/40">
            Everything you need to know about ZAZA Store
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <motion.button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full text-left glass-card p-5 transition-all duration-300 ${
                  openIndex === index
                    ? "border-brand-purple/50 bg-brand-purple/5"
                    : "hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-white pr-8">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
                  >
                    {openIndex === index ? (
                      <FiMinus className="w-4 h-4 text-brand-purple" />
                    ) : (
                      <FiPlus className="w-4 h-4 text-white/50" />
                    )}
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-white/50 leading-relaxed text-sm">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqs = [
  {
    question: "How does buying an MLBB account work?",
    answer:
      "Browse our marketplace, find an account you love, and click 'Buy Now'. Your payment is held securely in escrow until you receive and verify the account details. Once confirmed, the seller gets paid.",
  },
  {
    question: "Is it safe to buy Mobile Legends accounts on ZAZA Store?",
    answer:
      "Absolutely! We use secure escrow payments, verify all sellers, and provide buyer protection. Your money is only released to the seller after you confirm the account is exactly as described.",
  },
  {
    question: "What makes a 'Collector' or 'Legend' skin special?",
    answer:
      "Collector skins are limited-edition premium skins with exclusive effects and animations. Legend skins are the highest tier, featuring complete visual overhauls, unique voice lines, and special recall effects.",
  },
  {
    question: "How do I sell my MLBB account?",
    answer:
      "Click 'Sell Account', fill in your account details including rank, heroes, skins, and upload screenshots. Set your price and publish. Once a buyer purchases, you'll deliver the account and receive payment.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept credit/debit cards, PayPal, GCash, PayMaya, bank transfers, and cryptocurrency payments. All transactions are processed securely through our trusted payment partners.",
  },
  {
    question: "How quickly do I get the account after purchase?",
    answer:
      "Most accounts are delivered instantly after payment confirmation. The seller provides all login details through our secure system. In rare cases, delivery may take up to 24 hours.",
  },
  {
    question: "What if the account doesn't match the description?",
    answer:
      "ZAZA Store offers full buyer protection. If the account doesn't match the listing, open a dispute within 48 hours. Our support team will investigate and ensure you receive a full refund if necessary.",
  },
  {
    question: "Can I resell an account I bought from ZAZA Store?",
    answer:
      "Yes! Once you own the account, you're free to resell it on our platform. Simply create a new listing with the updated account details and screenshots.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="relative py-20 bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-purple-600">
              Questions
            </span>
          </h2>
          <p className="text-white/40 mt-3">
            Everything you need to know about ZAZA Store
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                  openIndex === index
                    ? "border-purple-500/30 bg-purple-500/5"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-white text-sm sm:text-base pr-8">
                    {faq.question}
                  </h3>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      openIndex === index
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {openIndex === index ? (
                      <FiMinus className="w-4 h-4" />
                    ) : (
                      <FiPlus className="w-4 h-4" />
                    )}
                  </div>
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
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

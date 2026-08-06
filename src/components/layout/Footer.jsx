import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineMail, HiOutlineCheck } from "react-icons/hi";
import { FiGithub, FiYoutube } from "react-icons/fi";
import { SiDiscord } from "react-icons/si";
import { useState } from "react";
import toast from "react-hot-toast";
import Logo from "../shared/Logo";

const footerLinks = {
  marketplace: {
    title: "Marketplace",
    links: [
      { label: "Browse Accounts", href: "/marketplace" },
      { label: "Sell Account", href: "/sell" },
      { label: "Player Checker", href: "/player-checker" },
      { label: "Featured Accounts", href: "/marketplace" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Contact Seller", href: "/dashboard/messages" },
      { label: "Report Issue", href: "/dashboard/orders" },
      { label: "Buyer Protection", href: "/#security" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About ZAZA Store", href: "/about" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Trust & Safety", href: "/#trust" },
      { label: "Contact Us", href: "/dashboard/messages" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
};

const socialLinks = [
  {
    icon: SiDiscord,
    href: "https://discord.com/channels/@me/1348013074589945866",
    label: "Discord",
    color:
      "hover:text-[#5865F2] hover:border-[#5865F2]/30 hover:bg-[#5865F2]/10",
  },
  {
    icon: FiGithub,
    href: "https://github.com/Muhammad-Saad-786",
    label: "Github",
    color: "hover:text-white hover:border-white/30 hover:bg-white/10",
  },
  {
    icon: FiYoutube,
    href: "https://www.youtube.com/@zaza-mlbb",
    label: "Youtube",
    color:
      "hover:text-[#FF0000] hover:border-[#FF0000]/30 hover:bg-[#FF0000]/10",
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubscribed(true);
    setEmail("");
    toast.success("Subscribed successfully!");
  };

  return (
    <footer className="relative bg-brand-darker border-t border-glass-border mt-20">
      {/* Gradient Top Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="lg" />
            <p className="mt-4 text-white/40 text-sm leading-relaxed max-w-xs">
              The ultimate marketplace for buying and selling Mobile Legends:
              Bang Bang accounts.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={social.href}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 bg-white/5 border border-glass-border rounded-xl text-white/50 transition-all duration-300 ${social.color}`}
                  title={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="sm:col-span-1">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/40 hover:text-brand-purple transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-glass-border bg-white/[0.01]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
              <p className="text-white/40 text-sm mt-1">
                Get notified about new accounts and exclusive deals.
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex gap-2 w-full sm:w-auto"
            >
              <div className="relative flex-1 sm:flex-none">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-glass pl-10 pr-4 py-2.5 w-full sm:w-64 text-sm"
                  disabled={subscribed}
                />
              </div>
              <button
                type="submit"
                disabled={subscribed}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  subscribed
                    ? "bg-green-500/20 text-green-400 cursor-default"
                    : "bg-brand-purple text-white hover:bg-brand-purple-deep"
                }`}
              >
                {subscribed ? (
                  <>
                    <HiOutlineCheck className="w-4 h-4" />
                    Subscribed
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30 text-center sm:text-left">
            © {new Date().getFullYear()} ZAZA Store. All rights reserved. Not
            affiliated with or endorsed by Moonton.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/terms"
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/refund"
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

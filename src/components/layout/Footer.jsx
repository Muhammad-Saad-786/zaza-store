import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineMail } from "react-icons/hi";
import { FiTwitter, FiGithub, FiYoutube } from "react-icons/fi";
import { SiDiscord } from "react-icons/si";
import Logo from "../shared/Logo";

const footerLinks = {
  marketplace: {
    title: "Marketplace",
    links: [
      { label: "All Accounts", href: "/marketplace" },
      { label: "Featured", href: "/marketplace?filter=featured" },
      { label: "Trending", href: "/marketplace?filter=trending" },
      { label: "New Arrivals", href: "/marketplace?sort=newest" },
      { label: "Premium Sellers", href: "/sellers" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Sell Account", href: "/sell" },
      { label: "Buyer Protection", href: "/buyer-protection" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Partners", href: "/partners" },
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
  { icon: FiTwitter, href: "#", label: "Twitter" },
  { icon: SiDiscord, href: "#", label: "Discord" },
  { icon: FiGithub, href: "#", label: "Github" },
  { icon: FiYoutube, href: "#", label: "Youtube" },
];

export default function Footer() {
  return (
    <footer className="relative bg-brand-darker border-t border-glass-border mt-20">
      {/* Gradient Top Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo size="lg" />
            <p className="mt-6 text-white/50 text-sm leading-relaxed max-w-sm">
              The ultimate marketplace for buying and selling Mobile Legends:
              Bang Bang accounts. Secure transactions, verified sellers, and the
              best deals in the Land of Dawn.
            </p>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="text-sm font-medium text-white/70 mb-3">
                Subscribe to our newsletter
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input-glass pl-10 pr-4 py-2.5 w-full text-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 bg-brand-purple text-white rounded-xl font-medium text-sm hover:bg-brand-purple-deep transition-colors"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-8">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 bg-white/5 border border-glass-border rounded-xl text-white/50 hover:text-white hover:border-brand-purple/30 hover:bg-brand-purple/10 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
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

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} ZAZA Store. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/terms"
              className="text-sm text-white/30 hover:text-white/50 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-white/30 hover:text-white/50 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/cookies"
              className="text-sm text-white/30 hover:text-white/50 transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

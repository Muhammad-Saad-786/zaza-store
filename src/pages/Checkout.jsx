// src/pages/Checkout.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineRefresh,
  HiOutlineArrowLeft,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import useOrderStore from "../stores/useOrderStore";
import useAuthStore from "../stores/useAuthStore";
import { supabase } from "../lib/supabase";
import Button from "../components/ui/Button";
import SEO from "../components/ui/SEO";
import toast from "react-hot-toast";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    selectedAccount,
    isProcessing,
    processPurchase,
    setSelectedAccount,
    clearSelectedAccount,
  } = useOrderStore();
  const { user, profile } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [accountImage, setAccountImage] = useState(null);

  useEffect(() => {
    async function loadAccount() {
      const accountFromState = location.state?.account;
      let targetAccount = accountFromState || selectedAccount;

      if (!targetAccount) {
        navigate("/marketplace");
        return;
      }

      // Check if image exists in targetAccount
      let img =
        targetAccount.images?.[0]?.url ||
        (typeof targetAccount.images?.[0] === "string" ? targetAccount.images[0] : null) ||
        targetAccount.image_urls?.[0] ||
        targetAccount.image_url ||
        targetAccount.image ||
        targetAccount.main_image;

      // If no image found, fetch directly from account_images table
      if (!img && targetAccount.id) {
        try {
          const { data: dbImages } = await supabase
            .from("account_images")
            .select("url, is_cover")
            .eq("account_id", targetAccount.id)
            .order("sort_order", { ascending: true })
            .limit(1);

          if (dbImages && dbImages.length > 0) {
            img = dbImages[0].url;
            targetAccount = {
              ...targetAccount,
              images: dbImages,
            };
          }
        } catch (err) {
          console.warn("Failed to fetch image in checkout:", err);
        }
      }

      if (img) {
        setAccountImage(img);
      }
      setSelectedAccount(targetAccount);
    }

    loadAccount();
  }, [location.state]);

  if (!selectedAccount) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-white">
            No account selected
          </h2>
          <p className="text-white/40 mt-2">
            Please select an account to purchase
          </p>
          <Link to="/marketplace" className="inline-block mt-4">
            <Button variant="primary">Browse Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmPurchase = async () => {
    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (paymentMethod === "card") {
      try {
        setLocalProcessing(true);

        // Step 1: Create the order first
        const orderResult = await processPurchase("card");

        if (!orderResult.success) {
          return;
        }

        // Step 2: Now create Stripe checkout with the order ID
        const { data, error } = await supabase.functions.invoke(
          "create-checkout",
          {
            body: {
              order_id: orderResult.orderId,  // Send order_id, not account_id
            },
          },
        );

        if (error || !data?.checkout_url) {
          console.error("Stripe checkout error:", error, data);
          toast.error(data?.error || error?.message || "Failed to initiate payment");
          return;
        }

        // Step 3: Redirect to Stripe
        window.location.href = data.checkout_url;
      } catch (error) {
        console.error("Checkout error:", error);
        toast.error(error.message || "Failed to process payment");
      } finally {
        setLocalProcessing(false);
      }
    } else {
      // Bank transfer flow
      const result = await processPurchase(paymentMethod);
      if (result.success) {
        navigate(`/order-confirmation/${result.orderId}`);
      }
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      <SEO title="Checkout" description="Secure checkout" noindex={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => {
            clearSelectedAccount();
            navigate(-1);
          }}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content - Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Summary */}
            <div className="bg-[#1f1f29] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <HiOutlineShoppingBag className="w-5 h-5 text-brand-purple" />
                Order Summary
              </h2>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                  {(() => {
                    // Try all possible image sources
                    const imageUrl =
                      accountImage ||
                      selectedAccount.images?.[0]?.url ||
                      selectedAccount.images?.[0] ||
                      selectedAccount.image_urls?.[0] ||
                      selectedAccount.image_url ||
                      selectedAccount.image ||
                      selectedAccount.main_image ||
                      (typeof selectedAccount.images === "string" &&
                        selectedAccount.images.startsWith("http")
                        ? selectedAccount.images
                        : null);

                    console.log("Checkout image URL:", imageUrl);

                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={selectedAccount.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log("Image failed to load:", imageUrl);
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<span className="text-2xl">🎮</span>';
                        }}
                      />
                    ) : (
                      <span>🎮</span>
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white line-clamp-2">
                    {selectedAccount.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-brand-gold font-medium">
                      {selectedAccount.rank}
                    </span>
                    <span className="text-xs text-white/40">
                      {selectedAccount.hero_count} Heroes
                    </span>
                    <span className="text-xs text-white/40">
                      {selectedAccount.skin_count} Skins
                    </span>
                  </div>
                  {selectedAccount.seller?.verified_seller && (
                    <div className="flex items-center gap-1 mt-2">
                      <HiOutlineShieldCheck className="w-4 h-4 text-cyber-neon" />
                      <span className="text-xs text-cyber-neon">
                        Verified Seller
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  to={`/account/${selectedAccount.id}`}
                  className="text-xs text-brand-purple hover:text-brand-gold transition-colors"
                >
                  View
                </Link>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-[#1f1f29] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <HiOutlineCreditCard className="w-5 h-5 text-brand-purple" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${paymentMethod === "card"
                      ? "border-brand-purple bg-brand-purple/10"
                      : "border-white/10 bg-black/30 hover:border-white/20"
                    }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <HiOutlineCreditCard className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">
                      Credit / Debit Card
                    </p>
                    <p className="text-xs text-white/40">
                      Visa, Mastercard, JazzCash, Easypaisa
                    </p>
                  </div>
                  {paymentMethod === "card" && (
                    <HiOutlineCheckCircle className="w-5 h-5 text-brand-purple" />
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod("bank")}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${paymentMethod === "bank"
                      ? "border-brand-purple bg-brand-purple/10"
                      : "border-white/10 bg-black/30 hover:border-white/20"
                    }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <HiOutlineLockClosed className="w-5 h-5 text-white/60" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">
                      Bank Transfer
                    </p>
                    <p className="text-xs text-white/40">Direct bank deposit</p>
                  </div>
                  {paymentMethod === "bank" && (
                    <HiOutlineCheckCircle className="w-5 h-5 text-brand-purple" />
                  )}
                </button>
              </div>
            </div>

            {/* Buyer Information */}
            <div className="bg-[#1f1f29] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Buyer Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={profile?.email || user?.email || ""}
                      readOnly
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-black/30 border border-white/10 text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={profile?.username || ""}
                      readOnly
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-black/30 border border-white/10 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-white/40 mt-3">
                Account details will be delivered to this email after payment
                confirmation.
              </p>
            </div>
          </div>

          {/* Order Summary - Right */}
          <div className="space-y-6">
            <div className="bg-[#1f1f29] border border-white/5 rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">
                Payment Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Account Price</span>
                  <span className="text-sm font-semibold text-white">
                    ${selectedAccount.price?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Service Fee</span>
                  <span className="text-sm font-semibold text-green-400">
                    Free
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">
                    Escrow Protection
                  </span>
                  <span className="text-sm font-semibold text-cyber-neon">
                    Included
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-white">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-gradient-gold">
                    ${selectedAccount.price?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <HiOutlineShieldCheck className="w-4 h-4 text-cyber-neon" />
                  Secure Escrow Payment
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <HiOutlineRefresh className="w-4 h-4 text-green-400" />
                  7-Day Replacement Guarantee
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <HiOutlineLockClosed className="w-4 h-4 text-brand-purple" />
                  256-bit SSL Encryption
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/10 bg-black/30 text-brand-purple focus:ring-brand-purple"
                />
                <label className="text-xs text-white/50">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-brand-purple hover:text-brand-gold"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/refund"
                    className="text-brand-purple hover:text-brand-gold"
                  >
                    Refund Policy
                  </Link>
                </label>
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handleConfirmPurchase}
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isProcessing || localProcessing || !agreeToTerms}
              >
                {isProcessing || localProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <HiOutlineLockClosed className="w-4 h-4" />
                    Confirm & Pay
                  </div>
                )}
              </Button>

              <p className="text-center text-xs text-white/30 mt-3">
                By confirming, you agree to the secure escrow process
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

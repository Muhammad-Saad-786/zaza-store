import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineUpload,
  HiOutlineX,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { supabase } from "../../lib/supabase";
import usePaymentStore from "../../stores/usePaymentStore";

const bankLogos = {
  easypaisa: "/Easypaisa.png",
  jazzcash: "/Jazzcash.png",
  bank_transfer: "/Bank.png",
  sada_pay: "/Sadapay.png",
  naya_pay: "/Nayapay.png",
  paypal: "/Paypal.png",
  binance: "/Binance.png",
  skrill: "/Skrill.png",
};

const paymentRegions = [
  {
    id: "pakistan",
    label: "🇵🇰 Pakistan",
    methods: ["easypaisa", "jazzcash", "sada_pay", "naya_pay", "bank_transfer"],
  },
  {
    id: "international",
    label: "🌍 International",
    methods: ["paypal", "binance", "skrill", "bank_transfer"],
  },
];

export default function PaymentModal() {
  const {
    showPaymentModal,
    selectedOrder,
    loading,
    closePaymentModal,
    submitPaymentProof,
  } = usePaymentStore();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [activeRegion, setActiveRegion] = useState("pakistan");
  const [step, setStep] = useState(1);
  const [sellerDetails, setSellerDetails] = useState(null);

  const filteredMethods =
    paymentRegions.find((r) => r.id === activeRegion)?.methods || [];

  // Fetch seller payment details
  useEffect(() => {
    if (selectedOrder?.seller_id) {
      fetchSellerDetails();
    }
  }, [selectedOrder?.seller_id]);

  const fetchSellerDetails = async () => {
    const { data } = await supabase
      .from("profiles")
      .select(
        "username, avatar_url, easypaisa_number, jazzcash_number, bank_name, bank_account, bank_title, sadapay_id, nayapay_id, paypal_email, binance_usdt, skrill_email",
      )
      .eq("id", selectedOrder.seller_id)
      .single();
    setSellerDetails(data);
  };

  const getPaymentDetails = (method) => {
    if (!sellerDetails) return "Loading seller details...";
    switch (method) {
      case "easypaisa":
        return `Easypaisa: ${sellerDetails.easypaisa_number || "Not set"}`;
      case "jazzcash":
        return `JazzCash: ${sellerDetails.jazzcash_number || "Not set"}`;
      case "sada_pay":
        return `SadaPay: ${sellerDetails.sadapay_id || "Not set"}`;
      case "naya_pay":
        return `NayaPay: ${sellerDetails.nayapay_id || "Not set"}`;
      case "bank_transfer":
        return `Bank: ${sellerDetails.bank_name || "Not set"}\nAccount: ${sellerDetails.bank_account || "Not set"}\nTitle: ${sellerDetails.bank_title || "Not set"}`;
      case "paypal":
        return `PayPal: ${sellerDetails.paypal_email || "Not set"}`;
      case "binance":
        return `USDT (TRC20): ${sellerDetails.binance_usdt || "Not set"}`;
      case "skrill":
        return `Skrill: ${sellerDetails.skrill_email || "Not set"}`;
      default:
        return "Select a payment method";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    if (!proofFile) {
      alert("Please upload payment proof");
      return;
    }
    submitPaymentProof(selectedOrder.id, paymentMethod, proofFile);
  };

  const handleClose = () => {
    setPaymentMethod("");
    setProofFile(null);
    setProofPreview(null);
    setStep(1);
    setActiveRegion("pakistan");
    closePaymentModal();
  };

  return (
    <AnimatePresence>
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-modal w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black/90 backdrop-blur-xl p-6 pb-4 border-b border-white/5 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Complete Payment
                  </h2>
                  <p className="text-white/40 text-xs mt-0.5">
                    Step {step} of 3
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-white/40 hover:text-white"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${s <= step ? "bg-purple-500 text-white" : "bg-white/5 text-white/30"}`}
                    >
                      {s < step ? "✓" : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`flex-1 h-0.5 ${s < step ? "bg-purple-500" : "bg-white/10"}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Account Summary with Image */}
              <div className="glass-card p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500/20 to-amber-500/20">
                    {selectedOrder.account?.images?.[0]?.url ? (
                      <img
                        src={selectedOrder.account.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        🎮
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {selectedOrder.account?.title || selectedOrder.title}
                    </p>
                    <p className="text-xs text-white/40">
                      {selectedOrder.account?.rank || selectedOrder.rank}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      Seller: {sellerDetails?.username || "Loading..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-white/50 text-sm">Amount</span>
                  <span className="text-xl font-bold text-amber-400">
                    ${selectedOrder.amount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Step 1: Choose Method */}
              {step === 1 && (
                <>
                  <div className="flex gap-2 mb-4">
                    {paymentRegions.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => setActiveRegion(region.id)}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          activeRegion === region.id
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-white/5 text-white/50 border border-transparent hover:bg-white/10"
                        }`}
                      >
                        {region.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {filteredMethods.map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          setPaymentMethod(method);
                          setStep(2);
                        }}
                        className={`p-4 rounded-xl text-left transition-all border ${
                          paymentMethod === method
                            ? "bg-purple-500/10 border-purple-500/30"
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        }`}
                      >
                        <img
                          src={bankLogos[method]}
                          alt=""
                          className="w-10 h-10 object-contain mb-2"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                        <p className="text-sm font-medium text-white capitalize">
                          {method.replace(/_/g, " ")}
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 2: Payment Details */}
              {step === 2 && (
                <>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-white/40 hover:text-white mb-4"
                  >
                    ← Back
                  </button>

                  <div className="p-5 rounded-xl border border-purple-500/20 bg-purple-500/5">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={bankLogos[paymentMethod]}
                        alt=""
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <p className="text-lg font-bold text-white capitalize">
                        {paymentMethod.replace(/_/g, " ")}
                      </p>
                    </div>

                    <div className="p-4 bg-black/30 rounded-xl">
                      <p className="text-white/70 text-sm whitespace-pre-line font-mono">
                        {getPaymentDetails(paymentMethod)}
                      </p>
                    </div>

                    <div className="flex items-start gap-3 mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 text-xs font-medium">
                          Send exact amount
                        </p>
                        <p className="text-yellow-400/60 text-xs mt-0.5">
                          Send{" "}
                          <strong>
                            ${selectedOrder.amount?.toLocaleString()}
                          </strong>{" "}
                          to the seller's details above.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    className="w-full mt-4 px-4 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600"
                  >
                    I've Sent Payment - Upload Proof
                  </button>
                </>
              )}

              {/* Step 3: Upload Proof */}
              {step === 3 && (
                <>
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-white/40 hover:text-white mb-4"
                  >
                    ← Back
                  </button>

                  <div className="flex items-center gap-2 mb-4 p-3 bg-white/[0.02] rounded-xl">
                    <img
                      src={bankLogos[paymentMethod]}
                      alt=""
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-white/70 text-sm capitalize">
                      {paymentMethod.replace(/_/g, " ")}
                    </span>
                    <span className="text-amber-400 text-sm font-semibold ml-auto">
                      ${selectedOrder.amount?.toLocaleString()}
                    </span>
                  </div>

                  <label className="block text-sm text-white/60 mb-2">
                    Upload Payment Screenshot
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="payment-proof"
                  />
                  <label
                    htmlFor="payment-proof"
                    className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-purple-500/30 transition-all"
                  >
                    {proofPreview ? (
                      <div className="relative w-full">
                        <img
                          src={proofPreview}
                          alt="Proof"
                          className="max-h-48 rounded-lg object-contain mx-auto"
                        />
                        <p className="text-white/30 text-xs text-center mt-2">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                          <HiOutlineUpload className="w-7 h-7 text-purple-400" />
                        </div>
                        <p className="text-white/50 text-sm">
                          Click to upload screenshot
                        </p>
                      </>
                    )}
                  </label>

                  <div className="flex items-center gap-2 mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <HiOutlineShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 text-xs">
                      Payment held in escrow until you confirm delivery.
                    </p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !proofFile}
                    className="w-full mt-4 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        <HiOutlineShieldCheck className="w-5 h-5" /> Submit
                        Payment Proof
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

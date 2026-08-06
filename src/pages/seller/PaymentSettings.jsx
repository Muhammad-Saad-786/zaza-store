import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const paymentFields = [
  {
    key: "easypaisa_number",
    label: "Easypaisa Number",
    icon: "/Easypaisa.png",
    placeholder: "03XX-XXXXXXX",
  },
  {
    key: "jazzcash_number",
    label: "JazzCash Number",
    icon: "/Jazzcash.png",
    placeholder: "03XX-XXXXXXX",
  },
  {
    key: "sadapay_id",
    label: "SadaPay ID",
    icon: "/Sadapay.png",
    placeholder: "@yourname",
  },
  {
    key: "nayapay_id",
    label: "NayaPay ID",
    icon: "/NayaPay.png",
    placeholder: "@yourname",
  },
  {
    key: "bank_name",
    label: "Bank Name",
    icon: "/Bank.png",
    placeholder: "Meezan Bank",
  },
  {
    key: "bank_account",
    label: "Bank Account Number",
    icon: "/Bank.png",
    placeholder: "1234567890",
  },
  {
    key: "bank_title",
    label: "Bank Account Title",
    icon: "/banks/bank.png",
    placeholder: "Muhammad Saad",
  },
  {
    key: "paypal_email",
    label: "PayPal Email",
    icon: "/Paypal.png",
    placeholder: "seller@email.com",
  },
  {
    key: "binance_usdt",
    label: "Binance USDT (TRC20)",
    icon: "/Binance.png",
    placeholder: "TXxxxx...xxxx",
  },
  {
    key: "skrill_email",
    label: "Skrill Email",
    icon: "/Skrill.png",
    placeholder: "seller@email.com",
  },
];

export default function PaymentSettings() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const fetchPaymentDetails = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) {
      const paymentData = {};
      paymentFields.forEach((f) => {
        paymentData[f.key] = data[f.key] || "";
      });
      setFormData(paymentData);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(formData)
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Payment details saved!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Payment Settings
      </h1>
      <p className="text-white/40 text-sm">
        Add your payment details so buyers can send payments to you.
      </p>

      <GlassCard className="p-6">
        <div className="space-y-4">
          {paymentFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-white/60 mb-2">
                {field.label}
              </label>
              <input
                type="text"
                value={formData[field.key] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.key]: e.target.value })
                }
                placeholder={field.placeholder}
                className="input-glass w-full px-3"
              />
            </div>
          ))}
        </div>
        <Button
          onClick={handleSave}
          variant="gold"
          className="mt-6"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Payment Details"}
        </Button>
      </GlassCard>
    </motion.div>
  );
}

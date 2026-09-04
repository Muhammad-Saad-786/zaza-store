import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  HiOutlineCamera,
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineDeviceMobile,
} from "react-icons/hi";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";

export default function SellerSettings() {
  const { profile, updateProfile, uploadAvatar, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security' | 'preferences'
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    profile?.two_factor_enabled || false,
  );

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      username: profile?.username || "",
      bio: profile?.bio || "",
      region: profile?.region || "Asia / SEA",
      phone: profile?.phone || "",
      social_discord: profile?.social_discord || "",
      social_whatsapp: profile?.social_whatsapp || "",
      social_telegram: profile?.social_telegram || "",
      social_instagram: profile?.social_instagram || "",
      default_currency: profile?.default_currency || "USD",
      timezone: profile?.timezone || "UTC+5",
    },
  });

  useEffect(() => {
    if (profile) {
      setValue("username", profile.username || "");
      setValue("bio", profile.bio || "");
      setValue("region", profile.region || "Asia / SEA");
      setValue("phone", profile.phone || "");
      setValue("social_discord", profile.social_discord || "");
      setValue("social_whatsapp", profile.social_whatsapp || "");
      setValue("social_telegram", profile.social_telegram || "");
      setValue("social_instagram", profile.social_instagram || "");
    }
  }, [profile]);

  const onSaveProfile = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      toast.success("Seller profile settings updated!");
    } else {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadAvatar(file);
    setIsUploading(false);

    if (result.success) {
      toast.success("Profile avatar updated!");
    } else {
      toast.error("Failed to upload avatar");
    }
  };

  const handleToggle2FA = async () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    await updateProfile({ two_factor_enabled: nextVal });
    toast.success(
      nextVal ? "2-Factor Authentication Enabled!" : "2FA Disabled",
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl pb-12"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">
          Profile & Store Settings
        </h1>
        <p className="text-xs text-white/40 mt-1">
          Customize your public seller storefront, configure store security, and
          manage preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-glass-border pb-3">
        {[
          { id: "profile", label: "Public Profile & Storefront" },
          { id: "security", label: "Security & 2FA" },
          { id: "preferences", label: "Regional & Notifications" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-brand-gold text-brand-darker font-bold shadow-md"
                : "bg-white/5 text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. PUBLIC PROFILE TAB */}
      {activeTab === "profile" && (
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-6">
          {/* Avatar & Storefront Banner */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Storefront Branding
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile?.username?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-7 h-7 bg-brand-gold text-brand-darker rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <HiOutlineCamera className="w-4 h-4 font-bold" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  {profile?.username}
                </p>
                <p className="text-xs text-white/40">{profile?.email}</p>
                {user?.id && (
                  <a
                    href={`/seller/${user.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-gold hover:underline mt-1 font-semibold"
                  >
                    <HiOutlineEye className="w-3.5 h-3.5" /> View Public
                    Storefront Profile
                  </a>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Bio & Details */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Seller Bio & Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Display Username
                </label>
                <input
                  {...register("username")}
                  className="input-glass px-3.5 py-2.5 text-xs w-full"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Contact Phone / WhatsApp
                </label>
                <input
                  {...register("phone")}
                  placeholder="+92 300 1234567"
                  className="input-glass px-3.5 py-2.5 text-xs w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1">
                Store Tagline / Bio
              </label>
              <textarea
                {...register("bio")}
                rows={3}
                placeholder="Describe your account inventory, verified trade history, and delivery speeds..."
                className="input-glass p-3 text-xs w-full resize-none"
              />
            </div>

            {/* Social Links */}
            <h3 className="text-xs font-bold text-white/60 pt-2">
              Social & Direct Contacts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-white/50 block mb-1">
                  Discord Tag / Server
                </label>
                <input
                  {...register("social_discord")}
                  placeholder="username#0000 or invite"
                  className="input-glass px-3 py-2 text-xs w-full"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/50 block mb-1">
                  Telegram Username
                </label>
                <input
                  {...register("social_telegram")}
                  placeholder="@username"
                  className="input-glass px-3 py-2 text-xs w-full"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-glass-border flex justify-end">
              <Button type="submit" variant="gold" size="sm">
                Save Profile Settings
              </Button>
            </div>
          </GlassCard>
        </form>
      )}

      {/* 2. SECURITY & 2FA TAB */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-5 h-5 text-brand-gold" />
                  Two-Factor Authentication (2FA)
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Protect payout requests and account credential dispatches
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggle2FA}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                  twoFactorEnabled ? "bg-green-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <HiOutlineDeviceMobile className="w-5 h-5 text-cyber-neon" />
              Active Sessions & Devices
            </h2>
            <div className="p-3 bg-white/[0.02] border border-glass-border rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  Current Browser Session (Windows • Chrome)
                </p>
                <p className="text-[10px] text-green-400">
                  ● Active now • IP: 103.255.***.***
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">
                This Device
              </span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* 3. REGIONAL & PREFERENCES TAB */}
      {activeTab === "preferences" && (
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Store Localization
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Default Display Currency
                </label>
                <select
                  {...register("default_currency")}
                  className="input-glass px-3 py-2.5 text-xs w-full bg-brand-dark"
                >
                  <option value="USD">USD ($ - United States Dollar)</option>
                  <option value="PKR">PKR (Rs - Pakistani Rupee)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Timezone
                </label>
                <select
                  {...register("timezone")}
                  className="input-glass px-3 py-2.5 text-xs w-full bg-brand-dark"
                >
                  <option value="UTC+5">UTC+5 (Pakistan Standard Time)</option>
                  <option value="UTC+0">UTC+0 (Greenwich Mean Time)</option>
                  <option value="UTC+8">UTC+8 (Singapore / Manila Time)</option>
                  <option value="UTC-5">UTC-5 (Eastern Standard Time)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-glass-border flex justify-end">
              <Button type="submit" variant="gold" size="sm">
                Save Preferences
              </Button>
            </div>
          </GlassCard>
        </form>
      )}
    </motion.div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineGlobe,
  HiOutlineCamera,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";

export default function ProfileSettings() {
  const { profile, updateProfile, uploadAvatar } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: profile?.username || "",
      bio: profile?.bio || "",
      region: profile?.region || "",
      phone: profile?.phone || "",
    },
  });

  const onSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      toast.success("Profile updated!");
    } else {
      toast.error(result.error || "Failed to update profile");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadAvatar(file);
    setIsUploading(false);

    if (result.success) {
      toast.success("Avatar updated!");
    } else {
      toast.error(result.error || "Failed to upload avatar");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-6"
    >
      <h1 className="text-2xl font-display font-extrabold text-white">
        Profile Settings
      </h1>

      {/* Avatar */}
      <GlassCard className="p-8">
        <h2 className="text-lg font-semibold text-white mb-4">Avatar</h2>
        <div className="flex items-center gap-8">
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
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-purple rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-purple-deep transition-colors">
              <HiOutlineCamera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-white font-medium">{profile?.username}</p>
            <p className="text-white/40 text-sm">{profile?.email}</p>
            {isUploading && (
              <p className="text-brand-purple text-sm mt-1">Uploading...</p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Profile Form */}
      <GlassCard className="p-8">
        <h2 className="text-lg font-semibold text-white mb-8">
          Personal Information
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/70">
              Username
            </label>

            <div className="relative">
              <HiOutlineUser className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />

              <input
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
                placeholder="Enter username"
                className="input-glass h-14 w-full pl-14 pr-5"
              />
            </div>

            {errors.username && (
              <p className="text-sm text-red-400">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/70">
              Email
            </label>

            <div className="relative">
              <HiOutlineMail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />

              <input
                value={profile?.email || ""}
                disabled
                className="input-glass h-14 w-full pl-14 pr-5 opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Region */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/70">
              Region
            </label>

            <div className="relative">
              <HiOutlineGlobe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />

              <select
                {...register("region")}
                className="input-glass h-14 w-full pl-14 pr-10 appearance-none bg-transparent text-white"
              >
                <option value="" className="bg-[#111827] text-white">
                  Select Country
                </option>
                <option value="SEA" className="bg-[#111827] text-white">
                  Pakistan
                </option>

                <option value="EU" className="bg-[#111827] text-white">
                  Europe
                </option>
                <option value="NA" className="bg-[#111827] text-white">
                  North America
                </option>
                <option value="MENA" className="bg-[#111827] text-white">
                  Middle East & North Africa
                </option>
                <option value="SA" className="bg-[#111827] text-white">
                  Other Countries
                </option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/70">
              Phone
            </label>

            <input
              {...register("phone")}
              placeholder="+92 300 1234567"
              className="input-glass h-14 w-full px-5"
            />
          </div>

          {/* Bio */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/70">
              Bio
            </label>

            <textarea
              {...register("bio")}
              rows={4}
              placeholder="Tell buyers about yourself..."
              className="input-glass min-h-[120px] w-full px-5 py-4 resize-none"
            />
          </div>
          {/* Role Switcher */}
          <GlassCard className="p-6 mt-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Account Type
            </h2>
            <p className="text-white/40 text-sm mb-4">
              Switch between buyer and seller mode. Your data is preserved.
            </p>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  const result = await updateProfile({ role: "buyer" });
                  if (result.success) toast.success("Switched to Buyer");
                }}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  profile?.role === "buyer"
                    ? "border-brand-purple bg-brand-purple/10 text-white"
                    : "border-glass-border text-white/50 hover:border-white/20"
                }`}
              >
                <HiOutlineShoppingBag className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Buyer</span>
              </button>

              <button
                onClick={async () => {
                  const result = await updateProfile({ role: "seller" });
                  if (result.success) toast.success("Switched to Seller");
                }}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  profile?.role === "seller"
                    ? "border-brand-gold bg-brand-gold/10 text-white"
                    : "border-glass-border text-white/50 hover:border-white/20"
                }`}
              >
                <HiOutlineCurrencyDollar className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Seller</span>
              </button>
            </div>
          </GlassCard>

          {/* Save Button */}
          <div className="pt-6 border-t border-white/10">
            <Button type="submit" variant="primary" className="h-12 px-8">
              Save Changes
            </Button>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
}

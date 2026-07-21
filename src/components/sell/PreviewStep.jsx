import { motion } from "framer-motion";
import { HiOutlineShieldCheck } from "react-icons/hi";
import useSellAccountStore from "../../stores/useSellAccountStore";
import useAuthStore from "../../stores/useAuthStore";
import GlassCard from "../ui/GlassCard";

export default function PreviewStep() {
  const { formData } = useSellAccountStore();
  const { profile } = useAuthStore();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Preview Your Listing</h2>
      <p className="text-white/40 text-sm">
        Review how your listing will appear to buyers.
      </p>

      <GlassCard className="p-6">
        {/* Images */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {formData.images.length > 0 ? (
            formData.images.slice(0, 3).map((img, i) => (
              <div
                key={i}
                className="aspect-[16/10] rounded-xl overflow-hidden bg-white/5"
              >
                <img
                  src={img.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 aspect-[16/6] rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-gold/10 flex items-center justify-center">
              <p className="text-white/30">No images uploaded</p>
            </div>
          )}
        </div>

        {/* Title & Price */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              {formData.title || "Untitled Listing"}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-brand-purple">
                {formData.rank || "No rank"}
              </span>
              {formData.server && (
                <span className="text-xs text-white/30">
                  • {formData.server}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40">Price</div>
            <div className="text-2xl font-bold text-gradient-gold">
              ${formData.price || "0"}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "Heroes", value: formData.heroCount || "0" },
            { label: "Skins", value: formData.skinCount || "0" },
            { label: "Collector", value: formData.collectorCount || "0" },
            { label: "Legend", value: formData.legendCount || "0" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3 bg-white/[0.02] rounded-xl"
            >
              <div className="font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-white/50 text-sm leading-relaxed">
          {formData.description || "No description provided"}
        </p>

        {/* Seller Info */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-glass-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-gold flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              profile?.username?.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-white">
                {profile?.username || "Unknown Seller"}
              </span>
              {profile?.verified_seller && (
                <HiOutlineShieldCheck className="w-4 h-4 text-cyber-neon" />
              )}
            </div>
            <span className="text-xs text-white/40">
              {profile?.verified_seller
                ? "Verified Seller"
                : profile?.total_sales > 0
                  ? `${profile.total_sales} sales`
                  : "New Seller"}
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

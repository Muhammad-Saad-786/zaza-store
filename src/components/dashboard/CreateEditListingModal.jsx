import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineX,
  HiOutlinePhotograph,
  HiOutlineCheck,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import Button from "../ui/Button";
import GlassCard from "../ui/GlassCard";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../stores/useAuthStore";
import toast from "react-hot-toast";

const RANKS = [
  "Warrior", "Elite", "Master", "Grandmaster", "Epic", "Legend", "Mythic", "Mythical Honor", "Mythical Glory", "Mythical Immortal"
];

const SERVERS = ["Asia / SEA", "Europe", "North America", "Latin America", "Middle East"];

// Market price suggestions based on rank
const RANK_PRICE_BENCHMARKS = {
  "Mythical Immortal": 140,
  "Mythical Glory": 85,
  "Mythical Honor": 55,
  "Mythic": 38,
  "Legend": 22,
  "Epic": 12,
  "Grandmaster": 8,
};

export default function CreateEditListingModal({ isOpen, onClose, listing = null, onSaved }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "MLBB Account",
    server: "Asia / SEA",
    rank: "Mythic",
    highestRank: "Mythical Glory",
    stars: 25,
    winRate: 58.5,
    heroCount: 95,
    skinCount: 140,
    collectorCount: 3,
    legendCount: 1,
    price: 45,
    isNegotiable: false,
    instantCredentials: "",
    images: [],
    videoUrl: "",
  });

  // Populate data if editing
  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || "",
        description: listing.description || "",
        category: listing.category || "MLBB Account",
        server: listing.server || "Asia / SEA",
        rank: listing.rank || "Mythic",
        highestRank: listing.highest_rank || listing.rank || "Mythic",
        stars: listing.stars || 0,
        winRate: listing.win_rate || 50,
        heroCount: listing.hero_count || 0,
        skinCount: listing.skin_count || 0,
        collectorCount: listing.collector_count || 0,
        legendCount: listing.legend_count || 0,
        price: listing.price || 0,
        isNegotiable: listing.is_negotiable || false,
        instantCredentials: "",
        images: listing.images ? listing.images.map((img) => ({ url: img.url, isCover: img.is_cover })) : [],
        videoUrl: "",
      });
    } else {
      // Check local draft
      const draft = localStorage.getItem("zaza_seller_listing_draft");
      if (draft) {
        try {
          setFormData((prev) => ({ ...prev, ...JSON.parse(draft) }));
        } catch (e) {}
      }
    }
  }, [listing, isOpen]);

  // Auto-save draft on step change
  const saveDraft = (data) => {
    if (!listing) {
      localStorage.setItem("zaza_seller_listing_draft", JSON.stringify(data || formData));
    }
  };

  const updateField = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    saveDraft(updated);
  };

  // SEO title generator
  const generateSEOTitle = () => {
    const parts = [
      formData.rank,
      formData.collectorCount > 0 ? `${formData.collectorCount} Collector` : null,
      formData.legendCount > 0 ? `${formData.legendCount} Legend` : null,
      `${formData.skinCount} Skins`,
      `${formData.heroCount} Heroes`,
      formData.server,
    ].filter(Boolean);
    const suggested = `MLBB ${parts.join(" • ")} [High WR]`;
    updateField("title", suggested);
    toast.success("SEO Title Generated!");
  };

  // Handle local image selection
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (formData.images.length + files.length > 10) {
      toast.error("Maximum 10 images allowed per listing");
      return;
    }

    const newImages = files.map((file, idx) => ({
      file,
      url: URL.createObjectURL(file),
      isCover: formData.images.length === 0 && idx === 0,
    }));

    updateField("images", [...formData.images, ...newImages]);
  };

  const removeImage = (index) => {
    const filtered = formData.images.filter((_, i) => i !== index);
    if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
      filtered[0].isCover = true;
    }
    updateField("images", filtered);
  };

  const setCoverImage = (index) => {
    const updated = formData.images.map((img, i) => ({
      ...img,
      isCover: i === index,
    }));
    updateField("images", updated);
  };

  // Validate step before advancing
  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.title || formData.title.trim().length < 8) {
        toast.error("Please enter a title (at least 8 characters)");
        return;
      }
      if (!formData.description || formData.description.trim().length < 15) {
        toast.error("Please enter a description (at least 15 characters)");
        return;
      }
    } else if (step === 2) {
      if (!formData.rank) {
        toast.error("Please select a rank");
        return;
      }
    } else if (step === 4) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error("Please enter a valid listing price");
        return;
      }
    }
    setStep((s) => Math.min(5, s + 1));
  };

  // Final submit handler
  const handleSubmitListing = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // 1. Upload new image files to Supabase Storage if any
      const uploadedImageUrls = [];
      for (const img of formData.images) {
        if (img.file) {
          const fileExt = img.file.name.split(".").pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 7)}.${fileExt}`;
          const { data, error: uploadErr } = await supabase.storage
            .from("account-images")
            .upload(fileName, img.file, { upsert: false });

          if (!uploadErr && data) {
            const { data: publicData } = supabase.storage.from("account-images").getPublicUrl(data.path);
            uploadedImageUrls.push({ url: publicData.publicUrl, isCover: img.isCover });
          } else {
            uploadedImageUrls.push({ url: img.url, isCover: img.isCover });
          }
        } else {
          uploadedImageUrls.push({ url: img.url, isCover: img.isCover });
        }
      }

      const payload = {
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        server: formData.server,
        rank: formData.rank,
        highest_rank: formData.highestRank,
        stars: parseInt(formData.stars) || 0,
        win_rate: parseFloat(formData.winRate) || 0,
        hero_count: parseInt(formData.heroCount) || 0,
        skin_count: parseInt(formData.skinCount) || 0,
        collector_count: parseInt(formData.collectorCount) || 0,
        legend_count: parseInt(formData.legendCount) || 0,
        price: parseFloat(formData.price),
        status: "active",
        updated_at: new Date().toISOString(),
      };

      let savedAccountId = listing?.id;

      if (listing) {
        // Update existing listing
        const { error } = await supabase.from("accounts").update(payload).eq("id", listing.id);
        if (error) throw error;
      } else {
        // Create new listing
        const { data: newAcc, error } = await supabase.from("accounts").insert([payload]).select().single();
        if (error) throw error;
        savedAccountId = newAcc.id;
      }

      // Save / replace images
      if (savedAccountId && uploadedImageUrls.length > 0) {
        if (listing) {
          await supabase.from("account_images").delete().eq("account_id", savedAccountId);
        }
        const imageRecords = uploadedImageUrls.map((img, idx) => ({
          account_id: savedAccountId,
          url: img.url,
          is_cover: img.isCover || idx === 0,
          sort_order: idx,
        }));
        await supabase.from("account_images").insert(imageRecords);
      }

      // Clear draft
      localStorage.removeItem("zaza_seller_listing_draft");
      toast.success(listing ? "Listing updated successfully!" : "Listing published to Marketplace!");
      if (onSaved) onSaved();
      onClose();
    } catch (error) {
      console.error("Save listing error:", error);
      toast.error(error.message || "Failed to save listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl glass-modal rounded-3xl p-6 sm:p-8 my-8 border border-glass-border shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-glass-border">
          <div>
            <h2 className="text-xl font-display font-extrabold text-white">
              {listing ? "Edit Listing" : "Create New Listing"}
            </h2>
            <p className="text-xs text-white/40 mt-0.5">Step {step} of 5 — Multi-Step Listing Wizard</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Indicator */}
        <div className="flex items-center justify-between my-6 px-2">
          {["Basic Info", "Account Details", "Media", "Pricing", "Review"].map((label, idx) => {
            const stepNum = idx + 1;
            const isDone = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={label} className="flex-1 flex flex-col items-center relative">
                <button
                  onClick={() => setStep(stepNum)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : isCurrent
                      ? "bg-brand-gold text-brand-darker shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black"
                      : "bg-white/5 text-white/40 border border-white/10"
                  }`}
                >
                  {isDone ? <HiOutlineCheck className="w-4 h-4" /> : stepNum}
                </button>
                <span className={`text-[11px] mt-1.5 hidden sm:block ${isCurrent ? "text-brand-gold font-semibold" : "text-white/40"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Wizard Form Steps */}
        <div className="min-h-[300px]">
          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white/70">Listing Title *</label>
                  <button
                    type="button"
                    onClick={generateSEOTitle}
                    className="text-xs text-brand-gold flex items-center gap-1 hover:underline"
                  >
                    <HiOutlineSparkles className="w-3.5 h-3.5" /> AI SEO Title
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Mythical Glory 120 Stars • 5 Collector • 150 Skins"
                  className="input-glass px-4 py-3 text-sm w-full"
                  maxLength={100}
                />
                <span className="text-[10px] text-white/30">{formData.title.length}/100 characters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">Game Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    disabled
                    className="input-glass px-4 py-3 text-sm w-full opacity-60"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">Server Region *</label>
                  <select
                    value={formData.server}
                    onChange={(e) => updateField("server", e.target.value)}
                    className="input-glass px-4 py-3 text-sm w-full bg-brand-dark"
                  >
                    {SERVERS.map((s) => (
                      <option key={s} value={s} className="bg-brand-dark">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 mb-1.5 block">Account Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  placeholder="Highlight key heroes, win rates, rare emblems, and binding safety..."
                  className="input-glass p-4 text-sm w-full resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: ACCOUNT DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">Current Rank *</label>
                  <select
                    value={formData.rank}
                    onChange={(e) => updateField("rank", e.target.value)}
                    className="input-glass px-4 py-3 text-sm w-full bg-brand-dark"
                  >
                    {RANKS.map((r) => (
                      <option key={r} value={r} className="bg-brand-dark">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">Highest Rank Achieved</label>
                  <select
                    value={formData.highestRank}
                    onChange={(e) => updateField("highestRank", e.target.value)}
                    className="input-glass px-4 py-3 text-sm w-full bg-brand-dark"
                  >
                    {RANKS.map((r) => (
                      <option key={r} value={r} className="bg-brand-dark">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">Mythic Stars</label>
                  <input
                    type="number"
                    value={formData.stars}
                    onChange={(e) => updateField("stars", e.target.value)}
                    className="input-glass px-3 py-2.5 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">All-Time Win Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.winRate}
                    onChange={(e) => updateField("winRate", e.target.value)}
                    className="input-glass px-3 py-2.5 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">Heroes Count</label>
                  <input
                    type="number"
                    value={formData.heroCount}
                    onChange={(e) => updateField("heroCount", e.target.value)}
                    className="input-glass px-3 py-2.5 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">Total Skins</label>
                  <input
                    type="number"
                    value={formData.skinCount}
                    onChange={(e) => updateField("skinCount", e.target.value)}
                    className="input-glass px-3 py-2.5 text-sm w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">Collector Skins Count</label>
                  <input
                    type="number"
                    value={formData.collectorCount}
                    onChange={(e) => updateField("collectorCount", e.target.value)}
                    className="input-glass px-3 py-2.5 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70 mb-1.5 block">Legend Skins Count</label>
                  <input
                    type="number"
                    value={formData.legendCount}
                    onChange={(e) => updateField("legendCount", e.target.value)}
                    className="input-glass px-3 py-2.5 text-sm w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MEDIA UPLOAD */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block p-6 border-2 border-dashed border-white/20 hover:border-brand-purple/50 rounded-2xl text-center cursor-pointer transition-all bg-white/[0.02]">
                <HiOutlinePhotograph className="w-10 h-10 text-brand-purple mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Drag & drop account screenshots here</p>
                <p className="text-xs text-white/40 mt-1">Upload up to 10 images (hero pool, skins, win rate profile, emblems)</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded Gallery Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/40">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      {img.isCover && (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-brand-gold text-brand-darker text-[10px] font-black uppercase tracking-wider">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        {!img.isCover && (
                          <button
                            type="button"
                            onClick={() => setCoverImage(idx)}
                            className="p-1.5 bg-brand-gold text-brand-darker rounded-lg text-xs font-bold"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1.5 bg-red-500/80 text-white rounded-lg text-xs"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: PRICING & SETTINGS */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-white/70 mb-1.5 block">Listing Price ($ USD) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold font-bold">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className="input-glass pl-8 pr-4 py-3 text-lg font-bold w-full"
                  />
                </div>
              </div>

              {/* Smart Market Recommendation */}
              <div className="p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-start gap-3">
                <HiOutlineInformationCircle className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="text-brand-gold font-semibold">Market Benchmark for {formData.rank}</p>
                  <p className="text-white/60 mt-0.5">
                    Similar {formData.rank} accounts with ~{formData.skinCount} skins average around{" "}
                    <strong className="text-white">${RANK_PRICE_BENCHMARKS[formData.rank] || 35}</strong> on ZAZA Store.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={formData.isNegotiable}
                  onChange={(e) => updateField("isNegotiable", e.target.checked)}
                  className="w-4 h-4 accent-brand-purple"
                />
                <label htmlFor="negotiable" className="text-xs text-white/80 cursor-pointer">
                  Allow buyers to send price offers (Negotiable)
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & PUBLISH */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Live Listing Preview</h3>
              <GlassCard className="p-4 flex gap-4 border border-brand-purple/30 bg-white/[0.04]">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                  {formData.images[0]?.url ? (
                    <img src={formData.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎮</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{formData.title || "Untitled Account"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-brand-gold font-semibold">{formData.rank}</span>
                    <span className="text-xs text-white/40">• {formData.server}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                    <span>🦸 {formData.heroCount} Heroes</span>
                    <span>🎨 {formData.skinCount} Skins</span>
                    {formData.collectorCount > 0 && <span className="text-pink-400">💎 {formData.collectorCount} Collector</span>}
                  </div>
                </div>
                <div className="text-right flex flex-col justify-between">
                  <span className="text-xl font-extrabold text-gradient-gold">${formData.price}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">Ready</span>
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-glass-border">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button variant="gold" size="sm" onClick={handleNextStep}>
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={handleSubmitListing}
            >
              {isSubmitting ? "Publishing..." : listing ? "Save Changes" : "Publish Listing 🚀"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

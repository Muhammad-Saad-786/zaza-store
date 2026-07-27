import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";
import toast from "react-hot-toast";

const useSellAccountStore = create((set, get) => ({
  // Form state
  currentStep: 1,
  totalSteps: 4,
  loading: false,
  error: null,
  isSubmitting: false,

  // Form data
  formData: {
    title: "",
    description: "",
    price: "",
    rank: "",
    highestRank: "",
    stars: "",
    server: "",
    winRate: "",
    heroCount: "",
    skinCount: "",
    collectorCount: "",
    legendCount: "",
    images: [],
  },

  // Draft auto-save key
  draftKey: "zaza_sell_draft",

  // ============ VALIDATION ============
  validateStep: (step) => {
    const { formData } = get();
    const errors = [];

    switch (step) {
      case 1: // Basic Info
        if (!formData.title || formData.title.trim().length < 10) {
          errors.push("Title must be at least 10 characters");
        }
        if (!formData.rank) {
          errors.push("Please select your current rank");
        }
        if (!formData.server) {
          errors.push("Please select your server");
        }
        break;

      case 2: // Details
        if (!formData.price || parseFloat(formData.price) < 1) {
          errors.push("Price must be at least $1");
        }
        if (!formData.description || formData.description.trim().length < 20) {
          errors.push("Description must be at least 20 characters");
        }
        if (!formData.heroCount || parseInt(formData.heroCount) < 1) {
          errors.push("Please enter total hero count");
        }
        if (!formData.skinCount || parseInt(formData.skinCount) < 1) {
          errors.push("Please enter total skin count");
        }
        break;

      case 3: // Images
        if (!formData.images || formData.images.length < 5) {
          errors.push(
            `Please upload at least 5 screenshots (${formData.images?.length || 0}/5 uploaded)`,
          );
        }
        break;
    }

    return errors;
  },

  // ============ NAVIGATION ============
  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep, totalSteps } = get();

    // Validate current step
    const errors = get().validateStep(currentStep);

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1 });
      get().saveDraft();
      window.scrollTo(0, 0);
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
      window.scrollTo(0, 0);
    }
  },

  // ============ FORM FIELDS ============
  updateField: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
      error: null,
    }));
  },

  // ============ IMAGE MANAGEMENT ============
  addImages: (files) => {
    const { formData } = get();
    const newImages = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      url: null,
    }));
    set({
      formData: {
        ...formData,
        images: [...formData.images, ...newImages].slice(0, 10),
      },
      error: null,
    });
  },

  removeImage: (imageId) => {
    const { formData } = get();
    const image = formData.images.find((img) => img.id === imageId);
    if (image?.preview) URL.revokeObjectURL(image.preview);
    set({
      formData: {
        ...formData,
        images: formData.images.filter((img) => img.id !== imageId),
      },
      error: null,
    });
  },

  reorderImages: (fromIndex, toIndex) => {
    const { formData } = get();
    const images = [...formData.images];
    const [removed] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, removed);
    set({ formData: { ...formData, images }, error: null });
  },

  // ============ UPLOAD IMAGES ============
  uploadImages: async () => {
    const { formData } = get();
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("Must be logged in");

    const uploadedUrls = [];

    for (const image of formData.images) {
      if (image.uploaded && image.url) {
        uploadedUrls.push(image.url);
        continue;
      }

      try {
        const fileExt = image.file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("account-images")
          .upload(fileName, image.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("account-images").getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);

        set((state) => ({
          formData: {
            ...state.formData,
            images: state.formData.images.map((img) =>
              img.id === image.id
                ? { ...img, progress: 100, uploaded: true, url: publicUrl }
                : img,
            ),
          },
        }));
      } catch (uploadError) {
        console.error("Failed to upload image:", uploadError);
        throw uploadError;
      }
    }

    return uploadedUrls;
  },

  // ============ SUBMIT LISTING ============
  submitListing: async () => {
    set({ isSubmitting: true, error: null });
    const { formData } = get();
    const user = useAuthStore.getState().user;

    try {
      if (!user) throw new Error("Must be logged in");

      // Validate ALL steps before publishing
      let allErrors = [];
      for (let step = 1; step <= 3; step++) {
        const errors = get().validateStep(step);
        allErrors = [...allErrors, ...errors];
      }

      if (allErrors.length > 0) {
        toast.error(allErrors[0]);
        set({ isSubmitting: false });
        return { success: false, error: allErrors[0] };
      }

      // Upload images first
      let imageUrls = [];
      if (formData.images.length > 0) {
        imageUrls = await get().uploadImages();
      }

      // Determine approval status
      const { data: profile } = await supabase
        .from("profiles")
        .select("verified_seller, completed_orders")
        .eq("id", user.id)
        .single();

      const autoApprove =
        profile?.verified_seller && (profile?.completed_orders || 0) >= 10;
      const approvalStatus = autoApprove ? "approved" : "pending";

      // Create account listing
      const { data: account, error } = await supabase
        .from("accounts")
        .insert([
          {
            seller_id: user.id,
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            rank: formData.rank,
            highest_rank: formData.highestRank || formData.rank,
            stars: parseInt(formData.stars) || 0,
            server: formData.server,
            win_rate: parseFloat(formData.winRate) || 0,
            hero_count: parseInt(formData.heroCount) || 0,
            skin_count: parseInt(formData.skinCount) || 0,
            collector_count: parseInt(formData.collectorCount) || 0,
            legend_count: parseInt(formData.legendCount) || 0,
            status: "active",
            approval_status: approvalStatus,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Save images
      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((url, index) => ({
          account_id: account.id,
          url: url,
          is_cover: index === 0,
          sort_order: index,
        }));

        await supabase.from("account_images").insert(imageRecords);
      }

      // Clear draft
      localStorage.removeItem(get().draftKey);
      set({ isSubmitting: false });

      if (approvalStatus === "pending") {
        return {
          success: true,
          accountId: account.id,
          pending: true,
          message: "Listing submitted for review! Admin will approve shortly.",
        };
      }

      return { success: true, accountId: account.id };
    } catch (error) {
      console.error("Submit error:", error);
      set({ isSubmitting: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // ============ DRAFT MANAGEMENT ============
  saveDraft: () => {
    const { formData } = get();
    const draft = {
      ...formData,
      images: formData.images.map((img) => ({
        id: img.id,
        preview: img.preview,
        uploaded: img.uploaded,
        url: img.url,
      })),
    };
    localStorage.setItem(get().draftKey, JSON.stringify(draft));
  },

  loadDraft: () => {
    try {
      const draft = localStorage.getItem(get().draftKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        set((state) => ({
          formData: { ...state.formData, ...parsed },
        }));
        return true;
      }
    } catch (e) {
      console.error("Failed to load draft:", e);
    }
    return false;
  },

  clearDraft: () => {
    localStorage.removeItem(get().draftKey);
  },

  resetForm: () => {
    set({
      currentStep: 1,
      formData: {
        title: "",
        description: "",
        price: "",
        rank: "",
        highestRank: "",
        stars: "",
        server: "",
        winRate: "",
        heroCount: "",
        skinCount: "",
        collectorCount: "",
        legendCount: "",
        images: [],
      },
      error: null,
    });
    get().clearDraft();
  },
}));

export default useSellAccountStore;

import { create } from "zustand";
import { supabase } from "../lib/supabase";
import useAuthStore from "./useAuthStore";

const useSellAccountStore = create((set, get) => ({
  // Form state
  currentStep: 1,
  totalSteps: 6,
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

  // Validation function
  validateStep: (step, formData) => {
    switch (step) {
      case 1:
        // Basic Info Step
        if (!formData.title?.trim()) return "Please enter a listing title";
        if (!formData.rank) return "Please select a current rank";
        if (!formData.server) return "Please select a server";
        return null;
      case 2:
        // Details Step
        if (!formData.description?.trim()) return "Please enter a description";
        if (!formData.price) return "Please enter a price";
        if (!formData.heroCount) return "Please enter hero count";
        if (!formData.skinCount) return "Please enter skin count";
        return null;
      case 3:
        // Images Step
        if (!formData.images || formData.images.length === 0)
          return "Please upload at least one image";
        return null;
      default:
        return null;
    }
  },

  // Navigation
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => {
    const { currentStep, totalSteps, formData } = get();
    if (currentStep < totalSteps) {
      const error = get().validateStep(currentStep, formData);
      if (error) {
        set({ error });
        return;
      }
      set({ currentStep: currentStep + 1, error: null });
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

  // Update form field
  updateField: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
      error: null,
    }));
  },

  // Image management
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

  // Upload images to Supabase
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

        console.log("Uploading:", fileName);

        const { data, error } = await supabase.storage
          .from("account-images")
          .upload(fileName, image.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);
          throw error;
        }

        console.log("Upload success:", data);

        const {
          data: { publicUrl },
        } = supabase.storage.from("account-images").getPublicUrl(data.path);

        console.log("Public URL:", publicUrl);
        uploadedUrls.push(publicUrl);

        // Update image status
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

  // Submit listing
  submitListing: async () => {
    set({ isSubmitting: true, error: null });
    const { formData } = get();
    const user = useAuthStore.getState().user;

    try {
      if (!user) throw new Error("Must be logged in");

      // Upload images first
      let imageUrls = [];
      if (formData.images.length > 0) {
        imageUrls = await get().uploadImages();
      }

      // Create account listing
      const { data: account, error } = await supabase
        .from("accounts")
        .insert([
          {
            seller_id: user.id,
            title: formData.title || "Untitled",
            description: formData.description || "",
            price: parseFloat(formData.price) || 0,
            rank: formData.rank || "Unknown",
            highest_rank: formData.highestRank || formData.rank || "Unknown",
            stars: parseInt(formData.stars) || 0,
            server: formData.server || "Unknown",
            win_rate: parseFloat(formData.winRate) || 0,
            hero_count: parseInt(formData.heroCount) || 0,
            skin_count: parseInt(formData.skinCount) || 0,
            collector_count: parseInt(formData.collectorCount) || 0,
            legend_count: parseInt(formData.legendCount) || 0,
            status: "active",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Save images to account_images table
      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((url, index) => ({
          account_id: account.id,
          url: url,
          is_cover: index === 0,
          sort_order: index,
        }));

        const { error: imageError } = await supabase
          .from("account_images")
          .insert(imageRecords);

        if (imageError) {
          console.error("Failed to save image records:", imageError);
        }
      }

      // Clear draft
      localStorage.removeItem(get().draftKey);

      set({ isSubmitting: false });
      return { success: true, accountId: account.id };
    } catch (error) {
      console.error("Submit error:", error);
      set({ isSubmitting: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
  // Save draft to localStorage
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

  // Load draft
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

  // Clear draft
  clearDraft: () => {
    localStorage.removeItem(get().draftKey);
  },

  // Reset form
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

import { create } from "zustand";
import { supabase } from "../lib/supabase";

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,

  // Initialize auth state
  initialize: async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (session?.user) {
        set({ session, user: session.user });
        await get().fetchProfile(session.user.id);

        // Check if profile exists, if not create one (for Google auth users)
        const profile = get().profile;
        if (!profile) {
          await get().createProfileForGoogleUser(session.user);
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ session, user: session.user });
        await get().fetchProfile(session.user.id);

        const profile = get().profile;
        if (!profile) {
          await get().createProfileForGoogleUser(session.user);
        }
      } else {
        set({ user: null, profile: null, session: null });
      }
      set({ loading: false });
    });
  },

  // Create profile for Google auth users
  createProfileForGoogleUser: async (user) => {
    try {
      const username =
        user.email?.split("@")[0] || "user_" + user.id.substring(0, 8);

      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            username: username,
            email: user.email,
            role: "buyer", // Default role for Google users
            avatar_url: user.user_metadata?.avatar_url || null,
          },
        ])
        .select()
        .single();

      if (error) {
        // If profile already exists, just fetch it
        if (error.code === "23505") {
          await get().fetchProfile(user.id);
          return;
        }
        throw error;
      }

      set({ profile: data });
    } catch (error) {
      console.error("Failed to create profile for Google user:", error);
    }
  },

  // Fetch user profile
  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      console.error("Fetch profile error:", error);
      set({ error: error.message });
    }
  },

  // Sign up with email
  signUp: async (email, password, username, role = "buyer") => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role,
          },
        },
      });

      if (error) throw error;

      // Don't manually create profile - the database trigger handles it
      // Just return success
      return { success: true, user: data.user };
    } catch (error) {
      // If it's a duplicate key error, the profile was created by trigger - that's fine
      if (error.code === "23505" || error.message?.includes("duplicate key")) {
        set({ loading: false });
        return { success: true, message: "Account created successfully" };
      }

      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  // Sign in with email
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ loading: false });
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ loading: false });
    }
  },

  // Sign out
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null, session: null });
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ loading: false });
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ loading: false });
    }
  },

  // Reset password
  resetPassword: async (newPassword) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ loading: false });
    }
  },

  // Update profile
  updateProfile: async (updates) => {
    set({ loading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      await get().fetchProfile(user.id);
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ loading: false });
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    set({ loading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error("No user logged in");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true, // Changed to true to overwrite existing avatar
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Refresh profile data
      await get().fetchProfile(user.id);

      return { success: true, url: publicUrl };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    } finally {
      set({ loading: false });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;

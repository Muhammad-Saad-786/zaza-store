// src/stores/useMLBBAuthStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import {
  sendVerificationCode,
  loginWithVerificationCode,
  getMLBBUserInfo,
  clearMLBBAuth,
} from "../components/auth/mlbbAuthApi";

const useMLBBAuthStore = create((set, get) => ({
  mlbbUser: null,
  mlbbToken: null,
  isLoggedIn: false,
  loading: false,
  error: null,
  verificationSent: false,
  resendTimer: 0,

  // Initialize MLBB auth state
  initializeMLBB: () => {
    const encryptedToken = localStorage.getItem("mlbb_token_encrypted");
    const roleId = localStorage.getItem("mlbb_role_id");
    const zoneId = localStorage.getItem("mlbb_zone_id");

    if (encryptedToken && roleId && zoneId) {
      const token = atob(encryptedToken);
      set({
        mlbbToken: token,
        isLoggedIn: true,
        mlbbUser: {
          roleId: parseInt(roleId),
          zoneId: parseInt(zoneId),
        },
      });

      // Fetch latest user info
      get().fetchMLBBUserInfo();
    }
  },

  // Send verification code
  sendVC: async (roleId, zoneId) => {
    if (!roleId || !zoneId) {
      toast.error("Please enter Role ID and Zone ID");
      return;
    }

    set({ loading: true, error: null });

    try {
      const result = await sendVerificationCode(roleId, zoneId);

      if (result.success) {
        set({
          loading: false,
          verificationSent: true,
          resendTimer: 60,
        });
        toast.success("Verification code sent to your in-game mailbox!");

        // Start countdown timer
        const timer = setInterval(() => {
          const currentTimer = get().resendTimer;
          if (currentTimer <= 1) {
            clearInterval(timer);
            set({ resendTimer: 0 });
          } else {
            set({ resendTimer: currentTimer - 1 });
          }
        }, 1000);

        return { success: true };
      } else {
        set({ error: result.error, loading: false });
        toast.error(result.error);
        return { success: false };
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to send verification code");
      return { success: false };
    }
  },

  // Login with verification code
  loginWithVC: async (roleId, zoneId, verificationCode) => {
    if (!verificationCode || verificationCode.length < 4) {
      toast.error("Please enter a valid verification code");
      return { success: false };
    }

    set({ loading: true, error: null });

    try {
      const result = await loginWithVerificationCode(
        roleId,
        zoneId,
        verificationCode,
      );

      if (result.success) {
        // Store token and user info
        const encryptedToken = btoa(result.data.jwt);
        localStorage.setItem("mlbb_token_encrypted", encryptedToken);
        localStorage.setItem("mlbb_role_id", roleId);
        localStorage.setItem("mlbb_zone_id", zoneId);

        set({
          loading: false,
          isLoggedIn: true,
          mlbbToken: result.data.jwt,
          mlbbUser: {
            roleId: parseInt(roleId),
            zoneId: parseInt(zoneId),
          },
          verificationSent: false,
        });

        toast.success("Successfully logged in with MLBB!");

        // Fetch user info
        await get().fetchMLBBUserInfo();

        return { success: true };
      } else {
        set({ error: result.error, loading: false });
        toast.error(result.error);
        return { success: false };
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Login failed");
      return { success: false };
    }
  },

  // Fetch MLBB user info
  fetchMLBBUserInfo: async () => {
    try {
      const result = await getMLBBUserInfo();

      if (result.success) {
        set({ mlbbUser: result.data });
      } else {
        // Token might be expired
        if (result.error === "Not logged in" || result.error.includes("401")) {
          get().logoutMLBB();
        }
      }
    } catch (error) {
      console.error("Failed to fetch MLBB user info:", error);
    }
  },

  // Logout MLBB
  logoutMLBB: () => {
    clearMLBBAuth();
    set({
      mlbbUser: null,
      mlbbToken: null,
      isLoggedIn: false,
      verificationSent: false,
      resendTimer: 0,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useMLBBAuthStore;

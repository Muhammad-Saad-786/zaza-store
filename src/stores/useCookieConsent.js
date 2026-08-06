import { create } from "zustand";

const COOKIE_KEY = "zaza_cookie_consent";

const useCookieConsent = create((set, get) => ({
  consent: null, // null = not decided, true = accepted, false = declined
  showBanner: false,

  // Initialize from localStorage
  init: () => {
    const saved = localStorage.getItem(COOKIE_KEY);
    if (saved === null) {
      set({ consent: null, showBanner: true });
    } else {
      set({ consent: saved === "true", showBanner: false });
    }
  },

  // Accept all cookies
  acceptAll: () => {
    localStorage.setItem(COOKIE_KEY, "true");
    set({ consent: true, showBanner: false });
    get().enableCookies();
  },

  // Accept only essential
  acceptEssential: () => {
    localStorage.setItem(COOKIE_KEY, "essential");
    set({ consent: "essential", showBanner: false });
  },

  // Decline all
  declineAll: () => {
    localStorage.setItem(COOKIE_KEY, "false");
    set({ consent: false, showBanner: false });
  },

  // Enable non-essential cookies
  enableCookies: () => {
    // Enable Google Analytics if you add it later
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  },

  // Reset consent
  resetConsent: () => {
    localStorage.removeItem(COOKIE_KEY);
    set({ consent: null, showBanner: true });
  },
}));

export default useCookieConsent;

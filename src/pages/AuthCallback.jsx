import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import Spinner from "../components/ui/Spinner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  useEffect(() => {
    const checkAndRedirect = () => {
      const currentUser = useAuthStore.getState().user;
      const currentProfile = useAuthStore.getState().profile;

      if (currentUser && currentProfile) {
        // If profile has no role or is new, send to role selection
        if (!currentProfile.role || currentProfile.role === "buyer") {
          // Check if this is a new Google user (created in last 30 seconds)
          const createdAt = new Date(currentProfile.created_at);
          const now = new Date();
          const diffSeconds = (now - createdAt) / 1000;

          if (diffSeconds < 60) {
            navigate("/select-role", { replace: true });
            return;
          }
        }

        // Redirect based on role
        if (
          currentProfile.role === "seller" ||
          currentProfile.role === "admin"
        ) {
          navigate("/seller-dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else if (currentUser && !currentProfile) {
        // Profile not created yet, wait and retry
        setTimeout(checkAndRedirect, 1000);
      } else {
        navigate("/login", { replace: true });
      }
    };

    // Wait a moment for auth state to settle
    const timer = setTimeout(checkAndRedirect, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-white/40">Setting up your account...</p>
      </div>
    </div>
  );
}

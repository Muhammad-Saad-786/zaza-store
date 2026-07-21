import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles required, allow any authenticated user
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check role-based access
  if (
    allowedRoles.length > 0 &&
    profile &&
    !allowedRoles.includes(profile.role)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
          <p className="mt-2 text-white/40">
            You need a{" "}
            <span className="text-brand-purple font-medium">
              {allowedRoles.join(" or ")}
            </span>{" "}
            account.
          </p>
          <p className="mt-1 text-white/30 text-sm">
            Current role:{" "}
            <span className="capitalize text-brand-gold">{profile?.role}</span>
          </p>
          <button
            onClick={async () => {
              const { supabase } = await import("../../lib/supabase");
              await supabase
                .from("profiles")
                .update({ role: allowedRoles[0] })
                .eq("id", user.id);
              window.location.reload();
            }}
            className="mt-4 px-6 py-3 bg-brand-gold text-brand-darker rounded-xl font-semibold"
          >
            Switch to {allowedRoles[0]} Account
          </button>
        </div>
      </div>
    );
  }

  return children;
}

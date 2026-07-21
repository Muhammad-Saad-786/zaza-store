import { useState } from "react";
import { supabase } from "../lib/supabase";
import useAuthStore from "../stores/useAuthStore";
import Button from "../components/ui/Button";

export default function TestConnection() {
  const [results, setResults] = useState({});
  const { user, profile, signOut } = useAuthStore();

  // Test 1: Check Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("count", { count: "exact" });
      setResults((prev) => ({
        ...prev,
        connection: error
          ? `❌ Failed: ${error.message}`
          : "✅ Connected to Supabase!",
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        connection: `❌ Error: ${err.message}`,
      }));
    }
  };

  // Test 2: Check if .env variables exist
  const testEnvVars = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    setResults((prev) => ({
      ...prev,
      envUrl: url
        ? `✅ Found: ${url.substring(0, 30)}...`
        : "❌ VITE_SUPABASE_URL is missing!",
      envKey: key
        ? `✅ Found: ${key.substring(0, 30)}...`
        : "❌ VITE_SUPABASE_ANON_KEY is missing!",
    }));
  };

  // Test 3: Check auth state
  const testAuth = () => {
    setResults((prev) => ({
      ...prev,
      user: user ? `✅ Logged in as: ${user.email}` : "❌ Not logged in",
      profile: profile
        ? `✅ Profile: ${profile.username} (${profile.role})`
        : "❌ No profile loaded",
    }));
  };

  // Test 4: Create a test profile (only if not logged in)
  const testProfileCreation = async () => {
    if (!user) {
      setResults((prev) => ({
        ...prev,
        profileCreation: "⚠️ Please login first",
      }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setResults((prev) => ({
          ...prev,
          profileCreation: `✅ Profile exists: ${data.username}`,
        }));
      } else if (error && error.code === "PGRST116") {
        setResults((prev) => ({
          ...prev,
          profileCreation: "⚠️ Profile not found",
        }));
      } else if (error) {
        setResults((prev) => ({
          ...prev,
          profileCreation: `❌ Error: ${error.message}`,
        }));
      }
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        profileCreation: `❌ Error: ${err.message}`,
      }));
    }
  };

  // Test 5: Test storage access - FIXED
  const testStorage = async () => {
    try {
      // Use listBuckets instead of getBucket
      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        setResults((prev) => ({
          ...prev,
          storage: `❌ Error: ${error.message}`,
        }));
        return;
      }

      if (data && data.length > 0) {
        const bucketNames = data.map((b) => b.name).join(", ");
        setResults((prev) => ({
          ...prev,
          storage: `✅ ${data.length} buckets found: ${bucketNames}`,
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          storage: "⚠️ No buckets found - create them in Supabase Storage",
        }));
      }
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        storage: `❌ Error: ${err.message}`,
      }));
    }
  };

  // Run all tests
  const runAllTests = () => {
    testEnvVars();
    testConnection();
    testAuth();
    testProfileCreation();
    testStorage();
  };

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-extrabold text-white mb-2">
          Supabase Connection Test
        </h1>
        <p className="text-white/40 mb-8">
          Check if everything is properly connected
        </p>

        {/* Run All Tests Button */}
        <Button
          onClick={runAllTests}
          variant="primary"
          size="lg"
          className="mb-8"
        >
          🔍 Run All Tests
        </Button>

        {/* Auth Status */}
        <div className="glass-card p-6 mb-4">
          <h2 className="text-lg font-semibold text-white mb-3">Auth Status</h2>
          {user ? (
            <div className="space-y-2">
              <p className="text-green-400">✅ Logged In</p>
              <p className="text-white/60 text-sm">Email: {user.email}</p>
              <p className="text-white/60 text-sm">
                User ID: {user.id.substring(0, 16)}...
              </p>
              {profile && (
                <>
                  <p className="text-white/60 text-sm">
                    Username: {profile.username}
                  </p>
                  <p className="text-white/60 text-sm">
                    Role:{" "}
                    <span className="capitalize text-brand-purple">
                      {profile.role}
                    </span>
                  </p>
                </>
              )}
              <button
                onClick={() => signOut()}
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <p className="text-yellow-400">⚠️ Not logged in</p>
          )}
        </div>

        {/* Test Results */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-3">
            Test Results
          </h2>

          {Object.keys(results).length === 0 ? (
            <p className="text-white/40 text-sm">
              Click "Run All Tests" to check connection
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(results).map(([test, result]) => (
                <div key={test} className="p-3 bg-white/[0.02] rounded-lg">
                  <p className="text-xs text-white/40 uppercase mb-1">{test}</p>
                  <p
                    className={`text-sm ${
                      result.startsWith("✅")
                        ? "text-green-400"
                        : result.startsWith("❌")
                          ? "text-red-400"
                          : result.startsWith("⚠️")
                            ? "text-yellow-400"
                            : "text-white/60"
                    }`}
                  >
                    {result}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 mt-4">
          <h2 className="text-lg font-semibold text-white mb-3">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {!user ? (
              <>
                <a href="/login">
                  <Button variant="primary" size="sm">
                    Go to Login
                  </Button>
                </a>
                <a href="/register">
                  <Button variant="ghost" size="sm">
                    Go to Register
                  </Button>
                </a>
              </>
            ) : (
              <a href="/dashboard">
                <Button variant="primary" size="sm">
                  Go to Dashboard
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

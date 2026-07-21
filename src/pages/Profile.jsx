import useAuthStore from "../stores/useAuthStore";

export default function Profile() {
  const { profile } = useAuthStore();

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-extrabold text-white">
          Profile
        </h1>
        <div className="mt-8 glass-card p-6">
          <pre className="text-white/60 text-sm overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

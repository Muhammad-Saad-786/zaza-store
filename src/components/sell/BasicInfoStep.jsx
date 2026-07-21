import useSellAccountStore from "../../stores/useSellAccountStore";

const ranks = [
  "Warrior",
  "Elite",
  "Master",
  "Grandmaster",
  "Epic",
  "Legend",
  "Mythic",
  "Mythical Honor",
  "Mythical Glory",
  "Mythical Immortal",
];

const servers = [
  "Global Server",
  "Indonesian Server",
  "Philippine Server",
  "Indian Server",
  "Other Server",
];

export default function BasicInfoStep() {
  const { formData, updateField } = useSellAccountStore();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Basic Information</h2>
      <p className="text-white/40 text-sm">
        Tell buyers about your account's rank and region.
      </p>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">
          Listing Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g., Mythical Glory 1000★ | 342 Skins | 12 Collector"
          className="input-glass w-full h-8 px-4 rounded-xl"
        />
        <p className="text-xs text-white/30 mt-1">
          A catchy title helps your listing stand out
        </p>
      </div>

      {/* Rank */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            Current Rank <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.rank}
            onChange={(e) => updateField("rank", e.target.value)}
            className="input-glass w-full h-8 px-4 rounded-xl"
          >
            <option value="">Select Rank</option>
            {ranks.map((rank) => (
              <option key={rank} value={rank} className="bg-brand-darker">
                {rank}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            Highest Rank Achieved
          </label>
          <select
            value={formData.highestRank}
            onChange={(e) => updateField("highestRank", e.target.value)}
            className="input-glass w-full h-8 px-4 rounded-xl"
          >
            <option value="">Select Highest Rank</option>
            {ranks.map((rank) => (
              <option key={rank} value={rank} className="bg-brand-darker">
                {rank}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stars & Server */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            Stars
          </label>
          <input
            type="number"
            value={formData.stars}
            onChange={(e) => updateField("stars", e.target.value)}
            placeholder="e.g., 1000"
            className="input-glass w-full h-8 px-4 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            Server <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.server}
            onChange={(e) => updateField("server", e.target.value)}
            className="input-glass w-full h-8 px-4 rounded-xl"
          >
            <option value="">Select Server</option>
            {servers.map((server) => (
              <option key={server} value={server} className="bg-brand-darker">
                {server}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

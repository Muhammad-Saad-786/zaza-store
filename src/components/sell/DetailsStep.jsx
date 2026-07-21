import useSellAccountStore from "../../stores/useSellAccountStore";

export default function DetailsStep() {
  const { formData, updateField } = useSellAccountStore();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Account Details</h2>
      <p className="text-white/40 text-sm">
        Add your account's hero, skin, and stat details.
      </p>

      {/* Hero & Skin Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { field: "heroCount", label: "Total Heroes", icon: "🦸" },
          { field: "skinCount", label: "Total Skins", icon: "🎨" },
          { field: "collectorCount", label: "Collector Skins", icon: "💎" },
          { field: "legendCount", label: "Legend Skins", icon: "👑" },
        ].map((item) => (
          <div key={item.field}>
            <label className="block text-sm font-medium text-white/60 mb-2">
              {item.label}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                {item.icon}
              </span>
              <input
                type="number"
                value={formData[item.field]}
                onChange={(e) => updateField(item.field, e.target.value)}
                placeholder="0"
                className="input-glass pl-12 w-full"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Win Rate & Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            Win Rate (%)
          </label>
          <input
            type="number"
            value={formData.winRate}
            onChange={(e) => updateField("winRate", e.target.value)}
            placeholder="e.g., 75.5"
            step="0.1"
            min="0"
            max="100"
            className="input-glass w-full h-8 px-4 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            Price (PKR) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              Rs
            </span>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => updateField("price", e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="1"
              className="input-glass pl-10 w-full h-8 px-4 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-white/60 mb-2">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe your account, special skins, achievements, etc..."
          rows={5}
          className="input-glass w-full resize-none px-4 rounded-xl"
        />
        <p className="text-xs text-white/30 mt-1">
          {formData.description.length}/2000 characters
        </p>
      </div>
    </div>
  );
}

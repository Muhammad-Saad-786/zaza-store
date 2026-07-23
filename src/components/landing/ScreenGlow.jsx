export default function ScreenGlow({ intensity = 0.5, color = "#8b5cf6" }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32"
        style={{
          background: `radial-gradient(ellipse at center, ${color}${Math.round(
            intensity * 40,
          )
            .toString(16)
            .padStart(2, "0")}, transparent 70%)`,
        }}
      />
      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32"
        style={{
          background: `radial-gradient(ellipse at center, ${color}${Math.round(
            intensity * 30,
          )
            .toString(16)
            .padStart(2, "0")}, transparent 70%)`,
        }}
      />
      {/* Side glows */}
      <div
        className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-3/4"
        style={{
          background: `radial-gradient(ellipse at center, ${color}${Math.round(
            intensity * 20,
          )
            .toString(16)
            .padStart(2, "0")}, transparent 70%)`,
        }}
      />
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-3/4"
        style={{
          background: `radial-gradient(ellipse at center, ${color}${Math.round(
            intensity * 20,
          )
            .toString(16)
            .padStart(2, "0")}, transparent 70%)`,
        }}
      />
    </div>
  );
}

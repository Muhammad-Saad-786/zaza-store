import { Link } from "react-router-dom";

export default function Logo({ size = "md" }) {
  const config = {
    sm: {
      text: "text-xl",
      logo: "w-6 h-6",
    },
    md: {
      text: "text-2xl",
      logo: "w-8 h-8",
    },
    lg: {
      text: "text-4xl",
      logo: "w-12 h-12",
    },
  };

  return (
    <Link to="/" className="flex items-center gap-1.5 group">
      {/* Logo acts as the first "Z" */}
      <img
        src="/zaza-store-logo.png"
        alt="ZAZA Store"
        className={`${config[size].logo} object-contain shrink-0`}
      />

      {/* Remaining Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`${config[size].text} font-display font-extrabold tracking-tight`}
        >
          <span className="text-white">ZAZA</span>
          <span className="text-gradient">.</span>
        </span>

        {size === "lg" && (
          <span className="mt-1 text-xs text-white/40 tracking-[0.25em] uppercase">
            Store
          </span>
        )}
      </div>
    </Link>
  );
}

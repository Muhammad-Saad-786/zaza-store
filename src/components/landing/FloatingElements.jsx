import { motion } from "framer-motion";
import {
  GiDiamondHard,
  GiCrown,
  GiShieldBash,
  GiSwordClash,
} from "react-icons/gi";

const floatingItems = [
  { icon: GiCrown, x: "15%", y: "20%", delay: 0, size: 40, color: "#f59e0b" },
  {
    icon: GiDiamondHard,
    x: "85%",
    y: "15%",
    delay: 0.5,
    size: 30,
    color: "#06b6d4",
  },
  {
    icon: GiSwordClash,
    x: "10%",
    y: "70%",
    delay: 1,
    size: 35,
    color: "#8b5cf6",
  },
  {
    icon: GiShieldBash,
    x: "90%",
    y: "60%",
    delay: 1.5,
    size: 45,
    color: "#fef08a",
  },
  { icon: GiCrown, x: "75%", y: "80%", delay: 2, size: 25, color: "#8b5cf6" },
  {
    icon: GiDiamondHard,
    x: "20%",
    y: "85%",
    delay: 0.8,
    size: 32,
    color: "#f59e0b",
  },
];

export default function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingItems.map((item, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.8, 1.1, 0.8],
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <item.icon
            size={item.size}
            color={item.color}
            style={{
              filter: `drop-shadow(0 0 20px ${item.color}40)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

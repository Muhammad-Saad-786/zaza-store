import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaGamepad, FaThumbsUp, FaCheckCircle, FaLock } from "react-icons/fa";

const stats = [
  { value: 12500, suffix: "+", label: "Accounts Sold", icon: FaGamepad },
  { value: 8500, suffix: "+", label: "Happy Buyers", icon: FaThumbsUp },
  { value: 3200, suffix: "+", label: "Verified Sellers", icon: FaCheckCircle },
  { value: 99.9, suffix: "%", label: "Secure Transactions", icon: FaLock },
];

function AnimatedCounter({ value, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    const steps = 60;
    const increment = value / steps;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = Math.floor(progress * value);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    }

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="font-display font-extrabold">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="relative py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 sm:p-12"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-2">
                  <stat.icon className="inline-block" />
                </div>
                <div className="text-3xl lg:text-4xl text-white mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { HiOutlineCheck } from "react-icons/hi";

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={step} className="flex items-center gap-2 sm:gap-4">
            {/* Step Circle */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  borderColor: isActive
                    ? "rgba(139, 92, 246, 0.8)"
                    : isCompleted
                      ? "rgba(139, 92, 246, 0.5)"
                      : "rgba(255, 255, 255, 0.2)",
                  backgroundColor: isCompleted
                    ? "rgba(139, 92, 246, 0.2)"
                    : "transparent",
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isActive ? "border-brand-purple" : ""
                }`}
              >
                {isCompleted ? (
                  <HiOutlineCheck className="w-5 h-5 text-brand-purple" />
                ) : (
                  <span
                    className={`text-sm font-semibold ${
                      isActive ? "text-brand-purple" : "text-white/40"
                    }`}
                  >
                    {stepNum}
                  </span>
                )}
              </motion.div>
              <span
                className={`hidden sm:inline text-sm font-medium ${
                  isActive
                    ? "text-white"
                    : isCompleted
                      ? "text-brand-purple"
                      : "text-white/30"
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="hidden sm:block w-8 h-[2px] bg-glass-border">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  className="h-full bg-brand-purple"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

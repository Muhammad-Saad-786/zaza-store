import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-8xl font-display font-extrabold text-gradient"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-white/50 text-lg"
        >
          Page not found
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

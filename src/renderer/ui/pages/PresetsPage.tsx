import React from "react";
import { motion } from "framer-motion";
import PresetsManager from "../../components/PresetsManager";

const PresetsPage: React.FC = () => {
  return (
    <div className="p-6 text-moon-text">
      <div className="flex items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet bg-clip-text text-transparent">
          Mod Presets
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-2xl"
      >
        <PresetsManager />
      </motion.div>
    </div>
  );
};

export default PresetsPage;

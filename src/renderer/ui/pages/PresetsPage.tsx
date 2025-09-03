import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import PresetsManager from "../../components/PresetsManager";

const PresetsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 text-moon-text max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-8"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-moon-text mb-1">Mod Presets</h1>
          <p className="text-moon-text/70">
            Manage your saved mod configurations
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-moon-text/40" />
          <input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-moon-surface/20 border border-moon-surface/30 rounded-lg 
                      text-moon-text placeholder-moon-text/40 focus:outline-none focus:ring-1 
                      focus:ring-moon-glowViolet/50 focus:border-transparent transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-moon-text/40 hover:text-moon-text/70 transition-colors"
            >
              <FiX />
            </button>
          )}
        </div>
      </motion.div>

      {/* Presets List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <PresetsManager searchQuery={searchQuery} />
      </motion.div>
    </div>
  );
};

export default PresetsPage;

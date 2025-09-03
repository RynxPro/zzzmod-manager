import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSave, FiSearch, FiFilter, FiX } from "react-icons/fi";
import PresetsManager from "../../components/PresetsManager";

const PresetsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="p-6 text-moon-text max-w-6xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-moon-glowCyan to-moon-glowViolet text-moon-bg">
                <FiSave className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet bg-clip-text text-transparent">
                Mod Presets
              </h1>
            </div>
            <p className="text-moon-text/70 mt-1">
              Save and manage different mod configurations for quick switching
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-moon-text/40" />
            <input
              type="text"
              placeholder="Search presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-moon-surface/20 border border-moon-surface/30 rounded-lg 
                        text-moon-text placeholder-moon-text/40 focus:outline-none focus:ring-2 
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
              showFilters
                ? "bg-moon-surface/30 border-moon-glowViolet/50 text-moon-glowViolet"
                : "bg-moon-surface/20 border-moon-surface/30 text-moon-text/70 hover:bg-moon-surface/30"
            }`}
          >
            <FiFilter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              className="overflow-hidden mb-6 bg-moon-surface/20 rounded-lg border border-moon-surface/30 p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-moon-text/70 mb-1">
                    Sort By
                  </label>
                  <select className="w-full bg-moon-surface/30 border border-moon-surface/40 rounded-lg px-3 py-2 text-sm text-moon-text focus:outline-none focus:ring-2 focus:ring-moon-glowViolet/50 focus:border-transparent">
                    <option>Name (A-Z)</option>
                    <option>Name (Z-A)</option>
                    <option>Newest First</option>
                    <option>Oldest First</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-moon-text/70 mb-1">
                    Mod Count
                  </label>
                  <select className="w-full bg-moon-surface/30 border border-moon-surface/40 rounded-lg px-3 py-2 text-sm text-moon-text focus:outline-none focus:ring-2 focus:ring-moon-glowViolet/50 focus:border-transparent">
                    <option>Any</option>
                    <option>1-5 Mods</option>
                    <option>5-10 Mods</option>
                    <option>10+ Mods</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-moon-surface/50 hover:bg-moon-surface/60 transition-colors text-moon-text py-2 px-4 rounded-lg border border-moon-surface/40 text-sm">
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Presets Grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <PresetsManager searchQuery={searchQuery} />
      </motion.div>
    </div>
  );
};

export default PresetsPage;

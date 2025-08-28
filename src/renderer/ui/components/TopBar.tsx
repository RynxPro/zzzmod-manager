import React from "react";
import { motion } from "framer-motion";
import { Search, Zap } from "lucide-react";

const TopBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-16 bg-gaming-bg-secondary/80 backdrop-blur-gaming border-b border-gaming-border-accent/30 relative z-20"
    >
      {/* Subtle bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-gaming-accent-cyan/40 via-transparent to-gaming-accent-violet/40" />

      <div className="w-full max-w-7xl mx-auto px-6 h-16 grid grid-cols-3 items-center gap-4">
        {/* Left: Search */}
        <div className="flex items-center justify-start">
          <motion.div
            className={`relative flex items-center transition-all duration-300 w-64 md:w-72 ${
              isSearchFocused ? "md:w-80" : ""
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute left-3 z-10">
              <Search
                size={16}
                className={`transition-colors duration-300 ${
                  isSearchFocused
                    ? "text-gaming-accent-cyan"
                    : "text-gaming-text-muted"
                }`}
              />
            </div>
            <motion.input
              type="text"
              placeholder="Search mods, settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-gaming-bg-card/60 border transition-all duration-300 text-sm font-medium placeholder:text-gaming-text-muted focus:outline-none ${
                isSearchFocused
                  ? "border-gaming-accent-cyan/50 shadow-glow bg-gaming-bg-card/80"
                  : "border-gaming-border-accent/30 hover:border-gaming-border-accent/50"
              }`}
              animate={{
                boxShadow: isSearchFocused
                  ? "0 0 0 1px rgba(0, 245, 255, 0.3), 0 0 20px rgba(0, 245, 255, 0.15)"
                  : "0 0 0 1px transparent",
              }}
              transition={{ duration: 0.2 }}
            />
            {/* Search glow effect */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-gaming-accent-cyan/10 to-gaming-accent-violet/10 -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: isSearchFocused ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>

        {/* Center: Status */}
        <div className="hidden md:flex items-center justify-center gap-2 text-gaming-text-secondary">
          <Zap size={14} className="text-gaming-accent-cyan" />
          <span className="text-sm font-medium">Ready to mod</span>
        </div>

        {/* Right: Version chip */}
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-panel">
            <motion.div
              className="w-2 h-2 rounded-full bg-gaming-status-enabled"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-mono text-gaming-text-muted">
              v0.1.0
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;

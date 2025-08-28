import React from "react";
import { motion } from "framer-motion";
import { Search, Sun, Moon, Zap } from "lucide-react";

type Props = {
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
};

const TopBar: React.FC<Props> = ({ theme = "dark", onToggleTheme }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-16 border-b border-gaming-border-accent/30 flex items-center justify-between px-6 glass-panel relative z-20"
    >
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <motion.div
          className={`relative flex items-center transition-all duration-300 ${
            isSearchFocused ? "flex-1" : "w-64"
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
                : "0 0 0 1px transparent"
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

      {/* Center Section - Welcome Message */}
      <div className="hidden md:flex items-center gap-2 text-gaming-text-secondary">
        <Zap size={14} className="text-gaming-accent-cyan" />
        <span className="text-sm font-medium">Ready to mod</span>
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <motion.button
          onClick={onToggleTheme}
          className="relative p-2.5 rounded-xl gaming-button-secondary group overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {/* Button background glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-gaming-accent-cyan/20 to-gaming-accent-violet/20 opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
          
          {/* Icon with rotation animation */}
          <motion.div
            className="relative z-10"
            animate={{ rotate: theme === "dark" ? 0 : 180 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          >
            {theme === "dark" ? (
              <Sun size={16} className="text-gaming-accent-cyan" />
            ) : (
              <Moon size={16} className="text-gaming-accent-violet" />
            )}
          </motion.div>
        </motion.button>

        {/* Status Indicator */}
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
    </motion.div>
  );
};

export default TopBar;

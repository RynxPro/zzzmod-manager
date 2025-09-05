import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid, List, RefreshCw, Menu, X } from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

type ViewMode = "grid" | "list";

interface TopBarProps {
  /** Current search query */
  searchQuery?: string;
  /** Callback when search query changes */
  onSearch?: (query: string) => void;
  /** Callback when refresh is requested */
  onRefresh?: () => Promise<void>;
  /** Current view mode */
  viewMode?: ViewMode;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void;
  /** Show view mode toggle buttons */
  showViewToggle?: boolean;
  /** Show search input */
  showSearch?: boolean;
  /** Show action buttons */
  showActions?: boolean;
  /** Additional class names */
  className?: string;
  /** Callback when sidebar toggle is clicked */
  onToggleSidebar?: () => void;
  /** Whether the sidebar is currently collapsed */
  isSidebarCollapsed?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  searchQuery = "",
  onSearch,
  onRefresh,
  viewMode = "grid",
  onViewModeChange,
  showViewToggle = true,
  showSearch = true,
  showActions = true,
  className = "",
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const location = useLocation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get current page title from route
  const getTitle = useCallback(() => {
    const path = location.pathname;
    if (path.startsWith("/characters/")) {
      const match = path.match(/^\/characters\/([^/]+)/);
      return match ? decodeURIComponent(match[1]) : "Character";
    }

    const titles: Record<string, string> = {
      "/characters": "Characters",
      "/settings": "Settings",
      "/about": "About",
      "/mods": "Mod Library",
      "/presets": "Presets",
      "/": "Dashboard",
    };

    return titles[path] || "Dashboard";
  }, [location.pathname]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearch?.(e.target.value);
    },
    [onSearch]
  );

  const clearSearch = useCallback(() => onSearch?.(""), [onSearch]);

  const handleRefreshClick = useCallback(async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      onViewModeChange?.(mode);
    },
    [onViewModeChange]
  );

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "sticky top-0 z-20 h-16 bg-moon-surface/80 backdrop-blur-lg",
        "border-b border-white/5 shadow-2xl shadow-moon-glowCyan/5",
        "bg-gradient-to-r from-moon-surface/90 via-moon-surface/80 to-moon-surface/90",
        className
      )}
    >
      <div className="w-full h-full px-6 flex items-center justify-between">
        {/* Left section - Menu and Title */}
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-moon-surface/20 text-moon-muted hover:text-moon-text transition-colors relative group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle sidebar"
          >
            <div className="absolute inset-0 bg-moon-glowCyan/5 group-hover:bg-moon-glowCyan/10 transition-colors rounded-xl" />
            {isSidebarCollapsed ? (
              <Menu className="w-5 h-5 relative z-10" />
            ) : (
              <X className="w-5 h-5 relative z-10" />
            )}
          </motion.button>
          <motion.div
            key={location.pathname}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-moon-glowCyan/50 to-moon-glowViolet/50 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
            <h1 className="relative text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet">
              {getTitle()}
            </h1>
          </motion.div>
        </div>

        {/* Middle section - Search */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-6">
          {showSearch && onSearch && (
            <motion.div
              className={`relative w-full rounded-xl transition-all duration-300 ${
                isSearchFocused
                  ? "ring-2 ring-moon-glowCyan/60 shadow-moonGlowCyan/30"
                  : "bg-moon-surface/30 hover:bg-moon-surface/40 shadow-moonGlowCyan/10 hover:shadow-moonGlowCyan/20"
              } backdrop-blur-sm`}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-moon-glowCyan/5 to-moon-glowViolet/5 rounded-xl" />
              <div className="relative z-10 flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    className={`h-4 w-4 ${
                      isSearchFocused ? "text-moon-glowCyan" : "text-moon-muted"
                    } transition-colors`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search mods, characters..."
                  className="block w-full pl-10 pr-10 py-2.5 bg-transparent border-0 text-moon-text placeholder-moon-muted/70 focus:ring-0 sm:text-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsSearchFocused(false), 200)
                  }
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-moon-muted hover:text-moon-text transition-colors"
                      aria-label="Clear search"
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 5 }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-3">
          {showViewToggle && onViewModeChange && (
            <div className="hidden sm:flex items-center bg-moon-surface/30 backdrop-blur-sm rounded-xl p-1">
              <button
                onClick={() => handleViewModeChange("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "text-moon-glowCyan bg-moon-surface/50 shadow-moonGlowCyan/30"
                    : "text-moon-muted hover:text-moon-glowCyan hover:bg-moon-surface/40"
                } hover:scale-110 active:scale-95`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-white/5 mx-0.5" />
              <button
                onClick={() => handleViewModeChange("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "text-moon-glowViolet bg-moon-surface/50 shadow-moonGlowViolet/30"
                    : "text-moon-muted hover:text-moon-glowViolet hover:bg-moon-surface/40"
                } hover:scale-110 active:scale-95`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl text-moon-muted hover:text-moon-glowCyan hover:bg-moon-surface/30 transition-all 
                  duration-300 hover:scale-110 active:scale-95 group relative overflow-hidden"
                title="Refresh"
              >
                <div className="absolute inset-0 bg-moon-glowCyan/5 group-hover:bg-moon-glowCyan/10 transition-colors rounded-xl" />
                <RefreshCw
                  className={`w-4 h-4 relative z-10 ${
                    isRefreshing ? "animate-spin" : "group-hover:animate-pulse"
                  }`}
                />
              </button>

              <NavLink
                to="/about"
                className={({ isActive }) => `
                  hidden sm:flex items-center px-4 py-2.5 rounded-xl transition-all duration-300
                  hover:scale-105 active:scale-95 group relative overflow-hidden
                  ${
                    isActive
                      ? "text-white bg-gradient-to-r from-moon-glowCyan/90 to-moon-glowViolet/90"
                      : "text-moon-muted hover:text-moon-text hover:bg-moon-surface/30"
                  }
                `}
              >
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors rounded-xl" />
                <span className="relative z-10 text-sm font-medium group-hover:drop-shadow-[0_0_4px_rgba(167,139,250,0.8)]">
                  About
                </span>
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;

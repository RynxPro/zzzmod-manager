import React, { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, Grid, List, RefreshCw, X, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

type ViewMode = 'grid' | 'list';

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
}

const TopBar: React.FC<TopBarProps> = ({
  searchQuery = '',
  onSearch,
  onRefresh,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true,
  showSearch = true,
  showActions = true,
  className = '',
  onToggleSidebar,
}) => {
  const location = useLocation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get current page title from route
  const getTitle = useCallback(() => {
    const path = location.pathname;
    if (path.startsWith('/characters/')) {
      const match = path.match(/^\/characters\/([^/]+)/);
      return match ? decodeURIComponent(match[1]) : 'Character';
    }
    
    const titles: Record<string, string> = {
      '/characters': 'Characters',
      '/settings': 'Settings',
      '/about': 'About',
      '/mods': 'Mod Library',
      '/presets': 'Presets',
      '/': 'Dashboard',
    };
    
    return titles[path] || 'Dashboard';
  }, [location.pathname]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
  }, [onSearch]);

  const clearSearch = useCallback(() => onSearch?.(''), [onSearch]);

  const handleRefreshClick = useCallback(async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    onViewModeChange?.(mode);
  }, [onViewModeChange]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`sticky top-0 z-20 h-16 bg-gradient-to-r from-moon-surface/80 via-moon-surface/70 to-moon-surface/80 
        backdrop-blur-md border-b border-white/5 shadow-lg shadow-moon-surface/10 ${className}`}
    >
      <div className="w-full h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left section - Title and menu */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-moon-glowCyan/10 text-moon-text/80 hover:text-moon-glowCyan transition-all 
              duration-200 hover:scale-105 active:scale-95 group"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
          
          <motion.h1 
            key={location.pathname}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet"
          >
            {getTitle()}
          </motion.h1>
        </div>

        {/* Middle section - Search */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4">
          {showSearch && onSearch && (
            <motion.div 
              className={`relative w-full rounded-xl transition-all duration-300 ${
                isSearchFocused 
                  ? 'ring-2 ring-moon-accent/70 shadow-moonGlowCyan' 
                  : 'bg-moon-surface/40 hover:bg-moon-surface/60 shadow-moonGlowCyan/20 hover:shadow-moonGlowCyan/30'
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-4 w-4 ${
                  isSearchFocused ? 'text-moon-glowCyan' : 'text-moon-muted'
                } transition-colors`} />
              </div>
              <input
                type="text"
                placeholder="Search mods, characters..."
                className="block w-full pl-10 pr-10 py-2.5 bg-transparent border-0 text-moon-text placeholder-moon-muted/70 focus:ring-0 sm:text-sm"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
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
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2">
          {showViewToggle && onViewModeChange && (
            <div className="hidden sm:flex items-center bg-moon-surface/50 rounded-lg p-0.5">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-moon-surface/80 text-moon-glowCyan shadow-moonGlowCyan/50' 
                    : 'text-moon-muted hover:text-moon-glowCyan hover:bg-moon-surface/40'
                } hover:scale-105 active:scale-95`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-moon-surface/80 text-moon-accent shadow-moonGlowViolet' 
                    : 'text-moon-muted hover:text-moon-text hover:bg-moon-surface/30'
                }`}
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
                className="p-2 rounded-lg text-moon-muted hover:text-moon-glowCyan hover:bg-moon-surface/30 transition-all 
                  duration-200 hover:rotate-180 disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
              </button>

              <button
                onClick={() => window.electronAPI.mods.chooseZip()}
                className="hidden sm:flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-moon-accent/80 to-moon-glowViolet/80 
                  text-white rounded-lg hover:shadow-moonGlowViolet/50 hover:shadow-md transition-all duration-200 
                  hover:scale-105 active:scale-95 group"
              >
                <Upload className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
                <span className="text-sm font-medium group-hover:drop-shadow-[0_0_4px_rgba(167,139,250,0.8)] transition-all">Upload</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;

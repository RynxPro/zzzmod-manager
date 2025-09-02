import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Upload, 
  Grid, 
  List, 
  Filter, 
  RefreshCw,
  ChevronDown,
  Plus,
  MoreHorizontal,
  X
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./Toast";

interface TopBarProps {
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showViewToggle?: boolean;
  showSearch?: boolean;
  showActions?: boolean;
  className?: string;
}

const TopBar: React.FC<TopBarProps> = ({
  onSearch,
  onRefresh,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true,
  showSearch = true,
  showActions = true,
  className = ''
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { success } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const match = location.pathname.match(/^\/characters\/(.+)$/);
  const charName = match ? decodeURIComponent(match[1]) : null;

  const getTitle = () => {
    if (charName) return charName;
    if (location.pathname.startsWith("/characters")) return "Characters";
    if (location.pathname.startsWith("/settings")) return "Settings";
    if (location.pathname.startsWith("/about")) return "About";
    if (location.pathname.startsWith("/mods")) return "Mod Library";
    if (location.pathname.startsWith("/presets")) return "Presets";
    return "Dashboard";
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        success('Refreshed successfully');
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleUploadMod = async () => {
    try {
      const filePath = await window.electronAPI.mods.chooseZip();
      if (filePath) {
        await window.electronAPI.mods.importZip(filePath, charName || undefined);
        success('Mod uploaded successfully');
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error uploading mod:', error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`h-16 bg-moon-surface/70 backdrop-blur-lg border-b border-white/5 relative z-20 ${className}`}
    >
      <div className="w-full h-full px-6 flex items-center justify-between">
        {/* Left section - Title and breadcrumbs */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet">
            {getTitle()}
          </h1>
          
          {charName && (
            <div className="flex items-center text-sm text-moon-muted">
              <span className="opacity-50">/</span>
              <span className="ml-2">Mods</span>
            </div>
          )}
        </div>

        {/* Middle section - Search */}
        {showSearch && (
          <div className="flex-1 max-w-2xl mx-8">
            <div className={`relative rounded-lg transition-all duration-200 ${
              isSearchFocused ? 'ring-2 ring-moon-accent/50 shadow-moonGlowCyan' : 'bg-moon-surface/50'
            }`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-moon-muted" />
              </div>
              <input
                type="text"
                placeholder="Search mods..."
                className="block w-full pl-10 pr-10 py-2.5 bg-transparent border-0 text-moon-text placeholder-moon-muted focus:ring-0 sm:text-sm"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-moon-muted hover:text-moon-text transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right section - Actions */}
        <div className="flex items-center space-x-3">
          {showViewToggle && onViewModeChange && (
            <div className="flex items-center bg-moon-surface/50 rounded-lg p-0.5">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-moon-surface/80 text-moon-accent shadow-moonGlowViolet' 
                    : 'text-moon-muted hover:text-moon-text hover:bg-moon-surface/30'
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
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

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-moon-muted hover:text-moon-text hover:bg-moon-surface/50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUploadMod}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-moon-glowCyan/90 to-moon-glowViolet/90 text-moon-bg font-medium text-sm hover:opacity-90 transition-opacity shadow-moonGlowCyan"
              >
                <Plus className="w-4 h-4" />
                <span>Add Mod</span>
              </button>

              <button className="p-2 rounded-lg text-moon-muted hover:text-moon-text hover:bg-moon-surface/50 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;

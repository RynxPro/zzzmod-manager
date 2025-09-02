import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Power, 
  Star, 
  Trash2, 
  MoreVertical, 
  Eye, 
  FolderOpen, 
  Download, 
  Heart, 
  HeartOff,
  Image as ImageIcon
} from 'lucide-react';
import { ModItem } from '../types/mods';
import { useToast } from './Toast';

// Define a more specific type for the mod prop in ModCard
interface ModCardModItem extends ModItem {
  thumbnail?: string;
  conflict?: boolean;
  isFavorite: boolean;
  installPath?: string;
}

interface ModCardProps {
  mod: ModCardModItem;
  isSelected?: boolean;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  onDelete: (id: string) => void;
  onFavorite: (id: string, favorite: boolean) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const ModCard: React.FC<ModCardProps> = ({
  mod,
  isSelected = false,
  onToggle,
  onDelete,
  onFavorite,
  viewMode = 'grid',
  className = ''
}) => {
  const { success, error } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    try {
      setIsToggling(true);
      await onToggle(mod.id, !mod.enabled);
      success(`Mod ${!mod.enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      console.error('Error toggling mod:', err);
      error('Failed to toggle mod. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite(mod.id, !mod.isFavorite);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(mod.id);
    setIsMenuOpen(false);
  };

  const handleOpenFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (mod.installPath) {
        const result = await window.electronAPI.mods.showItemInFolder(mod.installPath);
        if (!result?.success) {
          throw new Error(result?.error || 'Failed to open folder');
        }
      } else {
        throw new Error('No install path available for this mod');
      }
    } catch (err: unknown) {
      console.error('Error opening mod folder:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to open mod folder';
      error(errorMessage);
    } finally {
      setIsMenuOpen(false);
    }
  };

  const getStatusBadge = () => {
    if (mod.conflict) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
          Conflict
        </span>
      );
    }
    if (mod.enabled) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
        Inactive
      </span>
    );
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`relative group bg-moon-surface/50 rounded-xl border border-white/5 overflow-hidden transition-all duration-200 ${
          isSelected ? 'ring-2 ring-moon-accent/50 shadow-moonGlowViolet' : 'hover:bg-moon-surface/70'
        } ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (!isMenuOpen) setIsMenuOpen(false);
        }}
      >
        <div className="flex items-center p-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-16 h-16 rounded-lg bg-moon-surface/30 overflow-hidden">
            {mod.thumbnail ? (
              <img
                src={mod.thumbnail}
                alt={mod.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = ''; // Clear the src to prevent infinite error loop
                  target.className = 'w-full h-full flex items-center justify-center bg-moon-surface/30';
                  target.innerHTML = '<div class="text-moon-muted"><ImageIcon className="w-6 h-6" /></div>';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-moon-surface/30 text-moon-muted">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Mod Info */}
          <div className="ml-4 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-moon-text truncate">{mod.name}</h3>
              <div className="flex items-center space-x-2">
                {getStatusBadge()}
                {mod.isFavorite && (
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
                )}
              </div>
            </div>
            <p className="mt-0.5 text-xs text-moon-muted truncate">{mod.description || 'No description'}</p>
            <div className="mt-1.5 flex items-center text-xs text-moon-muted">
              <span>{mod.author || 'Unknown Author'}</span>
              <span className="mx-2">•</span>
              <span>v{mod.version || '1.0.0'}</span>
              {mod.character && (
                <>
                  <span className="mx-2">•</span>
                  <span className="px-1.5 py-0.5 rounded bg-moon-accent/10 text-moon-accent text-xs">
                    {mod.character}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="ml-4 flex items-center space-x-2">
            <button
              onClick={handleFavorite}
              className={`p-1.5 rounded-md transition-colors ${
                mod.isFavorite 
                  ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' 
                  : 'text-moon-muted hover:bg-moon-surface/50 hover:text-moon-text'
              }`}
              title={mod.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {mod.isFavorite ? (
                <Heart className="w-4 h-4 fill-current" />
              ) : (
                <Heart className="w-4 h-4" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-md text-moon-muted hover:bg-moon-surface/50 hover:text-moon-text transition-colors"
                title="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute right-0 mt-1 w-48 bg-moon-surface/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/5 z-10 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={handleOpenFolder}
                      className="w-full px-4 py-2 text-left text-sm text-moon-text hover:bg-moon-surface/50 flex items-center"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Open Folder
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Mod
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moon-accent/50 ${
                mod.enabled ? 'bg-moon-accent' : 'bg-moon-surface/50'
              }`}
              role="switch"
              aria-checked={mod.enabled}
              aria-label={mod.enabled ? 'Disable mod' : 'Enable mod'}
            >
              <span
                className={`${
                  mod.enabled ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative group bg-moon-surface/50 rounded-xl border border-white/5 overflow-hidden transition-all duration-200 ${
        isSelected ? 'ring-2 ring-moon-accent/50 shadow-moonGlowViolet' : 'hover:bg-moon-surface/70'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isMenuOpen) setIsMenuOpen(false);
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-moon-surface/30 overflow-hidden">
        {mod.thumbnail ? (
          <img
            src={mod.thumbnail}
            alt={mod.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = ''; // Clear the src to prevent infinite error loop
              target.className = 'w-full h-full flex items-center justify-center bg-moon-surface/30';
              target.innerHTML = '<div class="text-moon-muted"><ImageIcon className="w-8 h-8" /></div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-moon-surface/30 text-moon-muted">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
        
        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4"
            >
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-white line-clamp-1">{mod.name}</h3>
                    <p className="text-xs text-moon-muted mt-0.5 line-clamp-2">
                      {mod.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={handleFavorite}
                      className={`p-1.5 rounded-md transition-colors ${
                        mod.isFavorite 
                          ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' 
                          : 'text-white/70 hover:bg-white/10'
                      }`}
                      title={mod.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {mod.isFavorite ? (
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Heart className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-1.5 rounded-md text-white/70 hover:bg-white/10 transition-colors"
                      title="More options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {mod.character && (
                      <span className="px-1.5 py-0.5 rounded bg-moon-accent/10 text-moon-accent text-[10px] font-medium">
                        {mod.character}
                      </span>
                    )}
                    <span className="text-xs text-moon-muted">v{mod.version || '1.0.0'}</span>
                  </div>
                  
                  <button
                    onClick={handleToggle}
                    disabled={isToggling}
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moon-accent/50 ${
                      mod.enabled ? 'bg-moon-accent' : 'bg-moon-surface/50'
                    }`}
                    role="switch"
                    aria-checked={mod.enabled}
                    aria-label={mod.enabled ? 'Disable mod' : 'Enable mod'}
                  >
                    <span
                      className={`${
                        mod.enabled ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {getStatusBadge()}
        </div>
        
        {/* Favorite Badge */}
        {mod.isFavorite && !isHovered && (
          <div className="absolute top-2 left-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
          </div>
        )}
      </div>
      
      {/* Mod Info (visible when not hovered in grid view) */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-moon-text truncate">{mod.name}</h3>
            <p className="text-xs text-moon-muted truncate">{mod.author || 'Unknown Author'}</p>
          </div>
        </div>
      </div>
      
      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-2 top-12 w-48 bg-moon-surface/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/5 z-10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleOpenFolder}
              className="w-full px-4 py-2 text-left text-sm text-moon-text hover:bg-moon-surface/50 flex items-center"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Open Folder
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Mod
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModCard;

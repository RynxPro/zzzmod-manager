import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiSave, FiPlay, FiTrash2, FiLoader, FiSearch, FiX, FiClock, FiGrid } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PresetSaveDialog from './PresetSaveDialog';
import { useToast } from '../ui/components/Toast';
// Using a simple date formatter since we can't install date-fns right now
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
  
  return 'just now';
};

export interface Preset {
  name: string;
  mods: string[];
  createdAt?: Date | string;
  modCount?: number;
  [key: string]: unknown; // Allow additional properties
}

interface PresetsManagerProps {
  searchQuery?: string;
}

export const PresetsManager: React.FC<PresetsManagerProps> = ({ searchQuery = '' }) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<{type: 'apply' | 'delete', name: string} | null>(null);
  const { success, error: showError, warning } = useToast();

  const fetchPresets = useCallback(async () => {
    try {
      setIsLoading(true);
      const presetList = await window.electronAPI.mods.listPresets() as Array<{
        name: string;
        mods: string[];
        createdAt?: string | Date;
      }>;
      
      // Process presets to ensure they have required fields
      const processedPresets = presetList.map(preset => ({
        ...preset,
        modCount: preset.mods?.length || 0,
        createdAt: preset.createdAt ? new Date(preset.createdAt) : new Date()
      }));
      setPresets(processedPresets);
    } catch (err) {
      showError({
        title: 'Failed to load presets',
        message: 'Please try again later',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const handleSavePreset = async (name: string) => {
    try {
      setActiveAction({ type: 'apply', name });
      const result = await window.electronAPI.mods.savePreset(name);
      success({
        title: 'Preset saved',
        message: `"${name}" has been saved successfully`,
        type: 'success'
      });
      fetchPresets();
    } catch (err) {
      showError({
        title: 'Failed to save preset',
        message: err instanceof Error ? err.message : 'An unknown error occurred',
        type: 'error'
      });
    } finally {
      setActiveAction(null);
      setSaveDialogOpen(false);
    }
  };

  const handleApplyPreset = async (name: string) => {
    try {
      setActiveAction({ type: 'apply', name });
      const result = await window.electronAPI.mods.applyPreset(name);
      
      if (result.missingMods.length > 0) {
        warning({
          title: 'Preset applied with missing mods',
          message: `Skipped ${result.missingMods.length} missing mod(s) while applying "${name}"`,
          type: 'warning'
        });
      } else {
        success({
          title: 'Preset applied',
          message: `"${name}" has been applied successfully`,
          type: 'success'
        });
      }
    } catch (err) {
      showError({
        title: 'Failed to apply preset',
        message: err instanceof Error ? err.message : 'An unknown error occurred',
        type: 'error'
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleDeletePreset = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete the preset "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActiveAction({ type: 'delete', name });
      await window.electronAPI.mods.deletePreset(name);
      
      success({
        title: 'Preset deleted',
        message: `"${name}" has been removed`,
        type: 'success'
      });
      
      fetchPresets();
    } catch (err) {
      showError({
        title: 'Failed to delete preset',
        message: err instanceof Error ? err.message : 'An unknown error occurred',
        type: 'error'
      });
    } finally {
      setActiveAction(null);
    }
  };

  const isActionInProgress = (type: 'apply' | 'delete', name: string) => {
    return activeAction?.type === type && activeAction?.name === name;
  };

  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return presets;
    const query = searchQuery.toLowerCase();
    return presets.filter((preset: Preset) => 
      preset.name.toLowerCase().includes(query) ||
      (preset.mods?.some((mod: string) => mod.toLowerCase().includes(query)) ?? false)
    );
  }, [presets, searchQuery]);

  return (
    <div className="w-full bg-moon-surface/70 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-moon-text">MOD PRESETS</h3>
        <motion.button
          onClick={() => setSaveDialogOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
            bg-moon-accent/10 text-moon-accent border border-moon-accent/20
            hover:bg-moon-accent/20 hover:shadow-moonGlowCyan hover:shadow-moon-accent/20
            focus:outline-none focus:ring-2 focus:ring-moon-accent/50 focus:ring-offset-2 focus:ring-offset-moon-surface/70
            ${activeAction ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!!activeAction}
        >
          <FiSave className={`transition-opacity ${activeAction ? 'opacity-50' : ''}`} />
          <span className={`font-medium ${activeAction ? 'opacity-50' : ''}`}>Save Current Preset</span>
        </motion.button>
      </div>
      <div className="space-y-3">
        {/* Search Info Bar */}
        {searchQuery && (
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="text-sm text-moon-text/60">
              {filteredPresets.length} preset{filteredPresets.length !== 1 ? 's' : ''} found
              {searchQuery && ` for "${searchQuery}"`}
            </div>
            {searchQuery && (
              <button 
                onClick={() => {}}
                className="text-xs text-moon-glowViolet hover:text-moon-glowCyan transition-colors flex items-center gap-1"
              >
                <FiX size={14} /> Clear search
              </button>
            )}
          </div>
        )}

        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i: number) => (
                <div key={i} className="h-16 bg-moon-surface/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredPresets.length === 0 ? (
            <div className="text-center py-12 bg-moon-surface/30 rounded-lg border border-dashed border-white/10">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-moon-surface/50 border border-dashed border-moon-text/20 flex items-center justify-center text-moon-text/40">
                <FiSave size={24} />
              </div>
              <p className="text-moon-text/70">
                {searchQuery 
                  ? 'No presets match your search'
                  : 'No presets found'}
              </p>
              <p className="text-sm text-moon-text/50 mt-1 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try a different search term or create a new preset.'
                  : 'Save your current mod setup as a preset for quick access later.'}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredPresets.map((preset: Preset) => {
                const isApplying = isActionInProgress('apply', preset.name);
                const isDeleting = isActionInProgress('delete', preset.name);
                const isDisabled = isApplying || isDeleting || !!activeAction;
                
                return (
                  <motion.div 
                    key={preset.name}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`group flex items-center justify-between p-4 bg-moon-surface/80 rounded-lg border ${
                      isApplying ? 'border-moon-accent/30' : 
                      isDeleting ? 'border-red-500/30' : 
                      'border-white/5 hover:border-moon-glowViolet/30'
                    } ${isDisabled ? 'opacity-50' : 'hover:bg-moon-surface/90 transition-colors'}`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-moon-text truncate">{preset.name}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs">
                        <span className="flex items-center text-moon-text/60">
                          <FiGrid className="mr-1.5" size={12} />
                          {preset.modCount} mod{preset.modCount !== 1 ? 's' : ''}
                        </span>
                        {preset.createdAt && (
                          <span className="flex items-center text-moon-text/50" title={new Date(preset.createdAt).toLocaleString()}>
                            <FiClock className="mr-1.5 flex-shrink-0" size={12} />
                            {formatTimeAgo(new Date(preset.createdAt))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          !isDisabled && handleApplyPreset(preset.name);
                        }}
                        disabled={isDisabled}
                        whileHover={!isDisabled ? { scale: 1.05 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        className={`p-2 rounded-md transition-all relative group/btn ${
                          isApplying && preset.name === activeAction?.name
                            ? "text-moon-accent/80"
                            : "text-moon-glowingCyan/80 hover:bg-moon-glowingCyan/10 hover:text-moon-glowingCyan"
                        }`}
                        title={isApplying ? 'Applying...' : 'Apply Preset'}
                      >
                        <span className="absolute -top-2 -right-2 text-[10px] font-medium bg-moon-glowCyan/90 text-moon-bg px-1.5 py-0.5 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity">
                          Apply
                        </span>
                        {isApplying && preset.name === activeAction?.name ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <FiPlay />
                        )}
                      </motion.button>
                    
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          !isDisabled && handleDeletePreset(preset.name);
                        }}
                        disabled={isDisabled}
                        whileHover={!isDisabled ? { scale: 1.05 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        className={`p-2 rounded-md transition-all relative group/btn ${
                          isDeleting && preset.name === activeAction?.name
                            ? "text-red-400/80"
                            : "text-red-400/60 hover:bg-red-500/10 hover:text-red-400/90"
                        }`}
                        title={isDeleting ? 'Deleting...' : 'Delete Preset'}
                      >
                        <span className="absolute -top-2 -right-2 text-[10px] font-medium bg-red-500/90 text-white px-1.5 py-0.5 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity">
                          Delete
                        </span>
                        {isDeleting && preset.name === activeAction?.name ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <FiTrash2 />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <PresetSaveDialog
            isOpen={isSaveDialogOpen}
            onClose={() => setSaveDialogOpen(false)}
            onSave={handleSavePreset}
          />
        </div>
      </div>
    </div>
  );
};

// Export as default for backward compatibility
export default PresetsManager;

import React, { useState, useEffect, useCallback } from 'react';
import { FiSave, FiPlay, FiTrash2, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PresetSaveDialog from './PresetSaveDialog';
import { useToast } from '../ui/components/Toast';

interface Preset {
  name: string;
  mods: string[];
}

const PresetsManager: React.FC = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<{type: 'apply' | 'delete', name: string} | null>(null);
  const { success, error: showError, warning } = useToast();

  const fetchPresets = useCallback(async () => {
    try {
      setIsLoading(true);
      const presetList = await window.electronAPI.mods.listPresets();
      setPresets(presetList);
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

  return (
    <div className="bg-moon-surface/70 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
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

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="animate-spin text-moon-accent" size={24} />
            <span className="ml-2 text-moon-text/70">Loading presets...</span>
          </div>
        ) : presets.length === 0 ? (
          <div className="text-center py-8 bg-moon-surface/30 rounded-lg border border-dashed border-white/10">
            <p className="text-moon-text/70">No presets found</p>
            <p className="text-sm text-moon-text/50 mt-1">Save your current mod setup as a preset</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {presets.map((preset) => {
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
                  className={`flex items-center justify-between p-3 bg-moon-surface/80 rounded-lg border ${
                    isApplying ? 'border-moon-accent/30' : 
                    isDeleting ? 'border-red-500/30' : 
                    'border-white/5'
                  } ${isDisabled ? 'opacity-50' : ''}`}
                >
                  <span className="font-medium text-moon-text truncate">{preset.name}</span>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => !isDisabled && handleApplyPreset(preset.name)}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { scale: 1.1 } : {}}
                      whileTap={!isDisabled ? { scale: 0.95 } : {}}
                      className={`p-2 rounded-md transition-colors relative ${
                        isApplying && preset.name === activeAction?.name
                          ? "text-moon-accent/80"
                          : "text-moon-glowingCyan/80 hover:bg-moon-glowingCyan/10 hover:text-moon-glowingCyan"
                      }`}
                      title={isApplying ? 'Applying...' : 'Apply Preset'}
                    >
                      {isApplying && preset.name === activeAction?.name ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <FiPlay />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => !isDisabled && handleDeletePreset(preset.name)}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { scale: 1.1 } : {}}
                      whileTap={!isDisabled ? { scale: 0.95 } : {}}
                      className={`p-2 rounded-md transition-colors ${
                        isDeleting && preset.name === activeAction?.name
                          ? "text-red-400/80"
                          : "text-red-400/60 hover:bg-red-500/10 hover:text-red-400/90"
                      }`}
                      title={isDeleting ? 'Deleting...' : 'Delete Preset'}
                    >
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
      </div>
      <PresetSaveDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSavePreset}
      />
    </div>
  );
};

export default PresetsManager;

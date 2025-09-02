import React, { useState, useEffect, useCallback } from 'react';
import { FiSave, FiPlay, FiTrash2 } from 'react-icons/fi';
import PresetSaveDialog from './PresetSaveDialog';
import { useToast } from '../ui/components/Toast';

interface Preset {
  name: string;
  mods: string[];
}

const PresetsManager: React.FC = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const { success, error: showError, warning } = useToast();

  const fetchPresets = useCallback(async () => {
    try {
      const presetList = await window.electronAPI.mods.listPresets();
      setPresets(presetList);
    } catch (err) {
      showError('Failed to load presets.');
    }
  }, [showError]);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const handleSavePreset = async (name: string) => {
    try {
      await window.electronAPI.mods.savePreset(name);
      success(`Preset "${name}" saved.`);
      fetchPresets();
    } catch (err) {
      showError('Failed to save preset.');
    } finally {
      setSaveDialogOpen(false);
    }
  };

  const handleApplyPreset = async (name: string) => {
    try {
      const result = await window.electronAPI.mods.applyPreset(name);
      if (result.missingMods.length > 0) {
        warning(`Applied "${name}" but skipped ${result.missingMods.length} missing mod(s).`);
      } else {
        success(`Preset "${name}" applied successfully.`);
      }
    } catch (err) {
      showError('Failed to apply preset.');
    }
  };

  const handleDeletePreset = async (name: string) => {
    try {
      await window.electronAPI.mods.deletePreset(name);
      success(`Preset "${name}" deleted.`);
      fetchPresets();
    } catch (err) {
      showError('Failed to delete preset.');
    }
  };

  return (
    <div className="bg-moon-surface/70 border border-white/5 rounded-xl p-4 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-4 text-moon-text">MOD PRESETS</h3>
      <button
        onClick={() => setSaveDialogOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 rounded-lg bg-moon-accent/10 text-moon-accent border border-moon-accent/20 hover:bg-moon-accent/20 hover:shadow-moonGlowCyan transition-all duration-200"
      >
        <FiSave />
        <span>Save Current Preset</span>
      </button>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {presets.map((preset) => (
          <div key={preset.name} className="flex items-center justify-between p-2 bg-moon-surface rounded-md border border-white/5">
            <span className="font-medium text-moon-text truncate">{preset.name}</span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleApplyPreset(preset.name)} 
                className="p-2 rounded-md text-moon-glowingCyan/80 hover:bg-moon-glowingCyan/10 hover:text-moon-glowingCyan transition-colors"
                title="Apply Preset"
              >
                <FiPlay />
              </button>
              <button 
                onClick={() => handleDeletePreset(preset.name)} 
                className="p-2 rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Delete Preset"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
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

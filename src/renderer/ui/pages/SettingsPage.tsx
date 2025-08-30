import React from "react";
import { motion } from "framer-motion";
import { FolderOpen, Save, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "../components/Toast";

const SettingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [modsDir, setModsDir] = React.useState<string>("");
  const [saving, setSaving] = React.useState<boolean>(false);

  // Load settings on mount, retry if electronAPI is not yet ready
  React.useEffect(() => {
    const loadSettings = async () => {
      // Wait until electronAPI is available
      if (window.electronAPI?.settings?.get) {
        try {
          const s = await window.electronAPI.settings.get();
          setModsDir(s.modsDir || "");
        } catch (err) {
          // Show error if settings cannot be loaded
          error("Failed to load settings", err?.message || String(err));
        }
      } else {
        setTimeout(loadSettings, 100);
      }
    };
    loadSettings();
  }, []);

  // Select the ZZMI Mods folder
  const chooseModsDir = async () => {
    if (!window.electronAPI?.settings?.chooseModsDir) {
      alert("Mods folder selection is not available.");
      return;
    }
    try {
      const dir = await window.electronAPI.settings.chooseModsDir();
      if (dir) {
        setModsDir(dir);
        // Update modsDir in settings immediately
        if (window.electronAPI?.settings?.set) {
          await window.electronAPI.settings.set({ modsDir: dir });
        }
      }
    } catch (err) {
      error("Failed to select mods folder", err?.message || String(err));
    }
  };

  // Save settings and provide feedback
  const save = async () => {
    setSaving(true);
    try {
      await window.electronAPI.settings.set({ modsDir });
      console.log("Settings saved");
      success("Settings saved", "Your settings have been saved successfully.");
    } catch (err) {
      error("Failed to save settings", err?.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const canBrowse = Boolean(window.electronAPI?.settings?.chooseModsDir);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gaming-text-primary mb-2">
          Settings
        </h1>
        <p className="text-gaming-text-secondary">
          Configure your mod manager preferences
        </p>
      </motion.div>

      {/* Settings Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="glass-panel rounded-2xl p-6 space-y-6"
      >
        {/* Mods Directory */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gaming-text-primary">
            <SettingsIcon size={16} className="text-gaming-accent-violet" />
            ZZMI Mods Folder
          </label>
          <div className="flex gap-3">
            <input
              value={modsDir}
              onChange={(e) => setModsDir(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-gaming-bg-card/60 border border-gaming-border-accent/30 text-sm font-medium placeholder:text-gaming-text-muted focus:outline-none focus:border-gaming-accent-cyan/50 focus:shadow-glow transition-all duration-300"
              placeholder="Select your ZZMI mods folder"
            />
            <motion.button
              onClick={chooseModsDir}
              className={`gaming-button-secondary flex items-center gap-2 px-4 py-3${
                !canBrowse ? " opacity-60 cursor-not-allowed" : ""
              }`}
              whileHover={{
                scale: canBrowse ? 1.02 : 1,
              }}
              whileTap={{
                scale: canBrowse ? 0.98 : 1,
              }}
              disabled={!canBrowse}
            >
              <FolderOpen size={16} />
              Browse
            </motion.button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-4 border-t border-gaming-border-accent/30">
          <motion.button
            onClick={save}
            disabled={saving}
            className="gaming-button-primary flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: saving ? 1 : 1.02 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Settings"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;

import React from "react";
import { motion } from "framer-motion";
import { FolderOpen, Save, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "../components/Toast";

const SettingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [modsDir, setModsDir] = React.useState<string>("");
  const [saving, setSaving] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  // Load settings on mount, retry if electronAPI is not yet ready
  React.useEffect(() => {
    const loadSettings = async () => {
      // Wait until electronAPI is available
      if (window.electronAPI?.settings?.get) {
        try {
          const s = await window.electronAPI.settings.get();
          setModsDir(s.modsDir || "");
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          // Show error if settings cannot be loaded
          error("Failed to load settings", errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : String(err);
      error("Failed to select mods folder", errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : String(err);
      error("Failed to save settings", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const canBrowse = Boolean(window.electronAPI?.settings?.chooseModsDir);

  const backupData = async () => {
    if (!window.electronAPI?.settings?.backup) return;
    setBusy(true);
    try {
      const res = await window.electronAPI.settings.backup();
      if (res?.canceled) return;
      if (res?.success) {
        success("Backup complete", res.path || "Backup created successfully.");
      } else {
        error("Backup failed", res?.error || "Unknown error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      error("Backup failed", msg);
    } finally {
      setBusy(false);
    }
  };

  const resetApp = async () => {
    if (!window.electronAPI?.settings?.resetApp) return;
    const confirmed = window.confirm(
      "This will clear all app data (mods database, config). Your actual game mods folder is unaffected. Continue?"
    );
    if (!confirmed) return;
    setBusy(true);
    try {
      const res = await window.electronAPI.settings.resetApp();
      if (res?.success) {
        success("App reset", "Data cleared. Please restart the app.");
      } else {
        error("Reset failed", res?.error || "Unknown error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      error("Reset failed", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-moon-text mb-2">Settings</h1>
        <p className="text-moon-muted">
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
          <label className="flex items-center gap-2 text-sm font-medium text-moon-text">
            <SettingsIcon size={16} className="text-moon-accent" />
            ZZMI Mods Folder
          </label>
          <div className="flex gap-3">
            <input
              value={modsDir}
              onChange={(e) => setModsDir(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-moon-surface/70 border border-white/5 text-sm font-medium placeholder:text-moon-muted text-moon-text focus:outline-none focus:ring-2 focus:ring-moon-accent focus:border-transparent hover:shadow-moonGlowCyan transition-all duration-300"
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
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
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
        {/* Maintenance actions */}
        <div className="grid sm:grid-cols-2 gap-3">
          <motion.button
            onClick={backupData}
            disabled={busy}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-moon-surface/80 border border-white/5 text-moon-text hover:border-white/10 hover:shadow-moonGlowCyan disabled:opacity-50 transition-all"
            whileHover={{ scale: busy ? 1 : 1.02 }}
            whileTap={{ scale: busy ? 1 : 0.98 }}
          >
            <FolderOpen size={16} />
            Backup Data
          </motion.button>
          <motion.button
            onClick={resetApp}
            disabled={busy}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-900/40 border border-red-500/30 text-red-200 hover:bg-red-800/50 hover:shadow-[0_0_12px_rgba(239,68,68,0.25)] disabled:opacity-50 transition-all"
            whileHover={{ scale: busy ? 1 : 1.02 }}
            whileTap={{ scale: busy ? 1 : 0.98 }}
          >
            <SettingsIcon size={16} />
            Reset App
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;

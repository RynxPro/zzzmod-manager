import React from "react";
import { motion } from "framer-motion";
import { FolderOpen, Save, Trash2, Settings as SettingsIcon } from "lucide-react";

const SettingsPage: React.FC = () => {
  const [gameDir, setGameDir] = React.useState<string>("");
  const [modsDir, setModsDir] = React.useState<string>("");
  const [saving, setSaving] = React.useState<boolean>(false);
  const [clearing, setClearing] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      const s = await window.electronAPI.settings.get();
      setGameDir(s.gameDir || "");
      setModsDir(s.modsDir || "");
    })();
  }, []);

  const chooseGameDir = async () => {
    const dir = await window.electronAPI.settings.chooseGameDir();
    if (dir) setGameDir(dir);
  };

  const chooseModsDir = async () => {
    const dir = await window.electronAPI.settings.chooseModsDir();
    if (dir) setModsDir(dir);
  };

  const save = async () => {
    setSaving(true);
    try {
      await window.electronAPI.settings.set({ gameDir, modsDir });
    } finally {
      setSaving(false);
    }
  };

  const clearBackups = async () => {
    setClearing(true);
    try {
      await window.electronAPI.settings.clearBackups();
    } finally {
      setClearing(false);
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
        {/* Game Directory */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gaming-text-primary">
            <SettingsIcon size={16} className="text-gaming-accent-cyan" />
            Game Directory
          </label>
          <div className="flex gap-3">
            <input
              value={gameDir}
              onChange={(e) => setGameDir(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-gaming-bg-card/60 border border-gaming-border-accent/30 text-sm font-medium placeholder:text-gaming-text-muted focus:outline-none focus:border-gaming-accent-cyan/50 focus:shadow-glow transition-all duration-300"
              placeholder="/path/to/zzz/game"
            />
            <motion.button
              onClick={chooseGameDir}
              className="gaming-button-secondary flex items-center gap-2 px-4 py-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FolderOpen size={16} />
              Browse
            </motion.button>
          </div>
        </div>

        {/* Mods Directory */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gaming-text-primary">
            <SettingsIcon size={16} className="text-gaming-accent-violet" />
            Mods Directory
          </label>
          <div className="flex gap-3">
            <input
              value={modsDir}
              onChange={(e) => setModsDir(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-gaming-bg-card/60 border border-gaming-border-accent/30 text-sm font-medium placeholder:text-gaming-text-muted focus:outline-none focus:border-gaming-accent-cyan/50 focus:shadow-glow transition-all duration-300"
              placeholder="/path/to/mods"
            />
            <motion.button
              onClick={chooseModsDir}
              className="gaming-button-secondary flex items-center gap-2 px-4 py-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FolderOpen size={16} />
              Browse
            </motion.button>
          </div>
        </div>

        {/* Action Buttons */}
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
          
          <motion.button
            onClick={clearBackups}
            disabled={clearing}
            className="px-4 py-2.5 rounded-xl bg-gaming-status-conflict/20 hover:bg-gaming-status-conflict/30 text-gaming-status-conflict border border-gaming-status-conflict/30 hover:shadow-glow transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: clearing ? 1 : 1.02 }}
            whileTap={{ scale: clearing ? 1 : 0.98 }}
          >
            <Trash2 size={16} />
            {clearing ? "Clearing..." : "Clear Backups"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;

import React from "react";

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
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="rounded-lg border border-neutral-800 p-4 bg-neutral-900/50 space-y-4">
        <div>
          <label className="block text-sm text-neutral-400 mb-1">
            Game Directory
          </label>
          <div className="flex gap-2">
            <input
              value={gameDir}
              onChange={(e) => setGameDir(e.target.value)}
              className="flex-1 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="/path/to/game"
            />
            <button
              onClick={chooseGameDir}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500"
            >
              Browse
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-400 mb-1">
            Mods Directory
          </label>
          <div className="flex gap-2">
            <input
              value={modsDir}
              onChange={(e) => setModsDir(e.target.value)}
              className="flex-1 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="/path/to/mods"
            />
            <button
              onClick={chooseModsDir}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500"
            >
              Browse
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-neutral-700 px-3 py-2 text-sm font-medium hover:bg-neutral-600 disabled:opacity-50"
          >
            Save Settings
          </button>
          <button
            onClick={clearBackups}
            disabled={clearing}
            className="rounded-md bg-red-700 px-3 py-2 text-sm font-medium hover:bg-red-600 disabled:opacity-50"
          >
            Clear Backups
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

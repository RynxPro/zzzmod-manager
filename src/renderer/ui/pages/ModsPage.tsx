import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type ImportState = "idle" | "drag" | "importing";

const ModsPage: React.FC = () => {
  const [mods, setMods] = React.useState<ModItem[]>([]);
  const [importState, setImportState] = React.useState<ImportState>("idle");
  const [query, setQuery] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<"name" | "date" | "size">("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      const items = await window.electronAPI.mods.list();
      setMods(items);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load mods");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleEnableToggle = async (mod: ModItem) => {
    if (mod.enabled) {
      await window.electronAPI.mods.disable(mod.id);
    } else {
      await window.electronAPI.mods.enable(mod.id);
    }
    await refresh();
  };

  const handleDelete = async (mod: ModItem) => {
    await window.electronAPI.mods.remove(mod.id);
    await refresh();
  };

  const handleChooseZip = async () => {
    const file = await window.electronAPI.mods.chooseZip();
    if (!file) return;
    setImportState("importing");
    try {
      await window.electronAPI.mods.importZip(file);
      await refresh();
    } finally {
      setImportState("idle");
    }
  };

  const handleChooseFolder = async () => {
    const dir = await window.electronAPI.mods.chooseFolder();
    if (!dir) return;
    setImportState("importing");
    try {
      await window.electronAPI.mods.importFolder(dir);
      await refresh();
    } finally {
      setImportState("idle");
    }
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setImportState("drag");
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    setImportState("idle");
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    setImportState("importing");
    try {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        if (file.name.toLowerCase().endsWith(".zip")) {
          await window.electronAPI.mods.importZip(
            file.path as unknown as string
          );
        } else {
          await window.electronAPI.mods.importFolder(
            file.path as unknown as string
          );
        }
      }
      await refresh();
    } finally {
      setImportState("idle");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-semibold">Mods</h2>
        <div className="flex items-center gap-2 ml-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mods..."
            className="rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-56"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-md bg-neutral-800 border border-neutral-700 px-2 py-2 text-sm"
            title="Sort by"
          >
            <option value="name">Name</option>
            <option value="date">Date Added</option>
            <option value="size">Size</option>
          </select>
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="rounded-md bg-neutral-700 px-2 py-2 text-sm hover:bg-neutral-600"
            title="Toggle sort direction"
          >
            {sortDir === "asc" ? "Asc" : "Desc"}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleChooseZip}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
            disabled={importState === "importing"}
          >
            Import ZIP
          </button>
          <button
            onClick={handleChooseFolder}
            className="rounded-md bg-neutral-700 px-3 py-2 text-sm font-medium hover:bg-neutral-600 disabled:opacity-50"
            disabled={importState === "importing"}
          >
            Import Folder
          </button>
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`rounded-lg border p-6 mb-4 transition-colors ${
          importState === "drag"
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-neutral-800 bg-neutral-900/50"
        }`}
      >
        <p className="text-neutral-300 text-sm">
          Drag & drop mod ZIPs or folders here to import.
        </p>
      </div>

      {loading && <p className="text-neutral-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && mods.length === 0 && (
        <div className="rounded-lg border border-neutral-800 p-6 bg-neutral-900/50 text-neutral-400">
          No mods installed yet.
        </div>
      )}

      {(() => {
        const q = query.trim().toLowerCase();
        const filtered = mods.filter(
          (m) =>
            !q ||
            m.name.toLowerCase().includes(q) ||
            m.author.toLowerCase().includes(q) ||
            (m.description || "").toLowerCase().includes(q)
        );
        const sorted = [...filtered].sort((a, b) => {
          let cmp = 0;
          if (sortBy === "name") {
            cmp = a.name.localeCompare(b.name);
          } else if (sortBy === "date") {
            cmp = (a.dateAdded || 0) - (b.dateAdded || 0);
          } else if (sortBy === "size") {
            cmp = (a.sizeBytes || 0) - (b.sizeBytes || 0);
          }
          return sortDir === "asc" ? cmp : -cmp;
        });
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {sorted.map((mod) => (
                <motion.div
                  layout
                  key={mod.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  {mod.thumbnailPath && (
                    <img
                      src={`file://${mod.thumbnailPath}`}
                      alt={mod.name}
                      className="w-full h-32 object-cover rounded-lg border border-neutral-200 dark:border-neutral-800"
                    />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {mod.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        v{mod.version} • {mod.author}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-md border whitespace-nowrap ${
                        mod.enabled
                          ? "border-green-300 dark:border-green-700 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                          : "border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      {mod.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3">
                    {mod.description}
                  </p>
                  <div className="text-xs text-neutral-500">
                    <span>
                      {typeof mod.sizeBytes === "number"
                        ? formatBytes(mod.sizeBytes)
                        : "—"}
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      {mod.dateAdded
                        ? new Date(mod.dateAdded).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleEnableToggle(mod)}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        mod.enabled
                          ? "bg-neutral-200 hover:bg-neutral-300 text-neutral-900 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-50"
                          : "bg-green-600 hover:bg-green-500 text-white"
                      }`}
                    >
                      {mod.enabled ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleDelete(mod)}
                      className="rounded-md px-3 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        );
      })()}
    </div>
  );
};

export default ModsPage;
function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value < 10 && unit > 0 ? 1 : 0)} ${units[unit]}`;
}

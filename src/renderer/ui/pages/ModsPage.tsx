import React from "react";
import { ModItem } from "../types/mods";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FolderOpen,
  Filter,
  ArrowUpDown,
  Power,
  Trash2,
  AlertTriangle,
  Download,
  Calendar,
  HardDrive,
} from "lucide-react";
import { useToast, ToastContainer } from "../components/Toast";

type ImportState = "idle" | "drag" | "importing";

const ModsPage: React.FC = () => {
  const [mods, setMods] = React.useState<ModItem[]>([]);
  const [importState, setImportState] = React.useState<ImportState>("idle");
  const [query, setQuery] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<"name" | "date" | "size">("name");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [modsDir, setModsDir] = React.useState<string>("");
  const [needsSetup, setNeedsSetup] = React.useState<boolean>(false);
  const { toasts, dismissToast, success, error: showError } = useToast();
  const [togglingMods, setTogglingMods] = React.useState<
    Record<string, boolean>
  >({});

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      // Check if mods directory is configured
      const settings = await window.electronAPI.settings.get();
      setModsDir(settings.modsDir || "");

      if (!settings.modsDir || settings.modsDir.trim() === "") {
        setNeedsSetup(true);
        setMods([]);
        setError(null);
      } else {
        setNeedsSetup(false);
        // Get all mods in the manager library (zzzmodmanager/mods)
        const libraryMods = await window.electronAPI.mods.listLibrary();
        // Mark enabled status using saved state from library
        const modsWithStatus = libraryMods.map((mod: ModItem) => ({
          ...mod,
          enabled: !!mod.enabled, // use saved enabled state
        }));
        setMods(modsWithStatus);
        setError(null);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load mods");
      setNeedsSetup(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSelectModsFolder = async () => {
    try {
      const dir = await window.electronAPI.settings.chooseModsDir();
      if (dir) {
        await window.electronAPI.settings.set({ modsDir: dir });
        setModsDir(dir);
        await refresh();
        success("Mods folder selected", `Using: ${dir}`);
      }
    } catch (error: any) {
      showError("Failed to select folder", error?.message || "Unknown error");
    }
  };

  const handleEnableToggle = async (mod: ModItem) => {
    setTogglingMods((prev) => ({ ...prev, [mod.id]: true }));
    try {
      const result = await window.electronAPI.mods.toggleMod(
        mod.id,
        !mod.enabled
      );
      if (result.success) {
        setMods((prevMods) =>
          prevMods.map((m) => (m.id === mod.id ? result.mod : m))
        );
        success(
          `Mod ${!mod.enabled ? "enabled" : "disabled"}`,
          `${mod.name} is now ${!mod.enabled ? "active" : "inactive"}`
        );
      } else {
        showError("Failed to toggle mod", result.message);
      }
    } catch (e: any) {
      showError("Failed to toggle mod", e?.message || "Unknown error");
    } finally {
      setTogglingMods((prev) => ({ ...prev, [mod.id]: false }));
    }
  };

  const handleDelete = async (mod: ModItem) => {
    try {
      // Remove from library (zzzmodmanager/mods). This should remove from both library and active if present.
      await window.electronAPI.mods.remove(mod.id);
      await refresh();
      success("Mod deleted", `${mod.name} has been removed from your library`);
    } catch (e: any) {
      showError("Delete failed", e?.message || "Failed to delete mod");
    }
  };

  const handleChooseZip = async () => {
    const file = await window.electronAPI.mods.chooseZip();
    if (!file) return;
    setImportState("importing");
    try {
      const mod = await window.electronAPI.mods.importZip(file);
      await refresh();
      success(
        "Mod imported successfully",
        `${mod.name} has been added to your library`
      );
    } catch (e: any) {
      showError("Import failed", e?.message || "Failed to import ZIP file");
    } finally {
      setImportState("idle");
    }
  };

  const handleChooseFolder = async () => {
    const dir = await window.electronAPI.mods.chooseFolder();
    if (!dir) return;
    setImportState("importing");
    try {
      const mod = await window.electronAPI.mods.importFolder(dir);
      await refresh();
      success(
        "Mod imported successfully",
        `${mod.name} has been added to your library`
      );
    } catch (e: any) {
      showError("Import failed", e?.message || "Failed to import folder");
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
    let successCount = 0;
    let errorCount = 0;

    try {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        try {
          // Use webkitRelativePath or fallback to name for file path
          const filePath =
            (file as any).path || file.webkitRelativePath || file.name;

          if (file.name.toLowerCase().endsWith(".zip")) {
            await window.electronAPI.mods.importZip(filePath);
          } else {
            await window.electronAPI.mods.importFolder(filePath);
          }
          successCount++;
        } catch (e: any) {
          errorCount++;
          console.error(`Failed to import ${file.name}:`, e);
        }
      }

      await refresh();

      // Show appropriate feedback
      if (successCount > 0 && errorCount === 0) {
        success(
          `${successCount} mod${
            successCount > 1 ? "s" : ""
          } imported successfully`,
          "All files were processed successfully"
        );
      } else if (successCount > 0 && errorCount > 0) {
        success(
          `${successCount} mod${successCount > 1 ? "s" : ""} imported`,
          `${errorCount} file${errorCount > 1 ? "s" : ""} failed to import`
        );
      } else if (errorCount > 0) {
        showError(
          "Import failed",
          `Failed to import ${errorCount} file${errorCount > 1 ? "s" : ""}`
        );
      }
    } finally {
      setImportState("idle");
    }
  };

  const filteredAndSortedMods = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = mods.filter(
      (m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.author || "").toLowerCase().includes(q) ||
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
    return sorted;
  }, [mods, query, sortBy, sortDir]);

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="p-8 space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gaming-text-primary mb-2">
              Mod Library
            </h1>
            <p className="text-gaming-text-secondary">
              Manage your ZZZ modifications
            </p>
          </div>

          {/* Import Actions */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleChooseZip}
              disabled={importState === "importing" || needsSetup}
              className="gaming-button-primary flex items-center gap-2 disabled:opacity-50"
              whileHover={{
                scale: importState === "importing" || needsSetup ? 1 : 1.05,
              }}
              whileTap={{
                scale: importState === "importing" || needsSetup ? 1 : 0.95,
              }}
            >
              <Upload size={16} />
              Import ZIP
            </motion.button>
            <motion.button
              onClick={handleChooseFolder}
              disabled={importState === "importing" || needsSetup}
              className="gaming-button-secondary flex items-center gap-2 disabled:opacity-50"
              whileHover={{
                scale: importState === "importing" || needsSetup ? 1 : 1.05,
              }}
              whileTap={{
                scale: importState === "importing" || needsSetup ? 1 : 0.95,
              }}
            >
              <FolderOpen size={16} />
              Import Folder
            </motion.button>
          </div>
        </motion.div>

        {/* Status Bar */}
        {!needsSetup && modsDir && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-3 glass-panel rounded-xl flex items-center gap-3"
          >
            <FolderOpen size={16} className="text-gaming-accent-cyan" />
            <span className="text-sm text-gaming-text-secondary">
              Mods Directory:
            </span>
            <span className="text-sm font-mono text-gaming-text-primary bg-gaming-bg-card/60 px-2 py-1 rounded">
              {modsDir}
            </span>
          </motion.div>
        )}

        {/* Controls Bar */}
        {!needsSetup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center justify-between gap-4 p-4 glass-panel rounded-2xl"
          >
            {/* Search */}
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search mods..."
                  className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-gaming-bg-card/60 border border-gaming-border-accent/30 text-sm font-medium placeholder:text-gaming-text-muted focus:outline-none focus:border-gaming-accent-cyan/50 focus:shadow-glow transition-all duration-300"
                />
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 glass-panel rounded-xl">
                <Filter size={14} className="text-gaming-text-muted" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-sm font-medium focus:outline-none text-gaming-text-primary"
                >
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="size">Size</option>
                </select>
              </div>

              <motion.button
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
                className="p-2 glass-panel rounded-xl hover:bg-gaming-bg-overlay/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Toggle sort direction"
              >
                <ArrowUpDown size={14} className="text-gaming-text-muted" />
              </motion.button>
            </div>

            {/* Refresh Mods Button */}
            <motion.button
              onClick={refresh}
              disabled={refreshing}
              className="px-3 py-2 glass-panel rounded-xl hover:bg-gaming-bg-overlay/50 transition-colors flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh mods list"
            >
              <span className="flex items-center gap-2">
                {refreshing ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-gaming-accent-cyan/30 border-t-gaming-accent-cyan rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <Download size={14} className="text-gaming-text-muted" />
                )}
                Refresh
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* Drag & Drop Zone */}
        {!needsSetup && (
          <motion.div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={`relative rounded-2xl border-2 border-dashed p-8 transition-all duration-300 ${
              importState === "drag"
                ? "border-gaming-accent-cyan/70 bg-gaming-accent-cyan/10 shadow-glow"
                : "border-gaming-border-accent/30 bg-gaming-bg-card/30 hover:border-gaming-border-accent/50"
            }`}
          >
            <div className="text-center">
              <motion.div
                className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                  importState === "drag"
                    ? "bg-gaming-accent-cyan/20 text-gaming-accent-cyan"
                    : "bg-gaming-bg-overlay/50 text-gaming-text-muted"
                }`}
                animate={{
                  scale: importState === "drag" ? [1, 1.1, 1] : 1,
                  rotate: importState === "importing" ? 360 : 0,
                }}
                transition={{
                  scale: {
                    duration: 0.5,
                    repeat: importState === "drag" ? Infinity : 0,
                  },
                  rotate: {
                    duration: 1,
                    repeat: importState === "importing" ? Infinity : 0,
                    ease: "linear",
                  },
                }}
              >
                <Download size={24} />
              </motion.div>
              <p
                className={`text-sm font-medium mb-2 ${
                  importState === "drag"
                    ? "text-gaming-accent-cyan"
                    : "text-gaming-text-secondary"
                }`}
              >
                {importState === "importing"
                  ? "Importing mods..."
                  : importState === "drag"
                  ? "Drop files here to import"
                  : "Drag & drop mod ZIPs or folders here"}
              </p>
              <p className="text-xs text-gaming-text-muted">
                Supports .zip files and mod folders
              </p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-16"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-6 h-6 border-2 border-gaming-accent-cyan/30 border-t-gaming-accent-cyan rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-gaming-text-secondary font-medium">
                Loading mods...
              </span>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-gaming-status-conflict/10 border border-gaming-status-conflict/30 flex items-center gap-3"
          >
            <AlertTriangle size={20} className="text-gaming-status-conflict" />
            <span className="text-gaming-status-conflict font-medium">
              {error}
            </span>
          </motion.div>
        )}

        {/* Setup Required State */}
        {!loading && needsSetup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gaming-accent-cyan/10 flex items-center justify-center">
              <FolderOpen size={32} className="text-gaming-accent-cyan" />
            </div>
            <h3 className="text-xl font-semibold text-gaming-text-primary mb-2">
              Select Your Mods Folder
            </h3>
            <p className="text-gaming-text-secondary mb-6 max-w-md mx-auto">
              To get started, please select your ZZMI mods folder. This is where
              your mods will be stored and managed.
            </p>
            <motion.button
              onClick={handleSelectModsFolder}
              className="gaming-button-primary flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FolderOpen size={16} />
              Select Mods Folder
            </motion.button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !needsSetup && mods.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gaming-bg-overlay/50 flex items-center justify-center">
              <Upload size={32} className="text-gaming-text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-gaming-text-primary mb-2">
              No mods installed yet
            </h3>
            <p className="text-gaming-text-secondary mb-6 max-w-md mx-auto">
              Get started by importing your first mod using the buttons above or
              drag & drop files here.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleChooseZip}
                className="gaming-button-primary flex items-center gap-2"
              >
                <Upload size={16} />
                Import ZIP
              </button>
              <button
                onClick={handleChooseFolder}
                className="gaming-button-secondary flex items-center gap-2"
              >
                <FolderOpen size={16} />
                Import Folder
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredAndSortedMods.map((mod, index) => (
              <motion.div
                layout
                key={mod.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                className="group relative"
              >
                {/* Gaming Card Container */}
                <div className="relative rounded-2xl overflow-hidden glass-panel shadow-cardGlow hover:shadow-cardHover transition-all duration-300 h-full flex flex-col">
                  {/* Card Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-gaming-accent-cyan/5 via-transparent to-gaming-accent-violet/5 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />

                  {/* Thumbnail Section */}
                  {mod.thumbnailPath && (
                    <div className="relative overflow-hidden">
                      <motion.img
                        src={`file://${mod.thumbnailPath}`}
                        alt={mod.name}
                        className="w-full h-40 object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gaming-bg-card/80 via-transparent to-transparent" />

                      {/* Status Badges Overlay */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {mod.hasConflict && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-1 rounded-lg bg-gaming-status-conflict/90 backdrop-blur-sm border border-gaming-status-conflict/30 animate-pulse-glow"
                          >
                            <AlertTriangle size={12} className="text-white" />
                          </motion.div>
                        )}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`px-3 py-1 rounded-lg backdrop-blur-sm border text-xs font-medium ${
                            mod.enabled
                              ? "bg-gaming-status-enabled/90 border-gaming-status-enabled/30 text-white"
                              : "bg-gaming-status-disabled/90 border-gaming-status-disabled/30 text-white"
                          }`}
                        >
                          {mod.enabled ? "ACTIVE" : "INACTIVE"}
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-5 flex-1 flex flex-col relative z-10">
                    {/* Header */}
                    <div className="mb-3">
                      <h3 className="font-bold text-gaming-text-primary text-lg mb-1 line-clamp-1">
                        {mod.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gaming-text-muted font-mono">
                        <span>v{mod.version}</span>
                        <span>•</span>
                        <span>{mod.author}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gaming-text-secondary line-clamp-3 mb-4 flex-1">
                      {mod.description || "No description available."}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gaming-text-muted mb-4">
                      <div className="flex items-center gap-1">
                        <HardDrive size={12} />
                        <span>
                          {typeof mod.sizeBytes === "number"
                            ? formatBytes(mod.sizeBytes)
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>
                          {mod.dateAdded
                            ? new Date(mod.dateAdded).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleEnableToggle(mod)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          mod.enabled
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!!togglingMods[mod.id]}
                      >
                        {togglingMods[mod.id] ? (
                          <motion.div className="w-4 h-4 border-2 border-gaming-accent-cyan/30 border-t-gaming-accent-cyan rounded-full animate-spin mx-auto" />
                        ) : (
                          <>
                            <Power size={14} />
                            {mod.enabled ? "On" : "Off"}
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => handleDelete(mod)}
                        className="p-2.5 rounded-xl bg-gaming-status-conflict/20 hover:bg-gaming-status-conflict/30 text-gaming-status-conflict border border-gaming-status-conflict/30 hover:shadow-glow transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        title="Delete mod"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Card Border Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl border border-gaming-accent-cyan/20 opacity-0 group-hover:opacity-100 pointer-events-none"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

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

export default ModsPage;

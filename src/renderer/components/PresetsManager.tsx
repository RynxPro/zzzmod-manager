import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiSave,
  FiPlay,
  FiTrash2,
  FiEdit2,
  FiLoader,
  FiSearch,
  FiX,
  FiClock,
  FiGrid,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import PresetSaveDialog from "./PresetSaveDialog";
import { useToast } from "../ui/components/Toast";
// Using a simple date formatter since we can't install date-fns right now
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval === 1 ? "" : "s"} ago`;

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval === 1 ? "" : "s"} ago`;

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval === 1 ? "" : "s"} ago`;

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval === 1 ? "" : "s"} ago`;

  interval = Math.floor(seconds / 60);
  if (interval >= 1)
    return `${interval} minute${interval === 1 ? "" : "s"} ago`;

  return "just now";
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

export const PresetsManager: React.FC<PresetsManagerProps> = ({
  searchQuery: initialSearchQuery = "",
}) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<{
    type: "apply" | "delete" | "edit";
    name: string;
  } | null>(null);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [enabledMods, setEnabledMods] = useState<
    Array<{ id: string; name: string; enabled: boolean }>
  >([]);
  const { success, error: showError, warning } = useToast();

  const getEnabledMods = useCallback(async () => {
    try {
      const mods = await window.electronAPI.mods.listActive();
      return mods.map((mod: any) => ({
        id: mod.id,
        name: mod.name || mod.id,
        enabled: true, // Since we're using listActive, all mods are enabled
      }));
    } catch (err) {
      console.error("Error fetching enabled mods:", err);
      return [];
    }
  }, []);

  const fetchPresets = useCallback(async () => {
    try {
      setIsLoading(true);
      const presetList =
        (await window.electronAPI.mods.listPresets()) as Array<{
          name: string;
          mods: string[];
          createdAt?: string | Date;
        }>;

      // Process presets to ensure they have required fields
      const processedPresets = presetList.map((preset) => ({
        ...preset,
        modCount: preset.mods?.length || 0,
        createdAt: preset.createdAt ? new Date(preset.createdAt) : new Date(),
      }));
      setPresets(processedPresets);
    } catch (err) {
      showError({
        title: "Failed to load presets",
        message: "Please try again later",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPresets();

    // Load enabled mods when component mounts
    const loadEnabledMods = async () => {
      const mods = await getEnabledMods();
      setEnabledMods(mods);
    };
    loadEnabledMods();
  }, [fetchPresets, getEnabledMods]);

  const handleSavePreset = async (data: { name: string; mods: string[] }) => {
    try {
      setActiveAction({ type: "apply", name: data.name });

      // If editing, delete the old preset if the name changed
      if (editingPreset && editingPreset.name !== data.name) {
        await window.electronAPI.mods.deletePreset(editingPreset.name);
      }

      // Save the preset with mods
      await window.electronAPI.mods.savePreset(data.name);

      // Apply the selected mods
      await window.electronAPI.mods.applyPreset(data.name);

      success({
        title: editingPreset ? "Preset updated" : "Preset saved",
        message: `"${data.name}" has been ${
          editingPreset ? "updated" : "saved"
        } successfully`,
        type: "success",
      });

      fetchPresets();
    } catch (err) {
      showError({
        title: `Failed to ${editingPreset ? "update" : "save"} preset`,
        message:
          err instanceof Error ? err.message : "An unknown error occurred",
        type: "error",
      });
    } finally {
      setActiveAction(null);
      setSaveDialogOpen(false);
      setEditingPreset(null);
    }
  };

  const handleEditPreset = (preset: Preset) => {
    setEditingPreset(preset);
    setSaveDialogOpen(true);
  };

  const handleApplyPreset = async (name: string) => {
    try {
      setActiveAction({ type: "apply", name });
      const result = await window.electronAPI.mods.applyPreset(name);

      if (result.missingMods.length > 0) {
        warning({
          title: "Preset applied with missing mods",
          message: `Skipped ${result.missingMods.length} missing mod(s) while applying "${name}"`,
          type: "warning",
        });
      } else {
        success({
          title: "Preset applied",
          message: `"${name}" has been applied successfully`,
          type: "success",
        });
      }
    } catch (err) {
      showError({
        title: "Failed to apply preset",
        message:
          err instanceof Error ? err.message : "An unknown error occurred",
        type: "error",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleDeletePreset = async (name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the preset "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setActiveAction({ type: "delete", name });
      await window.electronAPI.mods.deletePreset(name);

      success({
        title: "Preset deleted",
        message: `"${name}" has been removed`,
        type: "success",
      });

      fetchPresets();
    } catch (err) {
      showError({
        title: "Failed to delete preset",
        message:
          err instanceof Error ? err.message : "An unknown error occurred",
        type: "error",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const isActionInProgress = (
    type: "apply" | "delete" | "edit",
    name: string
  ) => {
    return activeAction?.type === type && activeAction?.name === name;
  };

  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return presets;
    const query = searchQuery.toLowerCase();
    return presets.filter(
      (preset: Preset) =>
        preset.name.toLowerCase().includes(query) ||
        (preset.mods?.some((mod: string) =>
          mod.toLowerCase().includes(query)
        ) ??
          false)
    );
  }, [presets, searchQuery]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-moon-accent to-moon-glowViolet" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-moon-text to-moon-text/80 bg-clip-text text-transparent">
                Mod Presets
              </h2>
            </div>
            <p className="text-sm text-moon-text/60 pl-5">
              Manage your saved mod configurations
            </p>
          </div>
          <motion.button
            onClick={() => setSaveDialogOpen(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden group flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg transition-all duration-300
              bg-gradient-to-r from-moon-accent/90 to-moon-glowViolet/90 text-moon-bg font-medium
              shadow-lg shadow-moon-accent/20 hover:shadow-moon-glowViolet/30
              focus:outline-none focus:ring-2 focus:ring-moon-glowViolet/50 focus:ring-offset-2 focus:ring-offset-moon-surface/50
              ${activeAction ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!!activeAction}
          >
            <span className="relative z-10 flex items-center gap-2">
              <FiSave className="w-4 h-4" />
              Save Current
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-moon-accent to-moon-glowViolet opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 text-moon-text/40" />
          </div>
          <input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-moon-surface/10 border border-moon-surface/20 rounded-lg 
                     text-moon-text placeholder-moon-text/40 focus:outline-none focus:ring-1 
                     focus:ring-moon-glowViolet/50 focus:border-transparent transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-moon-text/40 hover:text-moon-text/70 transition-colors"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between mb-4 px-1"
          >
            <p className="text-sm text-moon-text/70 font-medium">
              <span className="text-moon-glowCyan">
                {filteredPresets.length}
              </span>{" "}
              preset{filteredPresets.length !== 1 ? "s" : ""} found
              {searchQuery && (
                <span className="text-moon-text/60"> for "{searchQuery}"</span>
              )}
            </p>
            {searchQuery && (
              <motion.button
                onClick={() => {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-moon-glowViolet hover:text-moon-glowCyan transition-all duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-moon-surface/10 hover:bg-moon-surface/20 border border-moon-surface/20"
              >
                <FiX size={14} /> Clear
              </motion.button>
            )}
          </motion.div>
        )}

        <div className="space-y-3 relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-moon-glowViolet/5 to-moon-glowCyan/5 rounded-2xl blur-xl -z-10" />
          {isLoading ? (
            <motion.div
              className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {[1, 2, 3].map((i: number) => (
                <motion.div
                  key={i}
                  className="h-28 bg-moon-surface/10 rounded-xl animate-pulse border border-moon-surface/20"
                  initial={{ opacity: 0.5, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              ))}
            </motion.div>
          ) : filteredPresets.length === 0 ? (
            <motion.div
              className="text-center p-10 bg-moon-surface/5 backdrop-blur-sm rounded-2xl border border-moon-surface/20 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-moon-glowViolet/5 to-moon-glowCyan/5 -z-10" />
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-moon-glowViolet/10 to-moon-glowCyan/10 border-2 border-dashed border-moon-glowViolet/20 flex items-center justify-center text-moon-glowViolet/50">
                <FiSave size={32} className="drop-shadow-glow" />
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-moon-text to-moon-text/80 bg-clip-text text-transparent mb-2">
                {searchQuery ? "No presets found" : "No presets yet"}
              </h3>
              <p className="text-sm text-moon-text/60 max-w-md mx-auto">
                {searchQuery
                  ? "Try a different search term or create a new preset."
                  : "Get started by saving your current mod configuration as a new preset."}
              </p>
              <motion.button
                onClick={() => setSaveDialogOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 px-5 py-2 text-sm font-medium rounded-lg bg-moon-surface/10 border border-moon-surface/20 hover:bg-moon-surface/20 text-moon-text/80 hover:text-moon-text transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <FiSave size={16} />
                Create New Preset
              </motion.button>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredPresets.map((preset: Preset) => {
                const isApplying = isActionInProgress("apply", preset.name);
                const isDeleting = isActionInProgress("delete", preset.name);
                const isDisabled = isApplying || isDeleting || !!activeAction;

                return (
                  <motion.div
                    key={preset.name}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      borderColor: isApplying
                        ? "rgba(0, 245, 255, 0.3)"
                        : isDeleting
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(255, 255, 255, 0.05)",
                    }}
                    whileHover={
                      !isDisabled
                        ? {
                            y: -2,
                            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                          }
                        : {}
                    }
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      borderColor: { duration: 0.2 },
                    }}
                    className={`group relative flex items-center justify-between p-5 bg-moon-surface/5 backdrop-blur-sm rounded-xl border ${
                      isDisabled
                        ? "opacity-60"
                        : "opacity-100 hover:bg-moon-surface/10"
                    } transition-all duration-300 overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-moon-glowViolet/5 to-moon-glowCyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-moon-accent to-moon-glowViolet opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-moon-text/90 group-hover:text-moon-glowCyan transition-colors duration-200 truncate">
                          {preset.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center text-moon-text/60 bg-moon-surface/20 group-hover:bg-moon-surface/30 px-2.5 py-1 rounded-lg transition-colors duration-200">
                          <FiGrid
                            className="mr-1.5 text-moon-glowViolet"
                            size={12}
                          />
                          <span className="font-medium">{preset.modCount}</span>{" "}
                          mod{preset.modCount !== 1 ? "s" : ""}
                        </span>
                        {preset.createdAt && (
                          <span
                            className="flex items-center text-moon-text/40 group-hover:text-moon-text/60 transition-colors duration-200"
                            title={new Date(preset.createdAt).toLocaleString()}
                          >
                            <FiClock
                              className="mr-1.5 flex-shrink-0 text-moon-glowViolet/80"
                              size={12}
                            />
                            <span>
                              Saved {formatTimeAgo(new Date(preset.createdAt))}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          !isDisabled && handleApplyPreset(preset.name);
                        }}
                        disabled={isDisabled}
                        whileHover={
                          !isDisabled
                            ? {
                                scale: 1.05,
                                backgroundColor: "rgba(0, 245, 255, 0.1)",
                                boxShadow: "0 0 15px rgba(0, 245, 255, 0.2)",
                              }
                            : {}
                        }
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        className={`p-2 rounded-lg transition-all duration-200 relative group/btn ${
                          isApplying && preset.name === activeAction?.name
                            ? "text-moon-accent bg-moon-accent/10"
                            : "text-moon-text/60 hover:text-moon-accent"
                        }`}
                        title={isApplying ? "Applying..." : "Apply Preset"}
                      >
                        <span className="relative z-10">
                          {isApplying && preset.name === activeAction?.name ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiPlay className="w-4 h-4" />
                          )}
                        </span>
                        {!isDisabled && !isApplying && (
                          <span className="absolute inset-0 bg-moon-accent/0 group-hover/btn:bg-moon-accent/10 rounded-lg transition-colors duration-200" />
                        )}
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          !isDisabled && handleEditPreset(preset);
                        }}
                        disabled={isDisabled}
                        whileHover={
                          !isDisabled
                            ? {
                                scale: 1.05,
                                backgroundColor: "rgba(147, 197, 253, 0.1)",
                                boxShadow: "0 0 15px rgba(147, 197, 253, 0.2)",
                              }
                            : {}
                        }
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        className={`p-2 rounded-lg transition-all duration-200 relative group/btn ${"text-moon-text/40 hover:text-blue-400"}`}
                        title="Edit Preset"
                      >
                        <span className="relative z-10">
                          <FiEdit2 className="w-4 h-4" />
                        </span>
                        {!isDisabled && (
                          <span className="absolute inset-0 bg-blue-500/0 group-hover/btn:bg-blue-500/10 rounded-lg transition-colors duration-200" />
                        )}
                      </motion.button>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          !isDisabled && handleDeletePreset(preset.name);
                        }}
                        disabled={isDisabled}
                        whileHover={
                          !isDisabled
                            ? {
                                scale: 1.05,
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                boxShadow: "0 0 15px rgba(239, 68, 68, 0.2)",
                              }
                            : {}
                        }
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        className={`p-2 rounded-lg transition-all duration-200 relative group/btn ${
                          isDeleting && preset.name === activeAction?.name
                            ? "text-red-400 bg-red-500/10"
                            : "text-moon-text/40 hover:text-red-400"
                        }`}
                        title={isDeleting ? "Deleting..." : "Delete Preset"}
                      >
                        <span className="relative z-10">
                          {isDeleting && preset.name === activeAction?.name ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiTrash2 className="w-4 h-4" />
                          )}
                        </span>
                        {!isDisabled && !isDeleting && (
                          <span className="absolute inset-0 bg-red-500/0 group-hover/btn:bg-red-500/10 rounded-lg transition-colors duration-200" />
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
            initialName={editingPreset?.name}
            initialMods={editingPreset?.mods || []}
            availableMods={enabledMods}
            isEditing={!!editingPreset}
          />
        </div>
      </div>
    </div>
  );
};

// Export as default for backward compatibility
export default PresetsManager;

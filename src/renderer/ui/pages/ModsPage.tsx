import React, { useState, useEffect, useCallback, FC, useMemo } from "react";
import { ModItem } from "../types/mods";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FolderOpen,
  ArrowUpDown,
  Power,
  Trash2,
  Search,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast, ToastContainer } from "../components/Toast";
import CharacterSelectDialog from "../../components/CharacterSelectDialog";

interface ModsPageProps {
  mods?: ModItem[];
  initialCharacter?: string | null;
}

type ImportState = "idle" | "drag" | "importing";

export const ModsPage: FC<ModsPageProps> = ({ initialCharacter = null }) => {
  // State
  const [mods, setMods] = useState<ModItem[]>([]);
  const [importState, setImportState] = useState<ImportState>("idle");
  const [query, setQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modsDir, setModsDir] = useState<string>("");
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);
  const { toasts, dismissToast, success, error: showError } = useToast();
  const [togglingMods, setTogglingMods] = useState<Record<string, boolean>>({});
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    type: "zip" | "folder" | "file";
    path: string;
    character?: string | null;
  } | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    initialCharacter || null
  );
  const [modToDelete, setModToDelete] = useState<string | null>(null);

  // Memoized values
  const availableCharacters = useMemo(() => {
    if (!Array.isArray(mods) || mods.length === 0) return [];
    
    // Only include characters that have at least one mod
    const charModCount = new Map<string, number>();
    mods.forEach((mod) => {
      if (mod?.character) {
        charModCount.set(mod.character, (charModCount.get(mod.character) || 0) + 1);
      }
    });
    
    // Convert to array and sort
    return Array.from(charModCount.entries())
      .filter(([_, count]) => count > 0) // Only include characters with mods
      .map(([char]) => char)
      .sort();
  }, [mods]);

  const filteredAndSortedMods = useMemo(() => {
    if (!Array.isArray(mods)) return [];

    const q = query.trim().toLowerCase();
    const filtered = mods.filter((mod) => {
      // Skip invalid mod objects
      if (!mod || typeof mod !== "object") return false;

      // Filter by selected character if any
      if (selectedCharacter && mod.character !== selectedCharacter)
        return false;

      // If no search query, include all matching the character filter
      if (!q) return true;

      // Search in mod properties
      return (
        (mod.name && mod.name.toLowerCase().includes(q)) ||
        (mod.description && mod.description.toLowerCase().includes(q)) ||
        (mod.author && mod.author.toLowerCase().includes(q)) ||
        (mod.version && mod.version.toLowerCase().includes(q))
      );
    });

    // Sort the filtered results
    return [...filtered].sort((a, b) => {
      // Handle undefined or null values in sort
      const getValue = (mod: ModItem, field: keyof ModItem) => {
        const val = mod[field];
        if (val === undefined || val === null) return "";
        return val;
      };

      let cmp = 0;
      if (sortBy === "name") {
        cmp = String(getValue(a, "name")).localeCompare(
          String(getValue(b, "name"))
        );
      } else if (sortBy === "date") {
        const dateA = Number(getValue(a, "dateAdded") || 0);
        const dateB = Number(getValue(b, "dateAdded") || 0);
        cmp = dateA - dateB;
      } else if (sortBy === "size") {
        const sizeA = Number(getValue(a, "sizeBytes") || 0);
        const sizeB = Number(getValue(b, "sizeBytes") || 0);
        cmp = sizeA - sizeB;
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [mods, query, sortBy, sortDir, selectedCharacter]);

  // Get all unique characters from the filtered mods that have mods in current search
  const filteredCharacters = useMemo(() => {
    if (!Array.isArray(filteredAndSortedMods) || filteredAndSortedMods.length === 0) return [];
    
    const charModCount = new Map<string, number>();
    filteredAndSortedMods.forEach((mod) => {
      if (mod?.character) {
        charModCount.set(mod.character, (charModCount.get(mod.character) || 0) + 1);
      }
    });
    
    // Only include characters that have at least one mod in current search
    return Array.from(charModCount.entries())
      .filter(([_, count]) => count > 0)
      .map(([char]) => char)
      .sort();
  }, [filteredAndSortedMods]);

  // Ensure a character is always selected
  useEffect(() => {
    if (availableCharacters.length > 0 && !selectedCharacter) {
      setSelectedCharacter(availableCharacters[0]);
    } else if (selectedCharacter && !availableCharacters.includes(selectedCharacter) && availableCharacters.length > 0) {
      setSelectedCharacter(availableCharacters[0]);
    } else if (availableCharacters.length > 0 && !selectedCharacter) {
      setSelectedCharacter(availableCharacters[0]);
    }
  }, [availableCharacters, selectedCharacter]);

  const loadMods = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await window.electronAPI.settings.get();
      setModsDir(settings.modsDir || "");

      if (!settings.modsDir?.trim()) {
        setNeedsSetup(true);
        setMods([]);
        setError("Mods directory not set. Please configure it in settings.");
        return;
      }
      
      setNeedsSetup(false);
      // Always refresh the full mod list to ensure we have the latest state
      const [modsList, activeMods] = await Promise.all([
        window.electronAPI.mods.listLibrary(),
        window.electronAPI.mods.listActive()
      ]);
      
      // Create a set of active mod IDs for quick lookup
      const activeModIds = new Set(activeMods.map(mod => mod.id));
      
      // Update mods with their actual enabled state
      const processedMods = modsList.map((mod: ModItem) => ({
        ...mod,
        enabled: activeModIds.has(mod.id)
      }));
      
      setMods(processedMods);
      setError(null);
    } catch (err) {
      console.error("Error loading mods:", err);
      setError("Failed to load mods. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Add a periodic refresh of mods
  useEffect(() => {
    const interval = setInterval(loadMods, 5000);
    return () => clearInterval(interval);
  }, [loadMods]);

  const toggleMod = useCallback(
    async (modId: string, enabled: boolean) => {
      setTogglingMods((prev) => ({ ...prev, [modId]: true }));

      try {
        // Update UI optimistically
        setMods(prevMods =>
          prevMods.map(mod =>
            mod.id === modId ? { ...mod, enabled, pending: true } : mod
          )
        );

        // Toggle mod in backend
        const success = await window.electronAPI.mods.toggleMod(modId, enabled);
        if (!success) {
          throw new Error('Failed to toggle mod');
        }

        // Refresh the full mod list to ensure consistency
        await loadMods();
        showError(`Mod ${enabled ? "enabled" : "disabled"} successfully`, 'success');
      } catch (err) {
        console.error("Error toggling mod:", err);
        showError(`Failed to ${enabled ? "enable" : "disable"} mod`);
        // Revert to the actual state from backend
        await loadMods();
        showError(`Failed to ${enabled ? "enable" : "disable"} mod`);
      } finally {
        setTogglingMods((prev) => ({ ...prev, [modId]: false }));
      }
    },
    [showError, loadMods]
  );

  const deleteMod = useCallback(
    (modId: string) => {
      setModToDelete(modId);
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!modToDelete) return;
    
    try {
      await window.electronAPI.mods.deleteMod(modToDelete);
      setMods((prevMods) => prevMods.filter((mod) => mod.id !== modToDelete));
      success("Mod deleted successfully");
      await loadMods();
    } catch (err) {
      console.error("Error deleting mod:", err);
      showError("Failed to delete mod");
    } finally {
      setModToDelete(null);
    }
  }, [modToDelete, success, showError, loadMods]);

  // Load mods on mount and whenever selectedCharacter changes
  useEffect(() => {
    loadMods();
  }, [loadMods, selectedCharacter]);

  // Handle pending import when character is selected
  const handleImport = useCallback(async () => {
    if (!pendingImport) return;

    const { type, path, character } = pendingImport;
    try {
      setImportState("importing");

      // Use the appropriate import method based on type
      if (type === "zip") {
        await window.electronAPI.mods.importZip(path, character);
      } else if (type === "folder") {
        await window.electronAPI.mods.importFolder(path, character);
      } else {
        throw new Error("Unsupported import type");
      }

      // Refresh the mods list
      await loadMods();

      // Show success message
      success(
        `Mod imported successfully${character ? ` for ${character}` : ""}!`
      );
    } catch (error) {
      console.error("Import error:", error);
      showError(
        error instanceof Error ? error.message : "Failed to import mod"
      );
    } finally {
      setPendingImport(null);
      setImportState("idle");
    }
  }, [pendingImport, loadMods, success, showError]);

  // Run import when pendingImport changes
  useEffect(() => {
    handleImport();
  }, [pendingImport, handleImport]);

  // Handle file/folder/zip import
  const handleImportClick = useCallback(
    async (type: "zip" | "folder" | "file") => {
      try {
        // If no character is selected, show character selection dialog
        if (!selectedCharacter) {
          setShowCharSelect(true);
          return;
        }

        let filePath: string | null = null;

        // Use the appropriate dialog method based on type
        if (type === "zip") {
          filePath = await window.electronAPI.mods.chooseZip();
        } else if (type === "folder") {
          filePath = await window.electronAPI.mods.chooseFolder();
        } else {
          // For single file, use the file dialog
          const result = await window.electronAPI.mods.openImportDialog("file");
          if (!result.canceled && result.filePaths?.[0]) {
            filePath = result.filePaths[0];
          }
        }

        if (!filePath) return;

        // Set pending import which will trigger the import process
        setPendingImport({
          type: type === "file" ? "zip" : (type as "zip" | "folder"),
          path: filePath,
          character: selectedCharacter,
        });
      } catch (error) {
        console.error("Import dialog error:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to open import dialog"
        );
      }
    },
    [selectedCharacter, showError]
  );

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const settings = await window.electronAPI.settings.get();
      setModsDir(settings.modsDir || "");

      if (!settings.modsDir?.trim()) {
        setNeedsSetup(true);
        setMods([]);
        setError(null);
      } else {
        setNeedsSetup(false);
        const modsList = await window.electronAPI.mods.listLibrary();
        setMods(
          modsList.map((mod: ModItem) => ({
            ...mod,
            enabled: !!mod.enabled,
          }))
        );
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

  // Handle character selection from dialog
  const handleCharacterSelect = useCallback(
    (character: string | null) => {
      setSelectedCharacter(character);
      setShowCharSelect(false);

      // If we were waiting for character selection, trigger the import
      if (pendingImport && character) {
        setPendingImport({
          ...pendingImport,
          character,
        });
      }
    },
    [pendingImport]
  );

  // Handle import button click (used in the UI)
  const handleImportButtonClick = useCallback(
    (type: "zip" | "folder" | "file") => {
      handleImportClick(type);
    },
    [handleImportClick]
  );

  // ... (other handlers remain the same)

  // Render
  if (loading && !mods.length) {
    return (
      <div className="min-h-screen bg-gaming-bg text-gaming-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gaming-accent-cyan mx-auto mb-4"></div>
          <p>Loading mods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-bg text-gaming-text">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="p-8 space-y-6">
        {/* Header */}
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
              {mods.length} mods{" "}
              {selectedCharacter ? `for ${selectedCharacter}` : ""}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleImportButtonClick("zip")}
                className="flex items-center space-x-2 px-4 py-2 bg-gaming-accent-cyan text-gaming-bg rounded-lg hover:bg-opacity-90 transition-all"
              >
                <Plus size={18} />
                <span>Add Mod</span>
              </button>
              {selectedCharacter && (
                <div className="text-sm text-gaming-text-secondary">
                  Adding to:{" "}
                  <span className="font-medium text-gaming-accent-violet">
                    {selectedCharacter}
                  </span>
                </div>
              )}
            </div>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gaming-text-secondary"
                size={18}
              />
              <input
                type="text"
                placeholder="Search mods..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gaming-card rounded-lg border border-gaming-border focus:border-gaming-accent-cyan focus:ring-1 focus:ring-gaming-accent-cyan outline-none transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Character Filter */}
        <div className="flex items-center space-x-4">
          {filteredCharacters.map((char) => (
            <button
              key={char}
              onClick={() => setSelectedCharacter(char)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCharacter === char
                  ? "bg-gaming-accent-violet text-white font-medium"
                  : "bg-gaming-card hover:bg-gaming-card-hover"
              }`}
            >
              {char}
            </button>
          ))}
          {/* Show available characters that don't have mods in current search */}
          {availableCharacters
            .filter(char => !filteredCharacters.includes(char))
            .map((char) => (
              <button
                key={char}
                onClick={() => {
                  setSelectedCharacter(char);
                  setQuery(''); // Clear search when selecting a character with no mods in current search
                }}
                className="px-4 py-2 rounded-lg bg-gaming-card/50 text-gaming-text-secondary hover:bg-gaming-card-hover/50 transition-colors opacity-70"
                title="No mods for this character in current search"
              >
                {char}
              </button>
            ))}
        </div>

        {/* Mods Grid */}
        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gaming-accent-cyan"></div>
                <p className="text-gaming-text-secondary">Loading mods...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6 bg-gaming-panel rounded-lg border border-red-500/30">
                <p className="text-red-400 mb-4">Error loading mods: {error}</p>
                <button
                  onClick={loadMods}
                  className="px-4 py-2 bg-gaming-accent-violet text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : !Array.isArray(filteredAndSortedMods) ||
            filteredAndSortedMods.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="bg-gaming-panel/50 rounded-full p-6 mb-4">
                <FolderOpen
                  size={48}
                  className="text-gaming-text-secondary mx-auto"
                />
              </div>
              <h3 className="text-xl font-medium text-gaming-text mb-2">
                No mods found
              </h3>
              <p className="text-gaming-text-secondary mb-6 max-w-md">
                {selectedCharacter
                  ? `No mods found for ${selectedCharacter}. Try importing some mods!`
                  : "No mods found. Try importing some mods to get started."}
              </p>
              <button
                onClick={() => handleImportButtonClick("zip")}
                className="px-6 py-2.5 bg-gaming-accent-cyan text-gaming-bg rounded-lg hover:bg-opacity-90 transition-all flex items-center space-x-2 mx-auto"
              >
                <Plus size={18} />
                <span>Import Mod</span>
              </button>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedMods.map((mod, index) => (
                  <motion.div
                    key={mod.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="group relative"
                  >
                    <div className="h-full bg-gaming-card rounded-xl border border-gaming-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                      {/* Mod Thumbnail */}
                      <div className="relative pt-[56.25%] bg-gaming-card-dark overflow-hidden">
                        {mod.thumbnailPath ? (
                          <img
                            src={`file://${mod.thumbnailPath}`}
                            alt={mod.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gaming-card-dark to-gaming-card-darker">
                            <FolderOpen
                              size={48}
                              className="text-gaming-text-secondary opacity-50"
                            />
                          </div>
                        )}
                      </div>

                      {/* Mod Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-medium text-gaming-text line-clamp-2">
                            {mod.name}
                          </h3>
                          {mod.character && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gaming-accent-violet/20 text-gaming-accent-violet">
                              {mod.character}
                            </span>
                          )}
                        </div>

                        {mod.description && (
                          <p className="text-sm text-gaming-text-secondary line-clamp-2 mb-4">
                            {mod.description}
                          </p>
                        )}

                        <div className="mt-auto pt-4 border-t border-gaming-border/50">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleMod(mod.id, !mod.enabled)}
                                disabled={togglingMods[mod.id]}
                                className={`p-2 rounded-lg transition-colors ${
                                  mod.enabled
                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    : "bg-gray-700/50 hover:bg-gray-600/50"
                                }`}
                              >
                                <Power size={16} />
                              </button>
                              <button
                                onClick={() => deleteMod(mod.id)}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="text-xs text-gaming-text-secondary">
                              {mod.version && <span>v{mod.version}</span>}
                              {mod.sizeBytes && (
                                <span className="ml-2">
                                  {(mod.sizeBytes / (1024 * 1024)).toFixed(1)}MB
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={!!modToDelete}
        onClose={() => setModToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Mod"
        message="Are you sure you want to delete this mod? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
};

export default ModsPage;

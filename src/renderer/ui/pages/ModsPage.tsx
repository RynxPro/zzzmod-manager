import React, { useState, useEffect, useCallback, FC, useMemo } from "react";
import { ModItem } from "../types/mods";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FolderOpen, ArrowUpDown, Power, Trash2, Search } from "lucide-react";
import { useToast, ToastContainer } from "../components/Toast";
import CharacterSelectDialog from "../../components/CharacterSelectDialog";

interface ModsPageProps {
  initialMods?: ModItem[];
}

type ImportState = "idle" | "drag" | "importing";

export const ModsPage: FC<ModsPageProps> = ({ initialMods = [] }) => {
  // State
  const [mods, setMods] = useState<ModItem[]>(initialMods);
  const [importState, setImportState] = useState<ImportState>("idle");
  const [query, setQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modsDir, setModsDir] = useState<string>("");
  const [needsSetup, setNeedsSetup] = useState<boolean>(false);
  const { toasts, dismissToast, success, error: showError } = useToast();
  const [togglingMods, setTogglingMods] = useState<Record<string, boolean>>({});
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    type: 'zip' | 'folder' | 'file';
    path: string;
  } | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  // Memoized values
  const availableCharacters = useMemo(() => {
    const chars = new Set<string>();
    mods.forEach(mod => mod.character && chars.add(mod.character));
    return Array.from(chars).sort();
  }, [mods]);

  const filteredAndSortedMods = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = mods.filter((mod: ModItem) => {
      if (selectedCharacter && mod.character !== selectedCharacter) return false;
      if (!q) return true;
      
      return (
        mod.name.toLowerCase().includes(q) ||
        mod.description?.toLowerCase().includes(q) ||
        mod.author?.toLowerCase().includes(q) ||
        mod.version?.toLowerCase().includes(q)
      );
    });
    
    return [...filtered].sort((a: ModItem, b: ModItem) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "date") cmp = (a.dateAdded || 0) - (b.dateAdded || 0);
      else if (sortBy === "size") cmp = (a.sizeBytes || 0) - (b.sizeBytes || 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [mods, query, sortBy, sortDir, selectedCharacter]);

  // Handlers
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
        const libraryMods = await window.electronAPI.mods.list();
        setMods(libraryMods.map((mod: ModItem) => ({
          ...mod,
          enabled: !!mod.enabled,
        })));
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

  // ... (other handlers remain the same)

  // Render
  if (loading) {
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
              {mods.length} mods {selectedCharacter ? `for ${selectedCharacter}` : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gaming-text-secondary" size={18} />
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
          <button
            onClick={() => setSelectedCharacter(null)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !selectedCharacter 
                ? 'bg-gaming-accent-cyan text-gaming-bg font-medium' 
                : 'bg-gaming-card hover:bg-gaming-card-hover'
            }`}
          >
            All Characters
          </button>
          
          {availableCharacters.map(char => (
            <button
              key={char}
              onClick={() => setSelectedCharacter(char)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCharacter === char
                  ? 'bg-gaming-accent-violet text-white font-medium'
                  : 'bg-gaming-card hover:bg-gaming-card-hover'
              }`}
            >
              {char}
            </button>
          ))}
        </div>

        {/* Mods Grid */}
        <div className="relative">
          <AnimatePresence>
            {filteredAndSortedMods.length > 0 ? (
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
                      {/* Mod content here */}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gaming-text-secondary">
                No mods found. Try adjusting your search or import some mods.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ModsPage;

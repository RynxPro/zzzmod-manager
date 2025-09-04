import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Upload } from "lucide-react";
import CharacterCardsGrid from "../../components/CharacterCardsGrid";
import { ModItem } from "../types/mods";
import CharacterSelectDialog from "../../components/CharacterSelectDialog";
import { ToastContainer, useToast } from "../components/Toast";
import { characters } from "../../data/characters";

const CharactersPage: React.FC = () => {
  const [mods, setMods] = useState<ModItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [minLoadingTimeElapsed, setMinLoadingTimeElapsed] = useState(false);

  // Set a minimum loading time to prevent flashing
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingTimeElapsed(true), 300);
    return () => clearTimeout(timer);
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [importState, setImportState] = useState<"idle" | "drag" | "importing">(
    "idle"
  );
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    type: "zip" | "folder";
    path: string;
  } | null>(null);
  const { toasts, dismissToast, success, error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchMods() {
      try {
        const modsList = await window.electronAPI.mods.listLibrary();
        if (isMounted) {
          setMods(modsList);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch mods:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load characters"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMods();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCharacterSelect = (charName: string) => {
    if (!charName) {
      console.error("Character name is required");
      return;
    }
    // Find the character by name to get their ID
    const char = characters.find(c => c.name === charName);
    if (char) {
      navigate(`/characters/${encodeURIComponent(char.id)}`);
    } else {
      // Fallback to name-based URL if character not found
      navigate(`/characters/${encodeURIComponent(charName.toLowerCase().replace(/\s+/g, '-'))}`);
    }
  };

  // Drag & Drop Handlers - Simplified to only handle the drop event
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setImportState("idle");

      try {
        const files = Array.from(e.dataTransfer.files || []);
        if (!files.length) return;

        // Only handle the first item for now
        const file = files[0] as any;
        const filePath: string | undefined = file?.path;
        if (!filePath) return;

        const isZip = filePath.toLowerCase().endsWith(".zip");
        const type = isZip ? ("zip" as const) : ("folder" as const);

        setPendingImport({ type, path: filePath });
        setShowCharSelect(true);
      } catch (err) {
        console.error("Drop handling failed:", err);
        showError("Failed to read dropped item");
      }
    },
    [showError]
  );

  // After character is picked from dialog, perform the import
  const handleDialogCharacterSelect = useCallback(
    async (character: string) => {
      setShowCharSelect(false);
      if (!pendingImport) return;

      try {
        setImportState("importing");
        if (pendingImport.type === "zip") {
          await window.electronAPI.mods.importZip(
            pendingImport.path,
            character
          );
        } else {
          await window.electronAPI.mods.importFolder(
            pendingImport.path,
            character
          );
        }

        // Refresh character mods after import
        try {
          const modsList = await window.electronAPI.mods.listLibrary();
          setMods(modsList);
        } catch (e) {
          console.warn("Failed to refresh mods after import", e);
        }

        success(`Mod imported for ${character}`);
      } catch (err) {
        console.error("Import error:", err);
        showError(err instanceof Error ? err.message : "Failed to import mod");
      } finally {
        setPendingImport(null);
        setImportState("idle");
      }
    },
    [pendingImport, success, showError]
  );

  if (error && !isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Characters</h1>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-moon-glowViolet/10 hover:bg-moon-glowViolet/20 text-moon-glowViolet rounded-lg transition-colors"
          >
            Reload
          </button>
        </div>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400">
          <div className="font-medium mb-2">Failed to load characters</div>
          <div className="text-sm text-red-300">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen p-6"
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Characters</h1>
          <div className="flex items-center gap-2 text-sm bg-moon-surface/40 hover:bg-moon-surface/60 transition-colors duration-200 px-3 py-1.5 rounded-lg border border-moon-glowViolet/20 group">
            <div className="relative">
              <Upload className="w-4 h-4 text-moon-glowViolet" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-moon-glowCyan shadow-[0_0_6px_2px_rgba(0,245,255,0.5)] animate-pulse" />
            </div>
            <span className="text-moon-text/90 group-hover:text-moon-text transition-colors duration-200">
              Drag & drop mods anywhere to import
            </span>
            <div className="ml-1 w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold">
              !
            </div>
          </div>
        </div>

        <div className="relative">
          <CharacterCardsGrid mods={mods} onSelect={handleCharacterSelect} />
          {isLoading && (
            <div className="absolute inset-0 bg-moon-surface/30 animate-pulse rounded-lg z-10" />
          )}
        </div>
      </div>

      <CharacterSelectDialog
        isOpen={showCharSelect}
        onClose={() => {
          setShowCharSelect(false);
          setPendingImport(null);
        }}
        onSelect={handleDialogCharacterSelect}
      />
    </div>
  );
};

export default CharactersPage;

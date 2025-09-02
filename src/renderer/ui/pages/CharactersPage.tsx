import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Upload } from "lucide-react";
import CharacterCardsGrid from "../../components/CharacterCardsGrid";
import { ModItem } from "../types/mods";
import CharacterSelectDialog from "../../components/CharacterSelectDialog";
import { ToastContainer, useToast } from "../components/Toast";

const CharactersPage: React.FC = () => {
  const [mods, setMods] = useState<ModItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [importState, setImportState] = useState<"idle" | "drag" | "importing">("idle");
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
    navigate(`/characters/${encodeURIComponent(charName)}`);
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

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
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
      const type = isZip ? "zip" as const : "folder" as const;

      setPendingImport({ type, path: filePath });
      setShowCharSelect(true);
    } catch (err) {
      console.error("Drop handling failed:", err);
      showError("Failed to read dropped item");
    }
  }, [showError]);

  // After character is picked from dialog, perform the import
  const handleDialogCharacterSelect = useCallback(async (character: string) => {
    setShowCharSelect(false);
    if (!pendingImport) return;

    try {
      setImportState("importing");
      if (pendingImport.type === "zip") {
        await window.electronAPI.mods.importZip(pendingImport.path, character);
      } else {
        await window.electronAPI.mods.importFolder(pendingImport.path, character);
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
  }, [pendingImport, success, showError]);

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Characters</h1>
        <div className="animate-pulse">Loading characters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Characters</h1>
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
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
          <div className="flex items-center gap-2 text-sm text-gaming-text-secondary/70">
            <Upload className="w-4 h-4" />
            <span>Drag & drop mods anywhere to import</span>
          </div>
        </div>
        
        <div className="relative">
          <CharacterCardsGrid mods={mods} onSelect={handleCharacterSelect} />
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

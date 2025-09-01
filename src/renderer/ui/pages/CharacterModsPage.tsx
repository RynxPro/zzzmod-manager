import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ModItem } from "../types/mods";
import ModCard from "../../components/ModCard";
import { FiFolderPlus, FiArrowLeft, FiPower, FiTrash2 } from "react-icons/fi";

const CharacterModsPage: React.FC = () => {
  const { charName } = useParams<{ charName: string }>();
  const navigate = useNavigate();
  const [mods, setMods] = useState<ModItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMods = useCallback(async () => {
    if (!charName) return;
    
    try {
      setIsLoading(true);
      const modsList = await window.electronAPI.mods.listModsByCharacter(charName);
      
      // Also fetch the full mod list to ensure we have the latest enabled state
      const allMods = await window.electronAPI.mods.listLibrary();
      
      // Merge the enabled state from the full list
      const modsWithState = modsList.map(mod => {
        const fullMod = allMods.find(m => m.id === mod.id);
        return fullMod ? { ...mod, enabled: fullMod.enabled } : mod;
      });
      
      setMods(modsWithState);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch mods:", err);
      setError(err instanceof Error ? err.message : "Failed to load mods");
    } finally {
      setIsLoading(false);
    }
  }, [charName]);

  useEffect(() => {
    fetchMods();
    
    // Set up an interval to periodically refresh mod state
    const interval = setInterval(fetchMods, 5000);
    
    return () => clearInterval(interval);
  }, [fetchMods]);

  // Upload zip handler
  const handleUploadZip = async () => {
    if (!charName) return;
    const filePath = await window.electronAPI.mods.chooseZip();
    if (filePath) {
      // Explicitly pass charName as the second argument
      await window.electronAPI.mods.importZip(filePath, charName);
      setIsLoading(true);
      try {
        const modsList = await window.electronAPI.mods.listModsByCharacter(
          charName
        );
        setMods(modsList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reload mods");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Upload folder handler
  const handleUploadFolder = async () => {
    if (!charName) return;
    const folderPath = await window.electronAPI.mods.chooseFolder();
    if (folderPath) {
      // Explicitly pass charName as the second argument
      await window.electronAPI.mods.importFolder(folderPath, charName);
      setIsLoading(true);
      try {
        const modsList = await window.electronAPI.mods.listModsByCharacter(
          charName
        );
        setMods(modsList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reload mods");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleMod = useCallback(async (modId: string, enabled: boolean) => {
    if (!charName) return;
    
    try {
      // Update UI optimistically
      setMods(prevMods => 
        prevMods.map(mod => 
          mod.id === modId 
            ? { ...mod, enabled, pending: true }
            : mod
        )
      );
      
      // Toggle the mod in the backend
      const success = await window.electronAPI.mods.toggleMod(modId, enabled);
      if (!success) {
        throw new Error('Failed to toggle mod');
      }
      
      // Refresh the mods list to ensure UI is in sync with backend
      await fetchMods();
      
    } catch (err) {
      console.error("Failed to toggle mod:", err);
      setError(err instanceof Error ? err.message : "Failed to toggle mod");
      
      // Revert UI state on error by refreshing from backend
      await fetchMods();
    }
  }, [charName, fetchMods]);

  const handleDeleteMod = useCallback(async (modId: string) => {
    if (!charName || !window.confirm("Are you sure you want to delete this mod? This action cannot be undone.")) {
      return;
    }
    try {
      await window.electronAPI.mods.deleteMod(modId);
      // Refresh the mods list
      const updatedMods = await window.electronAPI.mods.listModsByCharacter(charName);
      setMods(updatedMods);
    } catch (err) {
      console.error("Failed to delete mod:", err);
      setError(err instanceof Error ? err.message : "Failed to delete mod");
    }
  }, [charName]);

  if (!charName) {
    return (
      <div className="p-6 text-moon-text">
        <button
          onClick={() => navigate("/characters")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-moon-surface/80 border border-white/5 hover:border-white/10 hover:shadow-moonGlowCyan transition-colors duration-200"
        >
          <FiArrowLeft className="text-moon-accent" />
          Back to Characters
        </button>
        <div className="mt-4 p-4 bg-red-900/30 border border-red-500/40 rounded-lg text-red-300">
          Error: Character name is missing
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/characters")}
          className="px-3 py-2 rounded-xl bg-moon-surface/80 text-moon-text border border-white/5 hover:border-white/10 mb-4 transition-all duration-200 hover:shadow-moonGlowCyan"
        >
          ← Back to Characters
        </button>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-moon-accent"></div>
          <span>Loading {charName}'s mods...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/characters")}
          className="px-3 py-2 rounded-xl bg-moon-surface/80 text-moon-text border border-white/5 hover:border-white/10 mb-4"
        >
          ← Back to Characters
        </button>
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 text-moon-text">
      <div className="flex items-center mb-8">
        <motion.button
          onClick={() => navigate("/characters")}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-moon-surface/80 border border-white/5 hover:border-white/10 hover:shadow-moonGlowCyan transition-colors duration-200"
        >
          <FiArrowLeft className="text-moon-accent" />
          Back to Characters
        </motion.button>
        <h1 className="text-3xl font-bold ml-4 bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet bg-clip-text text-transparent">
          {charName}'s Mods
        </h1>
      </div>
      
      <div className="space-y-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-block"
        >
          <button
            onClick={handleUploadFolder}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-moon-surface/80 border border-white/5 hover:border-white/10 hover:shadow-moonGlowViolet transition-all duration-200"
          >
            <FiFolderPlus className="text-xl" />
            <span className="font-medium">Import Mod Folder</span>
          </button>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-moon-accent">Loading mods...</div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg text-red-300">
            {error}
          </div>
        ) : mods.length === 0 ? (
          <div className="text-center py-12 bg-moon-surface/70 rounded-xl border border-white/5">
            <p className="text-moon-muted">No mods installed for {charName} yet.</p>
            <p className="text-sm text-moon-muted mt-2">Click 'Import Mod Folder' to add mods</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mods.map((mod) => (
              <ModCard 
                key={mod.id} 
                mod={mod} 
                onToggle={handleToggleMod}
                onDelete={handleDeleteMod}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterModsPage;

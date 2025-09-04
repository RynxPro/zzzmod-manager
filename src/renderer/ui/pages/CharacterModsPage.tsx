import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ModItem } from "../types/mods";
import { 
  FiFolderPlus, 
  FiArrowLeft, 
  FiPower, 
  FiTrash2, 
  FiFolder, 
  FiPlus, 
  FiZap, 
  FiInfo,
  FiExternalLink
} from "react-icons/fi";
import { Button } from "../components/ui/Button";
import { cn } from "../../lib/utils";
import ModCard from "../components/mods/ModCard";

import { characters } from "../../data/characters";
import { getAttributeIcon, getRankIcon, getSpecialtyIcon, type Character, type Attribute } from "../../types/character";

// Get character data from the characters list
const getCharacterData = (charId: string): Character => {
  const character = characters.find(c => c.id === charId);
  if (!character) {
    // Try to find by name as fallback (for backward compatibility)
    const charByName = characters.find(c => 
      c.name.toLowerCase() === charId.toLowerCase() ||
      c.name.toLowerCase().replace(/\s+/g, '-') === charId.toLowerCase()
    );
    
    if (charByName) {
      return charByName;
    }
    
    // If still not found, create a default character
    return {
      id: charId,
      name: charId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      attribute: 'Physical' as Attribute,
      specialty: 'Support',
      rank: 'A',
      imageUrl: `/characters/${charId.toLowerCase().replace(/\s+/g, '')}_r.jpeg`
    };
  }
  return character;
};

const CharacterModsPage: React.FC = () => {
  const { charName } = useParams<{ charName: string }>();
  const navigate = useNavigate();
  const [mods, setMods] = useState<ModItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get character data and handle loading states
  const character = useMemo(() => 
    getCharacterData(charName || ''), 
    [charName]
  );
  const attributeIcon = character.attribute ? getAttributeIcon(character.attribute) : '';
  const specialtyIcon = character.specialty ? getSpecialtyIcon(character.specialty) : '';
  const rankIcon = character.rank ? getRankIcon(character.rank) : '';

  useEffect(() => {
    let isMounted = true;
    
    const fetchMods = async () => {
      if (!charName) return;
      
      try {
        setIsLoading(true);
        const modsList = await window.electronAPI.mods.listModsByCharacter(charName);
        
        if (!isMounted) return;
        
        // Also fetch the full mod list to ensure we have the latest enabled state
        const allMods = await window.electronAPI.mods.listLibrary();
        
        if (!isMounted) return;
        
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
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchMods();
    
    // Only refresh when the tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchMods();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [charName]); // Only depend on charName

  // Upload folder handler
  const handleUploadFolder = async () => {
    if (!charName) return;
    const folderPath = await window.electronAPI.mods.chooseFolder();
    if (folderPath) {
      try {
        setIsLoading(true);
        await window.electronAPI.mods.importFolder(folderPath, charName);
        
        // Force refresh the mods list immediately
        const modsList = await window.electronAPI.mods.listModsByCharacter(charName);
        const allMods = await window.electronAPI.mods.listLibrary();
        
        // Merge the enabled state from the full list
        const modsWithState = modsList.map(mod => {
          const fullMod = allMods.find(m => m.id === mod.id);
          return fullMod ? { ...mod, enabled: fullMod.enabled } : mod;
        });
        
        setMods(modsWithState);
        setError(null);
      } catch (err) {
        console.error("Failed to import folder:", err);
        setError(err instanceof Error ? err.message : "Failed to import mod");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleMod = useCallback(async (modId: string, enabled: boolean) => {
    if (!charName) return;
    
    // Store the current state for potential rollback
    const previousMods = [...mods];
    
    try {
      // Update the local state optimistically
      setMods(prevMods => 
        prevMods.map(mod => 
          mod.id === modId ? { ...mod, enabled } : mod
        )
      );
      
      // Toggle the mod in the backend
      await window.electronAPI.mods.toggleMod(modId, enabled);
      
      // The interval will automatically sync the UI with the backend state
      
    } catch (err) {
      console.error("Failed to toggle mod:", err);
      setError(err instanceof Error ? err.message : "Failed to toggle mod");
      
      // Revert to previous state on error
      setMods(previousMods);
    }
  }, [charName, mods]);

  const handleOpenModFolder = useCallback(async (modId: string) => {
    try {
      // Use showItemInFolder instead of openModFolder
      const mod = mods.find(m => m.id === modId);
      if (mod && (mod as any).installPath) {
        await window.electronAPI.mods.showItemInFolder((mod as any).installPath);
      }
    } catch (err) {
      console.error("Failed to open mod folder:", err);
      setError(err instanceof Error ? err.message : "Failed to open mod folder");
    }
  }, [mods]);

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
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={() => navigate("/characters")}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-moon-surface/50 text-moon-text border border-white/5 hover:border-moon-glowCyan/30 hover:bg-moon-surface/70 hover:shadow-moonGlowCyan/20 transition-all duration-300"
            whileHover={{ x: -2 }}
          >
            <FiArrowLeft className="w-5 h-5 group-hover:text-moon-glowCyan transition-colors" />
            Back to Characters
          </motion.button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={attributeIcon}
                  alt={character.attribute}
                  className="h-6 w-6 object-contain"
                  title={character.attribute}
                />
                <span className="text-sm font-medium text-moon-text">
                  {character.attribute}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={specialtyIcon}
                  alt={character.specialty}
                  className="h-6 w-6 object-contain"
                  title={character.specialty}
                />
                <span className="text-sm font-medium text-moon-text">
                  {character.specialty}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={rankIcon}
                  alt={`Rank ${character.rank}`}
                  className="h-6 w-6 object-contain"
                  title={`Rank ${character.rank}`}
                />
                <span className="text-sm font-medium text-yellow-400">
                  {character.rank}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-red-900/30 border border-red-500/40 rounded-2xl p-6 backdrop-blur-sm">
          <div>
            <h3 className="font-semibold text-red-200">Error Loading Mods</h3>
            <p className="text-red-300/90 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-1.5 text-sm rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-500/40 hover:border-red-400/60 transition-colors flex items-center gap-2"
            >
              <FiZap className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-moon-text max-w-7xl mx-auto">
      <motion.button
        onClick={() => navigate("/characters")}
        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-moon-surface/50 text-moon-text border border-white/5 hover:border-moon-glowCyan/30 hover:bg-moon-surface/70 hover:shadow-moonGlowCyan/20 transition-all duration-300 mb-6"
        whileHover={{ x: -2 }}
      >
        <FiArrowLeft className="w-5 h-5 group-hover:text-moon-glowCyan transition-colors" />
        Back to Characters
      </motion.button>

      {/* Character Header */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl mb-8 border border-white/5 bg-gradient-to-br from-moon-surface/30 to-moon-surface/10 backdrop-blur-lg shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
        <div className="p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <motion.div 
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-moon-glowViolet/40 shadow-lg flex-shrink-0"
              whileHover={{ scale: 1.03, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <img 
                src={character.imageUrl} 
                alt={character.name}
                className="w-full h-full object-cover scale-y-[-1]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-character.png';
                }}
              />
            </motion.div>
            
            <div className="text-center md:text-left">
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {character.name}
              </motion.h1>
              
              <motion.div 
                className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {character.attribute && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-moon-surface/40 border border-white/5 hover:border-moon-glowViolet/30 hover:bg-moon-surface/60 transition-colors duration-200">
                    <img
                      src={attributeIcon}
                      alt={character.attribute}
                      className="h-4 w-4 object-contain"
                      title={character.attribute}
                    />
                    <span className="text-sm text-moon-text/90">{character.attribute}</span>
                  </div>
                )}
                {character.specialty && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-moon-surface/40 border border-white/5 hover:border-moon-glowCyan/30 hover:bg-moon-surface/60 transition-colors duration-200">
                    <img
                      src={specialtyIcon}
                      alt={character.specialty}
                      className="h-4 w-4 object-contain"
                      title={character.specialty}
                    />
                    <span className="text-sm text-moon-text/90">{character.specialty}</span>
                  </div>
                )}
                {character.rank && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-moon-surface/40 border border-white/5 hover:border-yellow-500/30 hover:bg-moon-surface/60 transition-colors duration-200">
                    <img
                      src={rankIcon}
                      alt={`Rank ${character.rank}`}
                      className="h-4 w-4 object-contain"
                      title={`Rank ${character.rank}`}
                    />
                    <span className="text-sm text-yellow-400">{character.rank}</span>
                  </div>
                )}
              </motion.div>
              
              <motion.p 
                className="text-moon-text/70 mt-4 max-w-2xl text-sm sm:text-base"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Manage {character.name}'s mod collection. Enable, disable, or remove mods as needed.
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mods Section */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-moon-text to-moon-text/80">
              Installed Mods
            </h2>
            <p className="text-moon-text/60 text-sm mt-1">
              {mods.length} {mods.length === 1 ? 'mod' : 'mods'} installed
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="default"
              size="sm"
              onClick={handleUploadFolder}
              className="gap-2 group bg-gradient-to-r from-moon-glowViolet to-moon-glowCyan hover:from-moon-glowViolet/90 hover:to-moon-glowCyan/90 transition-all"
            >
              <FiFolderPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Import Mod Folder</span>
            </Button>
          </div>
        </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i} 
                  className="bg-moon-surface/20 rounded-2xl p-4 h-40 overflow-hidden relative"
                  initial={{ opacity: 0.5, y: 10 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    delay: i * 0.1
                  }}
                >
                  <div className="h-4 w-3/4 bg-moon-surface/40 rounded mb-3"></div>
                  <div className="h-3 w-1/2 bg-moon-surface/30 rounded mb-4"></div>
                  <div className="h-2 w-full bg-moon-surface/20 rounded mb-2"></div>
                  <div className="h-2 w-5/6 bg-moon-surface/20 rounded"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-moon-surface/30"></div>
                </motion.div>
              ))}
            </div>
          ) : mods.length === 0 ? (
            <motion.div 
              className="text-center py-16 border-2 border-dashed border-moon-surface/30 rounded-2xl bg-moon-surface/10 hover:bg-moon-surface/20 transition-colors duration-300 cursor-pointer"
              onClick={handleUploadFolder}
              whileHover={{ y: -2, boxShadow: '0 10px 30px -10px rgba(98, 234, 255, 0.1)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-moon-glowCyan/10 border border-moon-glowCyan/20 mb-6">
                <FiFolderPlus className="h-10 w-10 text-moon-glowCyan/60" />
              </div>
              <h3 className="text-xl font-semibold text-moon-text/90 mb-2">No Mods Found</h3>
              <p className="text-moon-text/60 mb-6 max-w-md mx-auto">
                You haven't added any mods for {character.name} yet. Get started by adding your first mod!
              </p>
              <Button
                variant="default"
                className="group bg-gradient-to-r from-moon-glowViolet to-moon-glowCyan hover:from-moon-glowViolet/90 hover:to-moon-glowCyan/90 transition-all"
              >
                <FiPlus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                Add Your First Mod
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {mods.map((mod, index) => (
                  <ModCard
                    key={mod.id}
                    mod={mod}
                    onToggle={handleToggleMod}
                    onDelete={handleDeleteMod}
                    onOpenFolder={handleOpenModFolder}
                    style={{
                      transitionDelay: `${index * 30}ms`,
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
      </motion.div>
    </div>
  );
};

export default CharacterModsPage;

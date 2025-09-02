import React, { useState, useEffect, useCallback } from "react";
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

// Mock character data - replace with actual data
const getCharacterData = (charName: string) => {
  // This is a mock - replace with actual character data
  return {
    name: charName || "Character",
    element: "Anemo", // Example element
    rarity: 5, // Example rarity
    imageUrl: `/characters/${charName?.toLowerCase()}_r.jpeg` || ""
  };
};

const CharacterModsPage: React.FC = () => {
  const { charName } = useParams<{ charName: string }>();
  const navigate = useNavigate();
  const [mods, setMods] = useState<ModItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const character = getCharacterData(charName || '');

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
        <motion.button
          onClick={() => navigate("/characters")}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-moon-surface/50 text-moon-text border border-white/5 hover:border-moon-glowCyan/30 hover:bg-moon-surface/70 hover:shadow-moonGlowCyan/20 transition-all duration-300 mb-6"
          whileHover={{ x: -2 }}
        >
          <FiArrowLeft className="w-5 h-5 group-hover:text-moon-glowCyan transition-colors" />
          Back to Characters
        </motion.button>
        <div className="bg-red-900/30 border border-red-500/40 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-red-500/20 rounded-lg">
              <FiInfo className="w-5 h-5 text-red-400" />
            </div>
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
                className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className="px-3 py-1 bg-moon-glowViolet/10 text-moon-glowViolet text-sm font-medium rounded-full border border-moon-glowViolet/30 backdrop-blur-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-moon-glowViolet animate-pulse"></span>
                  {character.element}
                </span>
                <div className="flex items-center bg-moon-surface/30 px-2.5 py-1 rounded-full border border-white/5">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-sm ${i < character.rarity ? 'text-yellow-400' : 'text-moon-text/20'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
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
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    transition={{ 
                      duration: 0.2,
                      delay: index * 0.03
                    }}
                    className={cn(
                      "group relative rounded-2xl border border-moon-surface/20 overflow-hidden transition-all duration-300",
                      "bg-moon-surface/10 hover:bg-moon-surface/20 hover:border-moon-surface/30",
                      "hover:shadow-lg hover:shadow-moon-glowViolet/5",
                      "hover:-translate-y-1"
                    )}
                  >
                    {/* Status indicator */}
                    <div className={cn(
                      "absolute top-3 right-3 w-2.5 h-2.5 rounded-full transition-all duration-300",
                      mod.enabled 
                        ? "bg-green-400 shadow-[0_0_8px] shadow-green-400/50" 
                        : "bg-moon-text/20"
                    )} />
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <h3 className="font-semibold text-moon-text/90 group-hover:text-moon-glowCyan transition-colors line-clamp-2">
                          {mod.name}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleMod(mod.id, !mod.enabled);
                          }}
                          className={cn(
                            "p-1.5 rounded-lg transition-all duration-200 flex-shrink-0",
                            "border hover:shadow-lg",
                            mod.enabled 
                              ? "text-green-400 border-green-400/30 bg-green-400/10 hover:bg-green-400/20 hover:shadow-green-400/20" 
                              : "text-moon-text/40 border-moon-surface/30 bg-moon-surface/10 hover:bg-moon-surface/20"
                          )}
                          title={mod.enabled ? 'Disable mod' : 'Enable mod'}
                        >
                          <FiPower className={cn(
                            "w-4 h-4 transition-transform duration-300",
                            mod.enabled && "fill-current"
                          )} />
                        </button>
                      </div>
                      
                      <p className="text-sm text-moon-text/60 mb-5 line-clamp-2 h-10">
                        {mod.description || 'No description available'}
                      </p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-moon-surface/20">
                        <div className={cn(
                          "text-xs font-medium px-2 py-1 rounded-md transition-colors",
                          mod.enabled 
                            ? "text-green-400 bg-green-400/10" 
                            : "text-moon-text/50 bg-moon-surface/20"
                        )}>
                          {mod.enabled ? 'Active' : 'Inactive'}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModFolder(mod.id);
                            }}
                            className="p-1.5 text-moon-text/50 hover:text-moon-glowCyan hover:bg-moon-surface/30 rounded-lg transition-all duration-200 group/button"
                            title="Open mod folder"
                          >
                            <FiFolder className="w-4 h-4 group-hover/button:-translate-y-0.5 transition-transform" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMod(mod.id);
                            }}
                            className="p-1.5 text-moon-text/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group/button"
                            title="Delete mod"
                          >
                            <FiTrash2 className="w-4 h-4 group-hover/button:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-moon-glowViolet/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
      </motion.div>
    </div>
  );
};

export default CharacterModsPage;

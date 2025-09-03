import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiFolderPlus, FiSearch, FiPackage } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { cn } from '../../../lib/utils';
import ModCard from '../../components/mods/ModCard';
import { ModItem } from '../../types/mods';

const ModsPage: React.FC = () => {
  const [mods, setMods] = useState<ModItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMods = async () => {
      try {
        setIsLoading(true);
        const modsList = await window.electronAPI.mods.listLibrary();
        setMods(modsList);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch mods:', err);
        setError('Failed to load mods. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMods();
  }, []);

  const handleToggleMod = async (modId: string, enabled: boolean) => {
    try {
      await window.electronAPI.mods.toggleMod(modId, enabled);
      setMods(prevMods =>
        prevMods.map(mod =>
          mod.id === modId ? { ...mod, enabled } : mod
        )
      );
    } catch (err) {
      console.error('Failed to toggle mod:', err);
      setError('Failed to update mod status.');
    }
  };

  const handleDeleteMod = async (modId: string) => {
    if (!window.confirm('Are you sure you want to delete this mod?')) return;
    
    try {
      await window.electronAPI.mods.deleteMod(modId);
      setMods(prevMods => prevMods.filter(mod => mod.id !== modId));
    } catch (err) {
      console.error('Failed to delete mod:', err);
      setError('Failed to delete mod. Please try again.');
    }
  };

  const handleOpenModFolder = async (modId: string) => {
    try {
      const mod = mods.find(m => m.id === modId);
      if (mod?.installPath) {
        await window.electronAPI.mods.showItemInFolder(mod.installPath);
      }
    } catch (err) {
      console.error('Failed to open mod folder:', err);
      setError('Failed to open mod folder.');
    }
  };

  const filteredMods = mods.filter(mod =>
    mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mod.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-moon-glowViolet" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg text-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Installed Mods</h1>
          <p className="text-moon-text/60">
            {mods.length} {mods.length === 1 ? 'mod' : 'mods'} installed
          </p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-moon-text/40" />
            <input
              type="text"
              placeholder="Search mods..."
              className="w-full pl-10 pr-4 py-2 bg-moon-surface/20 border border-moon-surface/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-moon-glowViolet/50 focus:border-transparent text-moon-text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="default"
            className="whitespace-nowrap"
            onClick={() => window.electronAPI.mods.chooseFolder()}
          >
            <FiFolderPlus className="mr-2" />
            Add Mod
          </Button>
        </div>
      </div>

      {filteredMods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-moon-surface/30 rounded-xl bg-moon-surface/10">
          <FiPackage className="w-12 h-12 text-moon-text/40 mb-4" />
          <h3 className="text-lg font-medium mb-2">No mods found</h3>
          <p className="text-moon-text/60 mb-4">
            {searchQuery ? 'Try a different search term' : 'Get started by adding your first mod'}
          </p>
          <Button
            variant="default"
            onClick={() => window.electronAPI.mods.chooseFolder()}
          >
            <FiPlus className="mr-2" />
            Add Your First Mod
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredMods.map((mod, index) => (
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
    </div>
  );
};

export default ModsPage;

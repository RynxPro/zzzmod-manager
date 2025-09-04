import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiSearch } from 'react-icons/fi';

interface ModItem {
  id: string;
  name: string;
  enabled: boolean;
}

interface PresetSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; mods: string[] }) => void;
  initialName?: string;
  initialMods?: string[];
  availableMods?: ModItem[];
  isEditing?: boolean;
}

const PresetSaveDialog: React.FC<PresetSaveDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialName = '',
  initialMods = [],
  availableMods = [],
  isEditing = false
}) => {
  const [name, setName] = useState(initialName);
  const [selectedMods, setSelectedMods] = useState<Set<string>>(new Set(initialMods));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setSelectedMods(new Set(initialMods));
      setSearchQuery('');
    } else {
      setName('');
      setSelectedMods(new Set());
    }
  }, [isOpen, initialName, initialMods]);

  const toggleMod = (modId: string) => {
    const newSelectedMods = new Set(selectedMods);
    if (newSelectedMods.has(modId)) {
      newSelectedMods.delete(modId);
    } else {
      newSelectedMods.add(modId);
    }
    setSelectedMods(newSelectedMods);
  };

  const selectAllMods = () => {
    const allModIds = new Set(availableMods.map(mod => mod.id));
    setSelectedMods(allModIds);
  };

  const clearSelection = () => {
    setSelectedMods(new Set());
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        mods: Array.from(selectedMods)
      });
    }
  };

  const filteredMods = availableMods.filter(mod => 
    mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mod.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-moon-surface/80 border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-moon-text">
              {isEditing ? 'Edit Preset' : 'Save New Preset'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-moon-text/80 mb-1">Preset Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="Enter preset name..."
                  className="w-full p-3 rounded-lg bg-moon-surface border border-white/10 text-moon-text focus:outline-none focus:ring-2 focus:ring-moon-accent focus:border-moon-accent transition-all duration-200"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-moon-text/80">Included Mods</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={selectAllMods}
                      className="text-xs text-moon-glowCyan hover:text-moon-accent transition-colors"
                    >
                      Select All
                    </button>
                    <span className="text-moon-text/40">|</span>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-xs text-moon-glowCyan hover:text-moon-accent transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-4 w-4 text-moon-text/40" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search mods..."
                    className="w-full pl-10 pr-4 py-2 bg-moon-surface/50 border border-white/10 rounded-lg text-moon-text placeholder-moon-text/40 focus:outline-none focus:ring-1 focus:ring-moon-accent/50 focus:border-moon-accent/50 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-moon-text/40 hover:text-moon-text/70 transition-colors"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto bg-moon-surface/30 border border-white/10 rounded-lg divide-y divide-white/5">
                  {filteredMods.length > 0 ? (
                    filteredMods.map((mod) => (
                      <div 
                        key={mod.id} 
                        className={`flex items-center p-3 hover:bg-moon-surface/50 transition-colors cursor-pointer ${
                          selectedMods.has(mod.id) ? 'bg-moon-surface/20' : ''
                        }`}
                        onClick={() => toggleMod(mod.id)}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 ${
                          selectedMods.has(mod.id) 
                            ? 'bg-moon-accent text-moon-bg' 
                            : 'border border-moon-text/30'
                        }`}>
                          {selectedMods.has(mod.id) && <FiCheck size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-moon-text truncate">{mod.name}</p>
                          <p className="text-xs text-moon-text/50 truncate">{mod.id}</p>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ml-2 ${
                          mod.enabled ? 'bg-green-500' : 'bg-moon-text/30'
                        }`} />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-moon-text/60 text-sm">
                      No mods found. {searchQuery ? 'Try a different search.' : 'No mods available.'}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-moon-text/50">
                  {selectedMods.size} mod{selectedMods.size !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-white/5 text-moon-text hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-5 py-2 rounded-lg bg-moon-accent text-black font-semibold hover:shadow-moonGlowCyan disabled:bg-moon-accent/30 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
              >
                Save Preset
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


export default PresetSaveDialog;

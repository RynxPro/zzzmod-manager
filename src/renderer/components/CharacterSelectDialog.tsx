import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '../types/characters';

// Mock characters data - replace with your actual data source
const characters: Character[] = [
  { id: 'alice', name: 'Alice', imageUrl: '/characters/alice_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'anby', name: 'Anby', imageUrl: '/characters/anby_r.jpeg', aliases: ['Anby Demara'], mods: { total: 0, active: 0 } },
  { id: 'anby_s0', name: 'Anby S0', imageUrl: '/characters/anbys0_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'anton', name: 'Anton', imageUrl: '/characters/anton_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'astra', name: 'Astra', imageUrl: '/characters/astra_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'belle', name: 'Belle', imageUrl: '/characters/belle_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'ben', name: 'Ben', imageUrl: '/characters/ben_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'billy', name: 'Billy', imageUrl: '/characters/billy_r.jpeg', aliases: ['Billy Kid'], mods: { total: 0, active: 0 } },
  { id: 'burnice', name: 'Burnice', imageUrl: '/characters/burnice_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'caesar', name: 'Caesar', imageUrl: '/characters/caesar_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'corin', name: 'Corin', imageUrl: '/characters/corin_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'ellen', name: 'Ellen', imageUrl: '/characters/ellen_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'evelyn', name: 'Evelyn', imageUrl: '/characters/evelyn_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'grace', name: 'Grace', imageUrl: '/characters/grace_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'harumasa', name: 'Harumasa', imageUrl: '/characters/harumasa_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'hugo', name: 'Hugo', imageUrl: '/characters/hugo_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'jane', name: 'Jane', imageUrl: '/characters/jane_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'jufufu', name: 'Jufufu', imageUrl: '/characters/jufufu_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'koleda', name: 'Koleda', imageUrl: '/characters/koleda_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'lighter', name: 'Lighter', imageUrl: '/characters/lighter_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'lucy', name: 'Lucy', imageUrl: '/characters/lucy_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'lycaon', name: 'Lycaon', imageUrl: '/characters/lycaon_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'miyabi', name: 'Miyabi', imageUrl: '/characters/miyabi_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'nekomata', name: 'Nekomata', imageUrl: '/characters/nekomata_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'nicole', name: 'Nicole', imageUrl: '/characters/nicole_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'pan', name: 'Pan', imageUrl: '/characters/pan_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'piper', name: 'Piper', imageUrl: '/characters/piper_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'pulchra', name: 'Pulchra', imageUrl: '/characters/pulchra_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'qingyi', name: 'Qingyi', imageUrl: '/characters/qingyi_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'rina', name: 'Rina', imageUrl: '/characters/rina_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'seth', name: 'Seth', imageUrl: '/characters/seth_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'soldier11', name: 'Soldier 11', imageUrl: '/characters/soldier11_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'soukaku', name: 'Soukaku', imageUrl: '/characters/soukaku_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'trigger', name: 'Trigger', imageUrl: '/characters/trigger_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'vivian', name: 'Vivian', imageUrl: '/characters/vivian_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'wise', name: 'Wise', imageUrl: '/characters/wise_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'yanagi', name: 'Yanagi', imageUrl: '/characters/yanagi_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'yixuan', name: 'Yixuan', imageUrl: '/characters/yixuan_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'yuzuha', name: 'Yuzuha', imageUrl: '/characters/yuzuha_r.jpeg', mods: { total: 0, active: 0 } },
  { id: 'zhuyuan', name: 'Zhuyuan', imageUrl: '/characters/zhuyuan_r.jpeg', mods: { total: 0, active: 0 } },
];
import { X, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface CharacterSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (character: string) => void;
}

const CharacterSelectDialog: React.FC<CharacterSelectDialogProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharacters = useMemo(() => {
    if (!searchQuery) return characters;
    const query = searchQuery.toLowerCase();
    return characters.filter(char => 
      char.name.toLowerCase().includes(query) ||
      (char.aliases?.some(alias => alias.toLowerCase().includes(query)) ?? false)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-moon-surface/90 border border-moon-glowViolet/20 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden backdrop-blur-lg"
      >
        <div className="p-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(122,90,248,0.1),transparent_70%)] pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet mb-2">
              Select Character
            </h2>
            <p className="text-moon-text/70 mb-6">Choose a character to assign the mod to</p>
            
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-moon-text/50" />
              </div>
              <input
                type="text"
                placeholder="Search characters..."
                className="w-full pl-10 pr-4 py-3 bg-moon-bg/50 border border-moon-glowViolet/30 rounded-lg text-moon-text focus:outline-none focus:ring-2 focus:ring-moon-glowViolet/50 focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-moon-surface/50 hover:bg-moon-surface/80 text-moon-text/70 hover:text-moon-text transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[50vh] overflow-y-auto p-2 -mx-2">
            {filteredCharacters.length > 0 ? (
              filteredCharacters.map((char) => (
                <motion.button
                  key={char.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedChar(char.name)}
                  className={cn(
                    "group relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 border-2",
                    selectedChar === char.name
                      ? 'border-moon-glowViolet/80 bg-moon-surface/50 shadow-lg shadow-moon-glowViolet/20'
                      : 'border-moon-glowViolet/10 bg-moon-surface/30 hover:border-moon-glowViolet/40 hover:bg-moon-surface/50'
                  )}
                >
                  {selectedChar === char.name && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-moon-glowViolet flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                  <div className="relative w-20 h-20 mb-3 group-hover:scale-110 transition-transform">
                    <div className="absolute inset-0 bg-gradient-to-br from-moon-glowViolet/30 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-moon-glowViolet/30 group-hover:border-moon-glowViolet/50 transition-colors">
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        className="w-full h-full object-cover"
                        style={{ transform: 'rotate(180deg)' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-moon-text group-hover:text-moon-glowViolet transition-colors">
                    {char.name}
                  </span>
                </motion.button>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-moon-text/60">
                No characters found matching "{searchQuery}"
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-moon-glowViolet/10 flex justify-end space-x-3">
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-moon-glowViolet/20 bg-moon-surface/50 text-moon-text hover:bg-moon-surface/70 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectedChar && onSelect(selectedChar)}
              disabled={!selectedChar}
              className={cn(
                "px-6 py-2.5 rounded-lg font-medium transition-all relative overflow-hidden group",
                selectedChar
                  ? 'bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet text-white hover:shadow-[0_0_20px_rgba(122,90,248,0.3)]'
                  : 'bg-moon-surface/30 text-moon-text/50 cursor-not-allowed'
              )}
            >
              {selectedChar ? (
                <>
                  <span className="relative z-10">Assign to {selectedChar}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-moon-glowViolet to-moon-glowCyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </>
              ) : (
                'Select a character'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CharacterSelectDialog;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { characters } from '../data/characters';
import { X } from 'lucide-react';

interface CharacterSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (character: string) => void;
}

const CharacterSelectDialog: React.FC<CharacterSelectDialogProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-gaming-bg-card border border-gaming-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="p-6 relative">
          <h2 className="text-2xl font-bold text-gaming-text-primary mb-6">Select Character</h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gaming-text-secondary hover:text-gaming-text-primary transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedChar(char.name)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                  selectedChar === char.name
                    ? 'bg-gradient-to-br from-gaming-accent-blue/20 to-gaming-accent-violet/20 border border-gaming-accent-blue/50 shadow-glow-blue'
                    : 'bg-gaming-bg-overlay/50 hover:bg-gaming-bg-overlay/70 border border-gaming-border/50 hover:border-gaming-accent-blue/30'
                }`}
              >
                <div className="relative w-16 h-16 mb-2">
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-sm font-medium text-gaming-text-primary">
                  {char.name}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gaming-border bg-gaming-bg-overlay/50 text-gaming-text-primary hover:bg-gaming-bg-overlay transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedChar && onSelect(selectedChar)}
              disabled={!selectedChar}
              className={`px-6 py-2 rounded-lg transition-all ${
                selectedChar
                  ? 'bg-gradient-to-r from-gaming-accent-blue to-gaming-accent-violet text-white hover:shadow-glow-blue'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CharacterSelectDialog;

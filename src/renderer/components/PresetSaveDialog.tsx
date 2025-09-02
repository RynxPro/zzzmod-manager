import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PresetSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const PresetSaveDialog: React.FC<PresetSaveDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

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
            <h2 className="text-xl font-bold mb-4 text-moon-text">Save New Preset</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Enter preset name..."
              className="w-full p-3 rounded-lg bg-moon-surface border border-white/10 text-moon-text focus:outline-none focus:ring-2 focus:ring-moon-accent focus:border-moon-accent transition-all duration-200"
              autoFocus
            />
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

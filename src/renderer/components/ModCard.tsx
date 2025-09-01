import React from 'react';
import { motion } from 'framer-motion';
import { FiPower, FiTrash2 } from 'react-icons/fi';
import { ModItem } from '../types/mods';

interface ModCardProps {
  mod: ModItem;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}

const ModCard: React.FC<ModCardProps> = ({ mod, onToggle, onDelete }) => {
  const thumbnail = mod.thumbnailPath || 'https://via.placeholder.com/300x150/1a1a2e/ffffff?text=No+Preview';
  
  return (
    <motion.div 
      className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-neon-cyan/50 transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/10"
      whileHover={{ y: -4 }}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={thumbnail} 
          alt={mod.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x150/1a1a2e/ffffff?text=No+Preview';
          }}
        />
        <div className="absolute bottom-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            mod.enabled 
              ? 'bg-green-900/80 text-green-300' 
              : 'bg-gray-900/80 text-gray-400'
          }`}>
            {mod.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-white mb-1 truncate">{mod.name}</h3>
        <p className="text-gray-400 text-sm h-10 line-clamp-2 mb-4">
          {mod.description || 'No description available'}
        </p>
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => onToggle(mod.id, !mod.enabled)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mod.enabled
                ? 'bg-red-900/50 hover:bg-red-800/70 text-red-300 hover:text-white'
                : 'bg-green-900/50 hover:bg-green-800/70 text-green-300 hover:text-white'
            }`}
          >
            <FiPower className="text-xs" />
            {mod.enabled ? 'Disable' : 'Enable'}
          </button>
          
          <button
            onClick={() => onDelete(mod.id)}
            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete Mod"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ModCard;

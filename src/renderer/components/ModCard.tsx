import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPower, FiTrash2 } from 'react-icons/fi';
import { ModItem } from '../ui/types/mods';

interface ModCardProps {
  mod: ModItem;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}

const ModCard: React.FC<ModCardProps> = ({ mod, onToggle, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const thumbnail = (mod.thumbnailPath && !imageError) ? 
    mod.thumbnailPath.startsWith('http') ? 
      mod.thumbnailPath : 
      `file://${mod.thumbnailPath}` : 
    null;
  
  return (
    <motion.div 
      className="bg-moon-surface/70 rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-moonGlowCyan"
      whileHover={{ y: -4 }}
    >
      <div className="relative h-40 overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={mod.name} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-moon-surface to-moon-bg">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🎮</div>
              <p className="text-xs text-moon-muted">No Preview</p>
              <p className="text-xxs text-moon-muted mt-1">{mod.name}</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${
              mod.enabled
                ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-moon-surface/80 text-moon-muted border-white/10'
            }`}
          >
            {mod.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-moon-text mb-1 truncate">{mod.name}</h3>
        <p className="text-moon-muted text-sm h-10 line-clamp-2 mb-4">
          {mod.description || 'No description available'}
        </p>
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => onToggle(mod.id, !mod.enabled)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              mod.enabled
                ? 'bg-red-900/40 hover:bg-red-800/60 text-red-300 hover:text-white border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 hover:text-white border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            }`}
          >
            <FiPower className="text-xs" />
            {mod.enabled ? 'Disable' : 'Enable'}
          </button>
          
          <button
            onClick={() => onDelete(mod.id)}
            className="p-1.5 text-moon-muted hover:text-red-400 transition-colors"
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

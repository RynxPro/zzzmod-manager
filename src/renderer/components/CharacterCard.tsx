import React from "react";

interface CharacterCardProps {
  name: string;
  imageUrl: string;
  totalMods?: number;
  activeMods?: number;
  onClick?: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  name,
  imageUrl,
  totalMods = 0,
  activeMods = 0,
  onClick,
}) => {
  const progress = totalMods > 0 ? (activeMods / totalMods) * 100 : 0;
  const isActive = activeMods > 0;

  return (
    <div
      className="group relative bg-gradient-to-br from-gray-800/90 to-gray-900/95 border border-gray-700/60 rounded-xl p-5 flex flex-col items-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm overflow-hidden hover:border-indigo-400/40 hover:shadow-indigo-500/20"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      aria-label={`${name}: ${activeMods} of ${totalMods} mods active`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Character image with border animation */}
      <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={imageUrl}
          alt={name}
          className="relative z-10 w-24 h-24 rounded-full object-cover border-2 border-gray-600/50 group-hover:border-indigo-400/70 transition-all duration-300 shadow-lg shadow-black/30"
        />
      </div>
      
      {/* Character name */}
      <h3 className="text-lg font-bold text-white mb-2 text-center tracking-wide bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-blue-400 transition-all duration-300">
        {name}
      </h3>
      
      {/* Mods counter */}
      <div className="relative mb-3">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full blur-sm group-hover:blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />
        <p className={`relative z-10 text-xs px-3 py-1 rounded-full ${isActive ? 'bg-indigo-900/30 text-indigo-200' : 'bg-gray-800/70 text-gray-400'} border ${isActive ? 'border-indigo-500/40' : 'border-gray-700/50'} shadow-sm backdrop-blur-sm`}>
          {isActive ? '🔵' : '⚪'} {activeMods}/{totalMods} mods
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50 shadow-inner">
        <div
          className={`h-full bg-gradient-to-r from-indigo-400 to-blue-500 transition-all duration-700 ease-out ${progress > 0 ? 'shadow-[0_0_8px_2px_rgba(99,102,241,0.3)]' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Hover indicator */}
      <div className="absolute bottom-2 w-8 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default CharacterCard;

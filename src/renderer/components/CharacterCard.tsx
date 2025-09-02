import React from "react";
import { FiZap } from "react-icons/fi";

interface CharacterCardProps {
  name: string;
  imageUrl: string;
  totalMods?: number;
  activeMods?: number;
  isActive?: boolean;
  onClick?: () => void;
}

const StatBadge: React.FC<{ value: number; label: string; isActive?: boolean }> = ({ 
  value, 
  label,
  isActive = false 
}) => (
  <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-300
    ${isActive 
      ? 'bg-gradient-to-r from-moon-glowCyan/20 to-moon-glowViolet/20 text-moon-glowCyan border border-moon-glowCyan/30 group-hover:shadow-[0_0_8px_rgba(99,102,241,0.3)]' 
      : 'bg-moon-surface/40 text-moon-text/80 border border-white/5 group-hover:bg-moon-surface/60 group-hover:border-white/10'}`}
  >
    <span className="font-bold">{value}</span>
    <span>{label}</span>
  </div>
);

const CharacterCard: React.FC<CharacterCardProps> = ({
  name,
  imageUrl,
  totalMods = 0,
  activeMods = 0,
  isActive = false,
  onClick,
}) => {
  return (
    <div
      className={`relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 transform-gpu
        ${isActive 
          ? 'bg-gradient-to-br from-moon-surface/70 to-moon-surface/50 shadow-lg shadow-moon-glowCyan/10' 
          : 'bg-moon-surface/40 hover:bg-moon-surface/60'}
        ${onClick ? 'cursor-pointer group hover:shadow-lg hover:shadow-moon-glowViolet/20' : ''}
        border ${isActive ? 'border-moon-glowCyan/30' : 'border-white/5'}
        hover:-translate-y-0.5 hover:scale-[1.02]`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${name}: ${activeMods} active of ${totalMods} total mods`}
    >
      {/* Active indicator ring */}
      {isActive && (
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-moon-glowCyan/30 to-moon-glowViolet/30 blur-sm -z-10" />
      )}

      {/* Character portrait */}
      <div className="relative w-20 h-20 mb-3">
        <div className={`absolute inset-0 rounded-full ${
          isActive 
            ? 'bg-gradient-to-br from-moon-glowCyan/40 to-moon-glowViolet/40'
            : 'bg-moon-surface/30'
        }`} />
        <div className="relative w-full h-full rounded-full overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover scale-y-[-1]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-character.png';
            }}
          />
        </div>
      </div>

      {/* Character name */}
      <h3 className="text-base font-semibold text-moon-text text-center mb-2.5 relative group-hover:text-moon-glowViolet transition-colors duration-300">
        <span className="relative inline-block">
          {name}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-moon-glowViolet transition-all duration-300 group-hover:w-full"></span>
        </span>
      </h3>

      {/* Mod stats */}
      <div className="flex gap-2">
        <StatBadge 
          value={totalMods} 
          label="Total" 
        />
        <StatBadge 
          value={activeMods} 
          label="Active" 
          isActive={activeMods > 0}
        />
      </div>
    </div>
  );
};

export default CharacterCard;

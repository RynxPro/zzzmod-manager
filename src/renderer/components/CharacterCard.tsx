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
  return (
    <div
      className="group cursor-pointer relative bg-moon-surface/80 rounded-2xl p-5 flex flex-col items-center hover:-translate-y-1 transition-all duration-300 backdrop-blur-gaming border border-white/5 hover:border-white/10 hover:shadow-moonGlowCyan"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      aria-label={`${name}: ${activeMods} of ${totalMods} mods active`}
    >
      <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-moon-glowCyan/25 to-moon-glowViolet/25 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={imageUrl}
          alt={name}
          className="relative z-10 w-24 h-24 rounded-full object-cover shadow-md group-hover:shadow-moonGlowViolet transition-all duration-300 transform -scale-y-100"
        />
      </div>
      <div className="relative">
        <h3 className="text-lg font-semibold text-moon-text mb-1 text-center tracking-wide">
          {name}
        </h3>
      </div>
      <p className="text-xs px-3 py-1.5 rounded-full bg-moon-surface/70 text-moon-muted border border-white/5 group-hover:text-moon-text group-hover:border-white/10 transition-colors">
        {totalMods} mods, {activeMods} on
      </p>
    </div>
  );
};

export default CharacterCard;

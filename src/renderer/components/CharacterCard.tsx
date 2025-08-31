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
      className="group cursor-pointer relative bg-gaming-bg-card/90 rounded-xl p-5 flex flex-col items-center hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm hover:bg-gradient-to-br hover:from-gaming-accent-blue/5 hover:to-gaming-accent-violet/5 hover:shadow-[0_4px_20px_-5px_rgba(59,130,246,0.2)]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      aria-label={`${name}: ${activeMods} of ${totalMods} mods active`}
    >
      <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gaming-accent-blue/30 to-gaming-accent-violet/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={imageUrl}
          alt={name}
          className="relative z-10 w-24 h-24 rounded-full object-cover shadow-md group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300"
        />
      </div>
      <h3 className="text-lg font-semibold text-gaming-text-primary mb-1 text-center tracking-wide group-hover:bg-gradient-to-r group-hover:from-gaming-accent-blue group-hover:to-gaming-accent-violet group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
        {name}
      </h3>
      <p className="text-xs px-3 py-1.5 bg-gaming-bg-overlay/50 text-gaming-text-secondary rounded-full shadow-sm group-hover:bg-gradient-to-r group-hover:from-gaming-accent-blue/10 group-hover:to-gaming-accent-violet/10 group-hover:text-gaming-text-primary group-hover:border group-hover:border-gaming-accent-blue/40 transition-all duration-300">
        {activeMods}/{totalMods} mods active
      </p>
    </div>
  );
};

export default CharacterCard;

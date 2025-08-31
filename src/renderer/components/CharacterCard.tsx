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

  return (
    <div
      className="cursor-pointer relative bg-gradient-to-tr from-gray-800/90 to-gray-900/90 border border-gray-700/70 rounded-xl p-5 flex flex-col items-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      aria-label={`${name}: ${activeMods} of ${totalMods} mods active`}
    >
      <div className="relative mb-4">
        <img
          src={imageUrl}
          alt={name}
          className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-600 shadow-md hover:ring-green-400 hover:shadow-green-500/40 transition-all duration-300"
        />
      </div>
      <h3 className="text-lg font-bold text-white mb-1 text-center tracking-wide">
        {name}
      </h3>
      <p className="text-xs px-3 py-1 bg-gray-700/80 rounded-full text-gray-200 mb-3 shadow-sm">
        {activeMods}/{totalMods} mods active
      </p>
      <div className="w-full bg-gray-700/60 h-2 rounded-full overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default CharacterCard;

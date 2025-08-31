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
      className="cursor-pointer bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col items-center shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      aria-label={`${name}: ${activeMods} of ${totalMods} mods active`}
    >
      <div className="relative mb-3">
        <img
          src={imageUrl}
          alt={name}
          className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-700 hover:ring-green-500 transition-all duration-200 rotate-180"
        />
      </div>
      <h3 className="text-lg font-bold text-white mb-1 text-center">{name}</h3>
      <p className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300 mb-3">
        {activeMods}/{totalMods} mods active
      </p>
      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default CharacterCard;

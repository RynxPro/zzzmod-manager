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
      className="cursor-pointer bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow hover:shadow-lg transition-all"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      aria-label={`${name}: ${activeMods} of ${totalMods} mods active`}
    >
      <img
        src={imageUrl}
        alt={name}
        className="w-24 h-24 rounded-full mb-3 object-cover scale-y-[-1]"
      />
      <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
      <p className="text-sm text-gray-400 mb-2">
        {activeMods}/{totalMods} mods active
      </p>
      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
        <div className="h-2 bg-green-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default CharacterCard;

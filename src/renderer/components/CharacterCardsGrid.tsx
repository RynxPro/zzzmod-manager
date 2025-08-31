import React from "react";
import CharacterCard from "./CharacterCard";
import { characters } from "../data/characters";
import { ModItem } from "../ui/types/mods";

interface CharacterCardsGridProps {
  mods: ModItem[];
  onSelect?: (charName: string) => void;
}

const CharacterCardsGrid: React.FC<CharacterCardsGridProps> = ({
  mods,
  onSelect,
}) => {
  const charactersWithStats = React.useMemo(() => {
    return characters.map((char) => {
      const modsForChar = mods.filter((m) => m.character === char.name);
      const activeMods = modsForChar.filter((m) => m.enabled).length;
      return {
        ...char,
        total: modsForChar.length,
        active: activeMods,
      };
    });
  }, [mods]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {charactersWithStats.map((char) => (
        <CharacterCard
          key={char.name}
          name={char.name}
          imageUrl={char.imageUrl}
          totalMods={char.total}
          activeMods={char.active}
          onClick={() => onSelect?.(char.name)}
        />
      ))}
    </div>
  );
};

export default CharacterCardsGrid;

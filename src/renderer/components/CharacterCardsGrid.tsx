import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

  const charactersWithStats = useMemo(() => {
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

  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return charactersWithStats;

    const query = searchQuery.toLowerCase();
    return charactersWithStats.filter(
      (char) =>
        char.name.toLowerCase().includes(query) ||
        char.id.toLowerCase().includes(query)
    );
  }, [charactersWithStats, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search characters..."
          className="block w-full pl-10 pr-3 py-2 rounded-full bg-gray-800/80 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
          aria-label="Search characters"
        />
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCharacters.map((char) => (
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
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No characters found matching "
            <span className="text-white">{searchQuery}</span>"
          </p>
        </div>
      )}
    </div>
  );
};

export default CharacterCardsGrid;

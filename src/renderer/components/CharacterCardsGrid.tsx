import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import CharacterCard from "./CharacterCard";
import { characters } from "../data/characters";
import { ModItem } from "../ui/types/mods";
import { Character } from "../types/character";

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
    // Group mods by character name (case-insensitive)
    const modsByChar = new Map<string, ModItem[]>();

    mods.forEach((mod) => {
      if (!mod.character) return;

      const lowerCharName = mod.character.toLowerCase();
      const existingMods = modsByChar.get(lowerCharName) || [];
      modsByChar.set(lowerCharName, [...existingMods, mod]);
    });

    return characters.map((char) => {
      const modsForChar = modsByChar.get(char.name.toLowerCase()) || [];
      const activeMods = modsForChar.filter((m) => m.enabled).length;

      return {
        ...char,
        total: modsForChar.length,
        active: activeMods,
        attribute: char.attribute,
        specialty: char.specialty,
        rank: char.rank,
      };
    });
  }, [mods]);

  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return charactersWithStats;

    const query = searchQuery.toLowerCase().trim();
    return charactersWithStats.filter((char) => {
      // Check name and id (which are required fields)
      if (
        char.name.toLowerCase().includes(query) ||
        char.id.toLowerCase().includes(query)
      ) {
        return true;
      }

      // Safely check optional fields
      if (char.attribute && char.attribute.toLowerCase().includes(query)) {
        return true;
      }

      if (char.specialty && char.specialty.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }, [charactersWithStats, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-moon-muted" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, attribute, or specialty..."
            className="block w-full pl-10 pr-4 py-2.5 rounded-lg bg-moon-surface/70 text-moon-text placeholder-moon-muted/70 border border-white/10 focus:outline-none focus:ring-2 focus:ring-moon-accent/50 focus:border-transparent shadow-sm transition-colors duration-200"
            aria-label="Search characters"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-moon-muted hover:text-moon-text transition-colors"
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
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
              attribute={char.attribute}
              specialty={char.specialty}
              rank={char.rank}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-moon-muted text-lg">
            No characters found matching "
            <span className="text-moon-text">{searchQuery}</span>"
          </p>
        </div>
      )}
    </div>
  );
};

export default CharacterCardsGrid;

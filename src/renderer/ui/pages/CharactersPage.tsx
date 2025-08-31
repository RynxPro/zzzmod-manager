import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CharacterCardsGrid from "../../components/CharacterCardsGrid";
import { ModItem } from "../types/mods";

const CharactersPage: React.FC = () => {
  const [mods, setMods] = useState<ModItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchMods() {
      try {
        const modsList = await window.electronAPI.mods.listLibrary();
        if (isMounted) {
          setMods(modsList);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch mods:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load characters");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMods();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCharacterSelect = (charName: string) => {
    if (!charName) {
      console.error("Character name is required");
      return;
    }
    navigate(`/characters/${encodeURIComponent(charName)}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Characters</h1>
        <div className="animate-pulse">Loading characters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Characters</h1>
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Characters</h1>
      <CharacterCardsGrid
        mods={mods}
        onSelect={handleCharacterSelect}
      />
    </div>
  );
};

export default CharactersPage;

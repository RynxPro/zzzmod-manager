import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CharacterCardsGrid from "../../components/CharacterCardsGrid";
import { ModItem } from "../../types/mods";

const CharactersPage: React.FC = () => {
  const [mods, setMods] = useState<ModItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMods() {
      try {
        const modsList = await window.electronAPI.mods.listLibrary();
        setMods(modsList);
      } catch (err) {
        console.error("Failed to fetch mods:", err);
      }
    }
    fetchMods();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Characters</h1>
      <CharacterCardsGrid
        mods={mods}
        onSelect={(charName) => navigate(`/characters/${charName}`)}
      />
    </div>
  );
};

export default CharactersPage;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModsPage from "./ModsPage";
import { ModItem } from "../../types/mods";

const CharacterModsPage: React.FC = () => {
  const { charName } = useParams<{ charName: string }>();
  const navigate = useNavigate();
  const [mods, setMods] = useState<ModItem[]>([]);

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

  const filteredMods = mods.filter((mod) => mod.character === charName);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/characters")}
        className="px-3 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 mb-4"
      >
        ← Back to Characters
      </button>
      <h2 className="text-2xl font-bold mb-4">{charName} Mods</h2>
      <ModsPage initialMods={filteredMods} />
    </div>
  );
};

export default CharacterModsPage;

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModsPage from "./ModsPage";
import { ModItem } from "../types/mods";

const CharacterModsPage: React.FC = () => {
  const { charName } = useParams<{ charName: string }>();
  const navigate = useNavigate();
  const [mods, setMods] = useState<ModItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchMods() {
      try {
        if (!charName) {
          throw new Error("Character name is required");
        }
        
        const modsList = await window.electronAPI.mods.listLibrary();
        if (isMounted) {
          setMods(modsList);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch mods:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load mods");
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
  }, [charName]);

  const filteredMods = useMemo(() => 
    charName ? mods.filter((mod) => mod.character === charName) : []
  , [mods, charName]);

  if (!charName) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/characters")}
          className="px-3 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 mb-4"
        >
          ← Back to Characters
        </button>
        <div className="text-red-500">Error: Character name is missing</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading character mods...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/characters")}
          className="px-3 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 mb-4"
        >
          ← Back to Characters
        </button>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

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

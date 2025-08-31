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
        const modsList = await window.electronAPI.mods.listModsByCharacter(
          charName
        );
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

  // Upload zip handler
  const handleUploadZip = async () => {
    if (!charName) return;
    const filePath = await window.electronAPI.mods.chooseZip();
    if (filePath) {
      // Explicitly pass charName as the second argument
      await window.electronAPI.mods.importZip(filePath, charName);
      setIsLoading(true);
      try {
        const modsList = await window.electronAPI.mods.listModsByCharacter(
          charName
        );
        setMods(modsList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reload mods");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Upload folder handler
  const handleUploadFolder = async () => {
    if (!charName) return;
    const folderPath = await window.electronAPI.mods.chooseFolder();
    if (folderPath) {
      // Explicitly pass charName as the second argument
      await window.electronAPI.mods.importFolder(folderPath, charName);
      setIsLoading(true);
      try {
        const modsList = await window.electronAPI.mods.listModsByCharacter(
          charName
        );
        setMods(modsList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reload mods");
      } finally {
        setIsLoading(false);
      }
    }
  };

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
        <button
          onClick={() => navigate("/characters")}
          className="px-3 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 mb-4"
        >
          ← Back to Characters
        </button>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span>Loading {charName}'s mods...</span>
        </div>
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
        className="px-3 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 mb-4 transition-all duration-200 hover:bg-opacity-80"
      >
        ← Back to Characters
      </button>
      <h2 className="text-2xl font-bold mb-4 text-gaming-accent-cyan">
        {charName}'s Mods
      </h2>
      <div className="flex flex-row gap-3 mb-4">
        <button
          onClick={handleUploadZip}
          className="px-3 py-2 rounded-xl bg-gaming-accent-cyan text-white hover:bg-opacity-80 transition-all duration-200"
        >
          Upload Zip
        </button>
        <button
          onClick={handleUploadFolder}
          className="px-3 py-2 rounded-xl bg-gaming-accent-pink text-white hover:bg-opacity-80 transition-all duration-200"
        >
          Upload Folder
        </button>
      </div>
      {mods.length > 0 ? (
        <ModsPage mods={mods} initialCharacter={charName} />
      ) : (
        <div className="text-gray-400 p-6 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700">
          <p>No mods found for {charName}.</p>
          <p className="text-sm mt-2 text-gray-500">
            Try importing mods for this character.
          </p>
        </div>
      )}
    </div>
  );
};

export default CharacterModsPage;

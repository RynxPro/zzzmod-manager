import React from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useLocation } from "react-router-dom";

const TopBar: React.FC = () => {
  const location = useLocation();

  const match = location.pathname.match(/^\/characters\/(.+)$/);
  const charName = match ? decodeURIComponent(match[1]) : null;

  const getTitle = () => {
    if (charName) return `${charName}'s Mods`;
    if (location.pathname.startsWith("/characters")) return "Characters";
    if (location.pathname.startsWith("/settings")) return "Settings";
    if (location.pathname.startsWith("/about")) return "About";
    if (location.pathname.startsWith("/mods")) return "All Mods";
    return "MoonLight Manager";
  };

  const handleUploadMod = async () => {
    if (!charName) return;
    const filePath = await window.electronAPI.mods.chooseZip();
    if (filePath) {
      await window.electronAPI.mods.importZip(filePath, charName);
    }
  };

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-16 bg-moon-surface/70 backdrop-blur-gaming border-b border-white/5 relative z-20"
    >
      <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Title */}
        <h1 className="text-lg md:text-xl font-semibold tracking-wide drop-shadow-sm">
          {getTitle()}
        </h1>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {charName && (
            <button
              onClick={handleUploadMod}
              className="gaming-button-primary flex items-center gap-2 px-4 py-2 rounded-lg"
              title="Upload Mod (.zip)"
            >
              <Upload size={16} />
              <span className="text-sm">Upload Mod</span>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;

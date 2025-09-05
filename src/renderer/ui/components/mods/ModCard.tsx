import React from "react";
import { motion } from "framer-motion";
import { FiPower, FiTrash2, FiFolder } from "react-icons/fi";
import { cn } from "../../../lib/utils";
import { ModItem } from "../../types/mods";

export interface CharacterInfo {
  id: string;
  name: string;
  imageUrl: string;
  attribute?: 'Auric Ink' | 'Electric' | 'Ether' | 'Fire' | 'Frost' | 'Ice' | 'Physical';
  specialty?: 'Attack' | 'Defense' | 'Support' | 'Anomaly' | 'Healing' | 'Stun' | 'Rupture';
  rank?: 'A' | 'S' | 'S-2';
}

interface ModCardProps {
  mod: ModItem;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  onDelete: (id: string) => void;
  onOpenFolder: (id: string) => void;
  onFavorite?: (id: string, favorite: boolean) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
  style?: React.CSSProperties;
  characterInfo?: CharacterInfo;
}

const ModCard: React.FC<ModCardProps> = ({
  mod,
  onToggle,
  onDelete,
  onOpenFolder,
  onFavorite,
  viewMode = 'grid',
  characterInfo,
  className,
  style,
}) => {
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onToggle(mod.id, !mod.enabled);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(mod.id);
  };

  const handleOpenFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenFolder(mod.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      className={cn(
        "group relative rounded-2xl border border-moon-surface/20 overflow-hidden transition-all duration-300",
        "bg-moon-surface/10 hover:bg-moon-surface/20 hover:border-moon-surface/30",
        "hover:shadow-lg hover:shadow-moon-glowViolet/5",
        "hover:-translate-y-1",
        className
      )}
      style={style}
    >
      {/* Status indicator */}
      <div
        className={cn(
          "absolute top-3 right-3 w-2.5 h-2.5 rounded-full transition-all duration-300",
          mod.enabled
            ? "bg-green-400 shadow-[0_0_8px] shadow-green-400/50"
            : "bg-moon-text/20"
        )}
      />

      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-moon-text/90 group-hover:text-moon-glowCyan transition-colors line-clamp-2">
              {mod.name}
            </h3>
            {characterInfo && (
              <div className="flex items-center gap-2 mt-1 text-xs text-moon-text/60">
                {characterInfo.attribute && (
                  <span className="flex items-center gap-1">
                    <img 
                      src={`/attribute/Icon_${characterInfo.attribute.replace(' ', '_')}.webp`} 
                      alt={characterInfo.attribute}
                      className="w-4 h-4"
                      aria-hidden="true"
                    />
                    {characterInfo.attribute}
                  </span>
                )}
                {characterInfo.rank && (
                  <span className="text-yellow-400">
                    {characterInfo.rank}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleToggle}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200 flex-shrink-0",
              "border hover:shadow-lg",
              mod.enabled
                ? "text-green-400 border-green-400/30 bg-green-400/10 hover:bg-green-400/20 hover:shadow-green-400/20"
                : "text-moon-text/40 border-moon-surface/30 bg-moon-surface/10 hover:bg-moon-surface/20"
            )}
            title={mod.enabled ? "Disable mod" : "Enable mod"}
          >
            <FiPower
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                mod.enabled && "fill-current"
              )}
            />
          </button>
        </div>

        <p className="text-sm text-moon-text/60 mb-5 line-clamp-2 h-10">
          {mod.description || "No description available"}
        </p>

        <div className="flex justify-between items-center pt-3 border-t border-moon-surface/20">
          <div
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-md transition-colors",
              mod.enabled
                ? "text-green-400 bg-green-400/10"
                : "text-moon-text/50 bg-moon-surface/20"
            )}
          >
            {mod.enabled ? "Active" : "Inactive"}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleOpenFolderClick}
              className="p-1.5 text-moon-text/50 hover:text-moon-glowCyan hover:bg-moon-surface/30 rounded-lg transition-all duration-200 group/button"
              title="Open mod folder"
            >
              <FiFolder className="w-4 h-4 group-hover/button:-translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-moon-text/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group/button"
              title="Delete mod"
            >
              <FiTrash2 className="w-4 h-4 group-hover/button:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-moon-glowViolet/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default ModCard;

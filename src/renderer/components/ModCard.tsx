import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { ModItem } from "../ui/types/mods";

interface ModCardProps {
  mod: ModItem;
  onEnableToggle: (modId: string, enabled: boolean) => void;
  onDelete: (modId: string) => void;
  isToggling?: boolean;
}

export function ModCard({
  mod,
  onEnableToggle,
  onDelete,
  isToggling,
}: ModCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      }}
      className="glass-panel rounded-2xl overflow-hidden border border-gaming-border/30 hover:border-gaming-border/70 transition-all duration-300"
    >
      {/* Thumbnail */}
      {mod.thumbnailPath ? (
        <img
          src={`file://${mod.thumbnailPath}`}
          alt={`${mod.name} thumbnail`}
          className="w-full h-32 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-32 flex items-center justify-center bg-gaming-bg-overlay/30 text-gaming-text-muted">
          No Thumbnail
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-gaming-text-primary font-medium text-sm truncate">
              {mod.name}
            </h3>
            <div className="flex gap-2 mt-1 flex-wrap">
              {mod.version && (
                <span className="bg-gray-700 text-white px-2 py-0.5 rounded text-xs">
                  v{mod.version}
                </span>
              )}
              {mod.author && (
                <span className="bg-gray-700 text-white px-2 py-0.5 rounded text-xs">
                  By {mod.author}
                </span>
              )}
              {typeof mod.sizeBytes === "number" && (
                <span className="bg-gray-700 text-white px-2 py-0.5 rounded text-xs">
                  {formatFileSize(mod.sizeBytes)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEnableToggle(mod.id, !mod.enabled)}
              className={`p-1.5 rounded-lg focus:outline-none relative ${
                mod.enabled
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              } transition-colors`}
              title={mod.enabled ? "On" : "Off"}
              aria-label={mod.enabled ? "On" : "Off"}
              aria-pressed={mod.enabled}
              disabled={isToggling}
            >
              {isToggling ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : mod.enabled ? (
                "On"
              ) : (
                "Off"
              )}
            </button>
            <button
              onClick={() => onDelete(mod.id)}
              className="p-1.5 rounded-lg focus:outline-none bg-gaming-bg-overlay/50 text-gaming-text-muted hover:bg-gaming-status-error/20 hover:text-gaming-status-error transition-colors"
              title="Delete mod"
              aria-label="Delete mod"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {mod.description && (
          <p className="text-xs text-gaming-text-secondary mb-3 hover:line-clamp-none line-clamp-2 transition-all">
            {mod.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(1)} ${units[i]}`;
}

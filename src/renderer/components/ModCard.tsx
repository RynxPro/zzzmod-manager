import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import ModItem from "../ui/pages/ModsPage";

interface ModCardProps {
  mod: ModItem;
  onEnableToggle: (modId: string, enabled: boolean) => void;
  onDelete: (modId: string) => void;
}

export function ModCard({ mod, onEnableToggle, onDelete }: ModCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-panel rounded-2xl overflow-hidden border border-gaming-border/30 hover:border-gaming-border/70 transition-all duration-300"
    >
      {/* Thumbnail */}
      {mod.thumbnailPath && (
        <img
          src={`file://${mod.thumbnailPath}`}
          alt={`${mod.name} thumbnail`}
          className="w-full h-32 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-gaming-text-primary font-medium text-sm truncate">
              {mod.name}
            </h3>
            {mod.version && (
              <span className="text-xs text-gaming-text-muted">
                v{mod.version}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEnableToggle(mod.id, !mod.enabled)}
              className={`p-1.5 rounded-lg focus:outline-none ${
                mod.enabled
                  ? "bg-gaming-status-success/20 text-gaming-status-success hover:bg-gaming-status-success/30"
                  : "bg-gaming-bg-overlay/50 text-gaming-text-muted hover:bg-gaming-bg-overlay/70"
              } transition-colors`}
              title={mod.enabled ? "Disable mod" : "Enable mod"}
              aria-label={mod.enabled ? "Disable mod" : "Enable mod"}
            >
              {mod.enabled ? <CheckCircle size={16} /> : <XCircle size={16} />}
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
          <p className="text-xs text-gaming-text-secondary line-clamp-2 mb-3">
            {mod.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gaming-text-muted">
          {mod.author && <span className="truncate">By {mod.author}</span>}
          {typeof mod.sizeBytes === "number" && (
            <span>{formatFileSize(mod.sizeBytes)}</span>
          )}
        </div>
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

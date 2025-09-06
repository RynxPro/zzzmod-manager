export interface ModItem {
  // Core properties
  id: string;
  name: string;
  enabled: boolean;
  dir: string;
  
  // Optional properties with default values
  updatedAt?: string;
  lastUpdated?: string;
  version?: string;
  author?: string;
  description?: string;
  activePath?: string | null;
  installPath?: string;
  character?: string;
  dateAdded?: number;
  sizeBytes?: number;
  appliedFiles?: string[];
  hasConflict?: boolean;
  
  // Thumbnail properties (support multiple sources)
  thumbnail?: string; // Primary thumbnail URL
  thumbnailUrl?: string; // Alias for thumbnail (legacy)
  thumbnailPath?: string | null; // Local file path (legacy)
  
  // Mod relationships
  tags?: string[];
  dependencies?: string[];
  conflicts?: string[];
  
  // UI state
  isFavorite?: boolean;
  isSelected?: boolean;
  
  // Callbacks
  onToggle?: (id: string, enabled: boolean) => Promise<void>;
  onDelete?: (id: string) => void;
  onFavorite?: (id: string, favorite: boolean) => void;
  
  // UI configuration
  viewMode?: "grid" | "list";
  className?: string;
}

export interface ModStats {
  total: number;
  enabled: number;
  disabled: number;
  favorites: number;
  byCharacter: Record<string, number>;
  lastUpdated: string;
}

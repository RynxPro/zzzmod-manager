export interface ModItem {
  id: string;
  name: string;
  author: string;
  version: string;
  description?: string;
  enabled: boolean;
  isFavorite: boolean;
  thumbnail?: string;
  character?: string;
  conflict?: boolean;
  lastUpdated?: string;
  fileSize?: string;
  tags?: string[];
  dependencies?: string[];
  conflicts?: string[];
  installPath?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional properties for the ModCard component
  isSelected?: boolean;
  onToggle?: (id: string, enabled: boolean) => Promise<void>;
  onDelete?: (id: string) => void;
  onFavorite?: (id: string, favorite: boolean) => void;
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

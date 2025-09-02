export interface Preset {
  id: string;
  name: string;
  description?: string;
  modCount: number;
  lastUsed: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  mods: string[]; // Array of mod IDs
}

export interface PresetStats {
  total: number;
  mostUsed: {
    name: string;
    count: number;
  };
  lastCreated: string;
}

export interface Character {
  id: string;
  name: string;
  element?: string;
  rarity?: number;
  avatar?: string;
  mods: {
    total: number;
    active: number;
  };
  lastUsed?: string;
  isFavorite?: boolean;
}

export interface CharacterStats {
  total: number;
  withMods: number;
  mostModded: {
    name: string;
    count: number;
  };
}

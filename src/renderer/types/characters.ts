export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  aliases?: string[];
  element?: string;
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

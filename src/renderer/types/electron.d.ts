export {}; // ensure this is a module

declare global {
  interface ModItem {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
    enabled: boolean;
    dir: string;
    dateAdded?: number;
    sizeBytes?: number;
    thumbnailPath?: string | null;
    appliedFiles?: string[];
    hasConflict?: boolean;
  }

  interface ModsAPI {
    list: () => Promise<ModItem[]>;
    enable: (id: string) => Promise<boolean>;
    disable: (id: string) => Promise<boolean>;
    remove: (id: string) => Promise<boolean>;
    importZip: (zipPath: string) => Promise<ModItem>;
    importFolder: (folderPath: string) => Promise<ModItem>;
    chooseZip: () => Promise<string | null>;
    chooseFolder: () => Promise<string | null>;
  }

  interface AppSettings {
    gameDir: string;
    modsDir: string;
  }
  interface SettingsAPI {
    get: () => Promise<AppSettings>;
    set: (partial: Partial<AppSettings>) => Promise<AppSettings>;
    chooseGameDir: () => Promise<string | null>;
    chooseModsDir: () => Promise<string | null>;
    clearBackups: () => Promise<boolean>;
  }

  interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
      selectModsFolder: () => Promise<string | null>;
      mods: ModsAPI;
      settings: SettingsAPI;
    };
  }
}

// Type definitions for Electron API exposed via contextBridge
declare interface Window {
  electronAPI: {
    getVersion: () => Promise<string>;
    mods: {
      listLibrary: () => Promise<ModItem[]>;
      listActive: () => Promise<ModItem[]>;
      toggleMod: (id: string, turnOn: boolean) => Promise<boolean>;
      remove: (id: string) => Promise<boolean>;
      importZip: (zipPath: string, character?: string | null) => Promise<ModItem>;
      importFolder: (folderPath: string, character?: string | null) => Promise<ModItem>;
      chooseZip: () => Promise<string | null>;
      chooseFolder: () => Promise<string | null>;
    };
    settings: {
      get: () => Promise<AppSettings>;
      set: (partial: Partial<AppSettings>) => Promise<AppSettings>;
      chooseModsDir: () => Promise<string | null>;
    };
    recentFolders: {
      get: () => Promise<string[]>;
      clear: () => Promise<void>;
    };
  };
}

interface AppSettings {
  modsDir: string;
  // Add other settings as needed
}

// Import the ModItem interface from your types
import { ModItem } from './ui/types/mods';

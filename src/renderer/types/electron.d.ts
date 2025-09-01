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

  interface ImportOptions {
    type: "zip" | "folder" | "file";
    path: string;
    character?: string | null;
  }

  interface ModsAPI {
    // List mods
    listLibrary: () => Promise<ModItem[]>;
    listActive: () => Promise<ModItem[]>;
    listModsByCharacter: (character: string) => Promise<ModItem[]>;

    // Mod management
    toggleMod: (id: string, turnOn: boolean) => Promise<boolean>;
    remove: (id: string) => Promise<boolean>;
    deleteMod: (id: string) => Promise<boolean>;

    // Import methods
    importMod: (options: ImportOptions) => Promise<ModItem>;
    openImportDialog: (
      type: "zip" | "folder" | "file"
    ) => Promise<{ canceled: boolean; filePaths: string[] }>;

    // Legacy import methods (kept for backward compatibility)
    importZip: (zipPath: string, character?: string | null) => Promise<ModItem>;
    importFolder: (
      folderPath: string,
      character?: string | null
    ) => Promise<ModItem>;
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
    chooseModsDir: () => Promise<string | null>;
    backup: () => Promise<{
      success: boolean;
      canceled?: boolean;
      path?: string;
      error?: string;
    }>;
    resetApp: () => Promise<{
      success: boolean;
      error?: string;
    }>;
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

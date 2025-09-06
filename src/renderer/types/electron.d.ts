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
    thumbnailUrl?: string; // Added for remote thumbnails
    appliedFiles?: string[];
    hasConflict?: boolean;
  }

  interface GetModResult {
    success: boolean;
    message?: string;
    mod?: ModItem;
  }

  interface UpdateThumbnailResult {
    success: boolean;
    message?: string;
    mod?: ModItem;
    thumbnailUrl?: string;
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

    // Mod thumbnail methods
    getMod: (id: string) => Promise<GetModResult>;
    updateModThumbnail: (id: string, thumbnailUrl: string) => Promise<UpdateThumbnailResult>;

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
    showItemInFolder: (
      path: string
    ) => Promise<{ success: boolean; error?: string }>;

    // Preset management
    listPresets: () => Promise<{ name: string; mods: string[] }[]>;
    savePreset: (name: string) => Promise<{ name: string; mods: string[] }>;
    applyPreset: (
      name: string
    ) => Promise<{ success: boolean; missingMods: string[] }>;
    deletePreset: (name: string) => Promise<{ success: boolean }>;
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

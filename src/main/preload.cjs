const { contextBridge, ipcRenderer, clipboard } = require("electron");

// Expose clipboard functionality with error handling
contextBridge.exposeInMainWorld('electronClipboard', {
  writeText: (text) => {
    try {
      clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      console.error('Failed to write to clipboard:', error);
      return { success: false, error: error.message };
    }
  },
  readText: () => {
    try {
      return { success: true, text: clipboard.readText() };
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      return { success: false, error: error.message };
    }
  },
  // Add cut/copy/paste commands
  cut: () => {
    document.execCommand('cut');
  },
  copy: () => {
    document.execCommand('copy');
  },
  paste: () => {
    document.execCommand('paste');
  }
});

// Expose other API functionality
contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
  mods: {
    listLibrary: () => ipcRenderer.invoke("mods:listLibrary"),
    listActive: () => ipcRenderer.invoke("mods:listActive"),
    listModsByCharacter: (character) =>
      ipcRenderer.invoke("mods:listModsByCharacter", character),
    getMod: (id) => ipcRenderer.invoke("mods:getMod", id),
    updateModThumbnail: (id, thumbnailUrl) => 
      ipcRenderer.invoke("mods:updateModThumbnail", { id, thumbnailUrl }),
    toggleMod: (id, turnOn) =>
      ipcRenderer.invoke(turnOn ? "mods:enable" : "mods:disable", id),
    deleteMod: (id) => ipcRenderer.invoke("mods:deleteMod", id),
    importZip: (zipPath, character = null) =>
      ipcRenderer.invoke("mods:importZip", zipPath, character),
    importFolder: (folderPath, character = null) =>
      ipcRenderer.invoke("mods:importFolder", folderPath, character),
    chooseZip: () => ipcRenderer.invoke("mods:chooseZip"),
    chooseFolder: () => ipcRenderer.invoke("mods:chooseFolder"),
    listPresets: () => ipcRenderer.invoke("mods:listPresets"),
    savePreset: (name) => ipcRenderer.invoke("mods:savePreset", name),
    applyPreset: (name) => ipcRenderer.invoke("mods:applyPreset", name),
    deletePreset: (name) => ipcRenderer.invoke("mods:deletePreset", name),
    showItemInFolder: (path) =>
      ipcRenderer.invoke("mods:showItemInFolder", path),
  },
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    set: (partial) => ipcRenderer.invoke("settings:set", partial),
    chooseModsDir: () => ipcRenderer.invoke("settings:chooseModsDir"),
    backup: () => ipcRenderer.invoke("settings:backup"),
    resetApp: () => ipcRenderer.invoke("settings:resetApp"),
  },
  recentFolders: {
    get: () => ipcRenderer.invoke("recentFolders:get"),
    clear: () => ipcRenderer.invoke("recentFolders:clear"),
  },
  sendDraggedFiles: (filePaths) => ipcRenderer.send("dragged-files", filePaths),
});

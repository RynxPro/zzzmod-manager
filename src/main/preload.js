const { ipcRenderer } = require("electron");

console.log("Preload script is executing");

// With nodeIntegration enabled, we can directly assign to window
window.electronAPI = {
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
  selectModsFolder: () => ipcRenderer.invoke("dialog:selectModsFolder"),
  mods: {
    list: () => ipcRenderer.invoke("mods:list"),
    enable: (id) => ipcRenderer.invoke("mods:enable", id),
    disable: (id) => ipcRenderer.invoke("mods:disable", id),
    remove: (id) => ipcRenderer.invoke("mods:delete", id),
    importZip: (zipPath) => ipcRenderer.invoke("mods:importZip", zipPath),
    importFolder: (folderPath) =>
      ipcRenderer.invoke("mods:importFolder", folderPath),
    chooseZip: () => ipcRenderer.invoke("mods:chooseZip"),
    chooseFolder: () => ipcRenderer.invoke("mods:chooseFolder"),
  },
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    set: (partial) => ipcRenderer.invoke("settings:set", partial),
    chooseGameDir: () => ipcRenderer.invoke("settings:chooseGameDir"),
    chooseModsDir: () => ipcRenderer.invoke("settings:chooseModsDir"),
    clearBackups: () => ipcRenderer.invoke("settings:clearBackups"),
  },
  recentFolders: {
    get: () => ipcRenderer.invoke("recentFolders:get"),
    clear: () => ipcRenderer.invoke("recentFolders:clear"),
  },
  // Drag-and-drop support: send dragged files to main process
  sendDraggedFiles: (filePaths) => ipcRenderer.send("dragged-files", filePaths),
};

console.log("electronAPI assigned to window");

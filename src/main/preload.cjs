const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
  mods: {
    listLibrary: () => ipcRenderer.invoke("mods:listLibrary"),
    listActive: () => ipcRenderer.invoke("mods:listActive"),
    toggleMod: (id, turnOn) => ipcRenderer.invoke("mods:toggleMod", id, turnOn),
    remove: (id) => ipcRenderer.invoke("mods:remove", id),
    importZip: (zipPath, character = null) => ipcRenderer.invoke("mods:importZip", zipPath, character),
    importFolder: (folderPath, character = null) =>
      ipcRenderer.invoke("mods:importFolder", folderPath, character),
    chooseZip: () => ipcRenderer.invoke("mods:chooseZip"),
    chooseFolder: () => ipcRenderer.invoke("mods:chooseFolder"),
  },
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    set: (partial) => ipcRenderer.invoke("settings:set", partial),
    chooseModsDir: () => ipcRenderer.invoke("settings:chooseModsDir"),
  },
  recentFolders: {
    get: () => ipcRenderer.invoke("recentFolders:get"),
    clear: () => ipcRenderer.invoke("recentFolders:clear"),
  },
  sendDraggedFiles: (filePaths) => ipcRenderer.send("dragged-files", filePaths),
});

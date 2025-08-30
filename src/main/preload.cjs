const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
  selectModsFolder: () => ipcRenderer.invoke("dialog:selectModsFolder"),
  mods: {
    listLibrary: () => ipcRenderer.invoke("mods:listLibrary"),
    listActive: () => ipcRenderer.invoke("mods:listActive"),
    enable: (id) => ipcRenderer.invoke("mods:enable", id),
    disable: (id) => ipcRenderer.invoke("mods:disable", id),
    remove: (id) => ipcRenderer.invoke("mods:remove", id),
    importZip: (zipPath) => ipcRenderer.invoke("mods:importZip", zipPath),
    importFolder: (folderPath) =>
      ipcRenderer.invoke("mods:importFolder", folderPath),
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

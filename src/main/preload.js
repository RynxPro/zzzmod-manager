import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("app:getVersion"),
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
});

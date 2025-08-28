import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  api as modsApi,
  paths as modPaths,
  getSettings,
  setSettings,
  clearBackups,
} from "./mods.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

/**
 * Creates the main application window.
 */
function createMainWindow() {
  const preloadPath = path.resolve(__dirname, "preload.js");
  console.log("Preload path:", preloadPath);
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "ZZZ Mod Manager",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: false,
      nodeIntegration: true,
      sandbox: false,
      webSecurity: false,
    },
  });

  mainWindow.webContents.once('did-finish-load', () => {
    console.log("Page loaded, manually injecting electronAPI");
    mainWindow.webContents.executeJavaScript(`
      const { ipcRenderer } = require("electron");
      
      window.electronAPI = {
        getVersion: () => ipcRenderer.invoke("app:getVersion"),
        selectModsFolder: () => ipcRenderer.invoke("dialog:selectModsFolder"),
        mods: {
          list: () => ipcRenderer.invoke("mods:list"),
          enable: (id) => ipcRenderer.invoke("mods:enable", id),
          disable: (id) => ipcRenderer.invoke("mods:disable", id),
          remove: (id) => ipcRenderer.invoke("mods:delete", id),
          importZip: (zipPath) => ipcRenderer.invoke("mods:importZip", zipPath),
          importFolder: (folderPath) => ipcRenderer.invoke("mods:importFolder", folderPath),
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
      };
      
      console.log("electronAPI manually injected:", window.electronAPI);
    `);
  });

  if (isDev) {
    const devServerUrl = "http://localhost:5173/";
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexHtml = path.join(__dirname, "../../dist/index.html");
    mainWindow.loadFile(indexHtml);
  }

  // Open links with target="_blank" externally
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return mainWindow;
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.whenReady().then(() => {
  createMainWindow();

  // Example IPC handler reserved for future use
  ipcMain.handle("app:getVersion", () => app.getVersion());

  // Mods IPC
  ipcMain.handle("mods:list", async () => modsApi.listMods());
  ipcMain.handle("mods:enable", async (_e, id) => modsApi.setEnabled(id, true));
  ipcMain.handle("mods:disable", async (_e, id) =>
    modsApi.setEnabled(id, false)
  );
  ipcMain.handle("mods:delete", async (_e, id) => modsApi.deleteMod(id));
  ipcMain.handle("mods:importZip", async (_e, zipPath) =>
    modsApi.importFromZip(zipPath)
  );
  ipcMain.handle("mods:importFolder", async (_e, folderPath) =>
    modsApi.importFromFolder(folderPath)
  );
  ipcMain.handle("mods:chooseZip", async () => {
    const res = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Zip", extensions: ["zip"] }],
    });
    if (res.canceled || res.filePaths.length === 0) return null;
    return res.filePaths[0];
  });
  ipcMain.handle("mods:chooseFolder", async () => {
    const res = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (res.canceled || res.filePaths.length === 0) return null;
    return res.filePaths[0];
  });

  // Settings IPC
  ipcMain.handle("settings:get", async () => getSettings());
  ipcMain.handle("settings:set", async (_e, partial) => setSettings(partial));
  ipcMain.handle("settings:chooseGameDir", async () => {
    const res = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (res.canceled || res.filePaths.length === 0) return null;
    const dir = res.filePaths[0];
    await setSettings({ gameDir: dir });
    return dir;
  });
  ipcMain.handle("settings:chooseModsDir", async () => {
    const res = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (res.canceled || res.filePaths.length === 0) return null;
    const dir = res.filePaths[0];
    await setSettings({ modsDir: dir });
    return dir;
  });
  ipcMain.handle("settings:clearBackups", async () => clearBackups());

  // Dialog IPC
  ipcMain.handle("dialog:selectModsFolder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Select Mods Folder",
      buttonLabel: "Select Folder",
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    
    return result.filePaths[0];
  });
});

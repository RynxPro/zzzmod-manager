import { app, BrowserWindow, shell, ipcMain, dialog, Menu } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import Store from "electron-store";
import {
  api as modsApi,
  paths as modPaths,
  getSettings,
  setSettings,
  clearBackups,
} from "./mods.js";

const store = new Store();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

// --- Single Instance Lock ---
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

// --- Window State Persistence ---
function getWindowState() {
  return store.get("windowState", {
    width: 1200,
    height: 800,
    x: undefined,
    y: undefined,
  });
}

function saveWindowState(win) {
  if (!win) return;
  const bounds = win.getBounds();
  store.set("windowState", bounds);
}

/**
 * Creates the main application window.
 */
function createMainWindow() {
  const preloadPath = path.resolve(__dirname, "preload.js");
  console.log("Preload path:", preloadPath);

  const winState = getWindowState();

  const mainWindow = new BrowserWindow({
    width: winState.width,
    height: winState.height,
    x: winState.x,
    y: winState.y,
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

  mainWindow.on("resize", () => saveWindowState(mainWindow));
  mainWindow.on("move", () => saveWindowState(mainWindow));

  mainWindow.webContents.once("did-finish-load", () => {
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
        recentFolders: {
          get: () => ipcRenderer.invoke("recentFolders:get"),
          clear: () => ipcRenderer.invoke("recentFolders:clear"),
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

  // --- Drag-and-Drop Support ---
  mainWindow.webContents.on("will-navigate", (event, url) => {
    event.preventDefault();
  });

  mainWindow.webContents.on("ipc-message", (event, channel, args) => {
    if (channel === "dragged-files") {
      console.log("Dragged files:", args[0]);
      // You can add logic to import mods here
    }
  });

  return mainWindow;
}

// --- App Menu ---
function setupAppMenu(mainWindow) {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open Mods Folder...",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const res = await dialog.showOpenDialog({
              properties: ["openDirectory"],
            });
            if (!res.canceled && res.filePaths.length > 0) {
              mainWindow.webContents.send(
                "mods-folder-selected",
                res.filePaths[0]
              );
              addRecentFolder(res.filePaths[0]);
            }
          },
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggledevtools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            await shell.openExternal(
              "https://github.com/wassimdev/zzzmod-manager"
            );
          },
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// --- Recent Folders ---
function addRecentFolder(folderPath) {
  let recent = store.get("recentFolders", []);
  recent = recent.filter((f) => f !== folderPath);
  recent.unshift(folderPath);
  if (recent.length > 10) recent = recent.slice(0, 10);
  store.set("recentFolders", recent);
}

ipcMain.handle("recentFolders:get", () => store.get("recentFolders", []));
ipcMain.handle("recentFolders:clear", () => store.set("recentFolders", []));

// --- Error Handling for IPC ---
function safeIpcHandle(channel, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (err) {
      console.error(`IPC error in ${channel}:`, err);
      return { error: err.message || "Unknown error" };
    }
  });
}

// Replace all ipcMain.handle with safeIpcHandle for robustness
safeIpcHandle("app:getVersion", () => app.getVersion());
safeIpcHandle("mods:list", async () => modsApi.listMods());
safeIpcHandle("mods:enable", async (_e, id) => modsApi.setEnabled(id, true));
safeIpcHandle("mods:disable", async (_e, id) => modsApi.setEnabled(id, false));
safeIpcHandle("mods:delete", async (_e, id) => modsApi.deleteMod(id));
safeIpcHandle("mods:importZip", async (_e, zipPath) =>
  modsApi.importFromZip(zipPath)
);
safeIpcHandle("mods:importFolder", async (_e, folderPath) =>
  modsApi.importFromFolder(folderPath)
);
safeIpcHandle("mods:chooseZip", async () => {
  const res = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Zip", extensions: ["zip"] }],
  });
  if (res.canceled || res.filePaths.length === 0) return null;
  return res.filePaths[0];
});
safeIpcHandle("mods:chooseFolder", async () => {
  const res = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (res.canceled || res.filePaths.length === 0) return null;
  return res.filePaths[0];
});
safeIpcHandle("settings:get", async () => getSettings());
safeIpcHandle("settings:set", async (_e, partial) => setSettings(partial));
safeIpcHandle("settings:chooseGameDir", async () => {
  const res = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (res.canceled || res.filePaths.length === 0) return null;
  const dir = res.filePaths[0];
  await setSettings({ gameDir: dir });
  return dir;
});
safeIpcHandle("settings:chooseModsDir", async () => {
  const res = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (res.canceled || res.filePaths.length === 0) return null;
  const dir = res.filePaths[0];
  await setSettings({ modsDir: dir });
  return dir;
});
safeIpcHandle("settings:clearBackups", async () => clearBackups());
safeIpcHandle("dialog:selectModsFolder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "Select Mods Folder",
    buttonLabel: "Select Folder",
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  addRecentFolder(result.filePaths[0]);
  return result.filePaths[0];
});

// --- Graceful App Quit ---
app.on("before-quit", (event) => {
  // You can check for unsaved changes here and prompt the user if needed
  // event.preventDefault(); // If you want to block quit
});

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
  const mainWindow = createMainWindow();
  setupAppMenu(mainWindow);
});

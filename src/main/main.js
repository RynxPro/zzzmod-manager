import { app, BrowserWindow, shell, ipcMain, dialog, Menu, MenuItem } from "electron";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Store from "electron-store";
import { api as modsApi, getManagerModsDir, paths } from "./mods.js";

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
  const preloadPath = path.resolve(__dirname, "preload.cjs");

  const winState = getWindowState();

  const mainWindow = new BrowserWindow({
    width: winState.width,
    height: winState.height,
    x: winState.x,
    y: winState.y,
    minWidth: 900,
    minHeight: 600,
    title: "MoonLight Manager",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      // Enable clipboard access
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      // Enable clipboard features
      webviewTag: false,
      // Enable clipboard access in the renderer process
      // This is required for the clipboard API to work
      // in the renderer process
      // Also enable spellcheck
      spellcheck: true,
    },
  });

  mainWindow.on("resize", () => saveWindowState(mainWindow));
  mainWindow.on("move", () => saveWindowState(mainWindow));

  if (isDev) {
    const devServerUrl = "http://localhost:5173/";
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexHtml = path.join(process.cwd(), "dist", "index.html");
    mainWindow.loadFile(indexHtml);
  }

  // Open links with target="_blank" externally
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // --- Drag-and-Drop Support ---
  // Set up context menu
  const contextMenu = new Menu();
  contextMenu.append(new MenuItem({
    label: 'Copy',
    role: 'copy',
    accelerator: 'CommandOrControl+C'
  }));
  contextMenu.append(new MenuItem({
    label: 'Paste',
    role: 'paste',
    accelerator: 'CommandOrControl+V'
  }));
  contextMenu.append(new MenuItem({
    label: 'Cut',
    role: 'cut',
    accelerator: 'CommandOrControl+X'
  }));
  contextMenu.append(new MenuItem({
    label: 'Select All',
    role: 'selectAll',
    accelerator: 'CommandOrControl+A'
  }));

  // Apply context menu to all windows
  mainWindow.webContents.on('context-menu', (e, params) => {
    contextMenu.popup();
  });

  mainWindow.webContents.on("will-navigate", (event) => {
    event.preventDefault();
  });

  mainWindow.webContents.on("ipc-message", (event, channel, args) => {
    if (channel === "dragged-files") {
      // Prevent default drag-drop behavior; logic can be added here if needed
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
              "https://github.com/RynxPro/zzzmod-manager"
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

// Mods API handlers
safeIpcHandle("mods:listLibrary", async () => modsApi.listLibrary());
safeIpcHandle("mods:listModsByCharacter", async (_e, character) => {
  return modsApi.listModsByCharacter(character);
});
safeIpcHandle("mods:listActive", async () => modsApi.listActive());
safeIpcHandle("mods:getMod", async (_e, id) => modsApi.getMod(id));
safeIpcHandle("mods:updateModThumbnail", async (_e, { id, thumbnailUrl }) => {
  return modsApi.updateModThumbnail(id, thumbnailUrl);
});
safeIpcHandle("mods:enable", async (_e, id) => modsApi.toggleMod(id, true));
safeIpcHandle("mods:disable", async (_e, id) => modsApi.toggleMod(id, false));
safeIpcHandle("mods:deleteMod", async (_e, id) => modsApi.deleteMod(id));

// Preset handlers
safeIpcHandle("mods:listPresets", async () => modsApi.listPresets());
safeIpcHandle("mods:savePreset", async (_e, name) => modsApi.savePreset(name));
safeIpcHandle("mods:applyPreset", async (_e, name) =>
  modsApi.applyPreset(name)
);
safeIpcHandle("mods:deletePreset", async (_e, name) =>
  modsApi.deletePreset(name)
);

// Import handlers with character support
safeIpcHandle("mods:importZip", async (_e, filePath, character = null) => {
  return modsApi.importFromZip(filePath, character);
});

safeIpcHandle("mods:importFolder", async (_e, folderPath, character = null) => {
  return modsApi.importFromFolder(folderPath, character);
});
safeIpcHandle("mods:chooseZip", async () => {
  const res = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Zip", extensions: ["zip"] }],
  });
  if (res.canceled || res.filePaths.length === 0) return null;
  return res.filePaths[0];
});
safeIpcHandle("mods:showItemInFolder", async (_e, filePath) => {
  return modsApi.showItemInFolder(filePath);
});

safeIpcHandle("mods:chooseFolder", async () => {
  const res = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (res.canceled || res.filePaths.length === 0) return null;
  return res.filePaths[0];
});
safeIpcHandle("mods:toggleMod", async (_e, id, turnOn) => {
  return modsApi.toggleMod(id, turnOn);
});

// Settings API handlers
safeIpcHandle("settings:get", async () => modsApi.getSettings());
safeIpcHandle("settings:set", async (_e, partial) =>
  modsApi.setSettings(partial)
);
safeIpcHandle("settings:chooseModsDir", async () => {
  const res = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  if (res.canceled || res.filePaths.length === 0) return null;
  const dir = res.filePaths[0];
  await modsApi.setSettings({ modsDir: dir });
  return dir;
});

// Backup app data directory into a timestamped folder in a user-selected destination
safeIpcHandle("settings:backup", async () => {
  const res = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });
  if (res.canceled || res.filePaths.length === 0)
    return { success: false, canceled: true };
  const destRoot = res.filePaths[0];
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  const backupDir = path.join(destRoot, `MoonLightManager_Backup_${stamp}`);

  const srcDir = paths.DATA_DIR;

  async function copyDir(src, dest) {
    const stat = await fsp.stat(src);
    if (stat.isDirectory()) {
      await fsp.mkdir(dest, { recursive: true });
      const entries = await fsp.readdir(src, { withFileTypes: true });
      for (const entry of entries) {
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          await copyDir(s, d);
        } else if (entry.isSymbolicLink()) {
          const link = await fsp.readlink(s);
          await fsp.symlink(link, d);
        } else if (entry.isFile()) {
          await fsp.copyFile(s, d);
        }
      }
    } else {
      await fsp.copyFile(src, dest);
    }
  }

  try {
    await copyDir(srcDir, backupDir);
    return { success: true, path: backupDir };
  } catch (err) {
    console.error("Backup failed:", err);
    return { success: false, error: err?.message || "Backup failed" };
  }
});

// Reset app data: remove data directory and re-create minimal structure
safeIpcHandle("settings:resetApp", async () => {
  try {
    const dataDir = paths.DATA_DIR;
    if (fs.existsSync(dataDir)) {
      await fsp.rm(dataDir, { recursive: true, force: true });
    }
    // Recreate by triggering mods API to ensure dirs
    getManagerModsDir();
    // Also clear recent folders
    store.set("recentFolders", []);
    return { success: true };
  } catch (err) {
    console.error("Reset failed:", err);
    return { success: false, error: err?.message || "Reset failed" };
  }
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
  getManagerModsDir(); // Ensure manager mods folder exists at startup
  const mainWindow = createMainWindow();
  setupAppMenu(mainWindow);
});

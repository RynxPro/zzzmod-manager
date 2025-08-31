// Returns the currently active mods
async function listActive() {
  const config = await readConfig();
  const activeModsDir = getActiveModsDir(config.settings);
  if (!fs.existsSync(activeModsDir)) return [];

  const dirEntries = await fsp.readdir(activeModsDir, { withFileTypes: true });
  const activeNames = dirEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const activeMods = (config.mods || []).filter((mod) =>
    activeNames.includes(path.basename(mod.dir))
  );

  return activeMods;
}
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { app } from "electron";
import crypto from "node:crypto";
import AdmZip from "adm-zip";

const APP_DIR = app.getPath("userData");
const DATA_DIR = path.join(APP_DIR, "data");
const MANAGER_MODS_DIR = path.join(DATA_DIR, "mods");
const ACTIVE_MODS_DIR = path.join(DATA_DIR, "zzmi", "mods");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(MANAGER_MODS_DIR))
    fs.mkdirSync(MANAGER_MODS_DIR, { recursive: true });
  if (!fs.existsSync(ACTIVE_MODS_DIR))
    fs.mkdirSync(ACTIVE_MODS_DIR, { recursive: true });
  return MANAGER_MODS_DIR; // return the path for convenience
}

async function readConfig() {
  ensureDirs();
  try {
    const raw = await fsp.readFile(CONFIG_PATH, "utf-8");
    const json = JSON.parse(raw);
    return json;
  } catch (err) {
    if (err?.code === "ENOENT") {
      const initial = {
        mods: [],
        settings: { modsDir: ACTIVE_MODS_DIR },
      };
      await fsp.writeFile(
        CONFIG_PATH,
        JSON.stringify(initial, null, 2),
        "utf-8"
      );
      return initial;
    }
    throw err;
  }
}

async function writeConfig(config) {
  ensureDirs();
  await fsp.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

function makeId(input) {
  return crypto.createHash("sha1").update(input).digest("hex").slice(0, 12);
}

async function listMods() {
  const config = await readConfig();
  return config.mods;
}

async function listModsByCharacter(character) {
  const characterDir = path.join(MANAGER_MODS_DIR, character);
  if (!fs.existsSync(characterDir)) {
    return [];
  }

  const entries = await fsp.readdir(characterDir, { withFileTypes: true });
  const mods = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const modDir = path.join(characterDir, entry.name);
      try {
        const manifest = await readManifest(modDir);
        const modObj = await buildModObject(modDir, manifest);
        modObj.character = character;
        mods.push(modObj);
      } catch (err) {
        console.error(`Failed to build mod object for ${modDir}:`, err);
      }
    }
  }

  return mods;
}

export function getManagerModsDir() {
  const dir = MANAGER_MODS_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  console.log("Manager mods folder:", dir); // debug log for folder location
  return dir;
}

function getActiveModsDir(settings) {
  return settings?.modsDir && settings.modsDir.trim().length > 0
    ? settings.modsDir
    : ACTIVE_MODS_DIR;
}

async function importFromZip(zipPath, character = null) {
  ensureDirs();
  const cfg = await readConfig();
  const modsDir = getManagerModsDir();
  const baseName = path.basename(zipPath, path.extname(zipPath));
  const characterDir = character ? path.join(modsDir, character) : modsDir;
  if (character && !fs.existsSync(characterDir))
    fs.mkdirSync(characterDir, { recursive: true });
  const targetDir = path.join(characterDir, baseName);
  const uniqueDir = await uniqueDirectory(targetDir);
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(uniqueDir, true);
  return await registerMod(uniqueDir, character);
}

async function importFromFolder(folderPath, character = null) {
  ensureDirs();
  const cfg = await readConfig();
  const modsDir = getManagerModsDir();
  const baseName = path.basename(folderPath);
  const characterDir = character ? path.join(modsDir, character) : modsDir;
  
  // Check if the source folder exists
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Source folder does not exist: ${folderPath}`);
  }
  
  // Check for manifest.json in the source folder (optional)
  const sourceManifestPath = path.join(folderPath, 'manifest.json');
  if (!fs.existsSync(sourceManifestPath)) {
    console.warn(`No manifest.json found in source folder: ${folderPath}. Using default values.`);
  }
  
  if (character && !fs.existsSync(characterDir)) {
    fs.mkdirSync(characterDir, { recursive: true });
  }
  
  const targetDir = path.join(characterDir, baseName);
  const uniqueDir = await uniqueDirectory(targetDir);
  
  try {
    await copyDirectory(folderPath, uniqueDir);
    return await registerMod(uniqueDir, character);
  } catch (error) {
    // Clean up the directory if registration fails
    if (fs.existsSync(uniqueDir)) {
      await fsp.rm(uniqueDir, { recursive: true, force: true });
    }
    throw error; // Re-throw the error after cleanup
  }
}

async function uniqueDirectory(targetDir) {
  let dir = targetDir;
  let counter = 1;
  while (fs.existsSync(dir)) {
    dir = `${targetDir}-${counter++}`;
  }
  await fsp.mkdir(dir, { recursive: true });
  return dir;
}

async function copyDirectory(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  const entries = await fsp.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const link = await fsp.readlink(srcPath);
      await fsp.symlink(link, destPath);
    } else {
      await fsp.copyFile(srcPath, destPath);
    }
  }
}

async function readManifest(modDir) {
  const preferred = path.join(modDir, "modinfo.json");
  const legacy = path.join(modDir, "mod.json");
  const manifestPath = fs.existsSync(preferred) ? preferred : legacy;
  try {
    const raw = await fsp.readFile(manifestPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function findThumbnailPath(modDir, manifest) {
  if (manifest?.thumbnail) {
    const explicit = path.join(modDir, manifest.thumbnail);
    if (fs.existsSync(explicit)) return explicit;
  }
  if (manifest?.image) {
    const explicit = path.join(modDir, manifest.image);
    if (fs.existsSync(explicit)) return explicit;
  }
  const candidates = [
    "thumbnail.png",
    "thumbnail.jpg",
    "thumbnail.jpeg",
    "thumb.png",
    "thumb.jpg",
    "thumb.jpeg",
    "preview.png",
    "preview.jpg",
    "preview.jpeg",
    "cover.png",
    "cover.jpg",
    "cover.jpeg",
  ];
  for (const name of candidates) {
    const p = path.join(modDir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function computeDirectorySizeBytes(dir) {
  let total = 0;
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += await computeDirectorySizeBytes(p);
    } else if (entry.isFile()) {
      const stat = await fsp.stat(p);
      total += stat.size;
    }
  }
  return total;
}

async function buildModObject(modDir, manifest) {
  const modName = path.basename(modDir);
  return {
    id: makeId(manifest?.name || modName),
    name: manifest?.name || modName,
    description: manifest?.description || `Mod: ${modName}`,
    author: manifest?.author || 'Unknown',
    version: manifest?.version || '1.0.0',
    character: manifest?.character || null,
    dir: modDir,
    dateAdded: Date.now(),
    sizeBytes: await computeDirectorySizeBytes(modDir),
    thumbnailPath: await findThumbnailPath(modDir, manifest || {}),
  };
}

async function registerMod(modDir, character = null) {
  const manifest = await readManifest(modDir);
  
  // If no manifest, create a default one using folder name
  const defaultManifest = {
    name: path.basename(modDir),
    description: 'No manifest found',
    author: 'Unknown',
    version: '1.0.0'
  };
  
  const mod = await buildModObject(modDir, manifest || defaultManifest);
  mod.enabled = false;
  mod.activePath = null;

  // Set character if provided
  if (character) {
    mod.character = character;
  }

  const config = await readConfig();
  const existingIndex = config.mods.findIndex((m) => m.id === mod.id);

  if (existingIndex >= 0) {
    // Update existing mod
    config.mods[existingIndex] = {
      ...config.mods[existingIndex],
      ...mod,
      // Preserve enabled state, activePath, and character if not being updated
      enabled: config.mods[existingIndex].enabled,
      activePath: config.mods[existingIndex].activePath,
      character:
        character !== null
          ? character
          : config.mods[existingIndex].character || null,
    };
    mod.enabled = config.mods[existingIndex].enabled;
    mod.activePath = config.mods[existingIndex].activePath;
    mod.character = config.mods[existingIndex].character;
  } else {
    // Add new mod
    config.mods.push(mod);
  }

  await writeConfig(config);
  return mod;
}

async function toggleMod(modId, turnOn) {
  try {
    const config = await readConfig();
    const idx = config.mods.findIndex((m) => m.id === modId);
    if (idx === -1) return { success: false, message: "Mod not found" };
    const mod = config.mods[idx];

    const activeModsDir = getActiveModsDir(config.settings);
    if (!fs.existsSync(activeModsDir))
      await fsp.mkdir(activeModsDir, { recursive: true });

    const destDir = path.join(activeModsDir, path.basename(mod.dir));

    if (turnOn) {
      // Enable: copy folder to zzmi/mods if not already present
      if (!fs.existsSync(destDir)) await copyDirectory(mod.dir, destDir);
      mod.activePath = destDir;
      mod.enabled = true;
    } else {
      // Disable: remove from zzmi/mods using activePath or fallback to computed path
      const pathToRemove = mod.activePath || destDir;
      if (fs.existsSync(pathToRemove))
        await fsp.rm(pathToRemove, { recursive: true, force: true });
      mod.activePath = null;
      mod.enabled = false;
    }

    config.mods[idx] = mod;
    await writeConfig(config);

    return { success: true, mod };
  } catch (err) {
    console.error("Failed to toggle mod:", err);
    return { success: false, message: err?.message || "Unknown error" };
  }
}

async function deleteMod(modId) {
  const config = await readConfig();
  const idx = config.mods.findIndex((m) => m.id === modId);
  if (idx === -1) return false;
  const mod = config.mods[idx];
  // Remove from manager mods folder
  if (fs.existsSync(mod.dir)) {
    await fsp.rm(mod.dir, { recursive: true, force: true });
  }
  // Remove from active mods folder if present
  const activeModsDir = getActiveModsDir(config.settings);
  const activeModDir = path.join(activeModsDir, path.basename(mod.dir));
  if (fs.existsSync(activeModDir)) {
    await fsp.rm(activeModDir, { recursive: true, force: true });
  }
  config.mods.splice(idx, 1);
  await writeConfig(config);
  return true;
}

export const paths = {
  APP_DIR,
  DATA_DIR,
  MODS_DIR: MANAGER_MODS_DIR,
  CONFIG_PATH,
};

async function listModsEnriched() {
  const cfg = await readConfig();
  const modsDir = getManagerModsDir();

  if (!fs.existsSync(modsDir)) return [];

  const items = await syncModsFromDirectory(modsDir, cfg);
  return Array.isArray(items) ? items : [];
}

async function syncModsFromDirectory(modsDir, config) {
  if (!fs.existsSync(modsDir)) return [];

  const existingMods = Array.isArray(config.mods) ? config.mods : [];
  const dirEntries = await fsp.readdir(modsDir, { withFileTypes: true });
  const modDirs = dirEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(modsDir, entry.name));

  const validMods = existingMods.filter((mod) => fs.existsSync(mod.dir));

  const newMods = [];
  for (const modDir of modDirs) {
    const existingMod = validMods.find((mod) => mod.dir === modDir);
    if (!existingMod) {
      try {
        const newMod = await createModFromDirectory(modDir);
        newMods.push(newMod);
      } catch (error) {
        console.error(`Failed to register mod from ${modDir}:`, error);
      }
    }
  }

  const merged = [...validMods, ...newMods];
  config.mods = merged;
  await writeConfig(config);
  return merged;
}

async function createModFromDirectory(modDir) {
  const manifest = await readManifest(modDir);
  return await buildModObject(modDir, manifest);
}

// Settings handling
async function getSettings() {
  const config = await readConfig();
  return config.settings || {};
}

async function setSettings(newSettings) {
  const config = await readConfig();
  config.settings = { ...(config.settings || {}), ...newSettings };
  await writeConfig(config);
  return config.settings;
}

async function listLibrary() {
  return listModsEnriched();
}

export const api = {
  listMods: listModsEnriched,
  listLibrary,
  listActive, // added
  listModsByCharacter,
  importFromZip,
  importFromFolder,
  toggleMod,
  deleteMod,
  getSettings,
  setSettings,
};

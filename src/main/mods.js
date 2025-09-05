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
import { app, shell } from "electron";
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
  // Normalize character name to lowercase for consistency
  const normalizedCharacter = character ? character.toLowerCase() : null;
  if (!normalizedCharacter) return [];

  const characterDir = path.join(MANAGER_MODS_DIR, normalizedCharacter);
  if (!fs.existsSync(characterDir)) {
    return [];
  }

  const mods = [];
  const entries = await fsp.readdir(characterDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const modDir = path.join(characterDir, entry.name);
      try {
        const manifest = await readManifest(modDir);
        const modObj = await buildModObject(modDir, manifest);
        // Use the normalized character name
        modObj.character = normalizedCharacter;
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
  const extractDir = await extractZip(zipPath, { dir: app.getPath("temp") });
  const modsDir = getManagerModsDir();
  await ensureDirs();

  // Normalize character name to lowercase for consistency
  const normalizedCharacter = character ? character.toLowerCase() : null;

  // If character is specified, create a subdirectory for them
  const targetDir = normalizedCharacter
    ? path.join(modsDir, normalizedCharacter)
    : modsDir;

  if (!fs.existsSync(targetDir)) {
    await fsp.mkdir(targetDir, { recursive: true });
  }

  // Copy the extracted files to the target directory
  const modDir = await uniqueDirectory(targetDir);
  await copyDirectory(extractDir, modDir);

  // Clean up the extracted files
  await fsp.rm(extractDir, { recursive: true, force: true });

  // Register the mod with the normalized character name
  const mod = await registerMod(modDir, normalizedCharacter);
  return mod;
}

async function importFromFolder(folderPath, character = null) {
  let modDir;
  try {
    await ensureDirs();
    const modsDir = getManagerModsDir();

    // Check if source folder exists
    if (!fs.existsSync(folderPath)) {
      throw new Error(`Source folder does not exist: ${folderPath}`);
    }

    // Check for manifest.json in the source folder (optional)
    const sourceManifestPath = path.join(folderPath, "manifest.json");
    if (!fs.existsSync(sourceManifestPath)) {
      console.warn(
        `No manifest.json found in source folder: ${folderPath}. Using default values.`
      );
    }

    // Normalize character name to lowercase for consistency
    const normalizedCharacter = character ? character.toLowerCase() : null;

    // If character is specified, create a subdirectory for them
    const targetDir = normalizedCharacter
      ? path.join(modsDir, normalizedCharacter)
      : modsDir;

    if (!fs.existsSync(targetDir)) {
      await fsp.mkdir(targetDir, { recursive: true });
    }

    // Create a unique directory for the mod
    modDir = await uniqueDirectory(
      path.join(targetDir, path.basename(folderPath))
    );

    // Copy the folder contents to the target directory
    await copyDirectory(folderPath, modDir);

    // Register the mod with the normalized character name
    const mod = await registerMod(modDir, normalizedCharacter);

    // Check if the mod is already in the active mods directory
    const config = await readConfig();
    const activeModsDir = getActiveModsDir(config.settings);
    const activeModPath = path.join(activeModsDir, path.basename(modDir));

    if (fs.existsSync(activeModPath)) {
      mod.enabled = true;
      mod.activePath = activeModPath;

      // Update the mod in config
      const modIndex = config.mods.findIndex((m) => m.id === mod.id);
      if (modIndex !== -1) {
        config.mods[modIndex] = mod;
        await writeConfig(config);
      }
    }

    return mod;
  } catch (error) {
    // Clean up the directory if registration fails
    if (modDir && fs.existsSync(modDir)) {
      await fsp.rm(modDir, { recursive: true, force: true });
    }
    console.error("Error in importFromFolder:", error);
    throw error; // Re-throw the error to be handled by the caller
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
  // Normalize character name to lowercase for consistency
  const normalizedCharacter = manifest?.character
    ? manifest.character.toLowerCase()
    : null;

  return {
    id: makeId(manifest?.name || modName),
    name: manifest?.name || modName,
    description: manifest?.description || `Mod: ${modName}`,
    author: manifest?.author || "Unknown",
    version: manifest?.version || "1.0.0",
    character: normalizedCharacter,
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
    description: "No manifest found",
    author: "Unknown",
    version: "1.0.0",
  };

  const mod = await buildModObject(modDir, manifest || defaultManifest);
  mod.enabled = false;
  mod.activePath = null;

  // Normalize character name to lowercase for consistency
  const normalizedCharacter = character ? character.toLowerCase() : null;

  // Set character if provided
  if (normalizedCharacter) {
    mod.character = normalizedCharacter;
  }

  const config = await readConfig();
  const existingIndex = config.mods.findIndex((m) => m.id === mod.id);

  if (existingIndex >= 0) {
    // Update existing mod
    const existingMod = config.mods[existingIndex];
    config.mods[existingIndex] = {
      ...existingMod,
      ...mod,
      // Preserve enabled state and activePath
      enabled: existingMod.enabled,
      activePath: existingMod.activePath,
      // Only update character if explicitly provided and different
      character:
        normalizedCharacter !== null
          ? normalizedCharacter
          : existingMod.character,
    };
    mod.enabled = existingMod.enabled;
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

    // Work on a copy then persist back to config
    const mod = { ...config.mods[idx] };
    const activeModsDir = getActiveModsDir(config.settings);

    // Ensure active mods dir exists
    if (!fs.existsSync(activeModsDir)) {
      await fsp.mkdir(activeModsDir, { recursive: true });
    }

    const modFolderName = path.basename(mod.dir);
    const destDir = path.join(activeModsDir, modFolderName);

    if (turnOn) {
      // Enable: copy the mod folder into the game's mods folder
      // If there's an existing folder at dest, remove it first to avoid stale files
      if (fs.existsSync(destDir)) {
        await fsp.rm(destDir, { recursive: true, force: true });
      }

      // Copy the manager mod directory (mod.dir) into the active mods dir
      await copyDirectory(mod.dir, destDir);

      mod.activePath = destDir;
      mod.enabled = true;
    } else {
      // Disable: remove the folder from the game's mods folder
      // Prefer mod.activePath if valid, otherwise fall back to destDir
      const pathToRemove =
        mod.activePath && fs.existsSync(mod.activePath)
          ? mod.activePath
          : destDir;

      if (
        pathToRemove &&
        fs.existsSync(pathToRemove) &&
        pathToRemove.startsWith(activeModsDir)
      ) {
        await fsp.rm(pathToRemove, { recursive: true, force: true });
      }

      mod.activePath = null;
      mod.enabled = false;
    }

    // Persist changes to config
    config.mods[idx] = mod;
    await writeConfig(config);

    return { success: true, mod: { ...mod } };
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

  // Get all character directories
  const dirEntries = await fsp.readdir(modsDir, { withFileTypes: true });
  const characterDirs = dirEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      path: path.join(modsDir, entry.name),
      name: entry.name.toLowerCase(), // Normalize directory names to lowercase
    }));

  // Sync mods from each character directory
  let allMods = [];
  for (const { path: charDir, name: charName } of characterDirs) {
    const mods = await syncModsFromDirectory(charDir, cfg);
    // Ensure all mods have the correct character name from their directory
    const normalizedMods = mods.map((mod) => ({
      ...mod,
      character: mod.character || charName, // Use directory name as fallback for character
    }));
    allMods = [...allMods, ...normalizedMods];
  }

  // Also sync from the root mods directory for backward compatibility
  const rootMods = await syncModsFromDirectory(modsDir, cfg);
  allMods = [...allMods, ...rootMods];

  // Remove duplicates by directory path and normalize character names
  const uniqueMods = [];
  const seenDirs = new Set();

  for (const mod of allMods) {
    if (!seenDirs.has(mod.dir)) {
      seenDirs.add(mod.dir);
      // Ensure character name is normalized
      uniqueMods.push({
        ...mod,
        character: mod.character ? mod.character.toLowerCase() : null,
      });
    }
  }

  return uniqueMods;
}

async function syncModsFromDirectory(modsDir, config) {
  if (!fs.existsSync(modsDir)) return [];

  const existingMods = Array.isArray(config.mods) ? config.mods : [];
  const dirEntries = await fsp.readdir(modsDir, { withFileTypes: true });

  // Get list of character directories (top-level directories in modsDir)
  const characterDirs = dirEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  // Get all mod directories (subdirectories within character directories)
  let modDirs = [];
  for (const entry of dirEntries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(modsDir, entry.name);
      const subEntries = await fsp.readdir(fullPath, { withFileTypes: true });

      for (const subEntry of subEntries) {
        if (subEntry.isDirectory()) {
          modDirs.push(path.join(fullPath, subEntry.name));
        }
      }
    }
  }

  const validMods = existingMods.filter((mod) => {
    // Only keep mods that exist and aren't character folders
    return (
      fs.existsSync(mod.dir) &&
      !characterDirs.some((charDir) =>
        mod.dir.includes(path.join(modsDir, charDir, charDir))
      )
    );
  });

  const newMods = [];
  for (const modDir of modDirs) {
    // Skip if this is a character directory
    if (
      characterDirs.some((charDir) =>
        modDir.includes(path.join(charDir, charDir))
      )
    ) {
      continue;
    }

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

const PRESETS_PATH = path.join(DATA_DIR, "presets.json");

async function readPresets() {
  try {
    const raw = await fsp.readFile(PRESETS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err?.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

async function writePresets(presets) {
  await fsp.writeFile(PRESETS_PATH, JSON.stringify(presets, null, 2), "utf-8");
}

async function listPresets() {
  return readPresets();
}

async function savePreset(name) {
  const activeMods = await listActive();
  const presets = await readPresets();
  const newPreset = {
    name,
    mods: activeMods.map((mod) => mod.id),
  };

  const existingIndex = presets.findIndex((p) => p.name === name);
  if (existingIndex >= 0) {
    presets[existingIndex] = newPreset;
  } else {
    presets.push(newPreset);
  }

  await writePresets(presets);
  return newPreset;
}

async function applyPreset(presetName) {
  const presets = await readPresets();
  const preset = presets.find((p) => p.name === presetName);
  if (!preset) {
    throw new Error(`Preset "${presetName}" not found.`);
  }

  const config = await readConfig();
  const allMods = config.mods || [];
  const missingMods = [];

  // First, disable all mods to ensure a clean slate
  for (const mod of allMods) {
    if (mod.enabled) {
      await toggleMod(mod.id, false);
    }
  }

  // Then, enable mods from the preset
  for (const modId of preset.mods) {
    const modExists = allMods.some((m) => m.id === modId);
    if (modExists) {
      await toggleMod(modId, true);
    } else {
      missingMods.push(modId);
    }
  }

  return { success: true, missingMods };
}

async function deletePreset(presetName) {
  let presets = await readPresets();
  presets = presets.filter((p) => p.name !== presetName);
  await writePresets(presets);
  return { success: true };
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
  listPresets,
  savePreset,
  applyPreset,
  deletePreset,
  showItemInFolder: (filePath) => {
    try {
      shell.showItemInFolder(path.normalize(filePath));
      return { success: true };
    } catch (error) {
      console.error("Error showing item in folder:", error);
      return { success: false, error: error.message };
    }
  },
};

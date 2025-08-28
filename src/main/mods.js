import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { app } from "electron";
import crypto from "node:crypto";
import AdmZip from "adm-zip";

const APP_DIR = app.getPath("userData");
const DATA_DIR = path.join(APP_DIR, "data");
let MODS_DIR = path.join(DATA_DIR, "mods");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(MODS_DIR)) fs.mkdirSync(MODS_DIR, { recursive: true });
  if (!fs.existsSync(BACKUPS_DIR))
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
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
        settings: { gameDir: "", modsDir: "" },
        appliedFiles: {},
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

function getEffectiveModsDir(settings) {
  return settings?.modsDir && settings.modsDir.trim().length > 0
    ? settings.modsDir
    : null; // Return null if no mods directory is configured
}

async function importFromZip(zipPath) {
  ensureDirs();
  const cfg = await readConfig();
  MODS_DIR = getEffectiveModsDir(cfg.settings);
  if (!MODS_DIR) {
    throw new Error("No mods directory configured. Please select a mods folder in Settings.");
  }
  if (!fs.existsSync(MODS_DIR)) fs.mkdirSync(MODS_DIR, { recursive: true });
  const baseName = path.basename(zipPath, path.extname(zipPath));
  const targetDir = path.join(MODS_DIR, baseName);
  const uniqueDir = await uniqueDirectory(targetDir);
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(uniqueDir, true);
  return await registerMod(uniqueDir);
}

async function importFromFolder(folderPath) {
  ensureDirs();
  const cfg = await readConfig();
  MODS_DIR = getEffectiveModsDir(cfg.settings);
  if (!MODS_DIR) {
    throw new Error("No mods directory configured. Please select a mods folder in Settings.");
  }
  if (!fs.existsSync(MODS_DIR)) fs.mkdirSync(MODS_DIR, { recursive: true });
  const baseName = path.basename(folderPath);
  const targetDir = path.join(MODS_DIR, baseName);
  const uniqueDir = await uniqueDirectory(targetDir);
  await copyDirectory(folderPath, uniqueDir);
  return await registerMod(uniqueDir);
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
  // prefer modinfo.json, fallback to mod.json for legacy
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
  // explicit path in manifest
  if (manifest?.thumbnail) {
    const explicit = path.join(modDir, manifest.thumbnail);
    if (fs.existsSync(explicit)) return explicit;
  }
  if (manifest?.image) {
    const explicit = path.join(modDir, manifest.image);
    if (fs.existsSync(explicit)) return explicit;
  }
  // common defaults
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

async function registerMod(modDir) {
  const config = await readConfig();
  const manifest = await readManifest(modDir);
  const fallbackName = path.basename(modDir);
  const mod = {
    id: makeId(modDir),
    name: manifest?.name || fallbackName,
    version: manifest?.version || "1.0.0",
    author: manifest?.author || "Unknown",
    description: manifest?.description || "No description provided.",
    enabled: true,
    dir: modDir,
    dateAdded: Date.now(),
    sizeBytes: await computeDirectorySizeBytes(modDir),
    thumbnailPath: await findThumbnailPath(modDir, manifest),
  };
  const existingIndex = config.mods.findIndex((m) => m.id === mod.id);
  if (existingIndex >= 0) {
    config.mods[existingIndex] = mod;
  } else {
    config.mods.push(mod);
  }
  await writeConfig(config);
  return mod;
}

async function setEnabled(modId, enabled) {
  const config = await readConfig();
  const idx = config.mods.findIndex((m) => m.id === modId);
  if (idx === -1) return false;
  config.mods[idx].enabled = enabled;
  await writeConfig(config);
  return true;
}

async function deleteMod(modId) {
  const config = await readConfig();
  const idx = config.mods.findIndex((m) => m.id === modId);
  if (idx === -1) return false;
  const mod = config.mods[idx];
  // remove files
  await removeDirectory(mod.dir);
  // update config
  config.mods.splice(idx, 1);
  await writeConfig(config);
  return true;
}

async function removeDirectory(dirPath) {
  try {
    await fsp.rm(dirPath, { recursive: true, force: true });
  } catch (e) {
    // ignore
  }
}

export const paths = { APP_DIR, DATA_DIR, MODS_DIR, CONFIG_PATH };
async function listModsEnriched() {
  const cfg = await readConfig();
  const modsDir = getEffectiveModsDir(cfg.settings);
  
  // If no mods directory is configured, return empty list
  if (!modsDir) {
    return [];
  }

  // Scan the actual mods directory and sync with config
  const items = await syncModsFromDirectory(modsDir, cfg);
  
  // backfill any missing fields for older entries
  const updated = [];
  for (const item of items) {
    const next = { ...item };
    if (next.dateAdded == null) next.dateAdded = Date.now();
    if (next.sizeBytes == null && fs.existsSync(next.dir))
      next.sizeBytes = await computeDirectorySizeBytes(next.dir);
    if (next.thumbnailPath == null && fs.existsSync(next.dir))
      next.thumbnailPath = await findThumbnailPath(
        next.dir,
        await readManifest(next.dir)
      );
    // compute conflict flag based on applied files ownership
    try {
      const filesForMod = Array.isArray(next.appliedFiles)
        ? next.appliedFiles
        : [];
      next.hasConflict = filesForMod.some((target) => {
        const owners = cfg.appliedFiles?.[target] || [];
        return owners.length > 1;
      });
    } catch {
      next.hasConflict = false;
    }
    updated.push(next);
  }
  // persist if any changed
  if (JSON.stringify(items) !== JSON.stringify(updated)) {
    const cfg2 = await readConfig();
    cfg2.mods = updated;
    await writeConfig(cfg2);
  }
  return updated;
}

async function syncModsFromDirectory(modsDir, config) {
  if (!fs.existsSync(modsDir)) {
    return [];
  }

  const existingMods = config.mods || [];
  const dirEntries = await fsp.readdir(modsDir, { withFileTypes: true });
  const modDirs = dirEntries
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(modsDir, entry.name));

  // Remove mods from config that no longer exist on disk
  const validMods = existingMods.filter(mod => fs.existsSync(mod.dir));

  // Add new mods found on disk that aren't in config
  const newMods = [];
  for (const modDir of modDirs) {
    const existingMod = validMods.find(mod => mod.dir === modDir);
    if (!existingMod) {
      try {
        const newMod = await createModFromDirectory(modDir);
        newMods.push(newMod);
      } catch (error) {
        console.error(`Failed to register mod from ${modDir}:`, error);
      }
    }
  }

  return [...validMods, ...newMods];
}

async function createModFromDirectory(modDir) {
  const manifest = await readManifest(modDir);
  const fallbackName = path.basename(modDir);
  return {
    id: makeId(modDir),
    name: manifest?.name || fallbackName,
    version: manifest?.version || "1.0.0",
    author: manifest?.author || "Unknown",
    description: manifest?.description || "No description provided.",
    enabled: false, // New mods start disabled
    dir: modDir,
    dateAdded: Date.now(),
    sizeBytes: await computeDirectorySizeBytes(modDir),
    thumbnailPath: await findThumbnailPath(modDir, manifest),
  };
}

export const api = {
  listMods: listModsEnriched,
  importFromZip,
  importFromFolder,
  setEnabled,
  deleteMod,
};

// ========================= Safe Apply / Revert =========================

async function walkDir(root) {
  /** @type {Array<{abs:string, rel:string}>} */
  const out = [];
  async function recurse(current, baseRel) {
    const entries = await fsp.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      const rel = path.join(baseRel, entry.name);
      if (entry.isDirectory()) {
        await recurse(abs, rel);
      } else if (entry.isFile()) {
        out.push({ abs, rel });
      }
    }
  }
  await recurse(root, "");
  return out;
}

function isMetaFile(rel) {
  const lower = rel.toLowerCase();
  return (
    lower.endsWith("mod.json") ||
    lower.endsWith("modinfo.json") ||
    lower.includes("thumbnail") ||
    lower.includes("preview") ||
    lower.includes("cover")
  );
}

async function ensureParentDir(filePath) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
}

async function copyFileSafe(src, dest) {
  await ensureParentDir(dest);
  await fsp.copyFile(src, dest);
}

async function fileExists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

async function applyModFiles(modId) {
  const config = await readConfig();
  const mod = config.mods.find((m) => m.id === modId);
  if (!mod) throw new Error("Mod not found");
  const gameDir = config.settings?.gameDir || "";
  if (!gameDir) throw new Error("Game directory not configured");

  const files = await walkDir(mod.dir);
  for (const { abs, rel } of files) {
    if (isMetaFile(rel)) continue;
    const target = path.join(gameDir, rel);
    const backup = path.join(BACKUPS_DIR, rel);

    // Track ownership stack
    config.appliedFiles ||= {};
    const owners = config.appliedFiles[target] || [];

    // Backup original on first modification
    if (owners.length === 0) {
      if (await fileExists(target)) {
        await copyFileSafe(target, backup);
      } else {
        // mark as no-original by creating empty placeholder? Skip backup if not exists
      }
    }

    // Apply this mod
    await copyFileSafe(abs, target);

    // Update ownership
    if (!owners.includes(modId)) owners.push(modId);
    config.appliedFiles[target] = owners;

    // Track per-mod list
    mod.appliedFiles ||= [];
    if (!mod.appliedFiles.includes(target)) mod.appliedFiles.push(target);
  }
  await writeConfig(config);
}

async function revertModFiles(modId) {
  const config = await readConfig();
  const mod = config.mods.find((m) => m.id === modId);
  if (!mod) throw new Error("Mod not found");
  const gameDir = config.settings?.gameDir || "";
  if (!gameDir) throw new Error("Game directory not configured");

  const applied = Array.isArray(mod.appliedFiles) ? [...mod.appliedFiles] : [];
  for (const target of applied) {
    const owners = config.appliedFiles?.[target] || [];
    const index = owners.indexOf(modId);
    if (index >= 0) owners.splice(index, 1);

    if (owners.length > 0) {
      // Re-apply the last owner's version of the file
      const nextOwnerId = owners[owners.length - 1];
      const nextMod = config.mods.find((m) => m.id === nextOwnerId);
      if (nextMod) {
        const rel = path.relative(path.join(config.settings.gameDir), target);
        // find corresponding file inside next mod by rel
        const src = path.join(nextMod.dir, rel);
        if (await fileExists(src)) {
          await copyFileSafe(src, target);
        }
      }
      config.appliedFiles[target] = owners;
    } else {
      // Restore backup if exists, else remove file
      const rel = path.relative(config.settings.gameDir, target);
      const backup = path.join(BACKUPS_DIR, rel);
      if (await fileExists(backup)) {
        await copyFileSafe(backup, target);
        // Optionally remove backup after full restore
        await fsp.rm(backup, { force: true });
      } else {
        try {
          await fsp.rm(target, { force: true });
        } catch {}
      }
      delete config.appliedFiles[target];
    }
  }
  mod.appliedFiles = [];
  await writeConfig(config);
}

// Wrap setEnabled to apply/revert files safely
const _setEnabled = setEnabled;
setEnabled = async function (modId, enabled) {
  if (enabled) {
    await applyModFiles(modId);
  } else {
    await revertModFiles(modId);
  }
  return _setEnabled(modId, enabled);
};

export const safe = { applyModFiles, revertModFiles };

// ========================= Settings Helpers =========================
export async function getSettings() {
  const cfg = await readConfig();
  return cfg.settings || { gameDir: "" };
}

export async function setSettings(partial) {
  const cfg = await readConfig();
  cfg.settings = {
    ...(cfg.settings || { gameDir: "", modsDir: "" }),
    ...partial,
  };
  await writeConfig(cfg);
  return cfg.settings;
}

export async function clearBackups() {
  ensureDirs();
  try {
    await fsp.rm(BACKUPS_DIR, { recursive: true, force: true });
  } catch {}
  await fsp.mkdir(BACKUPS_DIR, { recursive: true });
  return true;
}

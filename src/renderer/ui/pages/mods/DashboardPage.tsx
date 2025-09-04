import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiFolderPlus,
  FiSearch,
  FiPackage,
  FiGrid,
  FiList,
  FiFilter,
  FiRefreshCw,
  FiDownload,
  FiSave,
  FiCheckCircle,
  FiPower,
} from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { cn } from "../../../lib/utils";
import ModCard from "../../components/mods/ModCard";
import { characters } from "../../../data/characters";

const getCharacterInfo = (name?: string) => {
  if (!name) return null;
  return characters.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
};
import { ModItem } from "../../types/mods";

type ViewMode = "grid" | "list";
type SortBy = "name" | "date" | "status";

const DashboardPage: React.FC = () => {
  const [mods, setMods] = useState<ModItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [presets, setPresets] = useState<{name: string, mods: string[]}[]>([]);

  // Generate time-based greeting
  useEffect(() => {
    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning Master";
      if (hour < 18) return "Good Afternoon Master";
      return "Good Evening Master";
    };
    setGreeting(getTimeBasedGreeting());
  }, []);

  // Fetch presets
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const presetList = await window.electronAPI.mods.listPresets();
        setPresets(presetList);
      } catch (err) {
        console.error('Failed to fetch presets:', err);
      }
    };
    fetchPresets();
  }, []);

  useEffect(() => {
    const fetchMods = async () => {
      try {
        setIsLoading(true);
        const modsList = await window.electronAPI.mods.listLibrary();
        setMods(modsList);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch mods:", err);
        setError("Failed to load mods. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMods();
  }, []);

  const handleToggleMod = async (modId: string, enabled: boolean) => {
    try {
      await window.electronAPI.mods.toggleMod(modId, enabled);
      // refresh authoritative data from backend to keep UI in sync
      await refreshMods();
    } catch (err) {
      console.error("Failed to toggle mod:", err);
      setError("Failed to update mod status.");
    }
  };

  const handleDeleteMod = async (modId: string) => {
    if (!window.confirm("Are you sure you want to delete this mod?")) return;

    try {
      await window.electronAPI.mods.deleteMod(modId);
      // refresh authoritative data from backend
      await refreshMods();
    } catch (err) {
      console.error("Failed to delete mod:", err);
      setError("Failed to delete mod. Please try again.");
    }
  };

  const handleOpenModFolder = async (modId: string) => {
    try {
      const mod = mods.find((m) => m.id === modId);
      if (mod?.installPath) {
        await window.electronAPI.mods.showItemInFolder(mod.installPath);
      }
    } catch (err) {
      console.error("Failed to open mod folder:", err);
      setError("Failed to open mod folder.");
    }
  };

  const filteredMods = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = mods
      .filter((mod) => {
        const name = String(mod.name || "").toLowerCase();
        const desc = String(mod.description || "").toLowerCase();

        const matchesSearch = !q || name.includes(q) || desc.includes(q);

        const modCharKey = String(mod.character || "unassigned").toLowerCase();
        const matchesCharacter =
          selectedCharacter === "all" || modCharKey === selectedCharacter;

        return matchesSearch && matchesCharacter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "date":
            return (b.updatedAt || "").localeCompare(a.updatedAt || "");
          case "status":
            if (!!a.enabled === !!b.enabled) return 0;
            return a.enabled ? -1 : 1;
          default:
            return 0;
        }
      });

    return list;
  }, [mods, searchQuery, sortBy, selectedCharacter]);

  const characterOptions = React.useMemo(() => {
    const map = new Map();
    mods.forEach((mod) => {
      const name = mod.character ? String(mod.character) : "Unassigned";
      const key = name.toLowerCase();
      if (!map.has(key)) map.set(key, name);
    });

    const options = [{ key: "all", label: "All Characters" }].concat(
      Array.from(map.entries()).map(([key, label]) => ({ key, label }))
    );

    return options;
  }, [mods]);

  const stats = React.useMemo(
    () => ({
      total: mods.length,
      enabled: mods.filter((m) => !!m.enabled).length,
      disabled: mods.filter((m) => !m.enabled).length,
      favorites: mods.filter((m) => m.isFavorite).length,
    }),
    [mods]
  );

  const refreshMods = async () => {
    try {
      setIsRefreshing(true);
      const modsList = await window.electronAPI.mods.listLibrary();
      setMods(modsList);
      setError(null);
    } catch (err) {
      console.error("Failed to refresh mods:", err);
      setError("Failed to refresh mods. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFavorite = async (id: string, favorite: boolean) => {
    try {
      // Update local state optimistically
      setMods(
        mods.map((mod) =>
          mod.id === id ? { ...mod, isFavorite: favorite } : mod
        )
      );

      // TODO: Add API call to update favorite status
      // await window.electronAPI.mods.updateFavorite(id, favorite);
    } catch (error) {
      console.error("Failed to update favorite status:", error);
      // Revert on error
      setMods(
        mods.map((mod) =>
          mod.id === id ? { ...mod, isFavorite: !favorite } : mod
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-moon-glowViolet/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-moon-glowViolet border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-moon-text/70">Loading your mods...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-500/40 rounded-lg text-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-moon-glowViolet to-moon-glowCyan bg-clip-text text-transparent">
              {greeting}
            </h1>
            <p className="text-moon-text/70 mt-1">
              Manage and organize your game modifications
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMods}
              disabled={isRefreshing}
              className="gap-2"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="default"
              onClick={() => window.electronAPI.mods.chooseFolder()}
              className="gap-2 bg-gradient-to-r from-moon-glowViolet to-moon-glowCyan hover:opacity-90 transition-all"
            >
              <FiPlus className="w-4 h-4" />
              Add Mod
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FiPackage className="w-5 h-5" />}
            label="Total Mods"
            value={stats.total}
            color="text-moon-text"
          />
          <StatCard
            icon={<FiCheckCircle className="w-5 h-5" />}
            label="Active"
            value={stats.enabled}
            color="text-green-400"
          />
          <StatCard
            icon={<FiPower className="w-5 h-5" />}
            label="Inactive"
            value={mods.filter(mod => !mod.enabled).length}
            color="text-blue-400"
          />
          <StatCard
            icon={<FiSave className="w-5 h-5" />}
            label="Presets"
            value={presets.length}
            color="text-yellow-400"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-moon-surface/20 backdrop-blur-sm border border-moon-surface/30 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-moon-text/40" />
              <input
                type="text"
                placeholder="Search mods by name or description..."
                className="w-full pl-10 pr-4 py-2.5 bg-moon-surface/20 border border-moon-surface/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-moon-glowViolet/50 focus:border-transparent text-moon-text placeholder-moon-text/40 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <FiGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <FiList className="w-4 h-4" />
              </Button>
              <Button
                variant={showFilters ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                title="Filters"
              >
                <FiFilter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 pt-4 border-t border-moon-surface/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-moon-text/70 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="w-full bg-moon-surface/20 border border-moon-surface/30 rounded-lg px-3 py-2 text-sm text-moon-text focus:outline-none focus:ring-2 focus:ring-moon-glowViolet/50 focus:border-transparent"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="date">Recently Updated</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-moon-text/70 mb-2">
                    Character
                  </label>
                  <select
                    value={selectedCharacter}
                    onChange={(e) => setSelectedCharacter(e.target.value)}
                    className="w-full bg-moon-surface/20 border border-moon-surface/30 rounded-lg px-3 py-2 text-sm text-moon-text focus:outline-none focus:ring-2 focus:ring-moon-glowViolet/50 focus:border-transparent"
                  >
                    <option value="all">All Characters</option>
                    {characterOptions.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {filteredMods.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-moon-surface/30 rounded-xl bg-moon-surface/10"
        >
          <div className="p-4 bg-moon-surface/20 rounded-full mb-4">
            <FiPackage className="w-10 h-10 text-moon-glowViolet" />
          </div>
          <h3 className="text-xl font-semibold text-moon-text mb-2">
            {searchQuery || selectedCharacter !== "all"
              ? "No matching mods found"
              : "No mods installed yet"}
          </h3>
          <p className="text-moon-text/60 max-w-md mb-6">
            {searchQuery
              ? "Try adjusting your search or filters to find what you're looking for."
              : selectedCharacter !== "all"
              ? `No mods found for this character. Try changing the character filter.`
              : "Get started by adding your first mod to enhance your game experience."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="default"
              onClick={() => window.electronAPI.mods.chooseFolder()}
              className="gap-2 bg-gradient-to-r from-moon-glowViolet to-moon-glowCyan hover:opacity-90"
            >
              <FiPlus className="w-4 h-4" />
              Add Your First Mod
            </Button>
            {(searchQuery || selectedCharacter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCharacter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${sortBy}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-3",
              "relative"
            )}
          >
            <AnimatePresence>
              {filteredMods.map((mod) => {
                const characterInfo = getCharacterInfo(mod.character);
                return (
                  <ModCard
                    key={mod.id}
                    mod={{
                      ...mod,
                      author: mod.author || "Unknown Author",
                      version: mod.version || "1.0.0",
                      isFavorite: mod.isFavorite || false,
                      updatedAt: mod.updatedAt || new Date().toISOString(),
                      lastUpdated: mod.lastUpdated || new Date().toISOString(),
                      tags: mod.tags || [],
                      dependencies: mod.dependencies || [],
                      conflicts: mod.conflicts || [],
                    }}
                    characterInfo={characterInfo}
                    onToggle={handleToggleMod}
                    onDelete={handleDeleteMod}
                    onFavorite={handleToggleFavorite}
                    onOpenFolder={handleOpenModFolder}
                    viewMode={viewMode}
                    className="w-full"
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}> = ({ icon, label, value, color = "text-moon-text" }) => (
  <div className="bg-moon-surface/20 backdrop-blur-sm border border-moon-surface/30 rounded-xl p-4 transition-all hover:bg-moon-surface/30">
    <div className="flex items-center justify-between">
      <div className="p-2 rounded-lg bg-moon-surface/30 text-moon-glowViolet">
        {icon}
      </div>
      <div className="text-right">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-moon-text/60">{label}</p>
      </div>
    </div>
  </div>
);

export default DashboardPage;

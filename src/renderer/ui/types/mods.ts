export interface ModItem {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  enabled: boolean;
  dir: string;
  character?: string;
  dateAdded?: number;
  sizeBytes?: number;
  thumbnailPath?: string | null;
  appliedFiles?: string[];
  hasConflict?: boolean;
}

export type ImportState = "idle" | "importing" | "success" | "error";
export type SortField = "name" | "date" | "size";
export type SortDirection = "asc" | "desc";

export interface ModsState {
  mods: ModItem[];
  importState: ImportState;
  query: string;
  sortBy: SortField;
  sortDir: SortDirection;
  isLoading: boolean;
  error: string | null;
  modsDir: string;
  needsSetup: boolean;
  isRefreshing: boolean;
}

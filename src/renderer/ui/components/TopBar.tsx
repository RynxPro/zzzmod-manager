import React from "react";

type Props = {
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
};

const TopBar: React.FC<Props> = ({ theme = "dark", onToggleTheme }) => {
  return (
    <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 bg-white/50 dark:bg-neutral-900/70 backdrop-blur">
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        Welcome
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="rounded-md px-2 py-1 text-xs font-medium border border-neutral-300 dark:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          title="Toggle theme"
        >
          {theme === "dark" ? "Light" : "Dark"} Mode
        </button>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          v0.1.0
        </div>
      </div>
    </div>
  );
};

export default TopBar;

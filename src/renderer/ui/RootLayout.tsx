import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import TopBar from "./components/TopBar";

const NavItem: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-neutral-800 text-white"
          : "text-neutral-300 hover:text-white hover:bg-neutral-800"
      }`
    }
    end
  >
    {label}
  </NavLink>
);

const RootLayout: React.FC = () => {
  const [theme, setTheme] = React.useState<string>(
    () => localStorage.getItem("theme") || "dark"
  );
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="flex h-screen w-screen dark:bg-neutral-950 bg-white dark:text-neutral-100 text-neutral-900">
      <aside className="w-56 bg-neutral-900 border-r border-neutral-800 p-4 space-y-2">
        <div className="mb-4 px-2">
          <h1 className="text-lg font-semibold">ZZZ Mod Manager</h1>
        </div>
        <nav className="space-y-1">
          <NavItem to="/" label="Mods" />
          <NavItem to="/settings" label="Settings" />
          <NavItem to="/about" label="About" />
        </nav>
      </aside>
      <section className="flex-1 flex flex-col min-w-0">
        <TopBar
          onToggleTheme={() =>
            setTheme((t) => (t === "dark" ? "light" : "dark"))
          }
          theme={theme}
        />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </section>
    </div>
  );
};

export default RootLayout;

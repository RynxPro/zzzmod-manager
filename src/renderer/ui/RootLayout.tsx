import React from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Settings, Info, Gamepad2, Layers } from "lucide-react";
import TopBar from "./components/TopBar";

const IconNavItem: React.FC<{ to: string; label: string; icon: React.ReactNode }> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive =
    to === "/characters"
      ? location.pathname.startsWith("/characters")
      : location.pathname === to || (to === "/" && location.pathname === "/");
  return (
    <NavLink to={to} end className="relative group">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 border ${
          isActive
            ? "border-transparent shadow-moonGlowViolet bg-moon-surface/70"
            : "border-white/5 bg-moon-surface/40 hover:bg-moon-surface/60 hover:shadow-moonGlowCyan"
        }`}
      >
        <span className={`text-xl ${isActive ? "text-moon-accent" : "text-moon-muted group-hover:text-moon-text"}`}>{icon}</span>
      </motion.div>
      <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="px-2 py-1 rounded-md bg-moon-surface/95 border border-white/10 shadow-moonGlowCyan">
          <span className="text-xs text-moon-text whitespace-nowrap">{label}</span>
        </div>
      </div>
      <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-moon-accent transition-opacity ${isActive ? "opacity-100 shadow-moonGlowViolet" : "opacity-0"}`} />
    </NavLink>
  );
};

const RootLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-moon-bg text-moon-text">
      {/* Minimal vertical sidebar */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-16 relative z-10 border-r border-white/5 bg-gradient-moon-sidebar"
      >
        <div className="h-full flex flex-col items-center py-4 gap-4">
          {/* Logo */}
          <motion.div
            whileHover={{ rotate: 6, scale: 1.05 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-moon-glowCyan to-moon-glowViolet p-2 shadow-moonGlowCyan"
            title="MoonLight Manager"
          >
            <Gamepad2 className="w-full h-full text-moon-bg" />
          </motion.div>
          <div className="h-px w-10 bg-white/10" />
          {/* Nav icons */}
          <nav className="flex flex-col items-center gap-3">
            <IconNavItem to="/characters" label="Characters" icon={<Users size={18} />} />
            <IconNavItem to="/presets" label="Presets" icon={<Layers size={18} />} />
            <IconNavItem to="/settings" label="Settings" icon={<Settings size={18} />} />
            <IconNavItem to="/about" label="About" icon={<Info size={18} />} />
          </nav>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col min-w-0 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(77, 208, 225, 0.25) 0%, transparent 45%),
                               radial-gradient(circle at 75% 75%, rgba(122, 90, 248, 0.25) 0%, transparent 45%)`,
            }}
          />
        </div>

        <TopBar />

        <main className="flex-1 overflow-auto relative z-10">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </section>
    </div>
  );
};

export default RootLayout;

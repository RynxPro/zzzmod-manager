import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Puzzle, Settings, Info, Gamepad2 } from "lucide-react";
import TopBar from "./components/TopBar";

const NavItem: React.FC<{
  to: string;
  label: string;
  icon: React.ReactNode;
}> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to === "/" && location.pathname === "/");

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <NavLink
        to={to}
        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden ${
          isActive
            ? "bg-gradient-to-r from-gaming-accent-cyan/20 to-gaming-accent-violet/20 text-gaming-accent-cyan shadow-glow border border-gaming-accent-cyan/30"
            : "text-gaming-text-secondary hover:text-gaming-text-primary hover:bg-gaming-bg-overlay/50 hover:shadow-glass"
        }`}
        end
      >
        {/* Animated background for active state */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gaming-accent-cyan/10 to-gaming-accent-violet/10 opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />
        
        {/* Icon with glow effect */}
        <motion.span 
          className={`relative z-10 transition-all duration-300 ${
            isActive ? "text-gaming-accent-cyan drop-shadow-[0_0_8px_currentColor]" : ""
          }`}
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.4 }}
        >
          {icon}
        </motion.span>
        
        {/* Label with subtle animation */}
        <motion.span 
          className="relative z-10 font-medium tracking-wide"
          initial={false}
          animate={{ x: 0 }}
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {label}
        </motion.span>
        
        {/* Active indicator */}
        <motion.div
          className="absolute right-0 top-1/2 w-1 h-6 bg-gradient-to-b from-gaming-accent-cyan to-gaming-accent-violet rounded-l-full"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ 
            opacity: isActive ? 1 : 0,
            scaleY: isActive ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        />
      </NavLink>
    </motion.div>
  );
};

const RootLayout: React.FC = () => {
  const [theme, setTheme] = React.useState<"dark" | "light">(
    () => (localStorage.getItem("theme") as "dark" | "light") || "dark"
  );
  
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const location = useLocation();
  
  return (
    <div className="flex h-screen w-screen bg-gaming-bg-primary text-gaming-text-primary overflow-hidden">
      {/* Futuristic Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-72 relative z-10"
      >
        {/* Sidebar Background with Glassmorphism */}
        <div className="absolute inset-0 bg-gradient-sidebar backdrop-blur-gaming border-r border-gaming-border-accent/30">
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-gaming opacity-20"
            animate={{ 
              background: [
                "linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(244, 113, 181, 0.1) 100%)",
                "linear-gradient(135deg, rgba(244, 113, 181, 0.1) 0%, rgba(0, 245, 255, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%)",
                "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(244, 113, 181, 0.1) 50%, rgba(0, 245, 255, 0.1) 100%)"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Sidebar Content */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Logo/Title Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-gaming-accent-cyan to-gaming-accent-violet p-2 shadow-glow"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Gamepad2 className="w-full h-full text-gaming-bg-primary" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gaming-text-primary">
                  ZZZ Mod Manager
                </h1>
                <p className="text-xs text-gaming-text-muted font-mono">v0.1.0</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-gaming-accent-cyan/50 via-gaming-accent-violet/50 to-transparent" />
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <NavItem to="/" label="Mods" icon={<Puzzle size={18} />} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <NavItem to="/settings" label="Settings" icon={<Settings size={18} />} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <NavItem to="/about" label="About" icon={<Info size={18} />} />
            </motion.div>
          </nav>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-auto pt-6 border-t border-gaming-border-accent/30"
          >
            <div className="text-xs text-gaming-text-muted space-y-1">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gaming-status-enabled animate-pulse" />
                  <span className="text-gaming-status-enabled">Online</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col min-w-0 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0, 245, 255, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
          }} />
        </div>

        <TopBar
          onToggleTheme={() =>
            setTheme((t) => (t === "dark" ? "light" : "dark"))
          }
          theme={theme}
        />
        
        <main className="flex-1 overflow-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ 
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
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

import React from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Settings, 
  Info, 
  Gamepad2, 
  Layers, 
  Home,
  Zap,
  List,
  Star,
  Clock
} from "lucide-react";
import TopBar from "./components/TopBar";

const NavItem = ({ 
  to, 
  label, 
  icon: Icon,
  count,
  isCollapsed = false
}: { 
  to: string; 
  label: string; 
  icon: React.ElementType;
  count?: number;
  isCollapsed?: boolean;
}) => {
  const location = useLocation();
  const isActive = 
    to === "/characters" 
      ? location.pathname.startsWith("/characters")
      : to === "/" 
        ? location.pathname === "/"
        : location.pathname.startsWith(to);

  return (
    <NavLink 
      to={to} 
      end 
      className={`group relative flex items-center px-4 py-3 transition-colors duration-200 ${
        isActive 
          ? 'text-moon-accent bg-moon-surface/50' 
          : 'text-moon-muted hover:text-moon-text hover:bg-moon-surface/30'
      }`}
    >
      <div className="flex items-center w-full">
        <Icon className={`w-5 h-5 ${isActive ? 'text-moon-accent' : ''}`} />
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-3 text-sm font-medium"
          >
            {label}
          </motion.span>
        )}
        {count !== undefined && count > 0 && (
          <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-moon-accent/20 text-moon-accent">
            {count}
          </span>
        )}
      </div>
      <motion.div 
        className={`absolute left-0 top-0 h-full w-0.5 bg-moon-accent ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
        }`}
        layoutId="activeNav"
      />
    </NavLink>
  );
};

const RootLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const location = useLocation();
  
  // Mock data for demonstration
  const activeModsCount = 12;
  const totalMods = 24;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-moon-bg text-moon-text">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? '5rem' : '16rem',
          transition: { type: 'spring', stiffness: 400, damping: 40 }
        }}
        className="relative z-20 border-r border-white/5 bg-moon-surface/50 backdrop-blur-lg"
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <motion.div
              initial={false}
              animate={{
                opacity: isSidebarCollapsed ? 0 : 1,
                x: isSidebarCollapsed ? -20 : 0,
                transition: { duration: 0.2 }
              }}
              className="flex items-center"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-moon-glowCyan to-moon-glowViolet flex items-center justify-center mr-2">
                <Zap className="w-4 h-4 text-moon-bg" />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet">
                MoonLight
              </span>
            </motion.div>
            
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-md hover:bg-white/5 text-moon-muted hover:text-moon-text transition-colors"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <div className="space-y-1">
              <NavItem 
                to="/" 
                label="Mods" 
                icon={List}
                count={activeModsCount}
                isCollapsed={isSidebarCollapsed}
              />
              <NavItem 
                to="/characters" 
                label="Characters" 
                icon={Users}
                count={8}
                isCollapsed={isSidebarCollapsed}
              />
              <NavItem 
                to="/presets" 
                label="Presets" 
                icon={Layers}
                isCollapsed={isSidebarCollapsed}
              />
            </div>

            <div className="mt-8">
              <h3 className={`px-4 text-xs font-semibold text-moon-muted uppercase tracking-wider mb-2 ${
                isSidebarCollapsed ? 'opacity-0 w-0 h-0' : 'opacity-100'
              }`}>
                Library
              </h3>
              <div className="space-y-1">
                <NavItem 
                  to="/favorites" 
                  label="Favorites" 
                  icon={Star}
                  isCollapsed={isSidebarCollapsed}
                />
                <NavItem 
                  to="/recent" 
                  label="Recently Used" 
                  icon={Clock}
                  isCollapsed={isSidebarCollapsed}
                />
              </div>
            </div>
          </nav>

          {/* User & Settings */}
          <div className="p-2 border-t border-white/5">
            <NavItem 
              to="/settings" 
              label="Settings" 
              icon={Settings}
              isCollapsed={isSidebarCollapsed}
            />
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-moon-bg/80 via-moon-bg to-moon-surface/30"></div>
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(77, 208, 225, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(122, 90, 248, 0.15) 0%, transparent 50%),
                linear-gradient(to bottom right, transparent 0%, rgba(10, 15, 28, 0.8) 100%)
              `
            }}
          ></div>
        </div>

        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Status Bar */}
        <div className="h-8 border-t border-white/5 bg-moon-surface/30 backdrop-blur-sm flex items-center px-4 text-xs text-moon-muted">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span>Connected</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span>{activeModsCount} of {totalMods} mods active</span>
            <div className="h-3 w-px bg-white/10"></div>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom ChevronLeft and ChevronRight components for the collapsible sidebar
function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export default RootLayout;

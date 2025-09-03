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
  Package
} from "lucide-react";
import TopBar from "./components/TopBar";

const NavItem = ({ 
  to, 
  label, 
  icon: Icon,
  isCollapsed = false,
  isActive = false
}: { 
  to: string; 
  label: string; 
  icon: React.ElementType;
  isCollapsed?: boolean;
  isActive?: boolean;
}) => {
  const location = useLocation();
  const isActuallyActive = isActive || (
    to === "/characters" 
      ? location.pathname.startsWith("/characters")
      : to === "/" 
        ? location.pathname === "/"
        : location.pathname.startsWith(to)
  );

  return (
    <NavLink 
      to={to} 
      end 
      className={({ isActive: isNavActive }) => `group relative flex items-center px-2 py-2.5 rounded-xl transition-all duration-200 ${
        isActuallyActive || isNavActive
          ? 'text-white' 
          : 'text-moon-muted hover:text-moon-text hover:bg-moon-surface/40'
      }`}
    >
      <div className={`flex items-center w-full relative z-10 ${isCollapsed ? 'justify-center' : 'sm:justify-start'}`}>
        <div className={`p-2.5 rounded-lg transition-all duration-200 ${
          isActuallyActive || isActive
            ? 'bg-gradient-to-br from-moon-glowCyan to-moon-glowViolet text-white shadow-md shadow-moon-glowCyan/30' 
            : 'bg-moon-surface/30 text-moon-muted group-hover:bg-moon-surface/40 group-hover:text-moon-text'
        }`}>
          <Icon className="w-5 h-5 flex-shrink-0" />
        </div>
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ 
            opacity: isCollapsed ? 0 : 1, 
            x: isCollapsed ? -10 : 10,
            marginLeft: isCollapsed ? 0 : '0.75rem',
            display: isCollapsed ? 'none' : 'inline-block',
            width: isCollapsed ? 0 : 'auto',
            position: isCollapsed ? 'absolute' : 'relative'
          }}
          className={`text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis ${
            isActuallyActive || isActive ? 'text-white' : ''
          }`}
        >
          {label}
        </motion.span>
      </div>
      {!isCollapsed && (isActuallyActive || isActive) && (
        <motion.div 
          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-moon-glowCyan/10 to-moon-glowViolet/10 border border-white/5"
          layoutId="activeNavBg"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      {/* Removed vertical line indicator */}
    </NavLink>
  );
};

const RootLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('');
  const location = useLocation();
  
  // Mock data for demonstration
  const activeModsCount = 12;
  const totalMods = 24;

  // Update active section based on route
  React.useEffect(() => {
    if (location.pathname.startsWith('/characters')) {
      setActiveSection('characters');
    } else if (location.pathname === '/') {
      setActiveSection('dashboard');
    } else {
      setActiveSection(location.pathname.replace('/', ''));
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-moon-bg text-moon-text">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? '5.5rem' : '17rem',
          minWidth: isSidebarCollapsed ? '5.5rem' : '17rem',
          transition: { type: 'spring', stiffness: 400, damping: 40 }
        }}
        className="relative z-20 border-r border-white/5 bg-moon-surface/60 backdrop-blur-xl flex-shrink-0 overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-moon-glowCyan/5 rounded-full filter blur-3xl" />
          <div className="absolute -left-20 bottom-0 w-60 h-60 bg-moon-glowViolet/5 rounded-full filter blur-3xl" />
        </div>
        <div className="h-full flex flex-col relative z-10">
          {/* Logo */}
          <div className="flex items-center justify-center p-4 border-b border-white/5">
            <motion.div
              initial={false}
              animate={{
                opacity: isSidebarCollapsed ? 0 : 1,
                x: isSidebarCollapsed ? -20 : 0,
                width: isSidebarCollapsed ? 0 : 'auto',
                transition: { duration: 0.2 }
              }}
              className="flex items-center overflow-hidden"
            >
              <motion.div 
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-moon-glowCyan to-moon-glowViolet flex items-center justify-center mr-3 shadow-lg shadow-moon-glowCyan/30"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Zap className="w-4 h-4 text-moon-bg" />
              </motion.div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet whitespace-nowrap">
                MoonLight
              </span>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
            <div className="space-y-2 px-1">
              <NavItem 
                to="/mods"
                label="Mods"
                icon={Package}
                isCollapsed={isSidebarCollapsed}
                isActive={activeSection === 'mods'}
              />
              <NavItem 
                to="/characters" 
                label="Characters" 
                icon={Users}
                isCollapsed={isSidebarCollapsed}
                isActive={activeSection === 'characters'}
              />
              <NavItem 
                to="/presets" 
                label="Presets" 
                icon={Layers}
                isCollapsed={isSidebarCollapsed}
                isActive={activeSection === 'presets'}
              />
            </div>
          </nav>

          {/* User & Settings */}
          <div className="p-3 border-t border-white/5 bg-moon-surface/30 backdrop-blur-sm">
            <NavItem 
              to="/settings" 
              label="Settings" 
              icon={Settings}
              isCollapsed={isSidebarCollapsed}
              isActive={activeSection === 'settings'}
            />
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Animated background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-moon-bg/90 via-moon-bg to-moon-surface/40"></div>
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 30%, rgba(77, 208, 225, 0.2) 0%, transparent 60%),
                radial-gradient(circle at 80% 70%, rgba(122, 90, 248, 0.2) 0%, transparent 60%),
                linear-gradient(to bottom right, transparent 0%, rgba(10, 15, 28, 0.9) 100%)
              `
            }}
          ></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYwMiI+PHBhdGggZD0iTTIwIDM4YzkuOTQxIDAgMTgtOC4wNTkgMTgtMThzLTguMDU5LTE4LTE4LTE4LTE4IDguMDU5LTE4IDE4IDguMDU5IDE4IDE4IDE4em0wLTFjOS4zODggMCAxNy03LjYxMyAxNy0xN3MtNy42MTItMTctMTctMTctMTcgNy42MTMtMTcgMTcgNy42MTIgMTcgMTcgMTd6IiBmaWxsLW9wYWNpdHk9Ii4wMyIvPjwvZz48L2c+PC9zdmc+')] opacity-10" />
        </div>

        {/* Top Bar */}
        <TopBar 
          isSidebarCollapsed={isSidebarCollapsed} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto p-6 min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full min-w-0"
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

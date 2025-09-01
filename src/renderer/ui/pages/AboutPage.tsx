import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, Code, Zap, Heart } from "lucide-react";

const AboutPage: React.FC = () => {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-moon-glowCyan to-moon-glowViolet p-6 shadow-moonGlowCyan"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Gamepad2 className="w-full h-full text-moon-bg" />
        </motion.div>

        <h1 className="text-4xl font-bold text-moon-text mb-3">
          MoonLight Manager
        </h1>
        <p className="text-moon-muted text-lg max-w-md mx-auto">
          A futuristic mod management experience for Zenless Zone Zero
        </p>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Features Card */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-moon-glowCyan/20 flex items-center justify-center">
              <Zap size={20} className="text-moon-accent" />
            </div>
            <h3 className="text-xl font-semibold text-moon-text">
              Features
            </h3>
          </div>
          <ul className="space-y-2 text-moon-muted">
            <li>• Drag & drop mod installation</li>
            <li>• Real-time conflict detection</li>
            <li>• Automatic backup management</li>
            <li>• Gaming-inspired interface</li>
            <li>• Fast mod enable/disable</li>
          </ul>
        </div>

        {/* Tech Stack Card */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-moon-glowViolet/20 flex items-center justify-center">
              <Code size={20} className="text-moon-accent" />
            </div>
            <h3 className="text-xl font-semibold text-moon-text">
              Built With
            </h3>
          </div>
          <ul className="space-y-2 text-moon-muted">
            <li>• Electron for cross-platform support</li>
            <li>• React with TypeScript</li>
            <li>• Framer Motion animations</li>
            <li>• Tailwind CSS styling</li>
            <li>• Lucide React icons</li>
          </ul>
        </div>
      </motion.div>

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="glass-panel rounded-2xl p-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart size={16} className="text-moon-accent" />
          <span className="text-moon-muted">
            Made with passion for the ZZZ community
          </span>
        </div>
        <p className="text-moon-muted font-mono text-sm">
          Version 0.1.0 • Gaming Launcher Edition
        </p>
      </motion.div>
    </div>
  );
};

export default AboutPage;

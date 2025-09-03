import React from "react";
import { motion } from "framer-motion";
import { Zap, Layers, User, Plus, Star, Upload } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

// Mock data - replace with real data from your state management
const stats = [
  {
    name: "Total Mods",
    value: "24",
    icon: Layers,
    description: "Mods in your library",
  },
  {
    name: "Active Mods",
    value: "16",
    icon: Zap,
    description: "Currently enabled mods",
  },
  {
    name: "Characters",
    value: "8",
    icon: User,
    description: "Characters with mods",
  },
  {
    name: "Presets",
    value: "5",
    icon: Star,
    description: "Saved presets",
  },
];

const DashboardPage: React.FC = () => {
  const handleImportMod = () => {
    console.log("Import mod clicked");
    // TODO: Implement mod import functionality
  };

  return (
    <div className="min-h-screen bg-moon-bg text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-6 md:mb-0">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-moon-glowCyan to-moon-glowViolet mb-2">
                MoonLight Manager
              </h1>
              <p className="text-moon-text/80 text-lg">
                Your gateway to seamless mod management
                <span className="inline-block w-2 h-2 bg-moon-accent rounded-full ml-2 animate-pulse"></span>
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="default"
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-moon-accent to-moon-accent-light hover:from-moon-accent/90 hover:to-moon-accent-light/90"
              onClick={handleImportMod}
            >
              <div className="relative z-10 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Import Mod
              </div>
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2 },
              }}
            >
              <Card className="h-full bg-moon-surface/30 backdrop-blur-sm hover:bg-moon-surface/40 transition-all duration-300 border border-white/5 hover:border-moon-accent/20 group">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">{stat.name}</p>
                        <p className="text-2xl font-bold text-white">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.description}
                        </p>
                      </div>
                      <div className="text-gray-400">
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State - Clean and Spacious */}
        <motion.div
          className="rounded-2xl border-2 border-dashed border-moon-surface/40 p-12 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <div className="mx-auto max-w-md">
            <div className="w-16 h-16 mx-auto rounded-full bg-moon-surface/20 flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-moon-accent" />
            </div>
            <h3 className="text-lg font-medium text-moon-text mb-2">
              Ready to get started?
            </h3>
            <p className="text-moon-muted mb-6">
              Import your first mod or explore the mods section to begin
              customizing your game.
            </p>
            <Button
              variant="outline"
              className="border-moon-surface/30 hover:bg-moon-surface/20"
              onClick={handleImportMod}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Mod
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Layers, 
  User, 
  Plus, 
  FolderOpen, 
  Clock, 
  ArrowRight,
  Star,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ModItem } from '../types/mods';
import { Character } from '../types/characters';
import { Preset } from '../types/presets';

// Mock data - replace with real data from your state management
const mockMods: ModItem[] = [
  { id: '1', name: 'Cool Outfit', author: 'Modder1', version: '1.0.0', enabled: true, isFavorite: true, thumbnail: '', character: 'Anby' },
  { id: '2', name: 'Weapon Skin', author: 'Modder2', version: '2.1.0', enabled: true, isFavorite: false, thumbnail: '', character: 'Billy' },
  { id: '3', name: 'UI Mod', author: 'Modder3', version: '0.5.0', enabled: false, isFavorite: true, thumbnail: '', character: 'Nicole' },
];

const mockCharacters: Character[] = [
  { id: '1', name: 'Anby', mods: { total: 12, active: 8 } },
  { id: '2', name: 'Billy', mods: { total: 5, active: 3 } },
  { id: '3', name: 'Nicole', mods: { total: 8, active: 5 } },
];

const mockPresets: Preset[] = [
  { id: '1', name: 'My Setup', modCount: 5, lastUsed: '2023-06-15' },
  { id: '2', name: 'Streaming', modCount: 3, lastUsed: '2023-06-10' },
  { id: '3', name: 'Screenshots', modCount: 7, lastUsed: '2023-06-05' },
];

const stats = [
  { name: 'Total Mods', value: '24', icon: Layers, change: '+5', changeType: 'increase' },
  { name: 'Active Mods', value: '16', icon: Zap, change: '+3', changeType: 'increase' },
  { name: 'Characters', value: '8', icon: User, change: '+2', changeType: 'increase' },
  { name: 'Presets', value: '5', icon: Star, change: '0', changeType: 'neutral' },
];

const recentActivity = [
  { id: 1, type: 'mod', action: 'added', name: 'Cool Outfit', time: '2 minutes ago', icon: Plus },
  { id: 2, type: 'mod', action: 'enabled', name: 'Weapon Skin', time: '1 hour ago', icon: Zap },
  { id: 3, type: 'preset', action: 'created', name: 'My Setup', time: '3 hours ago', icon: Layers },
  { id: 4, type: 'mod', action: 'updated', name: 'UI Mod', time: '5 hours ago', icon: Activity },
];

const quickActions = [
  { name: 'Import Mod', icon: Plus, description: 'Add new mods to your library', action: () => console.log('Import Mod') },
  { name: 'Create Preset', icon: Layers, description: 'Save current mods as a preset', action: () => console.log('Create Preset') },
  { name: 'Open Characters', icon: User, description: 'Manage character mods', action: () => console.log('Open Characters') },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-moon-text">Dashboard</h1>
          <p className="text-moon-muted">Welcome back! Here's what's happening with your mods.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="border-moon-surface/30">
            <FolderOpen className="w-4 h-4 mr-2" />
            Open Mods Folder
          </Button>
          <Button variant="accent" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Mod
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Card className="h-full bg-moon-surface/30 backdrop-blur-sm hover:bg-moon-surface/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-moon-muted">{stat.name}</p>
                    <p className="mt-1 text-2xl font-semibold text-moon-text">{stat.value}</p>
                    <div className={`mt-1 flex items-center text-xs ${
                      stat.changeType === 'increase' ? 'text-green-400' : 
                      stat.changeType === 'decrease' ? 'text-red-400' : 'text-moon-muted'
                    }`}>
                      {stat.changeType === 'increase' && '+'}{stat.change} from last week
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-moon-accent/10 text-moon-accent">
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-moon-text">Recent Activity</h2>
            <button className="text-sm text-moon-accent hover:text-moon-accent/80 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <Card className="bg-moon-surface/30 backdrop-blur-sm">
            <CardContent className="p-0">
              <ul className="divide-y divide-white/5">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="px-6 py-4 hover:bg-moon-surface/50 transition-colors">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-moon-accent/10 text-moon-accent">
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-moon-text">
                          {activity.type === 'mod' ? 'Mod' : 'Preset'} <span className="font-bold">{activity.name}</span> {activity.action}
                        </p>
                        <p className="text-xs text-moon-muted">{activity.time}</p>
                      </div>
                      <div className="ml-auto">
                        <ArrowRight className="w-4 h-4 text-moon-muted" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-moon-text">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <button
                  onClick={action.action}
                  className="w-full p-4 text-left rounded-lg bg-moon-surface/30 backdrop-blur-sm hover:bg-moon-surface/50 transition-colors border border-white/5 hover:border-moon-accent/20 group"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-moon-accent/10 text-moon-accent group-hover:bg-moon-accent/20 transition-colors">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-moon-text">{action.name}</h3>
                      <p className="text-xs text-moon-muted">{action.description}</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Character Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-moon-text">Character Mods</h2>
            <button className="text-sm text-moon-accent hover:text-moon-accent/80 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockCharacters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full bg-moon-surface/30 backdrop-blur-sm hover:bg-moon-surface/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-moon-surface/50 flex items-center justify-center text-xl font-bold text-moon-text">
                        {character.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-moon-text">{character.name}</h3>
                        <div className="mt-1">
                          <div className="flex justify-between text-xs text-moon-muted mb-1">
                            <span>Mods</span>
                            <span>{character.mods.active} / {character.mods.total}</span>
                          </div>
                          <div className="w-full bg-moon-surface/30 rounded-full h-1.5">
                            <div 
                              className="bg-moon-accent h-1.5 rounded-full" 
                              style={{ width: `${(character.mods.active / character.mods.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-moon-text">Recent Presets</h2>
            <button className="text-sm text-moon-accent hover:text-moon-accent/80 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {mockPresets.map((preset, index) => (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="bg-moon-surface/30 backdrop-blur-sm hover:bg-moon-surface/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-moon-text">{preset.name}</h3>
                        <p className="text-xs text-moon-muted">{preset.modCount} mods • Last used {preset.lastUsed}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="border-moon-surface/30">
                          Edit
                        </Button>
                        <Button variant="accent" size="sm">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ModItem } from '../../../types/mods';
import { FiArrowLeft, FiImage, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ModCardPage: React.FC = () => {
  const { modId } = useParams<{ modId: string }>();
  const navigate = useNavigate();
  const [mod, setMod] = React.useState<ModItem | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdatingThumbnail, setIsUpdatingThumbnail] = React.useState(false);
  const [thumbnailInput, setThumbnailInput] = React.useState('');
  const [isEditingThumbnail, setIsEditingThumbnail] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  // Import the GetModResult type from electron.d.ts
  type GetModResult = {
    success: boolean;
    message?: string;
    mod?: ModItem;
  };

  // Fetch mod data
  React.useEffect(() => {
    const fetchMod = async () => {
      try {
        setIsLoading(true);
        // Call the getMod API
        const result = await window.electronAPI.mods.getMod(modId!);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to load mod');
        }
        
        if (!result.mod) {
          throw new Error('Mod not found');
        }
        
        const modData = result.mod;
        
        // Map the mod data to the ModItem interface
        const mappedMod: ModItem = createModWithThumbnail(
          {
            ...modData,
            isFavorite: false, // Default value for backward compatibility
            tags: [],
            dependencies: [],
            conflicts: [],
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            // Ensure all required properties are included
            id: modData.id,
            name: modData.name,
            enabled: modData.enabled,
            dir: modData.dir,
          },
          modData.thumbnailUrl || modData.thumbnailPath || ''
        );
        
        setMod(mappedMod);
        setThumbnailInput(getThumbnailUrl(mappedMod));
        setError(null);
      } catch (err) {
        console.error('Error fetching mod:', err);
        setError('Failed to load mod details');
      } finally {
        setIsLoading(false);
      }
    };

    if (modId) {
      fetchMod();
    }
  }, [modId]);

  const handleUpdateThumbnail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mod || !thumbnailInput.trim()) return;

    try {
      setIsUpdatingThumbnail(true);
      const result = await window.electronAPI.mods.updateModThumbnail(
        mod.id,
        thumbnailInput.trim()
      );
      
      if (result.success && result.mod) {
        // Map the updated mod to the expected ModItem type
        const updatedMod: ModItem = createModWithThumbnail(
          {
            ...result.mod,
            isFavorite: mod?.isFavorite || false,
            tags: mod?.tags || [],
            dependencies: mod?.dependencies || [],
            conflicts: mod?.conflicts || [],
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            // Ensure all required properties are included
            id: result.mod.id,
            name: result.mod.name,
            enabled: result.mod.enabled,
            dir: result.mod.dir,
          },
          result.mod.thumbnailUrl || result.mod.thumbnailPath || ''
        );
        
        setMod(updatedMod);
setThumbnailInput(updatedMod.thumbnailUrl || updatedMod.thumbnailPath || '');
        setIsEditingThumbnail(false);
        toast.success('Thumbnail updated successfully');
      } else {
        throw new Error(result.message || 'Failed to update thumbnail');
      }
    } catch (err) {
      console.error('Error updating thumbnail:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update thumbnail');
    } finally {
      setIsUpdatingThumbnail(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setThumbnailInput(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Helper function to get the thumbnail URL from a mod
  const getThumbnailUrl = (mod: ModItem | null): string => {
    if (!mod) return '';
    // Check all possible thumbnail properties in order of preference
    return mod.thumbnail || mod.thumbnailUrl || mod.thumbnailPath || '';
  };

  // Helper function to create a mod with updated thumbnail
  const createModWithThumbnail = (mod: ModItem, thumbnail: string): ModItem => {
    // Create a new mod object with the updated thumbnail
    const updatedMod: ModItem = {
      ...mod,
      // Update thumbnail URL and ensure it's set in the primary thumbnail field
      thumbnail: thumbnail || mod.thumbnail || mod.thumbnailUrl || mod.thumbnailPath || '',
      // Preserve other properties
      isFavorite: mod.isFavorite || false,
      tags: mod.tags || [],
      dependencies: mod.dependencies || [],
      conflicts: mod.conflicts || [],
      updatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    return updatedMod;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-moon-glowViolet"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-400 bg-moon-surface/20 rounded-xl">
        <p>Error loading mod: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <motion.button
          onClick={handleBack}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-moon-surface/50 text-moon-text border border-white/5 hover:border-moon-glowCyan/30 hover:bg-moon-surface/70 hover:shadow-moonGlowCyan/20 transition-all duration-300 mb-6"
          whileHover={{ x: -2 }}
        >
          <FiArrowLeft className="w-5 h-5 group-hover:text-moon-glowCyan transition-colors" />
          Back to Mods
        </motion.button>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Thumbnail Section */}
          <div className="w-full md:w-1/3">
            <div className="bg-moon-surface/20 backdrop-blur-sm border border-moon-surface/30 rounded-xl p-6 h-full">
              <div className="flex flex-col items-center">
                {mod && getThumbnailUrl(mod) ? (
                  <div className="relative group w-full">
                    <img
                      src={getThumbnailUrl(mod)}
                      alt={`${mod?.name || 'Mod'} thumbnail`}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <button
                        onClick={() => setIsEditingThumbnail(true)}
                        className="bg-moon-surface/80 hover:bg-moon-surface text-white p-2 rounded-full transition-colors"
                        title="Change thumbnail"
                      >
                        <FiImage className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-full h-48 bg-moon-surface/10 border-2 border-dashed border-moon-surface/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-moon-glowCyan/50 transition-colors mb-4"
                    onClick={() => setIsEditingThumbnail(true)}
                  >
                    <FiImage className="w-10 h-10 text-moon-text/40 mb-2" />
                    <p className="text-moon-text/60 text-sm">Click to add thumbnail</p>
                  </div>
                )}

                {isEditingThumbnail && (
                  <div className="w-full mt-4 p-4 bg-moon-surface/10 border border-moon-surface/30 rounded-lg">
                    <form onSubmit={handleUpdateThumbnail} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-moon-text/80 mb-1">
                          Thumbnail URL
                        </label>
                        <input
                          type="text"
                          value={thumbnailInput}
                          onChange={(e) => setThumbnailInput(e.target.value)}
                          placeholder="Enter image URL"
                          className="w-full px-3 py-2 bg-moon-surface/20 border border-moon-surface/30 rounded-lg text-moon-text focus:outline-none focus:ring-2 focus:ring-moon-glowViolet/50 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="text-center text-sm text-moon-text/60">
                        or
                      </div>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-moon-surface/20 hover:bg-moon-surface/30 border border-moon-surface/30 rounded-lg text-moon-text transition-colors"
                      >
                        <FiUpload className="w-4 h-4" />
                        Upload Image
                      </button>
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={isUpdatingThumbnail || !thumbnailInput.trim()}
                          className="flex-1 px-4 py-2 bg-moon-glowViolet/80 hover:bg-moon-glowViolet text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUpdatingThumbnail ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingThumbnail(false);
                            setThumbnailInput(mod?.thumbnail || '');
                          }}
                          className="px-4 py-2 border border-moon-surface/30 hover:bg-moon-surface/20 rounded-lg text-moon-text transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mod Details Section */}
          <div className="flex-1">
            <div className="bg-moon-surface/20 backdrop-blur-sm border border-moon-surface/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-moon-text mb-4">{mod?.name || 'Loading...'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-moon-text/60 mb-1">Mod ID</h3>
                  <p className="text-moon-text/80 break-all">{modId}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-moon-text/60 mb-1">Status</h3>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${mod?.enabled ? 'bg-green-400' : 'bg-moon-text/40'}`} />
                    <span className="text-moon-text/80">
                      {mod?.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                {mod?.author && (
                  <div>
                    <h3 className="text-sm font-medium text-moon-text/60 mb-1">Author</h3>
                    <p className="text-moon-text/80">{mod.author}</p>
                  </div>
                )}
                
                {mod?.version && (
                  <div>
                    <h3 className="text-sm font-medium text-moon-text/60 mb-1">Version</h3>
                    <p className="text-moon-text/80">{mod.version}</p>
                  </div>
                )}
                
                {mod?.character && (
                  <div>
                    <h3 className="text-sm font-medium text-moon-text/60 mb-1">Character</h3>
                    <p className="text-moon-text/80">{mod.character}</p>
                  </div>
                )}
              </div>
              
              {mod?.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-moon-text/60 mb-2">Description</h3>
                  <p className="text-moon-text/80 whitespace-pre-line">{mod.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModCardPage;

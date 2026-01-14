import { useState } from 'react';
import { 
  Image, 
  Pencil, 
  Grid3X3, 
  Upload, 
  Sparkles, 
  Settings2,
  ChevronDown,
  X
} from 'lucide-react';
import { CreativeStudioState, GeneratedImage, aiModels } from './types';
import { cn } from '@/lib/utils';

interface AdvancedEditPanelProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  onEdit: () => void;
  isEditing: boolean;
}

type EditModeType = 'generate' | 'edit' | 'variation';

export const AdvancedEditPanel = ({ 
  state, 
  onUpdate, 
  onEdit,
  isEditing 
}: AdvancedEditPanelProps) => {
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const editModes: { id: EditModeType; icon: typeof Image; label: string }[] = [
    { id: 'generate', icon: Image, label: 'Text to Image' },
    { id: 'edit', icon: Pencil, label: 'Edit Image' },
    { id: 'variation', icon: Grid3X3, label: 'Variations' },
  ];

  const handleModeChange = (mode: EditModeType) => {
    onUpdate({ editMode: mode });
    if (mode === 'generate') {
      onUpdate({ baseImage: null });
    }
  };

  const handleSelectFromGallery = (image: GeneratedImage) => {
    onUpdate({ baseImage: image, editMode: 'edit' });
  };

  const clearBaseImage = () => {
    onUpdate({ baseImage: null, editMode: 'generate' });
  };

  const selectedModel = aiModels.find(m => m.value === state.aiModel) || aiModels[0];

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Advanced Edit</h3>
            <p className="text-sm text-muted-foreground">Edit images or generate new ones</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Sidebar - Mode Selector */}
        <div className="flex flex-col gap-2 p-2 bg-secondary/50 rounded-xl border border-border">
          {editModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = state.editMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                title={mode.label}
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                  isActive 
                    ? "bg-accent text-accent-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Base Image Section (for edit/variation modes) */}
          {(state.editMode === 'edit' || state.editMode === 'variation') && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Base Image</label>
              
              {state.baseImage ? (
                <div className="relative group">
                  <div className="aspect-video w-full max-w-md rounded-xl overflow-hidden border border-border bg-secondary/30">
                    <img 
                      src={state.baseImage.imageUrl} 
                      alt="Base image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={clearBaseImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video w-full max-w-md rounded-xl border-2 border-dashed border-border bg-secondary/20 flex flex-col items-center justify-center gap-3 hover:border-accent/50 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Drop an image here</p>
                    <p className="text-xs text-muted-foreground">or select from the gallery below</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit Description */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {state.editMode === 'edit' 
                ? 'Describe the changes you want to make' 
                : state.editMode === 'variation'
                ? 'Describe variations to generate'
                : 'Describe what you want to create'
              }
            </label>
            <textarea
              value={state.editDescription}
              onChange={(e) => onUpdate({ editDescription: e.target.value })}
              placeholder={
                state.editMode === 'edit'
                  ? "e.g., Change the background to a beach scene with sunset lighting..."
                  : state.editMode === 'variation'
                  ? "e.g., Create variations with different color schemes..."
                  : "e.g., A product shot of white sneakers on marble surface..."
              }
              className="w-full h-24 px-4 py-3 bg-secondary/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm placeholder:text-muted-foreground"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Quick settings */}
            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm hover:bg-secondary transition-colors"
                >
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{selectedModel.label}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                
                {showModelDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-10">
                    {aiModels.map((model) => (
                      <button
                        key={model.value}
                        onClick={() => {
                          onUpdate({ aiModel: model.value });
                          setShowModelDropdown(false);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg",
                          model.value === state.aiModel && "bg-secondary"
                        )}
                      >
                        <div className="font-medium">{model.label}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Image count */}
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm">
                <span className="text-muted-foreground">Count:</span>
                <select
                  value={state.imageCount}
                  onChange={(e) => onUpdate({ imageCount: parseInt(e.target.value) })}
                  className="bg-transparent font-medium focus:outline-none cursor-pointer"
                >
                  {[1, 2, 4, 8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Settings button */}
              <button 
                className="w-9 h-9 flex items-center justify-center bg-secondary/50 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Advanced settings"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>

            {/* Generate Button */}
            <button
              onClick={onEdit}
              disabled={isEditing || (!state.editDescription.trim() && state.editMode !== 'variation')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-coral to-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              {isEditing ? 'Generating...' : (
                state.editMode === 'edit' ? 'Apply Edit' : 
                state.editMode === 'variation' ? 'Generate Variations' : 
                'Generate'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

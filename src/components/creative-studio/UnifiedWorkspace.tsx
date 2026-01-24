import { useState, useCallback, DragEvent } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  Image,
  Pencil,
  Grid3X3,
  Upload,
  X,
  Settings2,
  ChevronDown as ChevronDownIcon,
  GripVertical
} from 'lucide-react';
import { CreativeStudioState, GeneratedImage, aiModels, LogoPlacement } from './types';
import { GeneratedImagesGallery } from './GeneratedImagesGallery';
import { ImageDetailModal } from './ImageDetailModal';
import { cn } from '@/lib/utils';

interface UnifiedWorkspaceProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  images: GeneratedImage[];
  isGenerating: boolean;
  onEdit: () => void;
  onVariation: (image: GeneratedImage) => void;
  onEditImage: (image: GeneratedImage) => void;
  onDelete: (image: GeneratedImage) => void;
  onRegenerate?: () => void;
  isEditing: boolean;
  logoUrl?: string;
}

type EditModeType = 'generate' | 'edit' | 'variation';

export const UnifiedWorkspace = ({
  state,
  onUpdate,
  images,
  isGenerating,
  onEdit,
  onVariation,
  onEditImage,
  onDelete,
  onRegenerate,
  isEditing,
  logoUrl,
}: UnifiedWorkspaceProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  // Image detail modal state
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const editModes: { id: EditModeType; icon: typeof Image; label: string; shortLabel: string }[] = [
    { id: 'generate', icon: Image, label: 'Text to Image', shortLabel: 'Generate' },
    { id: 'edit', icon: Pencil, label: 'Edit Image', shortLabel: 'Edit' },
    { id: 'variation', icon: Grid3X3, label: 'Variations', shortLabel: 'Vary' },
  ];

  const handleModeChange = (mode: EditModeType) => {
    onUpdate({ editMode: mode });
    if (mode === 'generate') {
      onUpdate({ baseImage: null });
    }
    setIsExpanded(true);
  };

  const clearBaseImage = () => {
    onUpdate({ baseImage: null, editMode: 'generate' });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const imageData = e.dataTransfer.getData('application/json');
      if (imageData) {
        const image = JSON.parse(imageData) as GeneratedImage;
        onUpdate({ 
          baseImage: image, 
          editMode: 'edit',
          isEditPanelOpen: true 
        });
        setIsExpanded(true);
      }
    } catch (err) {
      console.error('Failed to parse dropped image data:', err);
    }
  };

  // Click on image shows detail modal, NOT immediate edit
  const handleImageClick = useCallback((image: GeneratedImage) => {
    setSelectedImage(image);
    setIsDetailModalOpen(true);
  }, []);

  // These actions come from the detail modal
  const handleVariationFromModal = useCallback((image: GeneratedImage) => {
    onVariation(image);
  }, [onVariation]);

  const handleEditFromModal = useCallback((image: GeneratedImage) => {
    // Set the image as base image for editing in the Quick Edit bar
    onUpdate({ 
      baseImage: image, 
      editMode: 'edit',
      isEditPanelOpen: true 
    });
    setIsExpanded(true);
  }, [onUpdate]);

  const handleDeleteFromModal = useCallback((image: GeneratedImage) => {
    onDelete(image);
  }, [onDelete]);

  const selectedModel = aiModels.find(m => m.value === state.aiModel) || aiModels[0];

  return (
    <div className="glass-card overflow-hidden">
      {/* Creative Tools Bar - Collapsible Header */}
      <div 
        className={cn(
          "border-b border-border transition-colors",
          isDragOver && "bg-accent/10 border-accent"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Collapsed State */}
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Creative Tools</h3>
                <p className="text-sm text-muted-foreground">
                  {isDragOver ? 'Drop image here to edit' : 'Generate, edit, or create variations'}
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        ) : (
          /* Expanded State */
          <div className="p-6 space-y-4">
            {/* Header with collapse button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Creative Tools</h3>
                  <p className="text-sm text-muted-foreground">Generate, edit images or create variations</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Main Edit Content */}
            <div className="flex gap-4">
              {/* Mode Selector - Vertical Sidebar */}
              <div className="flex flex-col gap-1.5 p-1.5 bg-secondary/50 rounded-xl border border-border">
                {editModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = state.editMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleModeChange(mode.id)}
                      title={mode.label}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                        isActive 
                          ? "bg-accent text-accent-foreground shadow-md" 
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              {/* Base Image / Drop Zone (for edit/variation modes) */}
              {(state.editMode === 'edit' || state.editMode === 'variation') && (
                <div 
                  className={cn(
                    "w-32 h-32 rounded-xl border-2 border-dashed flex-shrink-0 transition-all overflow-hidden",
                    isDragOver 
                      ? "border-accent bg-accent/10" 
                      : state.baseImage 
                        ? "border-border" 
                        : "border-border bg-secondary/20 hover:border-accent/50"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {state.baseImage ? (
                    <div className="relative w-full h-full group">
                      <img 
                        src={state.baseImage.imageUrl} 
                        alt="Base image"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={clearBaseImage}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center p-2">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground leading-tight">
                        {isDragOver ? 'Drop here' : 'Drag from gallery'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Prompt Input */}
              <div className="flex-1 flex flex-col gap-3">
                <textarea
                  value={state.editDescription}
                  onChange={(e) => onUpdate({ editDescription: e.target.value })}
                  placeholder={
                    state.editMode === 'edit'
                      ? "Describe the changes you want..."
                      : state.editMode === 'variation'
                      ? "Describe variation style..."
                      : "Describe what you want to create..."
                  }
                  className="w-full h-20 px-4 py-3 bg-secondary/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm placeholder:text-muted-foreground"
                />

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Model Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setShowModelDropdown(!showModelDropdown)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-xs hover:bg-secondary transition-colors"
                      >
                        <span className="text-muted-foreground">Model:</span>
                        <span className="font-medium">{selectedModel.label}</span>
                        <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
                      </button>
                      
                      {showModelDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-44 bg-popover border border-border rounded-lg shadow-lg z-20">
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
                              <div className="font-medium text-xs">{model.label}</div>
                              <div className="text-xs text-muted-foreground">{model.description}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Image count */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-xs">
                      <span className="text-muted-foreground">Count:</span>
                      <select
                        value={state.imageCount}
                        onChange={(e) => onUpdate({ imageCount: parseInt(e.target.value) })}
                        className="bg-transparent font-medium focus:outline-none cursor-pointer text-xs"
                      >
                        {[1, 2, 4, 8].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    {/* Settings button */}
                    <button 
                      className="w-8 h-8 flex items-center justify-center bg-secondary/50 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Advanced settings"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={onEdit}
                    disabled={isEditing || (!state.editDescription.trim() && state.editMode !== 'variation') || ((state.editMode === 'edit' || state.editMode === 'variation') && !state.baseImage)}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-coral to-primary text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isEditing ? 'Generating...' : (
                      state.editMode === 'edit' ? 'Apply Edit' : 
                      state.editMode === 'variation' ? 'Create Variations' : 
                      'Generate'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery Section */}
      <div className="p-6">
        <GeneratedImagesGallery
          images={images}
          isGenerating={isGenerating}
          imageCount={state.imageCount}
          onVariation={onVariation}
          onEdit={onEditImage}
          onDelete={onDelete}
          onRegenerate={onRegenerate}
          onSelectForEdit={handleImageClick}
          compact={true}
          enableDrag={true}
          logoPlacement={state.logoPlacement}
          logoUrl={logoUrl}
        />
      </div>

      {/* Image Detail Modal */}
      <ImageDetailModal
        image={selectedImage}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onVariation={handleVariationFromModal}
        onEdit={handleEditFromModal}
        onDelete={handleDeleteFromModal}
        logoPlacement={state.logoPlacement}
        logoUrl={logoUrl}
      />
    </div>
  );
};

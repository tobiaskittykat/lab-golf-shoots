import { useState, useCallback } from 'react';
import { GeneratedImage } from './types';
import { GeneratedImageCard, GeneratedImageCardSkeleton } from './GeneratedImageCard';
import { RefreshCw, Images, GripVertical, X } from 'lucide-react';

interface GeneratedImagesGalleryProps {
  images: GeneratedImage[];
  isGenerating: boolean;
  imageCount: number;
  onVariation: (image: GeneratedImage) => void;
  onEdit: (image: GeneratedImage) => void;
  onDelete: (image: GeneratedImage) => void;
  onRegenerate?: () => void;
  onSelectForEdit?: (image: GeneratedImage) => void;
  showBackButton?: boolean;
  onBack?: () => void;
  compact?: boolean;
  enableDrag?: boolean;
}

export const GeneratedImagesGallery = ({
  images,
  isGenerating,
  imageCount,
  onVariation,
  onEdit,
  onDelete,
  onRegenerate,
  onSelectForEdit,
  showBackButton = false,
  onBack,
  compact = false,
  enableDrag = false,
}: GeneratedImagesGalleryProps) => {
  const successfulImages = images.filter(img => img.status === 'completed');
  const failedImages = images.filter(img => img.status === 'failed');
  
  // Selection state
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  // Dismiss failed bar
  const [isFailedBarDismissed, setIsFailedBarDismissed] = useState(false);

  const handleToggleSelect = useCallback((image: GeneratedImage) => {
    setSelectedImageIds(prev => {
      const next = new Set(prev);
      if (next.has(image.id)) {
        next.delete(image.id);
      } else {
        next.add(image.id);
      }
      return next;
    });
  }, []);

  const handleRegenerateSelected = useCallback(() => {
    const selectedImages = images.filter(img => selectedImageIds.has(img.id) && img.status === 'completed');
    selectedImages.forEach(img => onVariation(img));
    setSelectedImageIds(new Set());
  }, [images, selectedImageIds, onVariation]);

  const hasSelection = selectedImageIds.size > 0;

  // Empty state
  if (!isGenerating && images.length === 0) {
    return (
      <div className={compact ? "" : "glass-card p-8"}>
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-3">
            <Images className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-base mb-1">No images yet</h3>
          <p className="text-muted-foreground text-sm">
            {compact ? 'Generate images to see them here' : 'Use the Creative Studio above to create your first images!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "glass-card p-6 space-y-6"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Images className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {successfulImages.length} image{successfulImages.length !== 1 ? 's' : ''}
            {hasSelection && (
              <span className="text-accent"> • {selectedImageIds.size} selected</span>
            )}
            {isGenerating && <span className="text-muted-foreground"> • Generating...</span>}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {enableDrag && successfulImages.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/50 rounded-md text-xs text-muted-foreground">
              <GripVertical className="w-3 h-3" />
              Drag to edit
            </div>
          )}
          
          {hasSelection && (
            <button
              onClick={() => setSelectedImageIds(new Set())}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
          
          <button
            onClick={hasSelection ? handleRegenerateSelected : onRegenerate}
            disabled={isGenerating || !hasSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs border border-border transition-all disabled:opacity-50"
            title={hasSelection ? `Regenerate ${selectedImageIds.size} selected` : 'Select images to regenerate'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate{hasSelection ? ` (${selectedImageIds.size})` : ''}
          </button>
        </div>
      </div>

      {/* Failed bar — dismissible */}
      {failedImages.length > 0 && !isFailedBarDismissed && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center justify-between">
          <span>{failedImages.length} image(s) failed to generate. You can try regenerating or adjust your settings.</span>
          <button
            onClick={() => setIsFailedBarDismissed(true)}
            className="ml-2 p-1 rounded hover:bg-destructive/20 transition-colors flex-shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {isGenerating && images.length === 0 ? (
          Array.from({ length: imageCount }).map((_, i) => (
            <GeneratedImageCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : (
          images.map((image) => (
            image.status === 'pending' ? (
              <GeneratedImageCardSkeleton key={image.id} />
            ) : (
              <GeneratedImageCard
                key={image.id}
                image={image}
                onVariation={onVariation}
                onEdit={onEdit}
                onDelete={(img) => {
                  onDelete(img);
                  // Remove from selection if deleted
                  setSelectedImageIds(prev => {
                    const next = new Set(prev);
                    next.delete(img.id);
                    return next;
                  });
                }}
                onSelect={onSelectForEdit}
                onToggleSelect={handleToggleSelect}
                isSelected={selectedImageIds.has(image.id)}
                enableDrag={enableDrag}
              />
            )
          ))
        )}
      </div>
    </div>
  );
};

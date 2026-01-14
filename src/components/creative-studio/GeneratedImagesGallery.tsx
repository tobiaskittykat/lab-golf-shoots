import { GeneratedImage } from './types';
import { GeneratedImageCard, GeneratedImageCardSkeleton } from './GeneratedImageCard';
import { RefreshCw, Images, MousePointerClick, GripVertical } from 'lucide-react';

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

  // Empty state - show different message based on context
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
          
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs border border-border transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {failedImages.length > 0 && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {failedImages.length} image(s) failed to generate. You can try regenerating or adjust your settings.
        </div>
      )}

      {/* Image Grid - 4 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {isGenerating && images.length === 0 ? (
          // Show skeleton cards while generating
          Array.from({ length: imageCount }).map((_, i) => (
            <GeneratedImageCardSkeleton key={`skeleton-${i}`} />
          ))
        ) : (
          // Show actual images
          images.map((image) => (
            <GeneratedImageCard
              key={image.id}
              image={image}
              onVariation={onVariation}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelectForEdit}
              enableDrag={enableDrag}
            />
          ))
        )}
      </div>
    </div>
  );
};

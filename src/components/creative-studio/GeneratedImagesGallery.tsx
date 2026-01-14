import { GeneratedImage } from './types';
import { GeneratedImageCard, GeneratedImageCardSkeleton } from './GeneratedImageCard';
import { RefreshCw, Images, MousePointerClick } from 'lucide-react';

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
}: GeneratedImagesGalleryProps) => {
  const successfulImages = images.filter(img => img.status === 'completed');
  const failedImages = images.filter(img => img.status === 'failed');

  // Empty state for persistent gallery
  if (!isGenerating && images.length === 0 && !compact) {
    return (
      <div className="glass-card p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <Images className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Your Generated Images</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Generated images will appear here. Use the Creative Studio above to create your first images!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-4" : "glass-card p-6 space-y-6"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
            <Images className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Generated Images</h3>
            <p className="text-sm text-muted-foreground">
              {successfulImages.length} image{successfulImages.length !== 1 ? 's' : ''} 
              {isGenerating && ` • Generating ${imageCount}...`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSelectForEdit && successfulImages.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-lg text-xs text-accent">
              <MousePointerClick className="w-3.5 h-3.5" />
              Click image to edit
            </div>
          )}
          
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
            />
          ))
        )}
      </div>
    </div>
  );
};

import { GeneratedImage } from './types';
import { GeneratedImageCard, GeneratedImageCardSkeleton } from './GeneratedImageCard';
import { ArrowLeft, RefreshCw, Images } from 'lucide-react';

interface GeneratedImagesGalleryProps {
  images: GeneratedImage[];
  isGenerating: boolean;
  imageCount: number;
  onVariation: (image: GeneratedImage) => void;
  onEdit: (image: GeneratedImage) => void;
  onDelete: (image: GeneratedImage) => void;
  onBack: () => void;
  onRegenerate: () => void;
}

export const GeneratedImagesGallery = ({
  images,
  isGenerating,
  imageCount,
  onVariation,
  onEdit,
  onDelete,
  onBack,
  onRegenerate,
}: GeneratedImagesGalleryProps) => {
  const successfulImages = images.filter(img => img.status === 'completed');
  const failedImages = images.filter(img => img.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to customize
          </button>
          
          <div className="flex items-center gap-2">
            <Images className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-lg">
              Generated Images
            </h3>
            <span className="text-sm text-muted-foreground">
              ({successfulImages.length} of {imageCount})
            </span>
          </div>
        </div>

        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          Regenerate All
        </button>
      </div>

      {/* Results Summary */}
      {failedImages.length > 0 && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {failedImages.length} image(s) failed to generate. You can try regenerating or adjust your settings.
        </div>
      )}

      {/* Image Grid - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            />
          ))
        )}
      </div>

      {/* Empty State */}
      {!isGenerating && images.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Images className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No images generated yet.</p>
          <p className="text-sm">Go back and click Generate to create images.</p>
        </div>
      )}
    </div>
  );
};

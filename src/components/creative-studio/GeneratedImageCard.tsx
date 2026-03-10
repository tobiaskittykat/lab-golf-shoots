// Stub - GeneratedImageCard
import { GeneratedImage } from './types';

interface GeneratedImageCardProps {
  image: GeneratedImage;
  onVariation?: (image: GeneratedImage) => void;
  onEdit?: (image: GeneratedImage) => void;
  onDelete?: (image: GeneratedImage) => void;
  onSelect?: (image: GeneratedImage) => void;
}

export const GeneratedImageCard = ({ image, onSelect }: GeneratedImageCardProps) => {
  return (
    <div
      className="rounded-lg overflow-hidden border border-border bg-card cursor-pointer hover:border-accent/40 transition-colors"
      onClick={() => onSelect?.(image)}
    >
      {image.imageUrl ? (
        <img src={image.imageUrl} alt={image.conceptTitle || 'Generated'} className="w-full aspect-square object-cover" loading="lazy" />
      ) : (
        <div className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground text-sm">
          {image.status === 'pending' ? 'Generating...' : 'Failed'}
        </div>
      )}
      {image.conceptTitle && (
        <div className="p-2">
          <p className="text-xs text-muted-foreground truncate">{image.conceptTitle}</p>
        </div>
      )}
    </div>
  );
};

export const GeneratedImageCardSkeleton = () => (
  <div className="rounded-lg overflow-hidden border border-border bg-card animate-pulse">
    <div className="w-full aspect-square bg-muted" />
    <div className="p-2">
      <div className="h-3 bg-muted rounded w-3/4" />
    </div>
  </div>
);

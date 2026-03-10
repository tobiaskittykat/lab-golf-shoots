// Stub - ImageDetailModal
import { GeneratedImage } from './types';

interface ImageDetailModalProps {
  image: GeneratedImage | null;
  isOpen: boolean;
  onClose: () => void;
  onVariation?: (image: GeneratedImage) => void;
  onEdit?: (image: GeneratedImage) => void;
  onDelete?: (image: GeneratedImage) => void;
}

export const ImageDetailModal = ({ image, isOpen, onClose }: ImageDetailModalProps) => {
  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl p-4 max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        {image.imageUrl && (
          <img src={image.imageUrl} alt={image.conceptTitle || 'Generated'} className="max-h-[70vh] object-contain rounded" />
        )}
        <div className="mt-4 space-y-2">
          {image.conceptTitle && <h3 className="font-semibold">{image.conceptTitle}</h3>}
          {image.prompt && <p className="text-sm text-muted-foreground">{image.prompt}</p>}
        </div>
        <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
          Close
        </button>
      </div>
    </div>
  );
};

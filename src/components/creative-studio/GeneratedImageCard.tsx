import { useState, DragEvent } from 'react';
import { Download, RefreshCw, Pencil, Trash2, Loader2, AlertTriangle, Check, GripVertical } from 'lucide-react';
import { GeneratedImage } from './types';
import { cn } from '@/lib/utils';

interface GeneratedImageCardProps {
  image: GeneratedImage;
  onVariation: (image: GeneratedImage) => void;
  onEdit: (image: GeneratedImage) => void;
  onDelete: (image: GeneratedImage) => void;
  onSelect?: (image: GeneratedImage) => void;
  enableDrag?: boolean;
}

export const GeneratedImageCard = ({ 
  image, 
  onVariation, 
  onEdit, 
  onDelete,
  onSelect,
  enableDrag = false
}: GeneratedImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (!enableDrag || image.status !== 'completed') {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('application/json', JSON.stringify(image));
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
    
    // Create a drag image
    const dragImage = document.createElement('div');
    dragImage.style.cssText = 'position: absolute; top: -1000px; left: -1000px;';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDownload = async () => {
    if (!image.imageUrl) return;
    
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getStatusBadge = () => {
    switch (image.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-muted-foreground text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating...
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs">
            <Check className="w-3 h-3" />
            Done
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs">
            <AlertTriangle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'nsfw':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs">
            <AlertTriangle className="w-3 h-3" />
            NSFW
          </span>
        );
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (onSelect && image.status === 'completed') {
      onSelect(image);
    }
  };

  const canDrag = enableDrag && image.status === 'completed';

  return (
    <div 
      className={cn(
        "group relative rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all",
        onSelect && image.status === 'completed' && 'cursor-pointer',
        isDragging && 'opacity-50 scale-95',
        canDrag && 'cursor-grab active:cursor-grabbing'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Image Container */}
      <div className="aspect-square relative bg-secondary/30">
        {image.status === 'pending' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">Generating...</span>
            </div>
          </div>
        ) : image.status === 'failed' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <span className="text-sm text-muted-foreground">
                {image.error || 'Generation failed'}
              </span>
            </div>
          </div>
        ) : image.status === 'nsfw' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 backdrop-blur-md">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <span className="text-sm text-muted-foreground">Content filtered</span>
            </div>
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <img
              src={image.imageUrl}
              alt={image.prompt}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        )}

        {/* Drag Handle Indicator */}
        {canDrag && isHovered && (
          <div className="absolute top-2 left-2 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-3 h-3" />
          </div>
        )}

        {/* Hover Overlay with Actions */}
        {isHovered && image.status === 'completed' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onVariation(image); }}
              className="p-2.5 rounded-full bg-white/90 hover:bg-white text-foreground transition-colors"
              title="Generate Variations"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(image); }}
              className="p-2.5 rounded-full bg-white/90 hover:bg-white text-foreground transition-colors"
              title="Edit Image"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="p-2.5 rounded-full bg-white/90 hover:bg-white text-foreground transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(image); }}
              className="p-2.5 rounded-full bg-white/90 hover:bg-white text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="p-3 space-y-2">
        {/* Truncated Prompt */}
        <p className="text-sm text-foreground line-clamp-2">
          {image.prompt || 'Generated image'}
        </p>

        {/* Status & References */}
        <div className="flex items-center justify-between">
          {getStatusBadge()}
          
          {/* Reference thumbnails */}
          {(image.productReferenceUrl || image.contextReferenceUrl) && (
            <div className="flex items-center gap-1">
              {image.productReferenceUrl && (
                <div 
                  className="w-5 h-5 rounded border border-border bg-secondary/50"
                  title="Product reference"
                />
              )}
              {image.contextReferenceUrl && (
                <div 
                  className="w-5 h-5 rounded border border-border bg-secondary/50"
                  title="Context reference"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton card for loading state
export const GeneratedImageCardSkeleton = () => (
  <div className="rounded-xl overflow-hidden border border-border bg-card animate-pulse">
    <div className="aspect-square bg-secondary/50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
    <div className="p-3 space-y-2">
      <div className="h-4 bg-secondary rounded w-3/4" />
      <div className="h-4 bg-secondary rounded w-1/2" />
    </div>
  </div>
);

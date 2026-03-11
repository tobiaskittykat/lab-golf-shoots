import { useState, DragEvent } from 'react';
import { Download, RefreshCw, Pencil, Trash2, Loader2, AlertTriangle, Check, GripVertical } from 'lucide-react';
import { GeneratedImage } from './types';
import { cn } from '@/lib/utils';
import { ProductIntegrityBadge } from './product-shoot/ProductIntegrityBadge';
import { ProductIntegrityResult } from './product-shoot/types';

interface GeneratedImageCardProps {
  image: GeneratedImage;
  onVariation: (image: GeneratedImage) => void;
  onEdit: (image: GeneratedImage) => void;
  onDelete: (image: GeneratedImage) => void;
  onSelect?: (image: GeneratedImage) => void;
  onToggleSelect?: (image: GeneratedImage) => void;
  isSelected?: boolean;
  enableDrag?: boolean;
  integrityResult?: ProductIntegrityResult;
  isAnalyzingIntegrity?: boolean;
}

export const GeneratedImageCard = ({ 
  image, 
  onVariation, 
  onEdit, 
  onDelete,
  onSelect,
  onToggleSelect,
  isSelected = false,
  enableDrag = false,
  integrityResult,
  isAnalyzingIntegrity = false,
}: GeneratedImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (!enableDrag || image.status !== 'completed') {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('application/json', JSON.stringify(image));
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
    
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
    
    setIsDownloading(true);
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
    } finally {
      setIsDownloading(false);
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

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    // Click card body = open detail/maximize modal
    if (onSelect && image.status === 'completed') {
      onSelect(image);
    }
  };

  const canDrag = enableDrag && image.status === 'completed';
  const isFailed = image.status === 'failed' || image.status === 'nsfw';

  return (
    <div 
      className={cn(
        "group relative rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all",
        isSelected 
          ? 'border-accent ring-2 ring-accent/30' 
          : 'border-border',
        (onToggleSelect || onSelect) && image.status === 'completed' && 'cursor-pointer',
        isDragging && 'opacity-50 scale-95',
        canDrag && !isSelected && 'cursor-grab active:cursor-grabbing'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      draggable={canDrag}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Selection Checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md">
          <Check className="w-3.5 h-3.5" />
        </div>
      )}

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
        {canDrag && isHovered && !isSelected && (
          <div className="absolute top-2 left-2 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-3 h-3" />
          </div>
        )}

        {/* Hover Overlay with Actions - for completed images */}
        {isHovered && image.status === 'completed' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onVariation(image); }}
              className="p-2.5 rounded-full bg-white/90 hover:bg-white text-foreground transition-colors"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="p-2.5 rounded-full bg-white/90 hover:bg-white text-foreground transition-colors"
              title="Download"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
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

        {/* Selection Checkbox - bottom-right corner */}
        {onToggleSelect && image.status === 'completed' && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(image); }}
            className={cn(
              "absolute bottom-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all",
              isSelected
                ? "bg-accent text-accent-foreground shadow-md"
                : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
            )}
            title={isSelected ? "Deselect" : "Select"}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Hover Overlay for failed/NSFW - just delete button */}
        {isHovered && isFailed && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity">
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
        <p className="text-sm text-foreground font-medium line-clamp-1">
          {image.conceptTitle || 'Generated Image'}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {image.prompt}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge()}

            {/* Pipeline step badge */}
            {image.settings && (image.settings as any).generationStep === 'color-swap' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Step 1 / Color
              </span>
            )}
            {image.settings && (image.settings as any).generationStep === 'mark-apply' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                Step 2 / Final
              </span>
            )}
            
            {(integrityResult || isAnalyzingIntegrity) && image.status === 'completed' && (
              <ProductIntegrityBadge
                result={integrityResult}
                isAnalyzing={isAnalyzingIntegrity}
                onRegenerate={() => onVariation(image)}
                compact
              />
            )}
          </div>
          
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

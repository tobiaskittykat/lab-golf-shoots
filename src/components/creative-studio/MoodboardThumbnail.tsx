import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { Check, Expand, ImageOff, Loader2, RefreshCw } from "lucide-react";
import { Moodboard } from "./types";

interface MoodboardThumbnailProps {
  moodboard: Moodboard;
  isSelected: boolean;
  onSelect: () => void;
  size?: 'default' | 'large';
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Build optimized thumbnail URL using Supabase's image transformation
const buildThumbnailUrl = (filePath: string | undefined, width: number = 400): string => {
  if (!filePath) return '';
  // Use Supabase's render endpoint for resized images
  return `${SUPABASE_URL}/storage/v1/render/image/public/moodboards/${filePath}?width=${width}&quality=80`;
};

// Build full-size URL for dialog view
const buildFullUrl = (filePath: string | undefined): string => {
  if (!filePath) return '';
  return `${SUPABASE_URL}/storage/v1/object/public/moodboards/${filePath}`;
};

export const MoodboardThumbnail = ({ 
  moodboard, 
  isSelected, 
  onSelect,
  size = 'default'
}: MoodboardThumbnailProps) => {
  const [isFullView, setIsFullView] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build URLs - prioritize direct thumbnail URL, fall back to filePath-based URLs
  const thumbnailUrl = moodboard.thumbnail || buildThumbnailUrl(moodboard.filePath, size === 'large' ? 600 : 400);
  const fullUrl = moodboard.thumbnail || buildFullUrl(moodboard.filePath);

  // Intersection Observer to detect visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Reset state when moodboard changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [moodboard.id, moodboard.filePath]);

  // Only start loading when visible or selected
  const shouldLoadImage = isVisible || isSelected;
  
  // Check if we have a valid URL to load
  const hasValidUrl = !!moodboard.filePath && !!thumbnailUrl;

  // Check if image is already cached
  useEffect(() => {
    if (!shouldLoadImage) return;
    
    // If no valid URL, immediately show error state
    if (!hasValidUrl) {
      setIsLoading(false);
      setImageError(true);
      return;
    }
    
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setIsLoading(false);
      setImageError(false);
    }
  }, [shouldLoadImage, thumbnailUrl, retryCount, hasValidUrl]);
  
  // Safety timeout: prevent stuck loading state (15 seconds)
  useEffect(() => {
    if (!shouldLoadImage || !hasValidUrl || !isLoading) return;
    
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn(`[MoodboardThumbnail] Load timeout for: ${moodboard.name}`);
        setImageError(true);
        setIsLoading(false);
      }
    }, 15000);
    
    return () => clearTimeout(timeout);
  }, [shouldLoadImage, hasValidUrl, isLoading, moodboard.name]);

  const handleImageError = useCallback(() => {
    console.warn(`[MoodboardThumbnail] Failed to load: ${moodboard.name}`);
    setImageError(true);
    setIsLoading(false);
  }, [moodboard.name]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageError(false);
  }, []);

  // Retry loading with cache-bust
  const handleRetry = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setImageError(false);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  }, []);

  const handleClick = () => {
    onSelect();
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullView(true);
  };

  const isLarge = size === 'large';

  // Add cache-bust for retries
  const currentThumbnailUrl = retryCount > 0 
    ? `${thumbnailUrl}&t=${Date.now()}` 
    : thumbnailUrl;

  return (
    <>
      <div
        ref={containerRef}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        className={`group relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-md cursor-pointer ${
          isLarge ? 'aspect-[4/3]' : 'aspect-[4/3]'
        } ${
          isSelected
            ? 'border-accent ring-2 ring-accent/30 shadow-md'
            : 'border-border hover:border-accent/50'
        }`}
      >
        {/* Loading state - only show if we have a valid URL to load */}
        {shouldLoadImage && isLoading && !imageError && hasValidUrl && (
          <div className="absolute inset-0 w-full h-full bg-secondary flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        )}

        {/* Background Image or Error State */}
        {imageError ? (
          <div 
            className="absolute inset-0 w-full h-full bg-secondary flex flex-col items-center justify-center gap-2 cursor-pointer"
            onClick={handleRetry}
          >
            <ImageOff className="w-8 h-8 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Image unavailable</span>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/10 hover:bg-accent/20 rounded text-accent transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        ) : shouldLoadImage && currentThumbnailUrl ? (
          <img 
            ref={imgRef}
            src={currentThumbnailUrl}
            alt={moodboard.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-secondary" />
        )}
        
        {/* Gradient overlay for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className={`absolute bottom-0 left-0 right-0 ${isLarge ? 'p-4' : 'p-2.5'} pointer-events-none`}>
          <h4 className={`font-medium text-white leading-tight ${isLarge ? 'text-sm' : 'text-xs'}`}>
            {moodboard.name}
          </h4>
          {isLarge && moodboard.description && (
            <p className="text-xs text-white/70 mt-1 line-clamp-2">{moodboard.description}</p>
          )}
        </div>

        {/* Selected check */}
        {isSelected && (
          <div className={`absolute ${isLarge ? 'top-3 right-3 w-6 h-6' : 'top-2 right-2 w-5 h-5'} rounded-full bg-accent flex items-center justify-center pointer-events-none`}>
            <Check className={isLarge ? 'w-4 h-4 text-accent-foreground' : 'w-3 h-3 text-accent-foreground'} />
          </div>
        )}

        {/* Expand button */}
        {!imageError && !isLoading && (
          <button
            onClick={handleExpandClick}
            className={`absolute ${isLarge ? 'top-3 left-3 w-7 h-7' : 'top-2 left-2 w-6 h-6'} rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70`}
          >
            <Expand className={isLarge ? 'w-4 h-4 text-white' : 'w-3 h-3 text-white'} />
          </button>
        )}
      </div>

      {/* Full View Dialog */}
      <Dialog open={isFullView} onOpenChange={setIsFullView}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
          {/* Image section - full quality */}
          <div className="bg-secondary flex-shrink-0 flex items-center justify-center">
            <img 
              src={fullUrl} 
              alt={moodboard.name}
              className="max-h-[45vh] w-full object-contain"
            />
          </div>
          
          {/* Content section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{moodboard.name}</h3>
              {moodboard.description && (
                <p className="text-sm text-muted-foreground mt-1">{moodboard.description}</p>
              )}
            </div>
            
            {/* Visual Analysis */}
            {moodboard.visualAnalysis && (
              <div className="space-y-4 pt-4 border-t border-border">
                {moodboard.visualAnalysis.emotional_tone && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mood</p>
                    <p className="text-sm">{moodboard.visualAnalysis.emotional_tone}</p>
                  </div>
                )}
                
                {moodboard.visualAnalysis.dominant_colors && moodboard.visualAnalysis.dominant_colors.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {moodboard.visualAnalysis.dominant_colors.map(color => (
                        <span key={color} className="px-2 py-1 bg-secondary rounded text-sm">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {moodboard.visualAnalysis.key_elements && moodboard.visualAnalysis.key_elements.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Key Elements</p>
                    <div className="flex flex-wrap gap-2">
                      {moodboard.visualAnalysis.key_elements.slice(0, 6).map(el => (
                        <span key={el} className="px-2 py-1 bg-accent/10 text-accent rounded text-sm">
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {moodboard.visualAnalysis.lighting_quality && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Lighting</p>
                      <p className="text-sm">{moodboard.visualAnalysis.lighting_quality}</p>
                    </div>
                  )}
                  {moodboard.visualAnalysis.textures && moodboard.visualAnalysis.textures.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Textures</p>
                      <p className="text-sm">{moodboard.visualAnalysis.textures.slice(0, 3).join(', ')}</p>
                    </div>
                  )}
                </div>
                
                {moodboard.visualAnalysis.best_for && moodboard.visualAnalysis.best_for.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Best For</p>
                    <div className="flex flex-wrap gap-2">
                      {moodboard.visualAnalysis.best_for.slice(0, 4).map(use => (
                        <span key={use} className="px-2 py-1 bg-secondary rounded text-xs">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

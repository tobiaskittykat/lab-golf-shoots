import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Expand, ImageOff, Loader2, RefreshCw } from "lucide-react";
import { Moodboard } from "./types";
import { cn } from "@/lib/utils";

interface MoodboardThumbnailProps {
  moodboard: Moodboard;
  isSelected: boolean;
  onSelect: () => void;
  size?: 'default' | 'large';
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Get direct public URL - no render endpoint (avoids Pro-only features)
const getImageUrl = (moodboard: Moodboard): string => {
  // Priority 1: Direct thumbnail URL from database
  if (moodboard.thumbnail) {
    return moodboard.thumbnail;
  }
  
  // Priority 2: Build public URL from filePath
  if (moodboard.filePath) {
    return `${SUPABASE_URL}/storage/v1/object/public/moodboards/${moodboard.filePath}`;
  }
  
  return '';
};

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

export const MoodboardThumbnail = ({ 
  moodboard, 
  isSelected, 
  onSelect,
  size = 'default'
}: MoodboardThumbnailProps) => {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [retryKey, setRetryKey] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const imageUrl = getImageUrl(moodboard);
  const isLarge = size === 'large';

  // Reset state when moodboard changes
  useEffect(() => {
    setLoadState('idle');
    setRetryKey(0);
  }, [moodboard.id, moodboard.thumbnail, moodboard.filePath]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Determine if we should render the image
  const shouldRenderImage = (isInView || isSelected) && imageUrl;

  // Cache-bust URL for retries
  const currentUrl = retryKey > 0 
    ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}` 
    : imageUrl;

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadState('idle');
    setRetryKey(k => k + 1);
  };

  const handleClick = () => {
    onSelect();
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullView(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Determine what to show
  const showSpinner = shouldRenderImage && loadState !== 'loaded' && loadState !== 'error';
  const showError = loadState === 'error' || (!imageUrl && isInView);
  const showImage = shouldRenderImage && !showError;

  return (
    <>
      <div
        ref={containerRef}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "group relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-md cursor-pointer aspect-[4/3]",
          isSelected
            ? "border-accent ring-2 ring-accent/30 shadow-md"
            : "border-border hover:border-accent/50"
        )}
      >
        {/* Background placeholder */}
        <div className="absolute inset-0 bg-secondary" />

        {/* Loading spinner */}
        {showSpinner && (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        )}

        {/* Error state */}
        {showError && (
          <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center gap-2 z-10">
            <ImageOff className="w-8 h-8 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Image unavailable</span>
            {imageUrl && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/10 hover:bg-accent/20 rounded text-accent transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* Image - hidden until loaded */}
        {showImage && (
          <img 
            src={currentUrl}
            alt={moodboard.name}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-200",
              loadState === 'loaded' ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setLoadState('loaded')}
            onError={() => setLoadState('error')}
            loading="lazy"
            decoding="async"
          />
        )}
        
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Name and description */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 pointer-events-none",
          isLarge ? "p-4" : "p-2.5"
        )}>
          <h4 className={cn(
            "font-medium text-white leading-tight",
            isLarge ? "text-sm" : "text-xs"
          )}>
            {moodboard.name}
          </h4>
          {isLarge && moodboard.description && (
            <p className="text-xs text-white/70 mt-1 line-clamp-2">
              {moodboard.description}
            </p>
          )}
        </div>

        {/* Selected checkmark */}
        {isSelected && (
          <div className={cn(
            "absolute rounded-full bg-accent flex items-center justify-center pointer-events-none",
            isLarge ? "top-3 right-3 w-6 h-6" : "top-2 right-2 w-5 h-5"
          )}>
            <Check className={cn(
              "text-accent-foreground",
              isLarge ? "w-4 h-4" : "w-3 h-3"
            )} />
          </div>
        )}

        {/* Expand button - only show when loaded */}
        {loadState === 'loaded' && (
          <button
            onClick={handleExpandClick}
            className={cn(
              "absolute rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70",
              isLarge ? "top-3 left-3 w-7 h-7" : "top-2 left-2 w-6 h-6"
            )}
          >
            <Expand className={cn(
              "text-white",
              isLarge ? "w-4 h-4" : "w-3 h-3"
            )} />
          </button>
        )}
      </div>

      {/* Full View Dialog */}
      <Dialog open={isFullView} onOpenChange={setIsFullView}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
          {/* Full-size image */}
          <div className="bg-secondary flex-shrink-0 flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt={moodboard.name}
              className="max-h-[45vh] w-full object-contain"
            />
          </div>
          
          {/* Content section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{moodboard.name}</h3>
              {moodboard.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {moodboard.description}
                </p>
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
                
                {moodboard.visualAnalysis.dominant_colors?.length > 0 && (
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
                
                {moodboard.visualAnalysis.key_elements?.length > 0 && (
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
                  {moodboard.visualAnalysis.textures?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Textures</p>
                      <p className="text-sm">{moodboard.visualAnalysis.textures.slice(0, 3).join(', ')}</p>
                    </div>
                  )}
                </div>
                
                {moodboard.visualAnalysis.best_for?.length > 0 && (
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

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { Check, Expand, ImageOff, Loader2, RefreshCw } from "lucide-react";
import { Moodboard } from "./types";
import { supabase } from "@/integrations/supabase/client";

interface MoodboardThumbnailProps {
  moodboard: Moodboard;
  isSelected: boolean;
  onSelect: () => void;
  size?: 'default' | 'large';
}

const LOAD_TIMEOUT_MS = 15000; // 15 seconds

export const MoodboardThumbnail = ({ 
  moodboard, 
  isSelected, 
  onSelect,
  size = 'default'
}: MoodboardThumbnailProps) => {
  const [isFullView, setIsFullView] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(moodboard.thumbnail || '');
  const [triedSigned, setTriedSigned] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout helper
  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Clear timeout on unmount
  useEffect(() => {
    return () => clearLoadTimeout();
  }, [clearLoadTimeout]);

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
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Reset state when moodboard changes
  useEffect(() => {
    clearLoadTimeout();
    setResolvedSrc(moodboard.thumbnail || '');
    setTriedSigned(false);
    setImageError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [moodboard.id, moodboard.thumbnail, clearLoadTimeout]);

  // In large gallery grids, avoid kicking off dozens of image requests at once.
  // Only start loading when the thumbnail is near/inside the viewport (or selected).
  const shouldLoadImage = isVisible || isSelected;

  // Check if image is already cached/complete, and start timeout when visible
  useEffect(() => {
    if (!shouldLoadImage) return; // Don't start timeout until we actually start loading
    
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      // Image already loaded (cached)
      setIsLoading(false);
      setImageError(false);
      return;
    }
    
    // Start timeout watchdog only when visible
    clearLoadTimeout();
    timeoutRef.current = setTimeout(() => {
      // If still loading after timeout, try signed URL or mark as error
      if (isLoading && !imageError) {
        console.warn(`[MoodboardThumbnail] Timeout loading: ${moodboard.name}`);
        handleImageError();
      }
    }, LOAD_TIMEOUT_MS);
    
    return () => clearLoadTimeout();
  }, [resolvedSrc, retryCount, shouldLoadImage, isLoading, imageError, moodboard.name, clearLoadTimeout]);

  // Handle image load error - try signed URL fallback
  const handleImageError = useCallback(async () => {
    clearLoadTimeout();
    
    if (!triedSigned && moodboard.filePath) {
      setTriedSigned(true);
      console.log(`[MoodboardThumbnail] Trying signed URL for: ${moodboard.name}`);
      try {
        const { data, error } = await supabase.storage
          .from('moodboards')
          .createSignedUrl(moodboard.filePath, 60 * 60 * 24 * 7); // 7 days
        
        if (data?.signedUrl && !error) {
          setResolvedSrc(data.signedUrl);
          setIsLoading(true); // Reset loading for new URL attempt
          return; // Don't set error, let the new URL try to load
        }
      } catch (err) {
        console.error('[MoodboardThumbnail] Failed to create signed URL:', err);
      }
    }
    setImageError(true);
    setIsLoading(false);
  }, [triedSigned, moodboard.filePath, moodboard.name, clearLoadTimeout]);

  const handleImageLoad = useCallback(() => {
    clearLoadTimeout();
    setIsLoading(false);
    setImageError(false);
  }, [clearLoadTimeout]);

  // Retry loading (cache-bust)
  const handleRetry = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    clearLoadTimeout();
    setImageError(false);
    setIsLoading(true);
    setTriedSigned(false);
    setRetryCount(prev => prev + 1);

    // Add cache-bust param (prefer current resolvedSrc, fallback to moodboard.thumbnail)
    const base = (resolvedSrc || moodboard.thumbnail || '').split('?')[0];
    if (base) {
      setResolvedSrc(`${base}?t=${Date.now()}`);
      return;
    }

    // If we somehow have no public URL, try a signed URL from storage.
    if (moodboard.filePath) {
      setTriedSigned(true);
      try {
        const { data, error } = await supabase.storage
          .from('moodboards')
          .createSignedUrl(moodboard.filePath, 60 * 60 * 24 * 7);
        if (data?.signedUrl && !error) {
          setResolvedSrc(data.signedUrl);
          return;
        }
      } catch (err) {
        console.error('[MoodboardThumbnail] Retry signed URL failed:', err);
      }
    }

    // Nothing we can do (should be very rare) — show error state.
    setImageError(true);
    setIsLoading(false);
  }, [moodboard.filePath, moodboard.thumbnail, resolvedSrc, clearLoadTimeout]);

  // Toggle selection - clicking selected moodboard deselects it
  const handleClick = () => {
    onSelect(); // Parent will handle toggle logic
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullView(true);
  };

  const isLarge = size === 'large';

  return (
    <>
      {/* Use div with role="button" to avoid nested button issues */}
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
        {/* Loading state */}
        {shouldLoadImage && isLoading && !imageError && (
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
        ) : shouldLoadImage ? (
          <img 
            ref={imgRef}
            src={resolvedSrc}
            alt={moodboard.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading={size === 'large' ? 'lazy' : 'eager'}
            decoding="async"
            referrerPolicy="no-referrer"
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

        {/* Expand button - only show if image loaded */}
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
          {/* Image section - uncropped */}
          <div className="bg-secondary flex-shrink-0 flex items-center justify-center">
            <img 
              src={resolvedSrc} 
              alt={moodboard.name}
              className="max-h-[45vh] w-full object-contain"
            />
          </div>
          
          {/* Content section - scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{moodboard.name}</h3>
              {moodboard.description && (
                <p className="text-sm text-muted-foreground mt-1">{moodboard.description}</p>
              )}
            </div>
            
            {/* Visual Analysis - only if available */}
            {moodboard.visualAnalysis && (
              <div className="space-y-4 pt-4 border-t border-border">
                {/* Emotional Tone */}
                {moodboard.visualAnalysis.emotional_tone && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mood</p>
                    <p className="text-sm">{moodboard.visualAnalysis.emotional_tone}</p>
                  </div>
                )}
                
                {/* Color Palette */}
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
                
                {/* Key Elements */}
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
                
                {/* Lighting & Textures */}
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
                
                {/* Best For */}
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

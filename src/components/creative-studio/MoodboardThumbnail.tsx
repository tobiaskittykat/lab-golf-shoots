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

const getImageUrl = (moodboard: Moodboard): string => {
  if (moodboard.thumbnail) return moodboard.thumbnail;
  if (moodboard.filePath) return `${SUPABASE_URL}/storage/v1/object/public/moodboards/${moodboard.filePath}`;
  return '';
};

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

export const MoodboardThumbnail = ({ moodboard, isSelected, onSelect, size = 'default' }: MoodboardThumbnailProps) => {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [retryKey, setRetryKey] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageUrl = getImageUrl(moodboard);
  const isLarge = size === 'large';

  useEffect(() => { setLoadState('idle'); setRetryKey(0); }, [moodboard.id, moodboard.thumbnail, moodboard.filePath]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsInView(true); }, { rootMargin: '100px', threshold: 0.1 });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const shouldRenderImage = (isInView || isSelected) && imageUrl;
  const currentUrl = retryKey > 0 ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : imageUrl;

  const handleRetry = (e: React.MouseEvent) => { e.stopPropagation(); setLoadState('idle'); setRetryKey(k => k + 1); };
  const handleExpandClick = (e: React.MouseEvent) => { e.stopPropagation(); setIsFullView(true); };

  const showSpinner = shouldRenderImage && loadState !== 'loaded' && loadState !== 'error';
  const showError = loadState === 'error' || (!imageUrl && isInView);
  const showImage = shouldRenderImage && !showError;

  return (
    <>
      <div ref={containerRef} role="button" tabIndex={0} onClick={onSelect} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
        className={cn("group relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-md cursor-pointer aspect-[4/3]", isSelected ? "border-accent ring-2 ring-accent/30 shadow-md" : "border-border hover:border-accent/50")}>
        <div className="absolute inset-0 bg-secondary" />
        {showSpinner && <div className="absolute inset-0 bg-secondary flex items-center justify-center z-10"><Loader2 className="w-6 h-6 text-muted-foreground animate-spin" /></div>}
        {showError && (
          <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center gap-2 z-10">
            <ImageOff className="w-8 h-8 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Image unavailable</span>
            {imageUrl && <button onClick={handleRetry} className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/10 hover:bg-accent/20 rounded text-accent transition-colors"><RefreshCw className="w-3 h-3" />Retry</button>}
          </div>
        )}
        {showImage && <img src={currentUrl} alt={moodboard.name} className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-200", loadState === 'loaded' ? 'opacity-100' : 'opacity-0')} onLoad={() => setLoadState('loaded')} onError={() => setLoadState('error')} loading="lazy" decoding="async" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className={cn("absolute bottom-0 left-0 right-0 pointer-events-none", isLarge ? "p-4" : "p-2.5")}>
          <h4 className={cn("font-medium text-white leading-tight", isLarge ? "text-sm" : "text-xs")}>{moodboard.name}</h4>
          {isLarge && moodboard.description && <p className="text-xs text-white/70 mt-1 line-clamp-2">{moodboard.description}</p>}
        </div>
        {isSelected && <div className={cn("absolute rounded-full bg-accent flex items-center justify-center pointer-events-none", isLarge ? "top-3 right-3 w-6 h-6" : "top-2 right-2 w-5 h-5")}><Check className={cn("text-accent-foreground", isLarge ? "w-4 h-4" : "w-3 h-3")} /></div>}
        {loadState === 'loaded' && <button onClick={handleExpandClick} className={cn("absolute rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70", isLarge ? "top-3 left-3 w-7 h-7" : "top-2 left-2 w-6 h-6")}><Expand className={cn("text-white", isLarge ? "w-4 h-4" : "w-3 h-3")} /></button>}
      </div>

      <Dialog open={isFullView} onOpenChange={setIsFullView}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
          <div className="bg-secondary flex-shrink-0 flex items-center justify-center">
            <img src={imageUrl} alt={moodboard.name} className="max-h-[45vh] w-full object-contain" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{moodboard.name}</h3>
              {moodboard.description && <p className="text-sm text-muted-foreground mt-1">{moodboard.description}</p>}
            </div>
            {moodboard.visualAnalysis && (
              <div className="space-y-4 pt-4 border-t border-border">
                {moodboard.visualAnalysis.emotional_tone && <div><p className="text-xs text-muted-foreground mb-1">Mood</p><p className="text-sm">{moodboard.visualAnalysis.emotional_tone}</p></div>}
                {(moodboard.visualAnalysis.dominant_colors?.length ?? 0) > 0 && (
                  <div><p className="text-xs text-muted-foreground mb-2">Colors</p><div className="flex flex-wrap gap-2">{moodboard.visualAnalysis.dominant_colors!.map(color => <span key={color} className="px-2 py-1 bg-secondary rounded text-sm">{color}</span>)}</div></div>
                )}
                {(moodboard.visualAnalysis.key_elements?.length ?? 0) > 0 && (
                  <div><p className="text-xs text-muted-foreground mb-2">Key Elements</p><div className="flex flex-wrap gap-2">{moodboard.visualAnalysis.key_elements!.slice(0, 6).map(el => <span key={el} className="px-2 py-1 bg-accent/10 text-accent rounded text-sm">{el}</span>)}</div></div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

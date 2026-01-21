import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, Expand, Loader2 } from "lucide-react";
import { ReferenceImage } from "./types";
import { cn } from "@/lib/utils";

interface ReferenceThumbnailProps {
  reference: ReferenceImage;
  isSelected: boolean;
  onSelect: () => void;
  showLabel?: boolean;
}

export const ReferenceThumbnail = ({ 
  reference, 
  isSelected, 
  onSelect,
  showLabel = false
}: ReferenceThumbnailProps) => {
  const [isFullView, setIsFullView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      <button
        onClick={onSelect}
        className={cn(
          "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:shadow-md",
          isSelected
            ? 'border-accent ring-1 ring-accent/30 shadow-md'
            : 'border-border hover:border-accent/50'
        )}
      >
        {/* Loading state */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-secondary/50 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Image */}
        <img
          src={reference.thumbnail}
          alt={reference.name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity",
            isLoaded && !hasError ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
        />

        {/* Fallback when image fails to load */}
        {hasError && (
          <div className="absolute inset-0 bg-secondary flex items-center justify-center p-2">
            <span className="text-xs text-muted-foreground text-center line-clamp-3">
              {reference.name}
            </span>
          </div>
        )}

        {/* Gradient overlay for label */}
        {showLabel && !hasError && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-white truncate">
              {reference.name}
            </span>
          </>
        )}

        {/* Selected check */}
        {isSelected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-3 h-3 text-accent-foreground" />
          </div>
        )}

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullView(true);
          }}
          className="absolute top-1.5 left-1.5 w-5 h-5 rounded bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          <Expand className="w-2.5 h-2.5 text-white" />
        </button>
      </button>

      {/* Full View Dialog */}
      <Dialog open={isFullView} onOpenChange={setIsFullView}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <img 
            src={reference.url || reference.thumbnail} 
            alt={reference.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full max-h-[70vh] object-contain bg-secondary"
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg">{reference.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{reference.category} reference</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

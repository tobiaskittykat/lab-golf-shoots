import { GeneratedImage } from "./types";
import { Download, RefreshCw, Heart, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GeneratedImageCardProps {
  image: GeneratedImage;
  onVariation?: (image: GeneratedImage) => void;
  onEdit?: (image: GeneratedImage) => void;
  onDelete?: (image: GeneratedImage) => void;
  onSelect?: (image: GeneratedImage) => void;
}

export const GeneratedImageCard = ({ image, onVariation, onSelect }: GeneratedImageCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!image.imageUrl) return;
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kittykat-${image.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const handleVariation = (e: React.MouseEvent) => {
    e.stopPropagation();
    onVariation?.(image);
  };

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden border border-border bg-card cursor-pointer transition-all group",
        "hover:border-accent/40 hover:shadow-md"
      )}
      onClick={() => onSelect?.(image)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square">
        {image.imageUrl ? (
          <img
            src={image.imageUrl}
            alt={image.conceptTitle || "Generated"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2">
            {image.status === "pending" ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Generating...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6" />
                <span className="text-xs">Failed</span>
              </>
            )}
          </div>
        )}

        {/* Hover overlay with actions */}
        {image.imageUrl && isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-end justify-end p-2 gap-1.5 transition-opacity">
            <button
              onClick={handleDownload}
              className="w-8 h-8 rounded-lg bg-white/90 text-foreground flex items-center justify-center hover:bg-white transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            {onVariation && (
              <button
                onClick={handleVariation}
                className="w-8 h-8 rounded-lg bg-white/90 text-foreground flex items-center justify-center hover:bg-white transition-colors"
                title="Variation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* NSFW badge */}
        {image.status === "nsfw" && (
          <div className="absolute inset-0 bg-muted/90 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Content filtered</span>
          </div>
        )}
      </div>

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

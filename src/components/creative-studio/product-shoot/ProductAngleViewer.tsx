import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseSkuDisplayInfo, formatSkuAttributes } from "@/lib/skuDisplayUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductAngleViewerProps {
  skuId: string;
  skuName: string;
  compositeImageUrl?: string | null;
  onEditClick: () => void;
}

export const ProductAngleViewer = ({
  skuId,
  skuName,
  compositeImageUrl,
  onEditClick,
}: ProductAngleViewerProps) => {
  const [activeAngleId, setActiveAngleId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: angles = [], isLoading } = useQuery({
    queryKey: ['sku-angles-preview', skuId],
    queryFn: async () => {
      const { data } = await supabase
        .from('scraped_products')
        .select('id, thumbnail_url, full_url, angle')
        .eq('sku_id', skuId)
        .order('created_at', { ascending: true });
      return data || [];
    },
    staleTime: 60000,
  });

  // Default to 3/4 angle on load / when angles change
  useEffect(() => {
    if (angles.length === 0) {
      setActiveAngleId(null);
      return;
    }
    const threeQuarter = angles.find(a => a.angle === '3/4');
    setActiveAngleId(threeQuarter?.id || angles[0].id);
  }, [angles]);

  const displayInfo = parseSkuDisplayInfo(skuName);
  const attributes = formatSkuAttributes(displayInfo);

  const activeAngle = angles.find(a => a.id === activeAngleId);
  const bigImageUrl = activeAngle?.thumbnail_url || compositeImageUrl;
  const fullResUrl = activeAngle?.full_url || activeAngle?.thumbnail_url || compositeImageUrl;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="w-10 h-10 rounded-lg" />
          ))}
        </div>
        <Skeleton className="w-full aspect-square rounded-xl" />
      </div>
    );
  }

  // No angles — just show composite with name
  if (angles.length === 0 && !compositeImageUrl) return null;

  return (
    <div className="space-y-2">
      {/* Angle strip + edit button */}
      {angles.length > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1.5 flex-1 overflow-x-auto">
            {angles.map(angle => (
              <button
                key={angle.id}
                onClick={() => setActiveAngleId(angle.id)}
                className={cn(
                  "relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                  activeAngleId === angle.id
                    ? "border-accent ring-1 ring-accent/30"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <img
                  src={angle.thumbnail_url}
                  alt={angle.angle || 'Product angle'}
                  className="w-full h-full object-cover"
                />
                {angle.angle && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-0.5 py-px">
                    <span className="text-[7px] text-white truncate block capitalize leading-tight">
                      {angle.angle}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={onEditClick}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Big thumbnail — clickable for fullscreen */}
      {bigImageUrl && (
        <button
          onClick={() => setIsFullscreen(true)}
          className="group relative w-full rounded-xl overflow-hidden border border-border bg-muted cursor-zoom-in"
        >
          <img
            src={bigImageUrl}
            alt={skuName}
            className="w-full aspect-square object-cover"
          />
          <div className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand className="w-3.5 h-3.5 text-white" />
          </div>
          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <span className="text-sm text-white font-medium block">
              {displayInfo.modelName}
            </span>
            {attributes && (
              <span className="text-xs text-white/80 block">
                {attributes}
              </span>
            )}
          </div>
        </button>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{skuName}</DialogTitle>
            <DialogDescription>Full size product image</DialogDescription>
          </DialogHeader>
          {fullResUrl && (
            <img
              src={fullResUrl}
              alt={skuName}
              className="w-full max-h-[80vh] object-contain bg-secondary"
            />
          )}
          <div className="p-4">
            <h3 className="font-semibold text-lg">{displayInfo.modelName}</h3>
            {attributes && (
              <p className="text-sm text-muted-foreground mt-1">{attributes}</p>
            )}
            {activeAngle?.angle && (
              <p className="text-xs text-muted-foreground mt-1 capitalize">{activeAngle.angle} view</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

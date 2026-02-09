import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseSkuDisplayInfo, formatSkuAttributes } from "@/lib/skuDisplayUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductAnglePreviewProps {
  skuId: string;
  skuName: string;
  onEditClick?: () => void;
}

export const ProductAnglePreview = ({ skuId, skuName, onEditClick }: ProductAnglePreviewProps) => {
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
  const featuredUrl = activeAngle?.thumbnail_url;
  const fullResUrl = activeAngle?.full_url || activeAngle?.thumbnail_url;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">{displayInfo.modelName}</div>
        <Skeleton className="w-full h-[140px] rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-14 h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (angles.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No angles available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header: name + edit button */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-foreground">{displayInfo.modelName}</div>
          {attributes && (
            <div className="text-xs text-muted-foreground">{attributes}</div>
          )}
        </div>
        {onEditClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
          >
            <Pencil className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Featured image — clickable for fullscreen */}
      {featuredUrl && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(true);
          }}
          className="group relative w-full rounded-lg overflow-hidden border border-border bg-muted cursor-zoom-in"
        >
          <img
            src={featuredUrl}
            alt={skuName}
            className="w-full h-[140px] object-cover"
          />
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand className="w-3 h-3 text-white" />
          </div>
        </button>
      )}

      {/* Angle strip */}
      <div className="flex gap-1.5 flex-wrap max-w-[280px]">
        {angles.map(angle => (
          <button
            key={angle.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveAngleId(angle.id);
            }}
            className={cn(
              "relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
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

      {/* Angle count */}
      <div className="text-xs text-muted-foreground">
        {angles.length} angle{angles.length !== 1 ? 's' : ''}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{skuName}</DialogTitle>
            <DialogDescription>Full size product image</DialogDescription>
          </DialogHeader>
          {fullResUrl && (
            <img
              src={fullResUrl}
              alt={skuName}
              className="w-full max-h-[70vh] object-contain bg-secondary"
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

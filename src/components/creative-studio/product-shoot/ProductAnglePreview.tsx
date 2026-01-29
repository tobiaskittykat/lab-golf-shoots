import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseSkuDisplayInfo, formatSkuAttributes } from "@/lib/skuDisplayUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductAnglePreviewProps {
  skuId: string;
  skuName: string;
}

export const ProductAnglePreview = ({ skuId, skuName }: ProductAnglePreviewProps) => {
  const { data: angles = [], isLoading } = useQuery({
    queryKey: ['sku-angles-preview', skuId],
    queryFn: async () => {
      const { data } = await supabase
        .from('scraped_products')
        .select('id, thumbnail_url, angle')
        .eq('sku_id', skuId)
        .order('created_at', { ascending: true });
      
      return data || [];
    },
    staleTime: 60000, // Cache for 1 minute
  });

  const displayInfo = parseSkuDisplayInfo(skuName);
  const attributes = formatSkuAttributes(displayInfo);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">{displayInfo.modelName}</div>
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
      <div>
        <div className="text-sm font-medium text-foreground">{displayInfo.modelName}</div>
        {attributes && (
          <div className="text-xs text-muted-foreground">{attributes}</div>
        )}
      </div>
      <div className="flex gap-2 flex-wrap max-w-[280px]">
        {angles.map(angle => (
          <div 
            key={angle.id} 
            className="relative w-14 h-14 rounded-lg overflow-hidden border border-border bg-muted"
          >
            <img 
              src={angle.thumbnail_url} 
              alt={angle.angle || 'Product angle'}
              className="w-full h-full object-cover"
            />
            {angle.angle && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                <span className="text-[9px] text-white truncate block capitalize">
                  {angle.angle}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {angles.length} angle{angles.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

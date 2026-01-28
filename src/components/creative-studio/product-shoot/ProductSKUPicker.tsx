import React, { useState } from 'react';
import { Plus, Package, ChevronDown, ChevronRight, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartUploadModal } from './SmartUploadModal';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';

export interface ProductSKU {
  id: string;
  name: string;
  sku_code: string | null;
  composite_image_url: string | null;
  brand_id: string | null;
  angles: Array<{
    id: string;
    thumbnail_url: string;
    angle: string | null;
  }>;
}

interface ProductSKUPickerProps {
  selectedSkuId: string | null;
  onSelectSku: (sku: ProductSKU | null) => void;
  onCreateNew: () => void;
}

export function ProductSKUPicker({ selectedSkuId, onSelectSku, onCreateNew }: ProductSKUPickerProps) {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const [expandedSkus, setExpandedSkus] = useState<Set<string>>(new Set());
  const [smartUploadOpen, setSmartUploadOpen] = useState(false);

  // Fetch SKUs with their linked product angles
  const { data: skus = [], isLoading } = useQuery({
    queryKey: ['product-skus', user?.id, currentBrand?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch SKUs
      let query = supabase
        .from('product_skus')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }

      const { data: skuData, error: skuError } = await query;
      if (skuError) throw skuError;

      // Fetch products linked to SKUs
      const skuIds = skuData?.map(s => s.id) || [];
      if (skuIds.length === 0) return [];

      const { data: products, error: prodError } = await supabase
        .from('scraped_products')
        .select('id, thumbnail_url, angle, sku_id')
        .in('sku_id', skuIds);

      if (prodError) throw prodError;

      // Group products by SKU
      const skusWithAngles: ProductSKU[] = (skuData || []).map(sku => ({
        id: sku.id,
        name: sku.name,
        sku_code: sku.sku_code,
        composite_image_url: sku.composite_image_url,
        brand_id: sku.brand_id,
        angles: (products || [])
          .filter(p => p.sku_id === sku.id)
          .map(p => ({
            id: p.id,
            thumbnail_url: p.thumbnail_url,
            angle: p.angle,
          })),
      }));

      return skusWithAngles;
    },
    enabled: !!user?.id,
  });

  const toggleExpanded = (skuId: string) => {
    setExpandedSkus(prev => {
      const next = new Set(prev);
      if (next.has(skuId)) {
        next.delete(skuId);
      } else {
        next.add(skuId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Smart Upload Button */}
      <Button
        variant="default"
        className="w-full justify-center gap-2"
        onClick={() => setSmartUploadOpen(true)}
      >
        <Sparkles className="w-4 h-4" />
        Smart Upload
      </Button>

      {/* Create New SKU Button */}
      <Button
        variant="outline"
        className="w-full justify-start gap-2 border-dashed"
        onClick={onCreateNew}
      >
        <Plus className="w-4 h-4" />
        Create New Product SKU
      </Button>

      {/* Smart Upload Modal */}
      <SmartUploadModal open={smartUploadOpen} onOpenChange={setSmartUploadOpen} />

      {/* SKU List */}
      {skus.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No product SKUs yet</p>
          <p className="text-xs">Create one to group multiple product angles</p>
        </div>
      ) : (
        skus.map((sku) => {
          const isSelected = selectedSkuId === sku.id;
          const isExpanded = expandedSkus.has(sku.id);

          return (
            <Collapsible key={sku.id} open={isExpanded} onOpenChange={() => toggleExpanded(sku.id)}>
              <Card
                className={`transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-accent border-accent' : 'hover:border-accent/40'
                }`}
                onClick={() => onSelectSku(isSelected ? null : sku)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Composite Preview or Mini Grid */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {sku.composite_image_url ? (
                        <img
                          src={sku.composite_image_url}
                          alt={sku.name}
                          className="w-full h-full object-cover"
                        />
                      ) : sku.angles.length > 0 ? (
                        <div className="grid grid-cols-2 gap-0.5 p-0.5 h-full">
                          {sku.angles.slice(0, 4).map((angle, i) => (
                            <div key={angle.id} className="bg-muted-foreground/10 overflow-hidden">
                              <img
                                src={angle.thumbnail_url}
                                alt={angle.angle || `Angle ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* SKU Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{sku.name}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-accent flex-shrink-0" />
                        )}
                      </div>
                      {sku.sku_code && (
                        <div className="text-xs text-muted-foreground">{sku.sku_code}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {sku.angles.length} angle{sku.angles.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Expand Toggle */}
                    {sku.angles.length > 0 && (
                      <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Expanded Angles Grid */}
              <CollapsibleContent>
                <div className="pl-4 pt-2">
                  <div className="grid grid-cols-4 gap-2">
                    {sku.angles.map((angle) => (
                      <div
                        key={angle.id}
                        className="aspect-square rounded-lg overflow-hidden bg-muted relative"
                      >
                        <img
                          src={angle.thumbnail_url}
                          alt={angle.angle || 'Product angle'}
                          className="w-full h-full object-cover"
                        />
                        {angle.angle && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-0.5 px-1 text-center truncate">
                            {angle.angle}
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Open add angle modal
                      }}
                      className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-accent/50 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })
      )}
    </div>
  );
}

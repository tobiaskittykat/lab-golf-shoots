import React, { useState, useEffect } from 'react';
import { Plus, Package, ChevronDown, ChevronRight, Check, Image as ImageIcon, Sparkles, Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SmartUploadModal } from './SmartUploadModal';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';

export interface ProductSKU {
  id: string;
  name: string;
  sku_code: string | null;
  composite_image_url: string | null;
  brand_id: string | null;
  last_used_at: string | null;
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
  autoSelectLastUsed?: boolean;
}

export function ProductSKUPicker({ selectedSkuId, onSelectSku, onCreateNew, autoSelectLastUsed = true }: ProductSKUPickerProps) {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const queryClient = useQueryClient();
  const [expandedSkus, setExpandedSkus] = useState<Set<string>>(new Set());
  const [smartUploadOpen, setSmartUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Fetch SKUs with their linked product angles - ordered by last_used_at
  const { data: skus = [], isLoading } = useQuery({
    queryKey: ['product-skus', user?.id, currentBrand?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch SKUs ordered by last_used_at DESC NULLS LAST, then created_at
      let query = supabase
        .from('product_skus')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false, nullsFirst: false });

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
        last_used_at: sku.last_used_at,
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

  // Auto-select most recently used product on mount
  useEffect(() => {
    if (autoSelectLastUsed && !hasAutoSelected && skus.length > 0 && !selectedSkuId) {
      // Find first SKU with last_used_at set, or fall back to first one
      const lastUsedSku = skus.find(s => s.last_used_at) || skus[0];
      if (lastUsedSku) {
        onSelectSku(lastUsedSku);
        setHasAutoSelected(true);
      }
    }
  }, [skus, selectedSkuId, autoSelectLastUsed, hasAutoSelected, onSelectSku]);

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

  // Filter SKUs by search query
  const filteredSkus = skus.filter(sku => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      sku.name.toLowerCase().includes(query) ||
      (sku.sku_code?.toLowerCase().includes(query))
    );
  });

  // Separate recently used (top 5 with last_used_at) from rest
  const recentlyUsed = filteredSkus.filter(s => s.last_used_at).slice(0, 5);
  const otherSkus = filteredSkus.filter(s => !recentlyUsed.some(r => r.id === s.id));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const renderSkuCard = (sku: ProductSKU, showRecentBadge = false) => {
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
                  {showRecentBadge && (
                    <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
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
  };

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

      {/* Search Input */}
      {skus.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

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
        <div className="space-y-4">
          {/* Recently Used Section */}
          {recentlyUsed.length > 0 && !searchQuery && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Recently Used</span>
              </div>
              <div className="space-y-2">
                {recentlyUsed.map(sku => renderSkuCard(sku, true))}
              </div>
            </div>
          )}

          {/* All Products Section */}
          {otherSkus.length > 0 && (
            <div className="space-y-2">
              {recentlyUsed.length > 0 && !searchQuery && (
                <div className="text-xs text-muted-foreground">All Products</div>
              )}
              <div className="space-y-2">
                {otherSkus.map(sku => renderSkuCard(sku))}
              </div>
            </div>
          )}

          {/* No results message */}
          {searchQuery && filteredSkus.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No products match "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to update last_used_at timestamp
export async function updateSkuLastUsed(skuId: string): Promise<void> {
  try {
    await supabase
      .from('product_skus')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', skuId);
  } catch (error) {
    console.error('Failed to update SKU last_used_at:', error);
  }
}

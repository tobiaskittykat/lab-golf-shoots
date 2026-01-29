import React, { useState, useMemo, useCallback, useRef } from 'react';
import { X, Search, Package, Clock, ChevronRight, Check, Sparkles, Plus, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';
import { ProductSKU } from './ProductSKUPicker';
import { parseSkuDisplayInfo, formatSkuSubtitle } from '@/lib/skuDisplayUtils';

interface ProductPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSkuId: string | null;
  onSelectSku: (sku: ProductSKU) => void;
  onCreateNew: () => void;
  onSmartUpload: () => void;
}

// Default categories for ungrouped products
const DEFAULT_CATEGORY = 'Uncategorized';

export function ProductPickerModal({
  open,
  onOpenChange,
  selectedSkuId,
  onSelectSku,
  onCreateNew,
  onSmartUpload,
}: ProductPickerModalProps) {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch SKUs with their linked product angles and description
  const { data: skus = [], isLoading } = useQuery({
    queryKey: ['product-skus-modal', user?.id, currentBrand?.id],
    queryFn: async () => {
      if (!user?.id) return [];

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

      const skuIds = skuData?.map(s => s.id) || [];
      if (skuIds.length === 0) return [];

      const { data: products, error: prodError } = await supabase
        .from('scraped_products')
        .select('id, thumbnail_url, angle, sku_id')
        .in('sku_id', skuIds);

      if (prodError) throw prodError;

      const skusWithAngles: (ProductSKU & { description?: any })[] = (skuData || []).map(sku => ({
        id: sku.id,
        name: sku.name,
        sku_code: sku.sku_code,
        composite_image_url: sku.composite_image_url,
        brand_id: sku.brand_id,
        last_used_at: sku.last_used_at,
        category: sku.category || DEFAULT_CATEGORY,
        description: sku.description,
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
    enabled: !!user?.id && open,
  });

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    skus.forEach(sku => cats.add((sku as any).category || DEFAULT_CATEGORY));
    return Array.from(cats).sort();
  }, [skus]);

  // Recently used products (top 5)
  const recentlyUsed = useMemo(() => {
    return skus.filter(s => s.last_used_at).slice(0, 5);
  }, [skus]);

  // Filter SKUs by search and category
  const filteredSkus = useMemo(() => {
    let result = skus;
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(sku =>
        sku.name.toLowerCase().includes(query) ||
        sku.sku_code?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(sku => 
        ((sku as any).category || DEFAULT_CATEGORY) === selectedCategory
      );
    }
    
    return result;
  }, [skus, searchQuery, selectedCategory]);

  // Group by category for display
  const groupedSkus = useMemo(() => {
    const groups: Record<string, ProductSKU[]> = {};
    
    filteredSkus.forEach(sku => {
      const cat = (sku as any).category || DEFAULT_CATEGORY;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(sku);
    });
    
    return groups;
  }, [filteredSkus]);

  const handleSelect = useCallback((sku: ProductSKU) => {
    onSelectSku(sku);
    onOpenChange(false);
  }, [onSelectSku, onOpenChange]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  // Product row component for virtualized list
  const ProductRow = ({ sku, showRecent = false }: { sku: ProductSKU; showRecent?: boolean }) => {
    const isSelected = selectedSkuId === sku.id;
    const displayInfo = parseSkuDisplayInfo(sku.name, (sku as any).description);
    const subtitle = formatSkuSubtitle(displayInfo);
    
    return (
      <button
        onClick={() => handleSelect(sku)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
          isSelected 
            ? 'bg-accent/10 ring-2 ring-accent' 
            : 'hover:bg-muted/50'
        }`}
      >
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {sku.composite_image_url ? (
            <img
              src={sku.composite_image_url}
              alt={sku.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : sku.angles[0]?.thumbnail_url ? (
            <img
              src={sku.angles[0].thumbnail_url}
              alt={sku.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{displayInfo.modelName}</span>
            {isSelected && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
            {showRecent && <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {subtitle && <span className="text-foreground/70">{subtitle}</span>}
            {subtitle && sku.angles.length > 1 && <span>•</span>}
            {sku.angles.length > 1 && (
              <span>{sku.angles.length} angles</span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Select Product
          </DialogTitle>
        </DialogHeader>

        {/* Search & Actions */}
        <div className="px-6 py-4 border-b border-border space-y-3 flex-shrink-0 bg-background">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filter chips */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  !selectedCategory 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => {
                onOpenChange(false);
                onSmartUpload();
              }}
            >
              <Sparkles className="w-4 h-4" />
              Smart Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                onOpenChange(false);
                onCreateNew();
              }}
            >
              <Plus className="w-4 h-4" />
              Create New SKU
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="px-6 py-4 space-y-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : skus.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="font-medium text-foreground">No products yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload product images to get started
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="default" size="sm" onClick={() => { onOpenChange(false); onSmartUpload(); }}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Smart Upload
                  </Button>
                </div>
              </div>
            ) : filteredSkus.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="font-medium text-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different search term
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={handleClearSearch}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                {/* Recently Used - only show when not filtering */}
                {!searchQuery && !selectedCategory && recentlyUsed.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      <Clock className="w-3 h-3" />
                      Recently Used
                    </div>
                    <div className="space-y-1">
                      {recentlyUsed.map(sku => (
                        <ProductRow key={sku.id} sku={sku} showRecent />
                      ))}
                    </div>
                  </div>
                )}

                {/* Grouped by Category */}
                {Object.entries(groupedSkus).map(([category, categorySkus]) => {
                  // Skip recently used items in main list when showing Recent section
                  const displaySkus = (!searchQuery && !selectedCategory && recentlyUsed.length > 0)
                    ? categorySkus.filter(sku => !recentlyUsed.some(r => r.id === sku.id))
                    : categorySkus;
                  
                  if (displaySkus.length === 0) return null;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {category}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {displaySkus.length}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {displaySkus.map(sku => (
                          <ProductRow key={sku.id} sku={sku} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer with count */}
        <div className="px-6 py-3 border-t border-border bg-muted/30 flex-shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            {filteredSkus.length} of {skus.length} products
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { X, Search, Package, Clock, ChevronRight, Check, Sparkles, Plus, Filter, Pencil, ChevronLeft } from 'lucide-react';
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
import { EditSKUModal } from './EditSKUModal';
import { ShoeComponentsPanel } from './ShoeComponentsPanel';
import { useShoeComponents, useComponentOverrides } from '@/hooks/useShoeComponents';
import { ComponentType, ComponentOverrides, ShoeComponents } from '@/lib/birkenstockMaterials';

interface ProductPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSkuId: string | null;
  onSelectSku: (sku: ProductSKU, components?: ShoeComponents | null, overrides?: ComponentOverrides, attachReferenceImages?: boolean) => void;
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
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Component customization state
  const [selectedSku, setSelectedSku] = useState<ProductSKU | null>(null);
  const [attachReferenceImages, setAttachReferenceImages] = useState(true);
  
  // Fetch shoe components for selected SKU
  const { 
    components, 
    isLoading: isLoadingComponents, 
    isAnalyzing, 
    triggerAnalysis,
    error: componentsError,
  } = useShoeComponents({ skuId: selectedSku?.id });
  
  // Component overrides state
  const { 
    overrides, 
    setComponentOverride, 
    resetOverrides, 
    hasOverrides,
  } = useComponentOverrides(components);
  
  // Reset selection when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedSku(null);
      resetOverrides();
      setAttachReferenceImages(true);
    }
  }, [open, resetOverrides]);

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

  // Handle initial SKU selection (show customization panel)
  const handleInitialSelect = useCallback((sku: ProductSKU) => {
    setSelectedSku(sku);
    resetOverrides();
  }, [resetOverrides]);
  
  // Handle final confirmation with customization
  const handleConfirmSelection = useCallback(() => {
    if (selectedSku) {
      onSelectSku(selectedSku, components, hasOverrides ? overrides : undefined, attachReferenceImages);
      onOpenChange(false);
    }
  }, [selectedSku, components, overrides, hasOverrides, attachReferenceImages, onSelectSku, onOpenChange]);
  
  // Handle back to list
  const handleBackToList = useCallback(() => {
    setSelectedSku(null);
    resetOverrides();
  }, [resetOverrides]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  // Product row component for list
  const ProductRow = ({ sku, showRecent = false }: { sku: ProductSKU; showRecent?: boolean }) => {
    const isSelected = selectedSkuId === sku.id;
    const displayInfo = parseSkuDisplayInfo(sku.name, (sku as any).description);
    const subtitle = formatSkuSubtitle(displayInfo);
    
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleInitialSelect(sku)}
          className={`flex-1 flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
            selectedSkuId === sku.id 
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
              {selectedSkuId === sku.id && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
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
        
        {/* Edit button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingSkuId(sku.id);
          }}
          className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          title="Edit product"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header - changes based on selection state */}
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {selectedSku ? (
              <>
                <button
                  onClick={handleBackToList}
                  className="p-1 -ml-1 rounded hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <Package className="w-5 h-5" />
                Customize Product
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Select Product
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {selectedSku ? (
          /* ========== CUSTOMIZATION VIEW ========== */
          <>
            <ScrollArea className="flex-1">
              <div className="px-6 py-4 space-y-6">
                {/* Selected product info */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {selectedSku.composite_image_url ? (
                      <img
                        src={selectedSku.composite_image_url}
                        alt={selectedSku.name}
                        className="w-full h-full object-cover"
                      />
                    ) : selectedSku.angles[0]?.thumbnail_url ? (
                      <img
                        src={selectedSku.angles[0].thumbnail_url}
                        alt={selectedSku.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{parseSkuDisplayInfo(selectedSku.name, (selectedSku as any).description).modelName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedSku.angles.length} angle{selectedSku.angles.length !== 1 ? 's' : ''} available
                    </p>
                    {selectedSku.sku_code && (
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        SKU: {selectedSku.sku_code}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shoe Components Panel */}
                <ShoeComponentsPanel
                  components={components}
                  overrides={overrides}
                  onOverrideChange={setComponentOverride}
                  onResetAll={resetOverrides}
                  attachReferenceImages={attachReferenceImages}
                  onAttachReferenceImagesChange={setAttachReferenceImages}
                  isLoading={isLoadingComponents}
                  isAnalyzing={isAnalyzing}
                  onTriggerAnalysis={triggerAnalysis}
                  error={componentsError}
                />
              </div>
            </ScrollArea>

            {/* Footer with confirm button */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex-shrink-0 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBackToList}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Products
              </Button>
              <Button
                onClick={handleConfirmSelection}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Select Product
                {hasOverrides && <Badge variant="secondary" className="text-[10px] px-1.5">Modified</Badge>}
              </Button>
            </div>
          </>
        ) : (
          /* ========== PRODUCT LIST VIEW ========== */
          <>
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
          </>
        )}
      </DialogContent>

      {/* Edit SKU Modal */}
      {editingSkuId && (
        <EditSKUModal
          open={!!editingSkuId}
          onClose={() => setEditingSkuId(null)}
          skuId={editingSkuId}
        />
      )}
    </Dialog>
  );
}

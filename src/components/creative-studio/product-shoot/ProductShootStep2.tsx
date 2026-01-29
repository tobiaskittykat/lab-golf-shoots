import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight, ImageIcon, Camera, Package, Settings2, Clock, Check, Pencil } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BackgroundSelector } from "./BackgroundSelector";
import { ProductSKU } from "./ProductSKUPicker";
import { ProductPickerModal } from "./ProductPickerModal";
import { SmartUploadModal } from "./SmartUploadModal";
import { CreateSKUModal } from "./CreateSKUModal";
import { EditSKUModal } from "./EditSKUModal";
import { ShotTypeVisualSelector } from "./ShotTypeVisualSelector";
import { OnFootConfigurator } from "./OnFootConfigurator";
import { LifestyleConfigurator } from "./LifestyleConfigurator";
import { ProductFocusConfigurator } from "./ProductFocusConfigurator";
import { ProductAnglePreview } from "./ProductAnglePreview";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import { useQuery } from "@tanstack/react-query";
import { parseSkuDisplayInfo, formatSkuAttributes } from "@/lib/skuDisplayUtils";
import { 
  ProductShootState, 
  initialProductShootState,
  initialOnFootConfig,
  initialLifestyleConfig,
  initialProductFocusConfig,
} from "./types";
import { aspectRatios, resolutions } from "../types";

interface ProductShootStep2Props {
  state: ProductShootState;
  onStateChange: (updates: Partial<ProductShootState>) => void;
  // Product selection from parent (legacy single image)
  selectedProduct?: {
    id: string;
    name: string;
    thumbnailUrl: string;
  };
  onProductSelect?: () => void;
  // Output settings from parent CreativeStudioState
  imageCount: number;
  resolution: string;
  aspectRatio: string;
  sequentialGeneration: boolean;
  onOutputSettingsChange: (updates: { 
    imageCount?: number; 
    resolution?: string; 
    aspectRatio?: string;
    sequentialGeneration?: boolean; 
  }) => void;
}

export const ProductShootStep2 = ({
  state,
  onStateChange,
  selectedProduct,
  onProductSelect,
  imageCount,
  resolution,
  aspectRatio,
  sequentialGeneration,
  onOutputSettingsChange,
}: ProductShootStep2Props) => {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  
  const [openSections, setOpenSections] = useState({
    product: true,
    background: true,
    shotType: true,
    output: true,
  });
  
  const [showProductPickerModal, setShowProductPickerModal] = useState(false);
  const [showSmartUploadModal, setShowSmartUploadModal] = useState(false);
  const [showCreateSKUModal, setShowCreateSKUModal] = useState(false);
  const [showEditSKUModal, setShowEditSKUModal] = useState(false);
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<ProductSKU | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  
  // Track stable display order for inline product grid (decoupled from DB query order)
  const [displayedSkuIds, setDisplayedSkuIds] = useState<string[]>([]);
  
  // Cache for SKU data (for products selected from modal that aren't in recentSkus)
  const [skuCache, setSkuCache] = useState<Map<string, ProductSKU>>(new Map());

  // Fetch top 3 SKUs for inline display (prioritize recently used, then newest)
  const { data: recentSkus = [] } = useQuery({
    queryKey: ['recent-skus-inline', user?.id, currentBrand?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Build base query for SKUs
      let query = supabase
        .from('product_skus')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }
      
      const { data: skus } = await query;
      if (!skus || skus.length === 0) return [];
      
      // For each SKU, fetch the first angle's thumbnail as fallback image
      const skusWithImages = await Promise.all(
        skus.map(async (sku) => {
          if (sku.composite_image_url) {
            return { ...sku, display_image_url: sku.composite_image_url };
          }
          // Get first angle's thumbnail
          const { data: angles } = await supabase
            .from('scraped_products')
            .select('thumbnail_url')
            .eq('sku_id', sku.id)
            .limit(1);
          
          return {
            ...sku,
            display_image_url: angles?.[0]?.thumbnail_url || null,
          };
        })
      );
      
      return skusWithImages;
    },
    enabled: !!user?.id,
  });

  // Fetch the selected SKU if we have a selectedProductId but no selectedSku object
  const { data: fetchedSku } = useQuery({
    queryKey: ['selected-sku', state.selectedProductId],
    queryFn: async () => {
      if (!state.selectedProductId || !user?.id) return null;
      
      const { data: sku } = await supabase
        .from('product_skus')
        .select('*')
        .eq('id', state.selectedProductId)
        .maybeSingle();
      
      if (!sku) return null;
      
      const { data: angles } = await supabase
        .from('scraped_products')
        .select('id, thumbnail_url, angle')
        .eq('sku_id', sku.id);
      
      return {
        id: sku.id,
        name: sku.name,
        sku_code: sku.sku_code,
        composite_image_url: sku.composite_image_url,
        brand_id: sku.brand_id,
        last_used_at: sku.last_used_at,
        angles: (angles || []).map(a => ({
          id: a.id,
          thumbnail_url: a.thumbnail_url,
          angle: a.angle,
        })),
      } as ProductSKU;
    },
    enabled: !!state.selectedProductId && !selectedSku && !!user?.id,
  });

  // Sync fetchedSku to local state
  useEffect(() => {
    if (fetchedSku && !selectedSku) {
      setSelectedSku(fetchedSku);
    }
  }, [fetchedSku, selectedSku]);

  // Initialize displayedSkuIds from database query (only once on first load)
  useEffect(() => {
    if (displayedSkuIds.length === 0 && recentSkus.length > 0) {
      setDisplayedSkuIds(recentSkus.slice(0, 3).map(s => s.id));
    }
  }, [recentSkus, displayedSkuIds.length]);

  // Auto-select the most recently used product if none selected
  useEffect(() => {
    if (!hasAutoSelected && recentSkus.length > 0 && !state.selectedProductId) {
      const mostRecent = recentSkus[0];
      handleSkuSelect({
        id: mostRecent.id,
        name: mostRecent.name,
        sku_code: mostRecent.sku_code,
        composite_image_url: mostRecent.composite_image_url,
        brand_id: mostRecent.brand_id,
        last_used_at: mostRecent.last_used_at,
        angles: [],
      }, false); // Auto-select doesn't change display order
      setHasAutoSelected(true);
    }
  }, [recentSkus, state.selectedProductId, hasAutoSelected]);
  
  // Build displayed products from stable order (with cache fallback)
  const displayedProducts = useMemo(() => {
    if (displayedSkuIds.length === 0) return recentSkus.slice(0, 3);
    
    return displayedSkuIds
      .map(id => {
        // First try to find in recentSkus
        const fromRecent = recentSkus.find(s => s.id === id);
        if (fromRecent) return fromRecent;
        
        // Fall back to cache (for products selected from modal)
        const fromCache = skuCache.get(id);
        if (fromCache) {
          return {
            id: fromCache.id,
            name: fromCache.name,
            sku_code: fromCache.sku_code,
            composite_image_url: fromCache.composite_image_url,
            brand_id: fromCache.brand_id,
            last_used_at: fromCache.last_used_at,
            display_image_url: fromCache.composite_image_url || fromCache.angles?.[0]?.thumbnail_url,
            description: null,
          };
        }
        
        return null;
      })
      .filter(Boolean) as typeof recentSkus;
  }, [displayedSkuIds, recentSkus, skuCache]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Check if shot type needs a model
  const needsModel = !['flat-lay', 'product-focus'].includes(state.productShotType);

  const handleSkuSelect = (sku: ProductSKU, fromModal: boolean = false) => {
    setSelectedSku(sku);
    onStateChange({
      selectedProductId: sku.id,
      recoloredProductUrl: sku.composite_image_url || sku.angles[0]?.thumbnail_url,
    });
    
    // Only update display order if selecting from modal (Browse More)
    if (fromModal) {
      // Cache the SKU data for display
      setSkuCache(prev => {
        const next = new Map(prev);
        next.set(sku.id, sku);
        return next;
      });
      
      // Move new selection to front, keep existing order for rest
      setDisplayedSkuIds(prev => {
        const newOrder = [sku.id, ...prev.filter(id => id !== sku.id)].slice(0, 3);
        return newOrder;
      });
    }
  };

  const handleClearProduct = () => {
    setSelectedSku(null);
    onStateChange({ selectedProductId: undefined, recoloredProductUrl: undefined });
  };

  const handleSkuCreated = (skuId: string) => {
    // Will refetch via query invalidation
  };

  const SectionHeader = ({ 
    icon: Icon, 
    title, 
    section,
    badge,
  }: { 
    icon: typeof Camera; 
    title: string; 
    section: keyof typeof openSections;
    badge?: string;
  }) => (
    <CollapsibleTrigger 
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-4 hover:bg-muted/50 rounded-xl transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        <span className="font-medium text-foreground">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      {openSections[section] ? (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </CollapsibleTrigger>
  );

  // Get display info for product section badge
  const getProductBadge = () => {
    if (selectedSku) return selectedSku.name;
    if (selectedProduct) return selectedProduct.name;
    return undefined;
  };

  // Get the current product image URL for display
  const getCurrentProductImage = () => {
    if (state.recoloredProductUrl) return state.recoloredProductUrl;
    if (selectedSku?.composite_image_url) return selectedSku.composite_image_url;
    if (selectedSku?.angles[0]?.thumbnail_url) return selectedSku.angles[0].thumbnail_url;
    if (selectedProduct?.thumbnailUrl) return selectedProduct.thumbnailUrl;
    return null;
  };

  const currentProductImage = getCurrentProductImage();
  const currentProductName = selectedSku?.name || selectedProduct?.name;

  return (
    <div className="space-y-4 mt-8">
      {/* Product Selection with SKU Picker */}
      <Collapsible open={openSections.product}>
        <div id="section-ps-product" className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader 
            icon={Package} 
            title="Product" 
            section="product"
            badge={getProductBadge()}
          />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {/* Always show product grid - no conditional switch */}
              <div className="space-y-3">
                {/* Recent Products Grid */}
                {displayedProducts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Your Products
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {displayedProducts.map(sku => {
                        const isSelected = state.selectedProductId === sku.id;
                        const imageUrl = (sku as any).display_image_url || sku.composite_image_url;
                        const displayInfo = parseSkuDisplayInfo(sku.name, sku.description as any);
                        const attributes = formatSkuAttributes(displayInfo);
                        
                        return (
                          <HoverCard key={sku.id} openDelay={300} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <button
                                onClick={() => handleSkuSelect({
                                  id: sku.id,
                                  name: sku.name,
                                  sku_code: sku.sku_code,
                                  composite_image_url: sku.composite_image_url,
                                  brand_id: sku.brand_id,
                                  last_used_at: sku.last_used_at,
                                  angles: [],
                                }, false)} // Inline click does NOT change display order
                                className={cn(
                                  "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                                  isSelected 
                                    ? "border-accent ring-2 ring-accent/30" 
                                    : "border-transparent hover:border-muted-foreground/30"
                                )}
                              >
                                {imageUrl ? (
                                  <img src={imageUrl} alt={sku.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Package className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                                {/* Selection indicator */}
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                                {/* Name overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                  <span className="text-xs text-white font-medium truncate block">
                                    {displayInfo.modelName}
                                  </span>
                                  {attributes && (
                                    <span className="text-[10px] text-white/80 truncate block">
                                      {attributes}
                                    </span>
                                  )}
                                </div>
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent 
                              side="top" 
                              align="center" 
                              className="w-auto p-3"
                              sideOffset={8}
                            >
                              <ProductAnglePreview skuId={sku.id} skuName={sku.name} />
                            </HoverCardContent>
                          </HoverCard>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Product Info Row */}
                {selectedSku && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{selectedSku.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {selectedSku.sku_code && <span className="truncate">{selectedSku.sku_code}</span>}
                        {selectedSku.sku_code && selectedSku.angles?.length > 0 && <span>•</span>}
                        {selectedSku.angles?.length > 0 && (
                          <span>{selectedSku.angles.length} angle{selectedSku.angles.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Browse All Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowProductPickerModal(true)}
                >
                  Browse All Products...
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Shot Type - Visual Selector */}
      <Collapsible open={openSections.shotType}>
        <div id="section-ps-shot-type" className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader 
            icon={Camera} 
            title="Shot Type" 
            section="shotType"
          />
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <ShotTypeVisualSelector
                selectedType={state.productShotType}
                onSelect={(type) => onStateChange({ productShotType: type })}
              />
              
              {/* Shot-type-specific options */}
              {state.productShotType === 'on-foot' && (
                <OnFootConfigurator
                  config={state.onFootConfig || initialOnFootConfig}
                  onConfigChange={(updates) => onStateChange({
                    onFootConfig: { ...(state.onFootConfig || initialOnFootConfig), ...updates }
                  })}
                />
              )}
              
              {state.productShotType === 'lifestyle' && (
                <LifestyleConfigurator
                  config={state.lifestyleConfig || initialLifestyleConfig}
                  onConfigChange={(updates) => onStateChange({
                    lifestyleConfig: { ...(state.lifestyleConfig || initialLifestyleConfig), ...updates }
                  })}
                />
              )}
              
              {state.productShotType === 'product-focus' && (
                <ProductFocusConfigurator
                  config={state.productFocusConfig || initialProductFocusConfig}
                  onConfigChange={(updates) => onStateChange({
                    productFocusConfig: { ...(state.productFocusConfig || initialProductFocusConfig), ...updates }
                  })}
                />
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Background Selection */}
      <Collapsible open={openSections.background}>
        <div id="section-ps-background" className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader 
            icon={ImageIcon} 
            title="Background" 
            section="background"
            badge={state.settingType === 'auto' ? 'Auto' : state.backgroundId ? 'Selected' : undefined}
          />
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <BackgroundSelector
                settingType={state.settingType}
                selectedBackgroundId={state.backgroundId}
                customBackgroundPrompt={state.customBackgroundPrompt}
                weatherCondition={state.weatherCondition}
                onSettingTypeChange={(type) => onStateChange({ settingType: type })}
                onBackgroundSelect={(id) => onStateChange({ backgroundId: id })}
                onCustomPromptChange={(prompt) => onStateChange({ customBackgroundPrompt: prompt })}
                onWeatherChange={(weather) => onStateChange({ weatherCondition: weather })}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Output Settings */}
      <Collapsible open={openSections.output}>
        <div id="section-ps-output" className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader 
            icon={Settings2} 
            title="Output Settings" 
            section="output"
          />
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-3">
                {/* Image Count */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Images</label>
                  <Select 
                    value={String(imageCount)} 
                    onValueChange={(v) => onOutputSettingsChange({ imageCount: Number(v) })}
                  >
                    <SelectTrigger className="bg-muted/50 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 4, 8].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resolution */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Resolution</label>
                  <Select 
                    value={resolution} 
                    onValueChange={(v) => onOutputSettingsChange({ resolution: v })}
                  >
                    <SelectTrigger className="bg-muted/50 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resolutions.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Aspect Ratio</label>
                  <Select 
                    value={aspectRatio} 
                    onValueChange={(v) => onOutputSettingsChange({ aspectRatio: v })}
                  >
                    <SelectTrigger className="bg-muted/50 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map(ar => (
                        <SelectItem key={ar} value={ar}>{ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Sequential Generation Toggle */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Sequential Generation</label>
                  <p className="text-xs text-muted-foreground">Fresh styling for each image</p>
                </div>
                <Switch
                  checked={sequentialGeneration}
                  onCheckedChange={(v) => onOutputSettingsChange({ sequentialGeneration: v })}
                />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Product Picker Modal */}
      <ProductPickerModal
        open={showProductPickerModal}
        onOpenChange={setShowProductPickerModal}
        selectedSkuId={selectedSku?.id || null}
        onSelectSku={(sku) => handleSkuSelect(sku, true)} // Modal selection DOES update display order
        onCreateNew={() => setShowCreateSKUModal(true)}
        onSmartUpload={() => setShowSmartUploadModal(true)}
      />

      {/* Smart Upload Modal */}
      <SmartUploadModal 
        open={showSmartUploadModal} 
        onOpenChange={setShowSmartUploadModal} 
      />

      {/* Create SKU Modal */}
      <CreateSKUModal
        open={showCreateSKUModal}
        onClose={() => setShowCreateSKUModal(false)}
        onCreated={handleSkuCreated}
      />

      {/* Edit SKU Modal */}
      {editingSkuId && (
        <EditSKUModal
          open={showEditSKUModal}
          onClose={() => {
            setShowEditSKUModal(false);
            setEditingSkuId(null);
          }}
          skuId={editingSkuId}
          onUpdated={() => {
            // Refetch selected SKU if it was the one being edited
            if (selectedSku?.id === editingSkuId) {
              setSelectedSku(null); // Will trigger refetch via query
            }
          }}
          onDeleted={() => {
            if (selectedSku?.id === editingSkuId) {
              setSelectedSku(null);
              onStateChange({ selectedProductId: undefined, recoloredProductUrl: undefined });
            }
          }}
        />
      )}
    </div>
  );
};

export { initialProductShootState };

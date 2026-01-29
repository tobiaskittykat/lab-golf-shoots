import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, ImageIcon, Camera, Package, Settings2, Plus, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BackgroundSelector } from "./BackgroundSelector";
import { ProductSKU } from "./ProductSKUPicker";
import { ProductPickerModal } from "./ProductPickerModal";
import { SmartUploadModal } from "./SmartUploadModal";
import { CreateSKUModal } from "./CreateSKUModal";
import { ShotTypeVisualSelector } from "./ShotTypeVisualSelector";
import { OnFootConfigurator } from "./OnFootConfigurator";
import { LifestyleConfigurator } from "./LifestyleConfigurator";
import { ProductFocusConfigurator } from "./ProductFocusConfigurator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import { useQuery } from "@tanstack/react-query";
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
  const [selectedSku, setSelectedSku] = useState<ProductSKU | null>(null);

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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Check if shot type needs a model
  const needsModel = !['flat-lay', 'product-focus'].includes(state.productShotType);

  const handleSkuSelect = (sku: ProductSKU) => {
    setSelectedSku(sku);
    onStateChange({
      selectedProductId: sku.id,
      recoloredProductUrl: sku.composite_image_url || sku.angles[0]?.thumbnail_url,
    });
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
              {/* Selected Product Preview */}
              {(selectedSku || selectedProduct) && currentProductImage ? (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted relative">
                    <img 
                      src={currentProductImage}
                      alt={currentProductName || 'Product'}
                      className="w-full h-full object-cover"
                    />
                    {selectedSku && selectedSku.angles.length > 1 && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs">
                        {selectedSku.angles.length} angles
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{currentProductName}</div>
                    {selectedSku?.sku_code && (
                      <div className="text-xs text-muted-foreground">{selectedSku.sku_code}</div>
                    )}
                    {selectedSku?.angles && selectedSku.angles.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {selectedSku.angles.length} angle{selectedSku.angles.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowProductPickerModal(true)}
                    >
                      Change
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearProduct}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                /* No product selected - show call to action */
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-20 border-dashed flex flex-col gap-1"
                    onClick={() => setShowProductPickerModal(true)}
                  >
                    <Package className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Select a product from your library</span>
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setShowSmartUploadModal(true)}
                    >
                      <Sparkles className="w-4 h-4" />
                      Smart Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => setShowCreateSKUModal(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Create SKU
                    </Button>
                  </div>
                </div>
              )}
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
        onSelectSku={handleSkuSelect}
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
    </div>
  );
};

export { initialProductShootState };

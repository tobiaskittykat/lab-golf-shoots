import { useState } from "react";
import { ChevronDown, ChevronRight, ImageIcon, Camera, Package, Settings2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackgroundSelector } from "./BackgroundSelector";
import { ProductSKUPicker, ProductSKU } from "./ProductSKUPicker";
import { CreateSKUModal } from "./CreateSKUModal";
import { ShotTypeVisualSelector } from "./ShotTypeVisualSelector";
import { OnFootConfigurator } from "./OnFootConfigurator";
import { 
  ProductShootState, 
  initialProductShootState,
  initialOnFootConfig,
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
  onOutputSettingsChange: (updates: { 
    imageCount?: number; 
    resolution?: string; 
    aspectRatio?: string; 
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
  onOutputSettingsChange,
}: ProductShootStep2Props) => {
  const [openSections, setOpenSections] = useState({
    product: true,
    background: true,
    shotType: true,
    output: true,
  });
  
  const [showCreateSKUModal, setShowCreateSKUModal] = useState(false);
  const [selectedSku, setSelectedSku] = useState<ProductSKU | null>(null);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Check if shot type needs a model
  const needsModel = !['flat-lay', 'product-focus'].includes(state.productShotType);


  const handleSkuSelect = (sku: ProductSKU | null) => {
    setSelectedSku(sku);
    if (sku) {
      onStateChange({
        selectedProductId: sku.id,
        // Use composite URL if available, otherwise first angle
        recoloredProductUrl: sku.composite_image_url || sku.angles[0]?.thumbnail_url,
      });
    } else {
      onStateChange({
        selectedProductId: undefined,
        recoloredProductUrl: undefined,
      });
    }
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
    <div className="space-y-4">
      {/* Product Selection with SKU Picker */}
      <Collapsible open={openSections.product}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader 
            icon={Package} 
            title="Product" 
            section="product"
            badge={getProductBadge()}
          />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {/* Selected Product Preview */}
              {(selectedSku || selectedProduct) && currentProductImage && (
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
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSku(null);
                      onStateChange({ selectedProductId: undefined, recoloredProductUrl: undefined });
                    }}
                    className="action-chip"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* SKU Picker */}
              <ProductSKUPicker
                selectedSkuId={selectedSku?.id || null}
                onSelectSku={handleSkuSelect}
                onCreateNew={() => setShowCreateSKUModal(true)}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Shot Type - Visual Selector */}
      <Collapsible open={openSections.shotType}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
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
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Background Selection */}
      <Collapsible open={openSections.background}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
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
                onSettingTypeChange={(type) => onStateChange({ settingType: type })}
                onBackgroundSelect={(id) => onStateChange({ backgroundId: id })}
                onCustomPromptChange={(prompt) => onStateChange({ customBackgroundPrompt: prompt })}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Output Settings */}
      <Collapsible open={openSections.output}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
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
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>


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

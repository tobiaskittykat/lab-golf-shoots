import { useState } from "react";
import { ChevronDown, ChevronRight, Paintbrush, ImageIcon, User, Camera } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BackgroundSelector } from "./BackgroundSelector";
import { ModelConfigurator } from "./ModelConfigurator";
import { ProductRecolorModal } from "./ProductRecolorModal";
import { 
  ProductShootState, 
  productShotTypes, 
  ProductShotType,
  initialProductShootState,
  ModelConfig,
  SettingType,
  RecolorOption,
} from "./types";

interface ProductShootStep2Props {
  state: ProductShootState;
  onStateChange: (updates: Partial<ProductShootState>) => void;
  // Product selection from parent
  selectedProduct?: {
    id: string;
    name: string;
    thumbnailUrl: string;
  };
  onProductSelect?: () => void;
}

export const ProductShootStep2 = ({
  state,
  onStateChange,
  selectedProduct,
  onProductSelect,
}: ProductShootStep2Props) => {
  const [openSections, setOpenSections] = useState({
    product: true,
    background: true,
    model: true,
    shotType: true,
  });
  
  const [showRecolorModal, setShowRecolorModal] = useState(false);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Check if shot type needs a model
  const needsModel = !['flat-lay', 'product-focus'].includes(state.productShotType);

  const handleRecolor = async (option: RecolorOption, color: string): Promise<string | null> => {
    onStateChange({
      productRecolorOption: option,
      productTargetColor: color,
    });
    
    if (option === 'pre-generation') {
      // TODO: Call recolor-product edge function
      // For now, return null (skeleton)
      onStateChange({ isRecoloring: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onStateChange({ isRecoloring: false });
      return null;
    }
    
    return null;
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

  return (
    <div className="space-y-4">
      {/* Product Selection with Recolor */}
      <Collapsible open={openSections.product}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader 
            icon={ImageIcon} 
            title="Product" 
            section="product"
            badge={selectedProduct?.name}
          />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {selectedProduct ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted relative">
                    <img 
                      src={state.recoloredProductUrl || selectedProduct.thumbnailUrl}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {state.productTargetColor && state.productRecolorOption !== 'none' && (
                      <div 
                        className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: state.productTargetColor }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{selectedProduct.name}</div>
                    {state.productTargetColor && (
                      <div className="text-xs text-muted-foreground">
                        Recolor: {state.productTargetColor}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRecolorModal(true)}
                      className="action-chip"
                    >
                      <Paintbrush className="w-4 h-4" />
                      Recolor
                    </button>
                    <button
                      onClick={onProductSelect}
                      className="action-chip"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onProductSelect}
                  className="w-full p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/40 transition-colors text-center"
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Select a product</div>
                </button>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Shot Type */}
      <Collapsible open={openSections.shotType}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader 
            icon={Camera} 
            title="Shot Type" 
            section="shotType"
            badge={productShotTypes.find(s => s.id === state.productShotType)?.name}
          />
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {productShotTypes.map((shot) => (
                  <button
                    key={shot.id}
                    onClick={() => onStateChange({ productShotType: shot.id })}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      state.productShotType === shot.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/40'
                    }`}
                  >
                    <div className="text-xl mb-1">{shot.icon}</div>
                    <div className="font-medium text-sm text-foreground">{shot.name}</div>
                    <div className="text-xs text-muted-foreground">{shot.description}</div>
                  </button>
                ))}
              </div>
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

      {/* Model Configuration */}
      <Collapsible open={openSections.model}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader 
            icon={User} 
            title="Model" 
            section="model"
            badge={!needsModel ? 'Not needed' : state.modelConfig.useOnBrandDefaults ? 'Auto' : 'Custom'}
          />
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <ModelConfigurator
                config={state.modelConfig}
                onConfigChange={(updates) => onStateChange({ 
                  modelConfig: { ...state.modelConfig, ...updates } 
                })}
                showModelOptions={needsModel}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Recolor Modal */}
      {selectedProduct && (
        <ProductRecolorModal
          isOpen={showRecolorModal}
          onClose={() => setShowRecolorModal(false)}
          productImageUrl={selectedProduct.thumbnailUrl}
          productName={selectedProduct.name}
          onRecolor={handleRecolor}
          currentOption={state.productRecolorOption}
          currentColor={state.productTargetColor}
        />
      )}
    </div>
  );
};

export { initialProductShootState };

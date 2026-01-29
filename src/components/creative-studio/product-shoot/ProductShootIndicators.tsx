import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductShootState } from "./types";

interface ProductShootIndicatorsProps {
  state: ProductShootState;
}

interface IndicatorChipProps {
  label: string;
  selected: boolean;
  isAuto?: boolean;
  onClick: () => void;
}

const IndicatorChip = ({ label, selected, isAuto, onClick }: IndicatorChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-sm",
      "hover:text-foreground hover:bg-secondary/50",
      selected 
        ? (isAuto ? "text-muted-foreground" : "text-accent")
        : "text-muted-foreground"
    )}
  >
    {selected && <Check className="w-3 h-3" />}
    {label}
  </button>
);

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
};

export const ProductShootIndicators = ({ state }: ProductShootIndicatorsProps) => {
  const hasProduct = !!state.selectedProductId;
  
  const shotTypeLabels: Record<string, string> = {
    'product-focus': 'Product Focus',
    'on-foot': 'On Foot',
    'lifestyle': 'Full Body',
  };
  const shotLabel = `Shot Type: ${shotTypeLabels[state.productShotType] || 'Select'}`;
  
  const getBackgroundLabel = () => {
    if (state.settingType === 'studio') return 'Background: Studio';
    if (state.settingType === 'outdoor') return 'Background: Outdoor';
    return 'Background: Auto';
  };
  
  return (
    <div className="flex items-center gap-0.5">
      <IndicatorChip
        label="Product"
        selected={hasProduct}
        onClick={() => scrollToSection('section-ps-product')}
      />
      
      <span className="text-muted-foreground/30">·</span>
      
      <IndicatorChip
        label={shotLabel}
        selected={true}
        onClick={() => scrollToSection('section-ps-shot-type')}
      />
      
      <span className="text-muted-foreground/30">·</span>
      
      <IndicatorChip
        label={getBackgroundLabel()}
        selected={true}
        onClick={() => scrollToSection('section-ps-background')}
      />
    </div>
  );
};

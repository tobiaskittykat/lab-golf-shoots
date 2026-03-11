import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreativeStudioState, sampleContextReferences } from "./types";

interface SelectionIndicatorsProps {
  state: CreativeStudioState;
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
    window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
  }
};

export const SelectionIndicators = ({ state }: SelectionIndicatorsProps) => {
  const hasConcept = !!state.selectedConcept;
  const hasMoodboard = !!state.moodboard;
  const productCount = state.productReferences.length;
  const hasShot = !!state.contextReference;
  const shotLabel = hasShot 
    ? sampleContextReferences.find(r => r.id === state.contextReference)?.name || 'Shot Type'
    : 'Shot Type (auto)';

  return (
    <div className="flex items-center gap-0.5">
      <IndicatorChip label="Concept" selected={hasConcept} onClick={() => scrollToSection('section-concepts')} />
      <span className="text-muted-foreground/30">·</span>
      <IndicatorChip label="Moodboard" selected={hasMoodboard} onClick={() => scrollToSection('section-moodboard')} />
      <span className="text-muted-foreground/30">·</span>
      <IndicatorChip label={productCount > 0 ? `Products ${productCount}/3` : 'Products'} selected={productCount > 0} onClick={() => scrollToSection('section-products')} />
      <span className="text-muted-foreground/30">·</span>
      <IndicatorChip label={shotLabel} selected={true} isAuto={!hasShot} onClick={() => scrollToSection('section-shot-type')} />
    </div>
  );
};

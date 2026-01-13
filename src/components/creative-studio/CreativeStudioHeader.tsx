import { Sparkles, RefreshCw } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useBrands } from "@/hooks/useBrands";
import { CreativeStudioState, typeCards, targetPersonas } from "./types";

interface CreativeStudioHeaderProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

export const CreativeStudioHeader = ({ 
  state, 
  onUpdate, 
  onRegenerate,
  showRegenerate = false 
}: CreativeStudioHeaderProps) => {
  const { brands, currentBrand } = useBrands();

  const handleTypeCardClick = (cardId: string) => {
    const card = typeCards.find(c => c.id === cardId);
    if (card) {
      onUpdate({ 
        selectedTypeCard: cardId,
        useCase: cardId as CreativeStudioState['useCase'],
      });
    }
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-8">
      {/* Centered Header with Gradient */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-accent" />
          <span className="text-gradient">Create</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          What would you like to create today?
        </p>
      </div>

      {/* Type Cards - KittyKat styled */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {typeCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleTypeCardClick(card.id)}
            className={`group flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
              state.selectedTypeCard === card.id
                ? 'border-accent bg-accent/10 shadow-lg'
                : 'border-border bg-card hover:border-accent/40 hover:shadow-md'
            }`}
            style={{
              boxShadow: state.selectedTypeCard === card.id 
                ? '0 8px 32px rgba(107, 124, 255, 0.2)' 
                : undefined
            }}
          >
            <span className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110">{card.icon}</span>
            <span className={`font-medium transition-colors ${
              state.selectedTypeCard === card.id ? 'text-accent' : 'text-foreground group-hover:text-accent'
            }`}>
              {card.label}
            </span>
          </button>
        ))}
      </div>

      {/* Settings Pills Row - KittyKat action-chip style */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Brand Selector Pill */}
        <Select 
          value={state.selectedBrand || currentBrand?.id || ''} 
          onValueChange={(value) => onUpdate({ selectedBrand: value })}
        >
          <SelectTrigger className="h-10 px-5 rounded-full bg-secondary border border-border text-sm font-medium hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all duration-200 w-auto gap-2">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campaign Selector Pill */}
        <Select value={state.selectedCampaign || ''} onValueChange={(value) => onUpdate({ selectedCampaign: value })}>
          <SelectTrigger className="h-10 px-5 rounded-full bg-secondary border border-border text-sm font-medium hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all duration-200 w-auto gap-2">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summer-2025">Summer 2025</SelectItem>
            <SelectItem value="holiday-collection">Holiday Collection</SelectItem>
            <SelectItem value="new-arrivals">New Arrivals</SelectItem>
          </SelectContent>
        </Select>

        {/* Media Type Dropdown */}
        <Select 
          value={state.mediaType} 
          onValueChange={(value) => onUpdate({ mediaType: value as 'image' | 'video' })}
        >
          <SelectTrigger className="h-10 px-5 rounded-full bg-secondary border border-border text-sm font-medium hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all duration-200 w-auto gap-2">
            <SelectValue placeholder="Media Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">🖼️ Image</SelectItem>
            <SelectItem value="video">🎬 Video</SelectItem>
          </SelectContent>
        </Select>

        {/* Target Persona Dropdown */}
        <Select 
          value={state.targetPersona || ''} 
          onValueChange={(value) => onUpdate({ targetPersona: value })}
        >
          <SelectTrigger className="h-10 px-5 rounded-full bg-secondary border border-border text-sm font-medium hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-all duration-200 w-auto gap-2">
            <SelectValue placeholder="Target Persona" />
          </SelectTrigger>
          <SelectContent>
            {targetPersonas.map((persona) => (
              <SelectItem key={persona.value} value={persona.value}>
                {persona.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brief Input - KittyKat command-input style */}
      <div className="w-full flex gap-3">
        <input
          type="text"
          value={state.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          placeholder="Enter your creative brief..."
          className="command-input flex-1"
        />
        {showRegenerate && (
          <button
            onClick={onRegenerate}
            className="h-14 px-6 rounded-2xl bg-secondary hover:bg-accent/10 border border-border hover:border-accent/30 transition-all duration-200 flex items-center gap-2 text-foreground hover:text-accent font-medium"
            title="Regenerate concepts"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        )}
      </div>
    </div>
  );
};

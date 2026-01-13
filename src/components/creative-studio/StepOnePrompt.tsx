import { RefreshCw, ArrowRight, Image, Video } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useBrands } from "@/hooks/useBrands";
import { CreativeStudioState, typeCards, useCaseOptions } from "./types";

interface StepOnePromptProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  onContinue: () => void;
}

const examplePrompts = [
  "A luxurious product shot of our diamond ring catching morning light",
  "Lifestyle scene with model wearing summer collection in urban setting",
  "Bold social media ad for our new skincare line launch",
  "Editorial flat lay of accessories for newsletter header",
];

export const StepOnePrompt = ({ state, onUpdate, onContinue }: StepOnePromptProps) => {
  const { brands, currentBrand } = useBrands();

  const handleShuffle = () => {
    const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    onUpdate({ prompt: randomPrompt });
  };

  const handleTypeCardClick = (cardId: string) => {
    const card = typeCards.find(c => c.id === cardId);
    if (card) {
      onUpdate({ 
        selectedTypeCard: cardId,
        useCase: cardId as CreativeStudioState['useCase'],
        prompt: state.prompt || card.promptTemplate
      });
    }
  };

  const canContinue = state.prompt.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header Dropdowns Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-secondary/30 rounded-xl border border-border">
        {/* Brand Selector */}
        <Select 
          value={state.selectedBrand || currentBrand?.id || ''} 
          onValueChange={(value) => onUpdate({ selectedBrand: value })}
        >
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Select Brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campaign Selector */}
        <Select value={state.selectedCampaign || ''} onValueChange={(value) => onUpdate({ selectedCampaign: value })}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <SelectValue placeholder="Select Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summer-2025">Summer 2025</SelectItem>
            <SelectItem value="holiday-collection">Holiday Collection</SelectItem>
            <SelectItem value="new-arrivals">New Arrivals</SelectItem>
          </SelectContent>
        </Select>

        {/* Media Type Toggle */}
        <div className="flex items-center rounded-lg border border-border bg-card overflow-hidden">
          <button
            onClick={() => onUpdate({ mediaType: 'image' })}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              state.mediaType === 'image' 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Image className="w-4 h-4" />
            Image
          </button>
          <button
            onClick={() => onUpdate({ mediaType: 'video' })}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              state.mediaType === 'video' 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
        </div>

        {/* Use Case Selector */}
        <Select value={state.useCase} onValueChange={(value) => onUpdate({ useCase: value as CreativeStudioState['useCase'] })}>
          <SelectTrigger className="w-[160px] bg-card border-border">
            <SelectValue placeholder="Use Case" />
          </SelectTrigger>
          <SelectContent>
            {useCaseOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Prompt Area */}
      <div className="relative">
        <textarea
          value={state.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          placeholder="Describe what you want to create..."
          rows={4}
          className="w-full bg-card border border-border rounded-xl p-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 text-foreground placeholder:text-muted-foreground text-lg"
        />
        <button
          onClick={handleShuffle}
          className="absolute right-3 top-3 p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-accent"
          title="Shuffle prompt"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
          {state.prompt.length} chars
        </div>
      </div>

      {/* Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {typeCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleTypeCardClick(card.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              state.selectedTypeCard === card.id
                ? 'border-accent bg-accent/5 shadow-md'
                : 'border-border bg-card hover:border-accent/50 hover:bg-secondary/30'
            }`}
          >
            <span className="text-2xl mb-2 block">{card.icon}</span>
            <h3 className="font-semibold text-foreground">{card.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </button>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

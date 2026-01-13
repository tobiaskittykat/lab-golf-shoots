import { RefreshCw, Sparkles, Image, Video } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useBrands } from "@/hooks/useBrands";
import { CreativeStudioState, typeCards } from "./types";

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
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-8 py-8">
      {/* Centered Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-accent" />
          Create
        </h1>
        <p className="text-muted-foreground text-lg">
          What would you like to create today?
        </p>
      </div>

      {/* Type Cards - Top, Icon + Label Only */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {typeCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleTypeCardClick(card.id)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
              state.selectedTypeCard === card.id
                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                : 'border-border bg-card hover:border-accent/50 hover:shadow-md'
            }`}
          >
            <span className="text-4xl mb-3">{card.icon}</span>
            <span className={`font-medium ${
              state.selectedTypeCard === card.id ? 'text-accent' : 'text-foreground'
            }`}>
              {card.label}
            </span>
          </button>
        ))}
      </div>

      {/* Settings Pills Row - Centered */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Brand Selector Pill */}
        <Select 
          value={state.selectedBrand || currentBrand?.id || ''} 
          onValueChange={(value) => onUpdate({ selectedBrand: value })}
        >
          <SelectTrigger className="h-9 px-4 rounded-full bg-secondary/50 border-0 text-sm font-medium hover:bg-secondary transition-colors">
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
          <SelectTrigger className="h-9 px-4 rounded-full bg-secondary/50 border-0 text-sm font-medium hover:bg-secondary transition-colors">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summer-2025">Summer 2025</SelectItem>
            <SelectItem value="holiday-collection">Holiday Collection</SelectItem>
            <SelectItem value="new-arrivals">New Arrivals</SelectItem>
          </SelectContent>
        </Select>

        {/* Media Type Toggle Pill */}
        <div className="flex items-center rounded-full bg-secondary/50 overflow-hidden">
          <button
            onClick={() => onUpdate({ mediaType: 'image' })}
            className={`flex items-center gap-1.5 px-4 h-9 text-sm font-medium transition-colors ${
              state.mediaType === 'image' 
                ? 'bg-accent text-accent-foreground rounded-full' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Image className="w-4 h-4" />
            Image
          </button>
          <button
            onClick={() => onUpdate({ mediaType: 'video' })}
            className={`flex items-center gap-1.5 px-4 h-9 text-sm font-medium transition-colors ${
              state.mediaType === 'video' 
                ? 'bg-accent text-accent-foreground rounded-full' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
        </div>

        {/* Number of Images Pill */}
        <Select 
          value={state.imageCount.toString()} 
          onValueChange={(value) => onUpdate({ imageCount: parseInt(value) })}
        >
          <SelectTrigger className="h-9 px-4 rounded-full bg-secondary/50 border-0 text-sm font-medium hover:bg-secondary transition-colors">
            <SelectValue placeholder="# Images" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Image</SelectItem>
            <SelectItem value="2">2 Images</SelectItem>
            <SelectItem value="4">4 Images</SelectItem>
            <SelectItem value="6">6 Images</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Single-Line Prompt Input */}
      <div className="relative w-full">
        <input
          type="text"
          value={state.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          placeholder="Describe what you want to create..."
          className="w-full h-14 bg-card border border-border rounded-2xl px-5 pr-14 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 text-foreground placeholder:text-muted-foreground text-lg"
        />
        <button
          onClick={handleShuffle}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-accent"
          title="Shuffle prompt"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Centered Generate Button */}
      <button
        onClick={onContinue}
        disabled={!canContinue}
        className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/25"
      >
        <Sparkles className="w-5 h-5" />
        Generate Concepts
      </button>
    </div>
  );
};

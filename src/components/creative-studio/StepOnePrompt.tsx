import { Shuffle, Sparkles, Image, Video, ArrowRight, Plus } from "lucide-react";
import { useState, useEffect } from "react";
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

// Example briefs organized by type
const exampleBriefsByType: Record<string, string[]> = {
  product: [
    "Hero shot of our luxury watch on marble surface with soft shadows",
    "Clean product photography of skincare bottle with water droplets",
    "Premium flatlay of jewelry collection on velvet backdrop",
    "Minimalist product shot of sneakers with dramatic lighting",
    "Elegant perfume bottle with golden hour light reflections",
    "Tech gadget floating with subtle shadow and gradient background",
  ],
  lifestyle: [
    "Model wearing summer collection walking through city streets",
    "Couple enjoying coffee at outdoor cafe with our products",
    "Athlete training in gym wearing our activewear line",
    "Friends at beach picnic featuring our lifestyle accessories",
    "Morning routine scene with skincare products in bathroom",
    "Weekend brunch setting with our tableware collection",
  ],
  ad: [
    "Bold promotional banner for Black Friday sale event",
    "Eye-catching social ad for new product launch",
    "Seasonal campaign creative for holiday collection",
    "Flash sale announcement with urgency messaging",
    "Brand awareness ad featuring hero product",
    "Retargeting creative with special offer highlight",
  ],
  social: [
    "Instagram carousel first slide for product showcase",
    "TikTok-ready vertical content with trending aesthetic",
    "Story-format teaser for upcoming collection drop",
    "User-generated style inspiration post",
    "Behind-the-scenes content for brand authenticity",
    "Influencer collaboration style product feature",
  ],
};

const getRandomBriefs = (typeId: string, count: number = 6): string[] => {
  const briefs = exampleBriefsByType[typeId] || exampleBriefsByType.product;
  const shuffled = [...briefs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const StepOnePrompt = ({ state, onUpdate, onContinue }: StepOnePromptProps) => {
  const { brands, currentBrand } = useBrands();
  const [displayedBriefs, setDisplayedBriefs] = useState<string[]>([]);

  // Initialize and update briefs when type changes
  useEffect(() => {
    const typeId = state.selectedTypeCard || 'product';
    setDisplayedBriefs(getRandomBriefs(typeId));
  }, [state.selectedTypeCard]);

  const handleShuffle = () => {
    const typeId = state.selectedTypeCard || 'product';
    setDisplayedBriefs(getRandomBriefs(typeId));
  };

  const handleBriefClick = (brief: string) => {
    onUpdate({ prompt: brief });
  };

  const handleTypeCardClick = (cardId: string) => {
    const card = typeCards.find(c => c.id === cardId);
    if (card) {
      onUpdate({ 
        selectedTypeCard: cardId,
        useCase: cardId as CreativeStudioState['useCase'],
      });
      // Briefs will update via useEffect
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

      {/* Settings Pills Row - Single Row */}
      <div className="flex items-center justify-center gap-3 flex-nowrap">
        {/* Brand Selector Pill */}
        <Select 
          value={state.selectedBrand || currentBrand?.id || ''} 
          onValueChange={(value) => onUpdate({ selectedBrand: value })}
        >
          <SelectTrigger className="h-9 px-4 rounded-full bg-secondary/50 border-0 text-sm font-medium hover:bg-secondary transition-colors w-auto">
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
          <SelectTrigger className="h-9 px-4 rounded-full bg-secondary/50 border-0 text-sm font-medium hover:bg-secondary transition-colors w-auto">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summer-2025">Summer 2025</SelectItem>
            <SelectItem value="holiday-collection">Holiday Collection</SelectItem>
            <SelectItem value="new-arrivals">New Arrivals</SelectItem>
          </SelectContent>
        </Select>

        {/* Media Type Toggle Pill */}
        <div className="flex items-center rounded-full bg-secondary/50 overflow-hidden shrink-0">
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

        {/* Number of Concepts Pill */}
        <Select 
          value={state.imageCount.toString()} 
          onValueChange={(value) => onUpdate({ imageCount: parseInt(value) })}
        >
          <SelectTrigger className="h-9 px-4 rounded-full bg-secondary/50 border-0 text-sm font-medium hover:bg-secondary transition-colors w-auto">
            <SelectValue placeholder="# Concepts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Concepts</SelectItem>
            <SelectItem value="3">3 Concepts</SelectItem>
            <SelectItem value="4">4 Concepts</SelectItem>
            <SelectItem value="6">6 Concepts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Brief Input */}
      <div className="w-full">
        <input
          type="text"
          value={state.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          placeholder="Enter your creative brief..."
          className="w-full h-14 bg-card border border-border rounded-2xl px-5 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 text-foreground placeholder:text-muted-foreground text-lg"
        />
      </div>

      {/* Example Briefs Section */}
      <div className="w-full space-y-4">
        {/* Section Header */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground font-medium">Example briefs</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Brief Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {displayedBriefs.map((brief, index) => (
            <button
              key={index}
              onClick={() => handleBriefClick(brief)}
              className="group flex items-start gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-accent/30 transition-all text-left"
            >
              <span className="text-muted-foreground text-sm leading-relaxed flex-1">
                {brief}
              </span>
              <Plus className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent shrink-0 mt-0.5" />
            </button>
          ))}
        </div>

        {/* Shuffle Button */}
        <div className="flex justify-center">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card hover:bg-secondary/50 transition-colors text-sm font-medium text-foreground"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </button>
        </div>
      </div>

      {/* Centered Continue Button */}
      <button
        onClick={onContinue}
        disabled={!canContinue}
        className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/25"
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

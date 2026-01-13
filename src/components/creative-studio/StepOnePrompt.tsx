import { Shuffle, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { CreativeStudioState } from "./types";

interface StepOnePromptProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
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

export const StepOnePrompt = ({ state, onUpdate }: StepOnePromptProps) => {
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

  

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-6 pt-6">
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

      {/* Footer is now in parent CreativeStudioWizard */}
    </div>
  );
};

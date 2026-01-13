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
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-6 pt-8">
      {/* Example Briefs Section */}
      <div className="w-full space-y-5">
        {/* Section Header */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-sm text-muted-foreground font-medium px-2">Example briefs</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Brief Cards Grid - KittyKat style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayedBriefs.map((brief, index) => (
            <button
              key={index}
              onClick={() => handleBriefClick(brief)}
              className="group flex items-start gap-3 p-5 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-md transition-all duration-200 text-left"
              style={{
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)'
              }}
            >
              <span className="text-muted-foreground text-sm leading-relaxed flex-1 group-hover:text-foreground transition-colors">
                {brief}
              </span>
              <Plus className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0 mt-0.5" />
            </button>
          ))}
        </div>

        {/* Shuffle Button - KittyKat style */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleShuffle}
            className="action-chip"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </button>
        </div>
      </div>
    </div>
  );
};

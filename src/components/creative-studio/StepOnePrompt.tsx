import { Shuffle, Plus, Bookmark } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { CreativeStudioState, SavedConcept } from "./types";
import { SavedConceptsModal } from "./SavedConceptsModal";

interface StepOnePromptProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  onLoadSavedConcept?: (concept: SavedConcept) => void;
  onDeleteSavedConcept?: (conceptId: string) => void;
}

// Marketing-style briefs - generic examples that work for any brand
const exampleBriefsByType: Record<string, string[]> = {
  lifestyle: [
    // Summer/Travel campaigns
    "Summer collection launch - effortless getaway vibes, golden hour luxury",
    "Vacation essentials shoot - poolside to dinner, versatile elegance",
    "Coastal collection campaign - sun-drenched elegance, ocean blues",
    
    // Festival/Desert campaigns
    "Festival season drop - desert sunset energy, bold and expressive",
    "Road trip content series - open highways, adventure-ready style",
    "Southwest-inspired editorial - earthy tones, effortless boho-luxe",
    
    // Urban/Street Style campaigns
    "City essentials campaign - coffee run to cocktail hour, urban chic",
    "Street style editorial - fashion week energy, sophisticated edge",
    "Morning routine content - everyday luxury, authentic moments",
    
    // Party/Evening campaigns
    "Holiday party campaign - champagne moments, after-dark glamour",
    "NYE collection shoot - celebration vibes, sparkle and spontaneity",
    "Night out content - getting ready together, going out in style",
    
    // Floral/Spring campaigns
    "Spring refresh campaign - garden party meets street style",
    "Mother's Day gifting shoot - brunch settings, fresh florals, thoughtful luxury",
    "New arrivals launch - spring color story, bright and optimistic",
    
    // Bold/Statement campaigns
    "Statement print drop - bold patterns, unapologetically confident",
    "Power accessories editorial - strong silhouettes, confident energy",
    "Fall fashion campaign - rich tones, texture-forward styling",
  ],
  product: [],
  localization: [],
  ugc: [],
};

const getRandomBriefs = (typeId: string, count: number = 6): string[] => {
  const briefs = exampleBriefsByType[typeId] || exampleBriefsByType.product;
  const shuffled = [...briefs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const StepOnePrompt = ({ state, onUpdate, onLoadSavedConcept, onDeleteSavedConcept }: StepOnePromptProps) => {
  const [displayedBriefs, setDisplayedBriefs] = useState<string[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize and update briefs when type changes
  useEffect(() => {
    const typeId = state.selectedTypeCard || 'product';
    setDisplayedBriefs(getRandomBriefs(typeId));
  }, [state.selectedTypeCard]);

  // Smooth transition when prompt changes
  useEffect(() => {
    if (state.prompt.trim()) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [state.prompt]);

  const handleShuffle = () => {
    const typeId = state.selectedTypeCard || 'product';
    setDisplayedBriefs(getRandomBriefs(typeId));
  };

  const handleBriefClick = (brief: string) => {
    onUpdate({ prompt: brief });
  };

  const handleLoadConcept = (concept: SavedConcept) => {
    onLoadSavedConcept?.(concept);
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-6 pt-8">
      {/* Example Briefs Section - smooth fade-out transition */}
      <div 
        ref={containerRef}
        className={`w-full space-y-5 transition-all duration-300 ease-out overflow-hidden ${
          !isVisible 
            ? 'opacity-0 max-h-0 pointer-events-none' 
            : 'opacity-100 max-h-[600px]'
        }`}>
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

        {/* Action Buttons Row */}
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            onClick={handleShuffle}
            className="action-chip"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </button>
          
          {state.savedConcepts.length > 0 && onLoadSavedConcept && (
            <button
              onClick={() => setShowSavedModal(true)}
              className="action-chip"
            >
              <Bookmark className="w-4 h-4" />
              Load saved ({state.savedConcepts.length})
            </button>
          )}
        </div>
      </div>

      {/* Saved Concepts Modal */}
      <SavedConceptsModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        savedConcepts={state.savedConcepts}
        onLoadConcept={handleLoadConcept}
        onDeleteConcept={onDeleteSavedConcept}
      />
    </div>
  );
};

import { Shuffle, Plus, Bookmark, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { CreativeStudioState, SavedConcept } from "./types";
import { SavedConceptsModal } from "./SavedConceptsModal";
import { Brand } from "@/hooks/useBrands";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface StepOnePromptProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  currentBrand?: Brand;
  onLoadSavedConcept?: (concept: SavedConcept) => void;
  onDeleteSavedConcept?: (conceptId: string) => void;
}

// Generic fallback briefs
const genericFallbackBriefs = [
  "Summer collection launch - golden hour luxury, effortless elegance",
  "Festival season drop - desert sunset vibes, bold and expressive",
  "City essentials campaign - coffee run to cocktail hour, urban chic",
  "Holiday party shoot - champagne moments, after-dark glamour",
  "Spring refresh campaign - garden party meets street style",
  "Street style editorial - fashion week energy, sophisticated edge",
];

export const StepOnePrompt = ({ state, onUpdate, currentBrand, onLoadSavedConcept, onDeleteSavedConcept }: StepOnePromptProps) => {
  const [displayedBriefs, setDisplayedBriefs] = useState<string[]>([]);
  const [cachedBriefs, setCachedBriefs] = useState<string[]>([]);
  const [isLoadingBriefs, setIsLoadingBriefs] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastBrandIdRef = useRef<string | null>(null);

  // Fetch brand-specific briefs from AI
  const fetchBrandBriefs = useCallback(async (brand: Brand) => {
    setIsLoadingBriefs(true);
    
    try {
      const brandContext = brand.brand_context as Record<string, any> | null;
      const brandBrain = brandContext?.brandBrain;
      
      // Extract product categories from brand context if available
      const productCategories = brandContext?.productCategories || 
        (brand.industry === 'Fashion & Accessories' ? ['phone cases', 'crossbody straps', 'leather accessories', 'tech accessories'] : []);
      
      const { data, error } = await supabase.functions.invoke('generate-brief-suggestions', {
        body: {
          brandName: brand.name,
          industry: brand.industry,
          personality: brand.personality,
          brandBrain: brandBrain,
          productCategories: productCategories,
          count: 18
        }
      });

      if (error) {
        console.error('Error fetching briefs:', error);
        setCachedBriefs(genericFallbackBriefs);
        setDisplayedBriefs(genericFallbackBriefs);
      } else {
        const briefs = data?.briefs || genericFallbackBriefs;
        setCachedBriefs(briefs);
        setDisplayedBriefs(briefs.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to fetch brand briefs:', err);
      setCachedBriefs(genericFallbackBriefs);
      setDisplayedBriefs(genericFallbackBriefs);
    } finally {
      setIsLoadingBriefs(false);
    }
  }, []);

  // Fetch briefs when brand changes
  useEffect(() => {
    if (currentBrand?.id && currentBrand.id !== lastBrandIdRef.current) {
      lastBrandIdRef.current = currentBrand.id;
      fetchBrandBriefs(currentBrand);
    } else if (!currentBrand) {
      // No brand - use generic fallbacks
      setCachedBriefs(genericFallbackBriefs);
      setDisplayedBriefs(genericFallbackBriefs);
    }
  }, [currentBrand?.id, fetchBrandBriefs]);

  // Smooth transition when prompt changes
  useEffect(() => {
    if (state.prompt.trim()) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [state.prompt]);

  const handleShuffle = () => {
    if (cachedBriefs.length <= 6) {
      // Not enough cached, just shuffle what we have
      const shuffled = [...cachedBriefs].sort(() => Math.random() - 0.5);
      setDisplayedBriefs(shuffled.slice(0, 6));
    } else {
      // Pick 6 random from cache
      const shuffled = [...cachedBriefs].sort(() => Math.random() - 0.5);
      setDisplayedBriefs(shuffled.slice(0, 6));
    }
  };

  const handleRegenerate = () => {
    if (currentBrand) {
      fetchBrandBriefs(currentBrand);
    }
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
          {isLoadingBriefs ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-card border border-border"
                style={{ boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)' }}
              >
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
          ) : (
            displayedBriefs.map((brief, index) => (
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
            ))
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            onClick={handleShuffle}
            className="action-chip"
            disabled={isLoadingBriefs}
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </button>
          
          <button
            onClick={handleRegenerate}
            className="action-chip"
            disabled={isLoadingBriefs}
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingBriefs ? 'animate-spin' : ''}`} />
            {isLoadingBriefs ? 'Generating...' : 'New ideas'}
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

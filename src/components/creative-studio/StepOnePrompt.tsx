import { Plus, Bookmark, RefreshCw } from "lucide-react";
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

const BRIEFS_PER_PAGE = 6;
const INITIAL_POOL_SIZE = 36;
const REFILL_THRESHOLD = 12;

export const StepOnePrompt = ({ state, onUpdate, currentBrand, onLoadSavedConcept, onDeleteSavedConcept }: StepOnePromptProps) => {
  const [briefPool, setBriefPool] = useState<string[]>([]);
  const [poolIndex, setPoolIndex] = useState(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isBackgroundFetching, setIsBackgroundFetching] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastBrandIdRef = useRef<string | null>(null);

  // Fetch brand-specific briefs from AI
  const fetchBrandBriefs = useCallback(async (brand: Brand, append = false) => {
    if (!append) {
      setIsLoadingInitial(true);
    }
    
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
          count: INITIAL_POOL_SIZE
        }
      });

      if (error) {
        console.error('Error fetching briefs:', error);
        if (!append) {
          setBriefPool(genericFallbackBriefs);
          setPoolIndex(0);
        }
      } else {
        const briefs = data?.briefs || genericFallbackBriefs;
        if (append) {
          setBriefPool(prev => [...prev, ...briefs]);
        } else {
          setBriefPool(briefs);
          setPoolIndex(0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch brand briefs:', err);
      if (!append) {
        setBriefPool(genericFallbackBriefs);
        setPoolIndex(0);
      }
    } finally {
      if (!append) {
        setIsLoadingInitial(false);
      }
    }
  }, []);

  // Background refill when pool is running low
  const refillPoolInBackground = useCallback(async () => {
    if (!currentBrand || isBackgroundFetching) return;
    
    setIsBackgroundFetching(true);
    console.log('Background refilling brief pool...');
    
    try {
      const brandContext = currentBrand.brand_context as Record<string, any> | null;
      const brandBrain = brandContext?.brandBrain;
      const productCategories = brandContext?.productCategories || 
        (currentBrand.industry === 'Fashion & Accessories' ? ['phone cases', 'crossbody straps', 'leather accessories', 'tech accessories'] : []);
      
      const { data, error } = await supabase.functions.invoke('generate-brief-suggestions', {
        body: {
          brandName: currentBrand.name,
          industry: currentBrand.industry,
          personality: currentBrand.personality,
          brandBrain: brandBrain,
          productCategories: productCategories,
          count: INITIAL_POOL_SIZE
        }
      });

      if (!error && data?.briefs) {
        setBriefPool(prev => [...prev, ...data.briefs]);
        console.log('Brief pool refilled, new size:', briefPool.length + data.briefs.length);
      }
    } catch (err) {
      console.error('Background refill failed:', err);
    } finally {
      setIsBackgroundFetching(false);
    }
  }, [currentBrand, isBackgroundFetching, briefPool.length]);

  // Fetch briefs when brand changes
  useEffect(() => {
    if (currentBrand?.id && currentBrand.id !== lastBrandIdRef.current) {
      lastBrandIdRef.current = currentBrand.id;
      fetchBrandBriefs(currentBrand);
    } else if (!currentBrand) {
      // No brand - use generic fallbacks
      setBriefPool(genericFallbackBriefs);
      setPoolIndex(0);
      setIsLoadingInitial(false);
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

  // Get current 6 briefs to display
  const displayedBriefs = briefPool.slice(poolIndex, poolIndex + BRIEFS_PER_PAGE);

  const handleNewIdeas = () => {
    const nextIndex = poolIndex + BRIEFS_PER_PAGE;
    
    // Check if we need to wrap around or advance
    if (nextIndex >= briefPool.length) {
      // Wrap around to start
      setPoolIndex(0);
    } else {
      setPoolIndex(nextIndex);
    }
    
    // Check if we need to refill in background
    const remaining = briefPool.length - nextIndex;
    if (remaining <= REFILL_THRESHOLD && !isBackgroundFetching && currentBrand) {
      refillPoolInBackground();
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
        className={`w-full space-y-5 transition-all duration-300 ease-out ${
          !isVisible 
            ? 'opacity-0 h-0 overflow-hidden pointer-events-none' 
            : 'opacity-100'
        }`}>
        {/* Section Header */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-sm text-muted-foreground font-medium px-2">Example briefs</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Brief Cards Grid - KittyKat style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoadingInitial ? (
            // Loading skeletons - only shown on initial load
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
                key={`${poolIndex}-${index}`}
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

        {/* Action Buttons Row - Only "New ideas" button now */}
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            onClick={handleNewIdeas}
            className="action-chip"
            disabled={isLoadingInitial}
          >
            <RefreshCw className="w-4 h-4" />
            New ideas
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
import { useState, useCallback, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Type, 
  Settings2, 
  FolderOpen,
  Palette,
  Sun,
  Camera,
  Hash,
  X,
  Upload,
  Cpu,
  Wand2,
  ChevronRight,
  Package,
  Focus,
  BookmarkCheck,
  ChevronDown,
  Loader2,
  RefreshCw,
  Trash2
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ConceptCard, AddConceptCard, SavedConceptCard, ConceptCardSkeleton } from "./ConceptCard";
import { ConceptEditModal } from "./ConceptEditModal";
import { CustomizationSection } from "./CustomizationSection";
import { MoodboardThumbnail } from "./MoodboardThumbnail";
import { ReferenceThumbnail } from "./ReferenceThumbnail";
import { MoodboardModal } from "./MoodboardModal";
import { ReferenceGalleryModal } from "./ReferenceGalleryModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  CreativeStudioState, 
  Concept,
  SavedConcept,
  ConceptPresets,
  Moodboard,
  ReferenceImage,
  aspectRatios, 
  resolutions, 
  lightingStyles,
  cameraAngles,
  aiModels,
  sampleProductReferences,
  sampleContextReferences,
  outputFormats
} from "./types";
import { useQuery } from "@tanstack/react-query";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface StepTwoCustomizeProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
}

export const StepTwoCustomize = ({ state, onUpdate }: StepTwoCustomizeProps) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [showMoodboardModal, setShowMoodboardModal] = useState(false);
  const [showProductRefModal, setShowProductRefModal] = useState(false);
  const [showContextRefModal, setShowContextRefModal] = useState(false);
  const [savingConceptId, setSavingConceptId] = useState<string | null>(null);
  const [savedConceptsOpen, setSavedConceptsOpen] = useState(true);
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<Concept | null>(null);
  const [isNewConcept, setIsNewConcept] = useState(false);
  const [isScrapingProducts, setIsScrapingProducts] = useState(false);
  const [isSmartMatching, setIsSmartMatching] = useState(false);
  const [lastMatchedConcept, setLastMatchedConcept] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch scraped products from database
  const { data: scrapedProducts = [], isLoading: loadingScrapedProducts, refetch: refetchScrapedProducts } = useQuery({
    queryKey: ['scraped-products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('scraped_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(p => ({
        id: `scraped-${p.id}`,
        dbId: p.id,
        name: p.name,
        thumbnail: p.thumbnail_url,
        url: p.full_url,
        category: 'product' as const,
        isScraped: true,
        productType: p.category || undefined,
      }));
    },
    enabled: !!user?.id,
  });

  // Infer product type for grouping when category is missing or too generic
  const inferProductType = useCallback((name: string) => {
    const n = name.toLowerCase();
    if (n.includes('case') || n.includes('magsafe') || n.includes('duet')) return 'phone-case';
    if (n.includes('strap')) return 'strap';
    if (n.includes('wallet') || n.includes('card')) return 'wallet';
    if (n.includes('bag') || n.includes('crossbody') || n.includes('pouch')) return 'bag';
    return 'accessory';
  }, []);

  // Combine scraped products with sample products (scraped first)
  const allProductReferences = useMemo(() => {
    const normalizedSamples = sampleProductReferences.map(r => ({
      ...r,
      productType: inferProductType(r.name),
    }));
    const normalizedScraped = scrapedProducts.map(r => ({
      ...r,
      productType: (r as any).productType || inferProductType(r.name),
    }));
    return [...normalizedScraped, ...normalizedSamples];
  }, [scrapedProducts, inferProductType]);

  // Handle scraping products from Bandolier
  const handleScrapeProducts = async () => {
    if (!user) {
      toast({ title: 'Please sign in to scrape products', variant: 'destructive' });
      return;
    }

    setIsScrapingProducts(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-products', {
        body: { url: 'https://www.bandolierstyle.com/collections/all' }
      });

      if (error) throw error;

        if (data.success && data.products?.length > 0) {
          // Insert products into database (upsert to avoid duplicates)
          const productsToInsert = data.products.map((p: any) => ({
            user_id: user.id,
            // Use URL as a stable external identifier (index-based IDs change between runs)
            external_id: p.url || p.thumbnail || p.id,
            name: p.name,
            thumbnail_url: p.thumbnail,
            full_url: p.url || p.thumbnail,
            category: p.category || inferProductType(p.name),
            collection: p.collection || 'bandolier',
          }));

        const { error: insertError } = await supabase
          .from('scraped_products')
          .upsert(productsToInsert, { onConflict: 'user_id,external_id' });

        if (insertError) throw insertError;

        toast({ 
          title: `Synced ${data.products.length} products!`, 
          description: 'Your product library has been updated' 
        });
        
        refetchScrapedProducts();
      } else {
        toast({ title: 'No products found', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Failed to scrape products:', err);
      toast({ title: 'Failed to sync products', variant: 'destructive' });
    } finally {
      setIsScrapingProducts(false);
    }
  };

  // Handle deleting a scraped product
  const handleDeleteScrapedProduct = async (productId: string) => {
    const dbId = productId.replace('scraped-', '');
    try {
      const { error } = await supabase
        .from('scraped_products')
        .delete()
        .eq('id', dbId);

      if (error) throw error;
      
      // Clear selection if this product was selected
      if (state.productReferences.includes(productId)) {
        onUpdate({ productReferences: state.productReferences.filter(id => id !== productId) });
      }
      
      refetchScrapedProducts();
      toast({ title: 'Product removed' });
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast({ title: 'Failed to remove product', variant: 'destructive' });
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !state.extraKeywords.includes(newKeyword.trim())) {
      onUpdate({ extraKeywords: [...state.extraKeywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onUpdate({ extraKeywords: state.extraKeywords.filter(k => k !== keyword) });
  };

  // Handle concept selection with preset application
  const handleConceptSelect = useCallback((concept: Concept) => {
    // Reset the smart-match tracker so it will run for the new concept
    setLastMatchedConcept(null);
    
    const updates: Partial<CreativeStudioState> = {
      selectedConcept: concept.id,
      // Reset curated options when concept changes (will be repopulated by smart-match)
      curatedMoodboards: [],
      curatedProducts: [],
      moodboard: null,
      productReferences: [],
    };

    // Apply presets if the concept has them
    if (concept.presets) {
      const presets = concept.presets;
      if (presets.artisticStyle) updates.artisticStyle = presets.artisticStyle;
      if (presets.lightingStyle) updates.lightingStyle = presets.lightingStyle;
      if (presets.cameraAngle) updates.cameraAngle = presets.cameraAngle;
      if (presets.aspectRatio) updates.aspectRatio = presets.aspectRatio;
      if (presets.extraKeywords?.length) {
        updates.extraKeywords = [...state.extraKeywords, ...presets.extraKeywords.filter(k => !state.extraKeywords.includes(k))];
      }
      if (presets.useCase) updates.useCase = presets.useCase as CreativeStudioState['useCase'];
    }

    onUpdate(updates);
  }, [state.extraKeywords, onUpdate]);

  // Save concept to database
  const handleSaveConcept = useCallback(async (concept: Concept) => {
    if (!user) {
      toast({ title: 'Please sign in to save concepts', variant: 'destructive' });
      return;
    }

    setSavingConceptId(concept.id);

    try {
      // Get current customization settings as presets
      const presets: ConceptPresets = {
        artisticStyle: state.artisticStyle || undefined,
        lightingStyle: state.lightingStyle !== 'auto' ? state.lightingStyle : undefined,
        cameraAngle: state.cameraAngle !== 'auto' ? state.cameraAngle : undefined,
        moodboardId: state.moodboard || undefined,
        extraKeywords: state.extraKeywords.length > 0 ? state.extraKeywords : undefined,
        useCase: state.useCase,
        aspectRatio: state.aspectRatio,
      };

      const insertData = {
        user_id: user.id,
        brand_id: state.selectedBrand,
        title: concept.title,
        description: concept.description,
        tags: concept.tags,
        artistic_style: presets.artisticStyle || null,
        lighting_style: presets.lightingStyle || null,
        camera_angle: presets.cameraAngle || null,
        moodboard_id: presets.moodboardId || null,
        extra_keywords: presets.extraKeywords || [],
        use_case: presets.useCase || null,
        aspect_ratio: presets.aspectRatio || null,
        // 9-point concept fields
        core_idea: concept.coreIdea || null,
        consumer_insight: concept.consumerInsight || null,
        product_focus: concept.productFocus as unknown as null,
        visual_world: concept.visualWorld as unknown as null,
        taglines: concept.taglines || null,
        content_pillars: concept.contentPillars as unknown as null,
        target_audience: concept.targetAudience as unknown as null,
        tonality: concept.tonality as unknown as null,
      };
      
      const { error } = await supabase.from('saved_concepts').insert(insertData);

      if (error) throw error;

      toast({ title: 'Concept saved!', description: 'You can reuse this concept later' });
      
      // Refresh saved concepts
      fetchSavedConcepts();
    } catch (err) {
      console.error('Failed to save concept:', err);
      toast({ title: 'Failed to save concept', variant: 'destructive' });
    } finally {
      setSavingConceptId(null);
    }
  }, [user, state, toast]);

  // Fetch saved concepts
  const fetchSavedConcepts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_concepts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const savedConcepts: SavedConcept[] = (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        brandId: row.brand_id,
        title: row.title,
        description: row.description,
        tags: row.tags || [],
        // 9-point concept fields
        coreIdea: row.core_idea || undefined,
        consumerInsight: row.consumer_insight || undefined,
        productFocus: row.product_focus as any || undefined,
        visualWorld: row.visual_world as any || undefined,
        taglines: row.taglines || undefined,
        contentPillars: row.content_pillars as any || undefined,
        targetAudience: row.target_audience as any || undefined,
        tonality: row.tonality as any || undefined,
        presets: {
          artisticStyle: row.artistic_style || undefined,
          lightingStyle: row.lighting_style || undefined,
          cameraAngle: row.camera_angle || undefined,
          moodboardId: row.moodboard_id || undefined,
          extraKeywords: row.extra_keywords || undefined,
          useCase: row.use_case || undefined,
          aspectRatio: row.aspect_ratio || undefined,
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      onUpdate({ savedConcepts });
    } catch (err) {
      console.error('Failed to fetch saved concepts:', err);
    }
  }, [user, onUpdate]);

  // Fetch saved concepts on mount
  useEffect(() => {
    fetchSavedConcepts();
  }, [fetchSavedConcepts]);

  // Delete saved concept
  const handleDeleteSavedConcept = useCallback(async (conceptId: string) => {
    try {
      const { error } = await supabase
        .from('saved_concepts')
        .delete()
        .eq('id', conceptId);

      if (error) throw error;

      toast({ title: 'Concept removed' });
      fetchSavedConcepts();
    } catch (err) {
      console.error('Failed to delete concept:', err);
      toast({ title: 'Failed to remove concept', variant: 'destructive' });
    }
  }, [toast, fetchSavedConcepts]);

  // Check if concept is already saved
  const isConceptSaved = useCallback((conceptId: string) => {
    return state.savedConcepts.some(sc => 
      sc.title === state.concepts.find(c => c.id === conceptId)?.title
    );
  }, [state.savedConcepts, state.concepts]);

  // Open edit modal for a concept
  const handleEditConcept = useCallback((concept: Concept, isNew: boolean = false) => {
    setEditingConcept(concept);
    setIsNewConcept(isNew);
    setEditModalOpen(true);
  }, []);

  // Handle saving edited concept
  const handleSaveEditedConcept = useCallback((updatedConcept: Concept) => {
    if (isNewConcept) {
      // Add new concept to the list
      onUpdate({ concepts: [...state.concepts, updatedConcept] });
    } else {
      // Update existing concept in the list
      const updatedConcepts = state.concepts.map(c => 
        c.id === updatedConcept.id ? updatedConcept : c
      );
      onUpdate({ concepts: updatedConcepts });
    }
  }, [state.concepts, isNewConcept, onUpdate]);

  // Open modal for adding new concept
  const handleAddConcept = useCallback(() => {
    setEditingConcept(null);
    setIsNewConcept(true);
    setEditModalOpen(true);
  }, []);

  // Handle moodboard toggle (deselect if already selected)
  const handleMoodboardSelect = (moodboardId: string) => {
    if (state.moodboard === moodboardId) {
      onUpdate({ moodboard: null }); // Deselect
    } else {
      onUpdate({ moodboard: moodboardId }); // Select
    }
  };

  // Handle product selection (multi-select, max 3)
  const handleProductSelect = (productId: string) => {
    const isSelected = state.productReferences.includes(productId);
    if (isSelected) {
      // Deselect
      onUpdate({ productReferences: state.productReferences.filter(id => id !== productId) });
    } else if (state.productReferences.length < 3) {
      // Select (only if under limit)
      onUpdate({ productReferences: [...state.productReferences, productId] });
    } else {
      toast({ title: 'Maximum 3 products', description: 'Deselect one to add another' });
    }
  };

  // Fetch moodboards from database (including visual_analysis)
  // IMPORTANT: Use same query key as MoodboardModal so invalidation works across both
  const { data: customMoodboards = [], isLoading: loadingMoodboards } = useQuery({
    queryKey: ['custom-moodboards', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('custom_moodboards')
        .select('*, visual_analysis')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(m => ({
        id: `custom-${m.id}`,
        name: m.name,
        thumbnail: m.thumbnail_url,
        filePath: m.file_path,
        description: m.description || 'Custom moodboard',
        visualAnalysis: m.visual_analysis as Moodboard['visualAnalysis'],
      })) as Moodboard[];
    },
    enabled: !!user?.id,
  });

  // Get curated moodboards (filter from custom moodboards based on curated IDs)
  const curatedMoodboardItems = useMemo(() => {
    const curatedIds = state.curatedMoodboards || [];
    if (curatedIds.length === 0) return [];
    return curatedIds
      .map(id => customMoodboards.find(m => m.id === id))
      .filter(Boolean) as Moodboard[];
  }, [state.curatedMoodboards, customMoodboards]);

  // Get curated products (filter from all products based on curated IDs)
  const curatedProductItems = useMemo(() => {
    const curatedIds = state.curatedProducts || [];
    if (curatedIds.length === 0) return [];
    return curatedIds
      .map(id => allProductReferences.find(p => p.id === id))
      .filter(Boolean) as ReferenceImage[];
  }, [state.curatedProducts, allProductReferences]);

  // Displayed moodboards: selected first, then curated, then fill to 3
  const displayedMoodboards = useMemo(() => {
    const selectedMoodboard = state.moodboard 
      ? customMoodboards.find(m => m.id === state.moodboard) 
      : null;
    
    const curated = curatedMoodboardItems.filter(m => m.id !== state.moodboard);
    const remaining = customMoodboards.filter(m => 
      m.id !== state.moodboard && !curatedMoodboardItems.some(c => c.id === m.id)
    );
    
    const result: Moodboard[] = [];
    if (selectedMoodboard) result.push(selectedMoodboard);
    result.push(...curated.slice(0, 3 - result.length));
    if (result.length < 3) result.push(...remaining.slice(0, 3 - result.length));
    
    return result;
  }, [state.moodboard, customMoodboards, curatedMoodboardItems]);

  // Displayed products: selected first, then curated, then fill to 5
  const displayedProducts = useMemo(() => {
    const selectedIds = state.productReferences;
    const selectedItems = selectedIds
      .map(id => allProductReferences.find(p => p.id === id))
      .filter(Boolean) as ReferenceImage[];
    
    const curated = curatedProductItems.filter(p => !selectedIds.includes(p.id));
    const remaining = allProductReferences.filter(p => 
      !selectedIds.includes(p.id) && !curatedProductItems.some(c => c.id === p.id)
    );
    
    const result: ReferenceImage[] = [...selectedItems];
    result.push(...curated.slice(0, 5 - result.length));
    if (result.length < 5) result.push(...remaining.slice(0, 5 - result.length));
    
    return result;
  }, [state.productReferences, allProductReferences, curatedProductItems]);

  // Smart AI-powered auto-selection of moodboard and product based on selected concept
  // IMPORTANT: Only runs when concept CHANGES, not when moodboards/products data loads
  useEffect(() => {
    if (!state.selectedConcept) return;
    
    // Skip if we already matched for this concept
    if (lastMatchedConcept === state.selectedConcept) return;
    
    // Wait for both data sources to be ready before running
    if (customMoodboards.length === 0 && allProductReferences.length === 0) return;
    
    const selectedConcept = state.concepts.find(c => c.id === state.selectedConcept) || 
                           state.savedConcepts.find(c => c.id === state.selectedConcept);
    
    if (!selectedConcept) return;

    // Mark this concept as being matched
    setLastMatchedConcept(state.selectedConcept);

    // Call the smart-match agent
    const runSmartMatch = async () => {
      setIsSmartMatching(true);
      try {
        const { data, error } = await supabase.functions.invoke('smart-match', {
          body: {
            concept: {
              title: selectedConcept.title,
              coreIdea: selectedConcept.coreIdea,
              visualWorld: selectedConcept.visualWorld,
              productFocus: selectedConcept.productFocus,
              targetAudience: selectedConcept.targetAudience,
              tonality: selectedConcept.tonality,
              consumerInsight: selectedConcept.consumerInsight,
            },
            moodboards: customMoodboards.map(m => ({ 
              id: m.id, 
              name: m.name, 
              description: m.description,
              visualAnalysis: m.visualAnalysis, // Pass rich analysis for better matching
            })),
            products: allProductReferences.map(p => ({ 
              id: p.id, 
              name: p.name, 
              category: (p as any).productType 
            })),
          }
        });

        if (error) {
          console.error('Smart match error:', error);
          return;
        }

        const updates: Partial<CreativeStudioState> = {};
        
        // Normalize moodboard IDs returned from smart-match
        // The AI might return bare UUIDs, but frontend expects "custom-{uuid}" format
        const normalizeId = (id: string, validIds: string[]) => {
          if (validIds.includes(id)) return id;
          // Try with custom- prefix
          const prefixed = `custom-${id}`;
          if (validIds.includes(prefixed)) return prefixed;
          // Try stripping prefix if it has one
          if (id.startsWith('custom-')) {
            const stripped = id.replace('custom-', '');
            if (validIds.includes(stripped)) return stripped;
          }
          return null; // Invalid ID
        };
        
        // Store curated options (normalize IDs)
        if (data?.rankedMoodboards?.length > 0) {
          const validMoodboardIds = customMoodboards.map(m => m.id);
          const normalizedMoodboards = data.rankedMoodboards
            .map((id: string) => normalizeId(id, validMoodboardIds))
            .filter(Boolean) as string[];
          
          if (normalizedMoodboards.length > 0) {
            updates.curatedMoodboards = normalizedMoodboards;
            updates.moodboard = normalizedMoodboards[0]; // Pre-select best
          }
        }
        if (data?.rankedProducts?.length > 0) {
          const validProductIds = allProductReferences.map(p => p.id);
          const normalizedProducts = data.rankedProducts
            .map((id: string) => normalizeId(id, validProductIds))
            .filter(Boolean) as string[];
          
          if (normalizedProducts.length > 0) {
            updates.curatedProducts = normalizedProducts;
            updates.productReferences = [normalizedProducts[0]]; // Pre-select best
          }
        }

        if (Object.keys(updates).length > 0) {
          onUpdate(updates);
          
          // Show toast with matching reason
          if (data?.matchReason) {
            toast({ 
              title: 'AI matched your creative assets', 
              description: data.matchReason,
            });
          }
        }
      } catch (err) {
        console.error('Smart match failed:', err);
      } finally {
        setIsSmartMatching(false);
      }
    };

    runSmartMatch();
  }, [state.selectedConcept, customMoodboards.length, allProductReferences.length, state.concepts, state.savedConcepts, lastMatchedConcept]);

  return (
    <div className="space-y-8">
      {/* ===== 1. CONCEPTS SECTION ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Concepts
          </h3>
          <span className="text-sm text-muted-foreground">Pick one or add your own</span>
        </div>

        {/* Saved Concepts - Collapsible */}
        {state.savedConcepts.length > 0 && (
          <Collapsible open={savedConceptsOpen} onOpenChange={setSavedConceptsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left hover:bg-secondary/30 rounded-lg px-2 -mx-2 transition-colors">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Your Saved Concepts</span>
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                  {state.savedConcepts.length}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${savedConceptsOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {state.savedConcepts.map((concept) => (
                <SavedConceptCard
                  key={concept.id}
                  concept={concept}
                  isSelected={state.selectedConcept === concept.id}
                  onSelect={() => handleConceptSelect(concept)}
                  onEdit={() => handleEditConcept(concept)}
                  onDelete={() => handleDeleteSavedConcept(concept.id)}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Generated Concepts - with progressive loading */}
        <div className="space-y-3">
          {state.concepts.length > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 
              {state.isLoadingConcepts 
                ? `Generating concepts (${state.concepts.length}/3)...` 
                : 'AI-generated concepts'}
            </p>
          )}
          
          {/* Show loaded concepts */}
          {state.concepts.map((concept, index) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              index={index}
              isSelected={state.selectedConcept === concept.id}
              onSelect={() => handleConceptSelect(concept)}
              onSave={() => handleSaveConcept(concept)}
              onEdit={() => handleEditConcept(concept)}
              isSaved={isConceptSaved(concept.id)}
              showSaveButton={!!user}
            />
          ))}
          
          {/* Show skeleton placeholders while loading */}
          {state.isLoadingConcepts && (
            <>
              {Array.from({ length: 3 - state.concepts.length }).map((_, i) => (
                <ConceptCardSkeleton key={`skeleton-${i}`} index={state.concepts.length + i} />
              ))}
            </>
          )}
          
          {/* Add concept button (hide while loading) */}
          {!state.isLoadingConcepts && (
            <AddConceptCard onClick={handleAddConcept} />
          )}
        </div>
      </div>

      {/* ===== CUSTOMIZATION PANEL (CONDITIONAL) ===== */}
      {!state.selectedConcept ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-4 text-muted-foreground/50" />
          <h4 className="font-medium text-foreground mb-2">Select a concept above</h4>
          <p className="text-sm text-muted-foreground">
            Choose a concept to unlock AI-curated moodboards and product references
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30">
            <h3 className="font-semibold text-foreground">Customize your creative</h3>
          </div>

          {/* ===== 2. MOODBOARD SECTION (Curated 3) ===== */}
          <CustomizationSection 
            title={
              <span className="flex items-center gap-2">
                Moodboard
                {isSmartMatching && (
                  <span className="flex items-center gap-1 text-xs text-accent">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    matching...
                  </span>
                )}
              </span>
            } 
            icon={<Palette className="w-4 h-4" />}
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                AI-curated visual moods for your campaign (select one)
              </p>
              
              {/* Moodboard Grid - 3 large items (selected first, then curated, then fallback) */}
              <div className="grid grid-cols-3 gap-4">
                {isSmartMatching || loadingMoodboards ? (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="aspect-[4/3] rounded-xl bg-secondary/50 animate-pulse" />
                    ))}
                  </>
                ) : displayedMoodboards.length > 0 ? (
                  displayedMoodboards.map((moodboard) => (
                    <MoodboardThumbnail
                      key={moodboard.id}
                      moodboard={moodboard}
                      isSelected={state.moodboard === moodboard.id}
                      onSelect={() => handleMoodboardSelect(moodboard.id)}
                      size="large"
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-muted-foreground text-sm">
                    No moodboards available. Upload some in the library.
                  </div>
                )}
              </div>
              
              {/* View All Moodboards */}
              <button 
                onClick={() => setShowMoodboardModal(true)}
                className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
              >
                Browse all moodboards
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </CustomizationSection>

          {/* ===== 3. PRODUCT REFERENCE SECTION (Curated 5, Multi-select up to 3) ===== */}
          <CustomizationSection 
            title={
              <span className="flex items-center gap-2">
                Product Reference
                {isSmartMatching && (
                  <span className="flex items-center gap-1 text-xs text-accent">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    matching...
                  </span>
                )}
                {state.productReferences.length > 0 && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                    {state.productReferences.length}/3 selected
                  </span>
                )}
              </span>
            } 
            icon={<Package className="w-4 h-4" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  AI-curated products for your campaign (select up to 3)
                </p>
                {state.productReferences.length > 0 && (
                  <button 
                    onClick={() => onUpdate({ productReferences: [] })}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              {/* Product Grid - 5 items (selected first, then curated, then fallback) */}
              <div className="grid grid-cols-5 gap-3">
                {isSmartMatching || loadingScrapedProducts ? (
                  <>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg bg-secondary/50 animate-pulse" />
                    ))}
                  </>
                ) : displayedProducts.length > 0 ? (
                  displayedProducts.map((ref) => (
                    <ReferenceThumbnail
                      key={ref.id}
                      reference={ref}
                      isSelected={state.productReferences.includes(ref.id)}
                      onSelect={() => handleProductSelect(ref.id)}
                      showLabel={true}
                    />
                  ))
                ) : (
                  <div className="col-span-5 text-center py-6 text-muted-foreground text-sm">
                    No products available. Sync from Bandolier below.
                  </div>
                )}
              </div>

              {/* Actions Row */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleScrapeProducts}
                  disabled={isScrapingProducts}
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent transition-colors disabled:opacity-50"
                >
                  {isScrapingProducts ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  {isScrapingProducts ? 'Syncing...' : 'Sync from Bandolier'}
                </button>
                
                <button 
                  onClick={() => setShowProductRefModal(true)}
                  className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  Browse all products
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CustomizationSection>

          {/* ===== 4. SHOT TYPE SECTION (Single-select, optional) ===== */}
          <CustomizationSection 
            title={
              <span className="flex items-center gap-2">
                Shot Type
                {state.contextReference && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                    1 selected
                  </span>
                )}
              </span>
            }
            icon={<Focus className="w-4 h-4" />}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Select shot composition (optional)
                </p>
                {state.contextReference && (
                  <button 
                    onClick={() => onUpdate({ contextReference: null })}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {/* Shot Type Grid - Single-select, click again to deselect */}
              <div className="grid grid-cols-4 gap-3">
                {sampleContextReferences.map((ref) => (
                  <ReferenceThumbnail
                    key={ref.id}
                    reference={ref}
                    isSelected={state.contextReference === ref.id}
                    onSelect={() => {
                      // Toggle: clicking selected item deselects it
                      onUpdate({ 
                        contextReference: state.contextReference === ref.id ? null : ref.id 
                      });
                    }}
                    showLabel={true}
                  />
                ))}
              </div>
              
              {/* Custom Shot Upload */}
              <button 
                onClick={() => setShowContextRefModal(true)}
                className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload custom shot reference
              </button>
            </div>
          </CustomizationSection>

          {/* ===== 5. PROMPT REFINEMENT SECTION ===== */}
          <CustomizationSection 
            title="Prompt Refinement" 
            icon={<Type className="w-4 h-4" />}
          >
            <div className="space-y-5">
              {/* Lighting & Camera Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Sun className="w-3 h-3" /> Lighting
                  </label>
                  <Select 
                    value={state.lightingStyle} 
                    onValueChange={(v) => onUpdate({ lightingStyle: v })}
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lightingStyles.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Camera Angle
                  </label>
                  <Select 
                    value={state.cameraAngle} 
                    onValueChange={(v) => onUpdate({ cameraAngle: v })}
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cameraAngles.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Extra Keywords */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Extra Keywords</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {state.extraKeywords.map((keyword) => (
                    <span 
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-sm"
                    >
                      {keyword}
                      <button 
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                    placeholder="Add keyword..."
                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                  <button 
                    onClick={handleAddKeyword}
                    className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Negative Prompt</label>
                <input
                  type="text"
                  value={state.negativePrompt}
                  onChange={(e) => onUpdate({ negativePrompt: e.target.value })}
                  placeholder="e.g., 'blurry, low quality, text artifacts'"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              {/* Text on Image */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Text on Image</label>
                <input
                  type="text"
                  value={state.textOnImage}
                  onChange={(e) => onUpdate({ textOnImage: e.target.value })}
                  placeholder="e.g., 'New Collection' or 'Sale 50% Off'"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            </div>
          </CustomizationSection>

          {/* ===== 6. OUTPUT SETTINGS SECTION ===== */}
          <CustomizationSection 
            title="Output" 
            icon={<Settings2 className="w-4 h-4" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Number of Images */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Images</label>
                  <Select 
                    value={String(state.imageCount)} 
                    onValueChange={(v) => onUpdate({ imageCount: Number(v) })}
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 4, 8].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resolution */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Resolution</label>
                  <Select 
                    value={state.resolution} 
                    onValueChange={(v) => onUpdate({ resolution: v })}
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resolutions.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Aspect Ratio</label>
                  <Select 
                    value={state.aspectRatio} 
                    onValueChange={(v) => onUpdate({ aspectRatio: v })}
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map((ar) => (
                        <SelectItem key={ar} value={ar}>{ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CustomizationSection>

          {/* ===== 8. AI MODEL SECTION ===== */}
          <CustomizationSection 
            title="AI Model" 
            icon={<Cpu className="w-4 h-4" />}
          >
            <div className="grid grid-cols-3 gap-3">
              {aiModels.map((model) => (
                <button
                  key={model.value}
                  onClick={() => onUpdate({ aiModel: model.value })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    state.aiModel === model.value
                      ? 'border-accent bg-accent/10 shadow-md'
                      : 'border-border bg-secondary/30 hover:border-accent/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {model.value === 'auto' && <Wand2 className="w-5 h-5 text-accent" />}
                    {model.value === 'gemini' && <span className="text-lg">✨</span>}
                    {model.value === 'flux' && <span className="text-lg">⚡</span>}
                    <span className="text-sm font-medium text-foreground">{model.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </CustomizationSection>

          {/* ===== 9. ADVANCED SETTINGS ===== */}
          <CustomizationSection 
            title="Advanced Settings" 
            icon={<Settings2 className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="space-y-4">
              {/* Guidance Scale */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Guidance Scale</label>
                  <span className="text-sm font-medium text-foreground">{state.guidanceScale}</span>
                </div>
                <Slider
                  value={[state.guidanceScale]}
                  onValueChange={([v]) => onUpdate({ guidanceScale: v })}
                  min={1}
                  max={20}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Seed */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Seed (optional)
                </label>
                <input
                  type="number"
                  value={state.seed || ''}
                  onChange={(e) => onUpdate({ seed: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Random"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              {/* Save to Folder */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" /> Save to Folder
                </label>
                <Select 
                  value={state.saveToFolder || ''} 
                  onValueChange={(v) => onUpdate({ saveToFolder: v })}
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Select folder..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="campaign-assets">Campaign Assets</SelectItem>
                    <SelectItem value="product-photos">Product Photos</SelectItem>
                    <SelectItem value="social-content">Social Content</SelectItem>
                    <SelectItem value="archive">Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CustomizationSection>
        </div>
      )}

      {/* ===== MODALS ===== */}
      <MoodboardModal
        isOpen={showMoodboardModal}
        onClose={() => setShowMoodboardModal(false)}
        selectedMoodboard={state.moodboard}
        onSelect={(id) => onUpdate({ moodboard: id })}
      />

      <ReferenceGalleryModal
        isOpen={showProductRefModal}
        onClose={() => setShowProductRefModal(false)}
        title="Product Reference"
        references={allProductReferences}
        selectedReferences={state.productReferences}
        onSelect={(id) => handleProductSelect(id)}
        onDelete={handleDeleteScrapedProduct}
        multiSelect={true}
      />

      <ReferenceGalleryModal
        isOpen={showContextRefModal}
        onClose={() => setShowContextRefModal(false)}
        title="Shot References"
        references={sampleContextReferences}
        selectedReference={state.contextReference}
        onSelect={(id) => {
          // Single-select: toggle selection
          onUpdate({ contextReference: state.contextReference === id ? null : id });
        }}
        multiSelect={false}
      />

      {/* Concept Edit Modal */}
      <ConceptEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        concept={editingConcept}
        onSave={handleSaveEditedConcept}
        isNew={isNewConcept}
        defaultUseCase={state.useCase}
      />
    </div>
  );
};

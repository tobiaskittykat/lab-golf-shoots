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
      if (state.productReference === productId) {
        onUpdate({ productReference: null });
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
    const updates: Partial<CreativeStudioState> = {
      selectedConcept: concept.id
    };

    // Apply presets if the concept has them
    if (concept.presets) {
      const presets = concept.presets;
      if (presets.artisticStyle) updates.artisticStyle = presets.artisticStyle;
      if (presets.lightingStyle) updates.lightingStyle = presets.lightingStyle;
      if (presets.cameraAngle) updates.cameraAngle = presets.cameraAngle;
      if (presets.moodboardId) updates.moodboard = presets.moodboardId;
      if (presets.aspectRatio) updates.aspectRatio = presets.aspectRatio;
      if (presets.extraKeywords?.length) {
        updates.extraKeywords = [...state.extraKeywords, ...presets.extraKeywords.filter(k => !state.extraKeywords.includes(k))];
      }
      if (presets.useCase) updates.useCase = presets.useCase as CreativeStudioState['useCase'];
    }
    
    // Apply aspect ratio from presets if available
    if (concept.presets?.aspectRatio) {
      updates.aspectRatio = concept.presets.aspectRatio;
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

  // Fetch moodboards from database
  const { data: customMoodboards = [], isLoading: loadingMoodboards } = useQuery({
    queryKey: ['custom-moodboards-preview', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('custom_moodboards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(m => ({
        id: `custom-${m.id}`,
        name: m.name,
        thumbnail: m.thumbnail_url,
        description: m.description || 'Custom moodboard',
      })) as Moodboard[];
    },
    enabled: !!user?.id,
  });

  // Show first 6 moodboards
  const visibleMoodboards = customMoodboards.slice(0, 6);

  // Smart auto-selection of moodboard based on selected concept
  useEffect(() => {
    if (!state.selectedConcept || state.moodboard || customMoodboards.length === 0) return;
    
    const selectedConcept = state.concepts.find(c => c.id === state.selectedConcept) || 
                           state.savedConcepts.find(c => c.id === state.selectedConcept);
    
    if (!selectedConcept) return;
    
    // Build search terms from concept metadata
    const searchTerms: string[] = [];
    if (selectedConcept.title) searchTerms.push(...selectedConcept.title.toLowerCase().split(' '));
    if (selectedConcept.coreIdea) searchTerms.push(...selectedConcept.coreIdea.toLowerCase().split(' '));
    if (selectedConcept.visualWorld?.atmosphere) searchTerms.push(...selectedConcept.visualWorld.atmosphere.toLowerCase().split(' '));
    if (selectedConcept.visualWorld?.palette) searchTerms.push(...selectedConcept.visualWorld.palette.map(p => p.toLowerCase()));
    
    // Find best matching moodboard
    let bestMatch: Moodboard | null = null;
    let bestScore = 0;
    
    for (const moodboard of customMoodboards) {
      const moodboardText = `${moodboard.name} ${moodboard.description || ''}`.toLowerCase();
      let score = 0;
      
      for (const term of searchTerms) {
        if (term.length > 2 && moodboardText.includes(term)) {
          score++;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = moodboard;
      }
    }
    
    // Only auto-select if we found a decent match
    if (bestMatch && bestScore >= 2) {
      onUpdate({ moodboard: bestMatch.id });
    }
  }, [state.selectedConcept, customMoodboards, state.concepts, state.savedConcepts]);

  // Smart auto-selection of product reference based on selected concept
  useEffect(() => {
    if (!state.selectedConcept || state.productReference || allProductReferences.length === 0) return;
    
    const selectedConcept = state.concepts.find(c => c.id === state.selectedConcept) || 
                           state.savedConcepts.find(c => c.id === state.selectedConcept);
    
    if (!selectedConcept?.productFocus?.productCategory) return;
    
    // Build search terms from product focus
    const searchTerms = selectedConcept.productFocus.productCategory.toLowerCase().split(/\s+/);
    
    // Find best matching product
    let bestMatch: typeof allProductReferences[0] | null = null;
    let bestScore = 0;
    
    for (const product of allProductReferences) {
      const productText = product.name.toLowerCase();
      let score = 0;
      
      for (const term of searchTerms) {
        if (term.length > 2 && productText.includes(term)) {
          score++;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = product;
      }
    }
    
    // Auto-select if we found a match
    if (bestMatch && bestScore >= 1) {
      onUpdate({ productReference: bestMatch.id });
    }
  }, [state.selectedConcept, allProductReferences, state.concepts, state.savedConcepts]);

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

      {/* ===== CUSTOMIZATION PANEL ===== */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="font-semibold text-foreground">Customize your creative</h3>
        </div>

        {/* ===== 2. MOODBOARD SECTION ===== */}
        <CustomizationSection 
          title="Moodboard" 
          icon={<Palette className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Set the visual mood and color palette</p>
            
            {/* Moodboard Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {loadingMoodboards ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-xl bg-secondary/50 animate-pulse" />
                  ))}
                </>
              ) : visibleMoodboards.length > 0 ? (
                visibleMoodboards.map((moodboard) => (
                  <MoodboardThumbnail
                    key={moodboard.id}
                    moodboard={moodboard}
                    isSelected={state.moodboard === moodboard.id}
                    onSelect={() => handleMoodboardSelect(moodboard.id)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-muted-foreground text-sm">
                  No moodboards uploaded yet. Click below to add some.
                </div>
              )}
            </div>

            {/* View More Button */}
            <button 
              onClick={() => setShowMoodboardModal(true)}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              View more moodboards
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CustomizationSection>

        {/* ===== 3. PRODUCT REFERENCE SECTION ===== */}
        <CustomizationSection 
          title="Product Reference" 
          icon={<Package className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Your product image for the creative</p>
              {scrapedProducts.length > 0 && (
                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                  {scrapedProducts.length} from Bandolier
                </span>
              )}
            </div>
            
            {/* Product Reference Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {loadingScrapedProducts ? (
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-secondary/50 animate-pulse" />
                  ))}
                </>
              ) : (
                <>
                  {allProductReferences.slice(0, 4).map((ref) => (
                    <ReferenceThumbnail
                      key={ref.id}
                      reference={ref}
                      isSelected={state.productReference === ref.id}
                      onSelect={() => onUpdate({ productReference: ref.id })}
                    />
                  ))}
                </>
              )}
              
              {/* Upload Button */}
              <button className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowProductRefModal(true)}
                className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
              >
                View more options
                <ChevronRight className="w-4 h-4" />
              </button>
              
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
            </div>
          </div>
        </CustomizationSection>

        {/* ===== 4. SHOT REFERENCES SECTION (Multi-select) ===== */}
        <CustomizationSection 
          title="Shot References" 
          icon={<Focus className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Scene, environment, or setting for your product (select multiple)</p>
            
            {/* Selected count badge */}
            {state.contextReferences.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                  {state.contextReferences.length} selected
                </span>
                <button 
                  onClick={() => onUpdate({ contextReferences: [] })}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
            )}
            
            {/* Shot Reference Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {sampleContextReferences.slice(0, 5).map((ref) => (
                <ReferenceThumbnail
                  key={ref.id}
                  reference={ref}
                  isSelected={state.contextReferences.includes(ref.id)}
                  onSelect={() => {
                    const isSelected = state.contextReferences.includes(ref.id);
                    if (isSelected) {
                      onUpdate({ contextReferences: state.contextReferences.filter(id => id !== ref.id) });
                    } else {
                      onUpdate({ contextReferences: [...state.contextReferences, ref.id] });
                    }
                  }}
                  showLabel={true}
                />
              ))}
              
              {/* Upload Button */}
              <button className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* View More */}
            <button 
              onClick={() => setShowContextRefModal(true)}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              View more options
              <ChevronRight className="w-4 h-4" />
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
        selectedReference={state.productReference}
        onSelect={(id) => onUpdate({ productReference: id })}
        onDelete={handleDeleteScrapedProduct}
      />

      <ReferenceGalleryModal
        isOpen={showContextRefModal}
        onClose={() => setShowContextRefModal(false)}
        title="Shot References"
        references={sampleContextReferences}
        selectedReferences={state.contextReferences}
        onSelect={(id) => {
          const isSelected = state.contextReferences.includes(id);
          if (isSelected) {
            onUpdate({ contextReferences: state.contextReferences.filter(refId => refId !== id) });
          } else {
            onUpdate({ contextReferences: [...state.contextReferences, id] });
          }
        }}
        multiSelect={true}
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

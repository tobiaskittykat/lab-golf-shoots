import { useState, useCallback, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Image, ChevronDown, ChevronRight, ArrowLeft, Sparkles, Compass } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { CreativeStudioHeader } from "./CreativeStudioHeader";
import { StepOnePrompt } from "./StepOnePrompt";
import { StepTwoCustomize } from "./StepTwoCustomize";
import { UnifiedWorkspace } from "./UnifiedWorkspace";
import { SelectionIndicators } from "./SelectionIndicators";
import { DiscoveryModeGallery } from "./DiscoveryModeGallery";
import { DiscoverySwipeView } from "./DiscoverySwipeView";
import { CampaignStyleSummary } from "./CampaignStyleSummary";
import { CreativeStudioState, initialCreativeStudioState, GeneratedImage, SavedConcept, UserPreference, CampaignStyle, ProductShootState, initialProductShootState } from "./types";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useBrands } from "@/hooks/useBrands";
import { useBrandImages } from "@/hooks/useBrandImages";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { smoothScrollTo } from "@/lib/utils";
import { ProductShootSubtypeSelector, ProductShootStep2, ProductShootIndicators } from "./product-shoot";

interface CreativeStudioWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreativeStudioWizard = ({ isOpen, onOpenChange }: CreativeStudioWizardProps) => {
  const [state, setState] = useState<CreativeStudioState>(initialCreativeStudioState);
  const [previousImages, setPreviousImages] = useState<GeneratedImage[]>([]);
  const navigate = useNavigate();
  const { currentBrand } = useBrands();
  const { user } = useAuth();
  const { images: brandImages, fetchImages: fetchBrandImages } = useBrandImages();
  const { 
    isGeneratingConcepts, 
    isGeneratingImages, 
    isGeneratingDiscovery,
    conceptsProgress,
    generateConcepts, 
    generateImages,
    generateVariations,
    deleteImage,
    editImage,
    generateDiscoveryBatch,
    updateImageLike,
    generateFromPreferences,
  } = useImageGeneration();
  
  // Discovery mode state
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [discoveryView, setDiscoveryView] = useState<'grid' | 'swipe' | 'summary'>('grid');
  const [campaignStyle, setCampaignStyle] = useState<CampaignStyle | null>(null);
  
  // Get brand logo URL
  const brandLogo = brandImages.find(img => img.category === 'logo');
  const logoUrl = brandLogo?.image_url;
  
  // Refs for floating footer positioning
  const step2CardRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  // State for floating footer
  const [floating, setFloating] = useState({ active: false, left: 0, width: 0 });
  const [footerHeight, setFooterHeight] = useState(80);
  const [isAgentMatching, setIsAgentMatching] = useState(false);

  // Fetch previously generated images
  const fetchPreviousImages = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .eq('brand_id', currentBrand?.id || '')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && !error) {
      const images: GeneratedImage[] = data.map((img, index) => {
        // Extract references from settings.references if present (new format)
        const settings = img.settings as Record<string, any> | null;
        const refs = settings?.references || {};
        
        return {
          id: img.id,
          imageUrl: img.image_url,
          status: (img.status as 'pending' | 'completed' | 'failed' | 'nsfw') || 'completed',
          prompt: img.prompt,
          refinedPrompt: img.refined_prompt || undefined,
          conceptTitle: img.concept_title || undefined,
          index,
          // Moodboard references
          moodboardId: refs.moodboardId || img.moodboard_id || undefined,
          moodboardUrl: refs.moodboardUrl || undefined,
          // Product references - prefer array from settings, fallback to single
          productReferenceUrls: refs.productReferenceUrls?.length > 0 
            ? refs.productReferenceUrls 
            : (img.product_reference_url ? [img.product_reference_url] : undefined),
          productReferenceUrl: img.product_reference_url || undefined,
          // Context references - prefer array from settings, fallback to single
          contextReferenceUrls: refs.contextReferenceUrls?.length > 0 
            ? refs.contextReferenceUrls 
            : (img.context_reference_url ? [img.context_reference_url] : undefined),
          contextReferenceUrl: img.context_reference_url || undefined,
          // Generation settings (includes aiModel)
          settings: settings || undefined,
        };
      });
      setPreviousImages(images);
    } else if (error) {
      console.error('Error fetching images:', error);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchPreviousImages();
    fetchBrandImages();
  }, [fetchPreviousImages, fetchBrandImages]);

  // Fetch saved concepts on mount for Step 1 display
  useEffect(() => {
    const fetchSavedConcepts = async () => {
      if (!user?.id) return;
      
      let query = supabase
        .from('saved_concepts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      // Filter by brand if available
      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }
      
      const { data, error } = await query;
      
      if (data && !error) {
        const concepts: SavedConcept[] = data.map(row => ({
          id: row.id,
          userId: row.user_id,
          brandId: row.brand_id,
          title: row.title,
          description: row.description,
          tags: row.tags || [],
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
            productIds: (row as any).product_reference_ids || undefined,
            extraKeywords: row.extra_keywords || undefined,
            useCase: row.use_case || undefined,
            aspectRatio: row.aspect_ratio || undefined,
          },
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        
        handleUpdate({ savedConcepts: concepts });
      }
    };
    
    fetchSavedConcepts();
  }, [user?.id]);

  // Refetch when new images are generated
  useEffect(() => {
    if (state.generatedImages.length > 0) {
      // Small delay to allow DB to update
      const timer = setTimeout(fetchPreviousImages, 500);
      return () => clearTimeout(timer);
    }
  }, [state.generatedImages, fetchPreviousImages]);

  const handleUpdate = useCallback((updates: Partial<CreativeStudioState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Handler for Product Shoot state updates
  const handleProductShootUpdate = useCallback((updates: Partial<ProductShootState>) => {
    setState(prev => ({
      ...prev,
      productShoot: { ...prev.productShoot, ...updates }
    }));
  }, []);

  const handleContinue = useCallback(async () => {
    // Reset ALL Step 2 selections when generating new concepts to avoid stale selections
    handleUpdate({ 
      isLoadingConcepts: true, 
      step: 2, 
      concepts: [],
      selectedConcept: null,
      moodboard: null,
      productReferences: [],
      curatedMoodboards: [],
      curatedProducts: [],
      displayedMoodboardIds: [],
      displayedProductIds: [],
    });
    
    // Progressive callback to add concepts one by one (no auto-selection)
    const onConceptReady = (concept: any, index: number) => {
      setState(prev => ({
        ...prev,
        concepts: [...prev.concepts, concept],
      }));
    };
    
    // Call real AI to generate concepts with progressive reveal
    await generateConcepts(
      state.prompt,
      currentBrand?.name,
      currentBrand?.personality || undefined,
      currentBrand?.industry || undefined,
      state.useCase,
      state.targetPersona || undefined,
      onConceptReady
    );
    
    handleUpdate({ isLoadingConcepts: false });
    
    // Scroll to concepts section with smooth eased animation
    setTimeout(() => {
      smoothScrollTo('section-concepts', 100, 600);
    }, 100);
  }, [state.prompt, state.useCase, state.targetPersona, currentBrand, handleUpdate, generateConcepts]);

  const handleBack = useCallback(() => {
    // Clear ALL step 2 selections when going back to ensure clean state
    handleUpdate({ 
      step: 1,
      // Clear lifestyle flow data
      concepts: [],
      selectedConcept: null,
      moodboard: null,
      productReferences: [],
      contextReference: null,
      curatedMoodboards: [],
      curatedProducts: [],
      displayedMoodboardIds: [],
      displayedProductIds: [],
      discoveryMode: false,
      discoveryImages: [],
      userPreferences: [],
      // Reset product shoot to defaults
      productShoot: initialProductShootState,
    });
  }, [handleUpdate]);

  // Load a saved concept and jump to Step 2 with all presets applied
  const handleLoadSavedConcept = useCallback((concept: SavedConcept) => {
    const updates: Partial<CreativeStudioState> = {
      step: 2,
      prompt: concept.description,
      selectedConcept: concept.id,
      concepts: [concept], // Put saved concept in the list
      isLoadingConcepts: false,
      // Apply all saved presets
      moodboard: concept.presets?.moodboardId || null,
      productReferences: concept.presets?.productIds || [],
      displayedMoodboardIds: concept.presets?.moodboardId ? [concept.presets.moodboardId] : [],
      displayedProductIds: concept.presets?.productIds || [],
      artisticStyle: concept.presets?.artisticStyle || null,
      lightingStyle: concept.presets?.lightingStyle || 'auto',
      cameraAngle: concept.presets?.cameraAngle || 'auto',
      aspectRatio: concept.presets?.aspectRatio || '1:1',
      extraKeywords: concept.presets?.extraKeywords || [],
      useCase: (concept.presets?.useCase as CreativeStudioState['useCase']) || 'lifestyle',
      // Reset curated options since we have saved selections
      curatedMoodboards: [],
      curatedProducts: [],
    };
    
    handleUpdate(updates);
  }, [handleUpdate]);

  const { toast } = useToast();
  
  // Delete a saved concept
  const handleDeleteSavedConcept = useCallback(async (conceptId: string) => {
    try {
      const { error } = await supabase
        .from('saved_concepts')
        .delete()
        .eq('id', conceptId);

      if (error) throw error;

      toast({ title: 'Concept removed' });
      // Update state to remove from list
      handleUpdate({
        savedConcepts: state.savedConcepts.filter(c => c.id !== conceptId)
      });
    } catch (err) {
      console.error('Failed to delete concept:', err);
      toast({ title: 'Failed to delete concept', variant: 'destructive' });
    }
  }, [handleUpdate, state.savedConcepts, toast]);

  const handleGenerate = useCallback(async () => {
    handleUpdate({ isGenerating: true, generatedImages: [] });
    
    // Generate placeholder images for loading state (show remaining slots)
    const placeholders: GeneratedImage[] = Array.from({ length: state.imageCount }).map((_, i) => ({
      id: `pending-${i}`,
      imageUrl: '',
      status: 'pending' as const,
      prompt: state.prompt,
      index: i,
    }));
    handleUpdate({ generatedImages: placeholders });
    
    // Progressive callback: replace placeholder with real image as each completes
    const onImageReady = (image: GeneratedImage) => {
      setState(prev => {
        // Find the first pending placeholder and replace it
        const newImages = [...prev.generatedImages];
        const pendingIdx = newImages.findIndex(img => img.status === 'pending');
        
        if (pendingIdx >= 0) {
          newImages[pendingIdx] = image;
        } else {
          // No pending placeholder, just add to end
          newImages.push(image);
        }
        
        return { ...prev, generatedImages: newImages };
      });
    };
    
    // Call real AI to generate images with progressive callback
    const images = await generateImages(state, logoUrl, currentBrand?.id, onImageReady);
    
    // Final update (replaces any remaining placeholders with failed status or final images)
    handleUpdate({ 
      isGenerating: false, 
      generatedImages: images.length > 0 
        ? images 
        : placeholders.map(p => ({ ...p, status: 'failed' as const }))
    });
  }, [state, handleUpdate, generateImages, logoUrl, currentBrand?.id]);

  const handleVariation = useCallback(async (image: GeneratedImage) => {
    // Add a pending placeholder to the gallery
    const placeholderId = `pending-regen-${Date.now()}`;
    setState(prev => ({
      ...prev,
      generatedImages: [...prev.generatedImages, {
        id: placeholderId,
        imageUrl: '',
        status: 'pending' as const,
        prompt: image.prompt || '',
        index: prev.generatedImages.length,
      }],
    }));
    
    // Progressive callback: replace placeholder with real image
    const onImageReady = (newImage: GeneratedImage) => {
      setState(prev => ({
        ...prev,
        generatedImages: prev.generatedImages.map(img =>
          img.id === placeholderId ? newImage : img
        ),
      }));
    };
    
    const newImages = await generateVariations(state, image, onImageReady);
    
    if (newImages.length === 0) {
      // Remove placeholder if failed
      setState(prev => ({
        ...prev,
        generatedImages: prev.generatedImages.map(img =>
          img.id === placeholderId 
            ? { ...img, status: 'failed' as const, error: 'Regeneration failed' } 
            : img
        ),
      }));
    }
  }, [state, generateVariations]);

  const handleEdit = useCallback((image: GeneratedImage) => {
    // Navigate to edit page with the image
    navigate(`/edit-image?source=${encodeURIComponent(image.imageUrl)}`);
  }, [navigate]);

  const handleDelete = useCallback(async (image: GeneratedImage) => {
    const success = await deleteImage(image.id);
    if (success) {
      handleUpdate({
        generatedImages: state.generatedImages.filter(img => img.id !== image.id)
      });
      // Also update previous images
      setPreviousImages(prev => prev.filter(img => img.id !== image.id));
    }
  }, [state.generatedImages, handleUpdate, deleteImage]);

  // Handle edit from Advanced Edit Panel
  const handleAdvancedEdit = useCallback(async () => {
    if (state.editMode === 'generate') {
      // Text-to-image generation using the edit description
      handleUpdate({ isGenerating: true, generatedImages: [] });
      
      const placeholders: GeneratedImage[] = Array.from({ length: state.imageCount }).map((_, i) => ({
        id: `pending-${i}`,
        imageUrl: '',
        status: 'pending' as const,
        prompt: state.editDescription,
        index: i,
      }));
      handleUpdate({ generatedImages: placeholders });

      // Use editDescription as the prompt
      const editState = { ...state, prompt: state.editDescription };
      const images = await generateImages(editState);
      
      handleUpdate({ 
        isGenerating: false, 
        generatedImages: images.length > 0 ? images : placeholders.map(p => ({ ...p, status: 'failed' as const }))
      });
    } else if (state.editMode === 'edit' && state.baseImage) {
      // Image-to-image editing
      const newImages = await editImage(state.baseImage, state.editDescription, state);
      if (newImages.length > 0) {
        handleUpdate({ 
          generatedImages: [...state.generatedImages, ...newImages] 
        });
      }
    } else if (state.editMode === 'variation' && state.baseImage) {
      // Generate variations
      const newImages = await generateVariations(state, state.baseImage);
      if (newImages.length > 0) {
        handleUpdate({ 
          generatedImages: [...state.generatedImages, ...newImages] 
        });
      }
    }
  }, [state, handleUpdate, generateImages, editImage, generateVariations]);

  // ========== DISCOVERY MODE HANDLERS ==========
  
  // Start discovery mode batch generation
  const handleStartDiscovery = useCallback(async () => {
    if (state.concepts.length === 0) {
      toast({ title: 'No concepts', description: 'Generate concepts first', variant: 'destructive' });
      return;
    }
    
    if (!user?.id) {
      toast({ title: 'Not logged in', variant: 'destructive' });
      return;
    }
    
    handleUpdate({ 
      discoveryMode: true, 
      isDiscoveryGenerating: true,
      discoveryImages: [],
      userPreferences: [],
    });
    
    // Fetch user's moodboards from database (filtered by brand)
    let moodboardQuery = supabase
      .from('custom_moodboards')
      .select('id, name, description, thumbnail_url, visual_analysis')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (currentBrand?.id) {
      moodboardQuery = moodboardQuery.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
    }
    
    const { data: customMoodboards } = await moodboardQuery;
    
    // Fetch user's products from database (filtered by brand)
    let productQuery = supabase
      .from('scraped_products')
      .select('id, name, category, thumbnail_url, description')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (currentBrand?.id) {
      productQuery = productQuery.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
    }
    
    const { data: scrapedProducts } = await productQuery;
    
    console.log('=== DISCOVERY MODE START ===');
    console.log('Moodboards available:', customMoodboards?.length || 0);
    console.log('Products available:', scrapedProducts?.length || 0);
    
    // For each concept, run smart-match with FULL data
    const moodboardMatches: { conceptId: string; moodboardId: string; moodboardUrl: string; productIds: string[] }[] = [];
    
    for (const concept of state.concepts) {
      try {
        const { data, error } = await supabase.functions.invoke('smart-match', {
          body: {
            concept: {
              title: concept.title,
              coreIdea: concept.coreIdea,
              visualWorld: concept.visualWorld,
              productFocus: concept.productFocus,
              targetAudience: concept.targetAudience,
              tonality: concept.tonality,
              consumerInsight: concept.consumerInsight,
            },
            moodboards: (customMoodboards || []).map(m => ({
              id: m.id,
              name: m.name,
              description: m.description,
              visualAnalysis: m.visual_analysis,
            })),
            products: (scrapedProducts || []).map(p => ({
              id: p.id,
              name: p.name,
              category: p.category,
              description: p.description,
            })),
          },
        });
        
        console.log(`Smart-match for "${concept.title}":`, data);
        
        if (!error && data) {
          const bestMoodboardId = data.rankedMoodboards?.[0];
          const bestProductIds = data.rankedProducts?.slice(0, 3) || [];
          
          if (bestMoodboardId) {
            const moodboard = customMoodboards?.find(m => m.id === bestMoodboardId);
            moodboardMatches.push({
              conceptId: concept.id,
              moodboardId: bestMoodboardId,
              moodboardUrl: moodboard?.thumbnail_url || '',
              productIds: bestProductIds,
            });
          } else {
            // Fallback: use first available moodboard if no match
            const firstMoodboard = customMoodboards?.[0];
            moodboardMatches.push({
              conceptId: concept.id,
              moodboardId: firstMoodboard?.id || '',
              moodboardUrl: firstMoodboard?.thumbnail_url || '',
              productIds: bestProductIds.length > 0 ? bestProductIds : (scrapedProducts?.slice(0, 3).map(p => p.id) || []),
            });
          }
        }
      } catch (err) {
        console.error('Smart-match error for concept:', concept.id, err);
        // Fallback on error
        const firstMoodboard = customMoodboards?.[0];
        moodboardMatches.push({
          conceptId: concept.id,
          moodboardId: firstMoodboard?.id || '',
          moodboardUrl: firstMoodboard?.thumbnail_url || '',
          productIds: scrapedProducts?.slice(0, 3).map(p => p.id) || [],
        });
      }
    }
    
    console.log('Moodboard matches:', moodboardMatches);
    
    // Generate discovery batch with matched moodboards and products
    // NOTE: Don't flatten productReferences - each concept uses its own matched products
    const images = await generateDiscoveryBatch(
      state,  // Don't override productReferences - they come from moodboardMatches per-concept
      state.concepts, 
      moodboardMatches, 
      logoUrl
    );
    
    handleUpdate({ 
      isDiscoveryGenerating: false,
      discoveryImages: images,
    });
    
    // Scroll to discovery gallery
    setTimeout(() => {
      smoothScrollTo('discovery-gallery', 100, 600);
    }, 100);
  }, [state, handleUpdate, generateDiscoveryBatch, logoUrl, toast, user?.id]);

  // Toggle like on discovery image
  const handleToggleLike = useCallback(async (imageId: string, liked: boolean) => {
    // Find the image
    const image = state.discoveryImages.find(img => img.id === imageId);
    if (!image) return;
    
    // Toggle: if already set to this value, set to null (unrate)
    const newLiked = image.liked === liked ? null : liked;
    
    // Update local state
    handleUpdate({
      discoveryImages: state.discoveryImages.map(img => 
        img.id === imageId ? { ...img, liked: newLiked } : img
      ),
    });
    
    // Persist to database
    await updateImageLike(imageId, newLiked);
    
    // Update preferences (moodboardId is optional, productIds carried forward)
    if (newLiked === true && image.conceptId && image.shotType) {
      const concept = state.concepts.find(c => c.id === image.conceptId);
      if (concept) {
        handleUpdate({
          userPreferences: [
            ...state.userPreferences.filter(p => 
              !(p.conceptId === image.conceptId && p.shotType === image.shotType)
            ),
            {
              conceptId: image.conceptId,
              conceptTitle: concept.title,
              moodboardId: image.moodboardId || '',
              shotType: image.shotType,
              productIds: image.productIds || [], // Carry forward product IDs
              liked: true,
            },
          ],
        });
      }
    } else if (newLiked !== true && image.conceptId && image.shotType) {
      // Remove from preferences if unliked
      handleUpdate({
        userPreferences: state.userPreferences.filter(p => 
          !(p.conceptId === image.conceptId && p.shotType === image.shotType)
        ),
      });
    }
  }, [state, handleUpdate, updateImageLike]);

  // Generate more images from liked preferences (supports missing moodboardId)
  const handleGenerateMoreLikeThat = useCallback(async (batchCount: number = 2) => {
    const likedImages = state.discoveryImages.filter(img => img.liked === true);
    if (likedImages.length === 0) {
      toast({ title: 'No images selected', description: 'Like some images first', variant: 'destructive' });
      return;
    }
    
    // Build preferences from liked images - moodboardId is now OPTIONAL
    const preferences: UserPreference[] = likedImages
      .filter(img => img.conceptId && img.shotType) // Only require conceptId + shotType
      .map(img => {
        const concept = state.concepts.find(c => c.id === img.conceptId);
        return {
          conceptId: img.conceptId!,
          conceptTitle: concept?.title || 'Unknown',
          moodboardId: img.moodboardId || '', // Empty string if missing
          shotType: img.shotType!,
          productIds: img.productIds || [], // Carry forward product IDs
          liked: true,
        };
      });
    
    if (preferences.length === 0) {
      toast({ title: 'No valid images', description: 'Liked images are missing required data', variant: 'destructive' });
      return;
    }
    
    setIsGeneratingMore(true);
    
    const newImages = await generateFromPreferences(state, preferences, logoUrl, batchCount);
    
    // Add to regular generated images (not discovery)
    handleUpdate({
      generatedImages: [...state.generatedImages, ...newImages],
    });
    
    setIsGeneratingMore(false);
    
    // Scroll to gallery
    setTimeout(() => {
      smoothScrollTo('unified-workspace', 100, 600);
    }, 100);
  }, [state, handleUpdate, generateFromPreferences, logoUrl, toast]);

  // Toggle discovery mode
  const handleToggleDiscoveryMode = useCallback((enabled: boolean) => {
    handleUpdate({ discoveryMode: enabled });
    if (!enabled) {
      // Clear discovery state when disabled
      handleUpdate({
        discoveryImages: [],
        userPreferences: [],
        isDiscoveryGenerating: false,
      });
    }
  }, [handleUpdate]);

  // ========== END DISCOVERY MODE HANDLERS ==========

  // Track card position for floating footer
  useLayoutEffect(() => {
    const updateFloating = () => {
      if (!step2CardRef.current || state.step !== 2 || !isOpen) {
        setFloating({ active: false, left: 0, width: 0 });
        return;
      }
      
      const rect = step2CardRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 100;
      
      setFloating({
        active: inView,
        left: rect.left,
        width: rect.width
      });
    };

    const handleScroll = () => requestAnimationFrame(updateFloating);
    const handleResize = () => requestAnimationFrame(updateFloating);

    if (footerRef.current) {
      setFooterHeight(footerRef.current.offsetHeight);
    }

    updateFloating();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [state.step, isOpen]);

  // Combine recent generated + previous images for gallery
  // Latest generation first, then historical images (excluding duplicates)
  const currentImageIds = new Set(state.generatedImages.map(img => img.id));
  const allImages = [
    ...state.generatedImages,
    ...previousImages.filter(img => !currentImageIds.has(img.id))
  ];

  return (
    <section className="px-8 py-16 border-t border-border bg-secondary/20">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Main Creative Studio Section */}
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
          <div className="flex items-center gap-3 mb-6">
            <CollapsibleTrigger asChild>
              <button 
                className="w-8 h-8 rounded-lg border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
                title={isOpen ? "Collapse section" : "Expand section"}
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-primary flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Visual Media</p>
              <h2 className="font-display text-2xl font-bold">Creative Studio</h2>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                state.step === 1 ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                1
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                state.step === 2 ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                2
              </div>
            </div>
          </div>

          <CollapsibleContent>
            {/* PRODUCT SHOT FLOW - Step 1: New vs Remix, Step 2: Configuration */}
            {state.useCase === 'product' ? (
              <>
                {/* PRODUCT SHOT STEP 1: Choose New vs Remix */}
                {state.step === 1 ? (
                  <div className="glass-card p-6">
                    <CreativeStudioHeader
                      state={state}
                      onUpdate={handleUpdate}
                      onRegenerate={() => {}}
                      showRegenerate={false}
                      hideBriefInput={true}
                    />
                    
                    <ProductShootSubtypeSelector
                      selectedMode={state.productShoot.shootMode}
                      onSelectMode={(mode) => handleProductShootUpdate({ shootMode: mode })}
                    />
                    
                    {/* Step 1 Footer for Product Shot */}
                    <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {state.productShoot.shootMode ? '✨ Ready to configure your shoot' : 'Choose a shoot type to continue'}
                      </div>
                      <button
                        onClick={() => handleUpdate({ step: 2 })}
                        disabled={!state.productShoot.shootMode}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg group"
                        style={{
                          boxShadow: state.productShoot.shootMode ? '0 8px 32px rgba(107, 124, 255, 0.25)' : undefined
                        }}
                      >
                        <Sparkles className="w-5 h-5" />
                        Continue
                      </button>
                    </div>
                  </div>
                ) : (
                  /* PRODUCT SHOT STEP 2: Configuration */
                  <div ref={step2CardRef} className="glass-card p-6">
                    <CreativeStudioHeader
                      state={state}
                      onUpdate={handleUpdate}
                      showRegenerate={false}
                      hideBriefInput={true}
                      disableTypeSwitch={true}
                    />
                    
                    <div style={{ paddingBottom: footerHeight + 24 }}>
                      <ProductShootStep2
                        state={state.productShoot}
                        onStateChange={handleProductShootUpdate}
                        selectedProduct={
                          state.productReferences.length > 0
                            ? {
                                id: state.productReferences[0],
                                name: 'Selected Product',
                                thumbnailUrl: state.displayedProductIds.length > 0 
                                  ? state.displayedProductIds[0] 
                                  : '',
                              }
                            : undefined
                        }
                        onProductSelect={() => {
                          // Will integrate with product picker modal
                        }}
                        imageCount={state.imageCount}
                        resolution={state.resolution}
                        aspectRatio={state.aspectRatio}
                        sequentialGeneration={state.sequentialGeneration}
                        onOutputSettingsChange={(updates) => handleUpdate(updates)}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* LIFESTYLE/OTHER FLOWS - Keep existing step 1 → step 2 */
              <>
                {state.step === 1 ? (
                  <div className="glass-card p-6">
                    <CreativeStudioHeader
                      state={state}
                      onUpdate={handleUpdate}
                      onRegenerate={handleContinue}
                      showRegenerate={false}
                    />
                    <StepOnePrompt 
                      state={state} 
                      onUpdate={handleUpdate}
                      onLoadSavedConcept={handleLoadSavedConcept}
                      onDeleteSavedConcept={handleDeleteSavedConcept}
                    />
                    
                    {/* Step 1 Footer */}
                    <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {state.prompt ? '✨ Ready to generate concepts' : 'Enter a brief to continue'}
                      </div>
                      <button
                        onClick={handleContinue}
                        disabled={!state.prompt.trim() || isGeneratingConcepts}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg group"
                        style={{
                          boxShadow: state.prompt.trim() ? '0 8px 32px rgba(107, 124, 255, 0.25)' : undefined
                        }}
                      >
                        <Sparkles className={`w-5 h-5 transition-all ${
                          state.prompt.trim() && !isGeneratingConcepts 
                            ? 'animate-sparkle' 
                            : ''
                        }`} />
                        {isGeneratingConcepts ? 'Generating...' : 'Create Concepts'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div ref={step2CardRef} className="glass-card p-6">
                    <CreativeStudioHeader
                      state={state}
                      onUpdate={handleUpdate}
                      onRegenerate={handleContinue}
                      showRegenerate={true}
                      disableTypeSwitch={true}
                    />
                    
                    <div style={{ paddingBottom: footerHeight + 24 }}>
                      <StepTwoCustomize
                        state={state}
                        onUpdate={handleUpdate}
                        onMatchingStateChange={setIsAgentMatching}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CollapsibleContent>
        </Collapsible>
        
        {/* Discovery Mode Section */}
        {state.discoveryMode && (state.discoveryImages.length > 0 || state.isDiscoveryGenerating) && (
          <div id="discovery-gallery" className="glass-card p-6">
            {discoveryView === 'swipe' ? (
              <DiscoverySwipeView
                images={state.discoveryImages}
                concepts={state.concepts}
                onToggleLike={handleToggleLike}
                onComplete={(style) => {
                  setCampaignStyle(style);
                  setDiscoveryView('summary');
                }}
                onBack={() => setDiscoveryView('grid')}
                isGenerating={state.isDiscoveryGenerating}
              />
            ) : discoveryView === 'summary' && campaignStyle ? (
              <CampaignStyleSummary
                style={campaignStyle}
                onGenerateMore={(count) => handleGenerateMoreLikeThat(count)}
                onBack={() => setDiscoveryView('swipe')}
                isGenerating={isGeneratingMore}
              />
            ) : (
              <DiscoveryModeGallery
                images={state.discoveryImages}
                concepts={state.concepts}
                onToggleLike={handleToggleLike}
                onGenerateMore={() => handleGenerateMoreLikeThat(2)}
                onSwitchToSwipe={() => setDiscoveryView('swipe')}
                isGenerating={state.isDiscoveryGenerating}
                isGeneratingMore={isGeneratingMore}
              />
            )}
          </div>
        )}
        
        {/* Unified Workspace - Combines Quick Edit Bar + Gallery */}
        <div id="unified-workspace">
          <UnifiedWorkspace
            state={state}
            onUpdate={handleUpdate}
            images={allImages}
            isGenerating={isGeneratingImages && state.generatedImages.length === 0}
            onEdit={handleAdvancedEdit}
            onVariation={handleVariation}
            onEditImage={handleEdit}
            onDelete={handleDelete}
            onRegenerate={state.step === 2 ? handleGenerate : undefined}
            isEditing={isGeneratingImages}
          />
        </div>
        
        {/* Floating Footer - Show for Step 2 (both Product Shot and Lifestyle) */}
        {floating.active && state.step === 2 && (
          <div
            ref={footerRef}
            className="fixed bottom-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-xl px-6 py-4"
            style={{
              left: floating.left,
              width: floating.width,
            }}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleUpdate({ step: 1 })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              {/* Show selection indicators only for non-product flows */}
              {state.useCase !== 'product' && (
                <SelectionIndicators state={state} />
              )}
              
              {/* Product Shot specific info - clickable indicator chips matching lifestyle */}
              {state.useCase === 'product' && (
                <ProductShootIndicators 
                  state={state.productShoot}
                />
              )}
              
              {/* Discovery Mode Toggle - Only for non-product flows */}
              {state.useCase !== 'product' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border">
                  <Compass className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Discovery</span>
                  <Switch
                    checked={state.discoveryMode}
                    onCheckedChange={handleToggleDiscoveryMode}
                  />
                </div>
              )}
              
              <button
                onClick={state.useCase === 'product' ? handleGenerate : (state.discoveryMode ? handleStartDiscovery : handleGenerate)}
                disabled={isGeneratingImages || isAgentMatching || isGeneratingConcepts || state.isLoadingConcepts || state.isDiscoveryGenerating}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                style={{
                  boxShadow: !isGeneratingImages && !isAgentMatching && !isGeneratingConcepts && !state.isLoadingConcepts && !state.isDiscoveryGenerating
                    ? '0 8px 32px rgba(107, 124, 255, 0.25)' 
                    : undefined
                }}
              >
                <Sparkles className="w-5 h-5" />
                {isGeneratingImages 
                  ? 'Generating...' 
                  : state.useCase === 'product'
                    ? `Generate (${state.imageCount} images)`
                    : isGeneratingConcepts || state.isLoadingConcepts 
                      ? 'Creating concepts...' 
                      : isAgentMatching 
                        ? 'Matching...' 
                        : state.isDiscoveryGenerating
                          ? 'Discovering...'
                          : state.discoveryMode
                            ? 'Start Discovery (12 images)'
                            : `Generate (${state.imageCount} images)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

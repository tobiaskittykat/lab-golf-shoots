import { useState, useCallback, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Image, ChevronDown, ChevronRight, ArrowLeft, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CreativeStudioHeader } from "./CreativeStudioHeader";
import { StepOnePrompt } from "./StepOnePrompt";
import { StepTwoCustomize } from "./StepTwoCustomize";
import { UnifiedWorkspace } from "./UnifiedWorkspace";
import { CreativeStudioState, initialCreativeStudioState, GeneratedImage } from "./types";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useBrands } from "@/hooks/useBrands";
import { supabase } from "@/integrations/supabase/client";

interface CreativeStudioWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreativeStudioWizard = ({ isOpen, onOpenChange }: CreativeStudioWizardProps) => {
  const [state, setState] = useState<CreativeStudioState>(initialCreativeStudioState);
  const [previousImages, setPreviousImages] = useState<GeneratedImage[]>([]);
  const navigate = useNavigate();
  const { currentBrand } = useBrands();
  const { 
    isGeneratingConcepts, 
    isGeneratingImages, 
    conceptsProgress,
    generateConcepts, 
    generateImages,
    generateVariations,
    deleteImage,
    editImage
  } = useImageGeneration();
  
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
  }, [fetchPreviousImages]);

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

  const handleContinue = useCallback(async () => {
    // Clear existing concepts and show loading state
    handleUpdate({ isLoadingConcepts: true, step: 2, concepts: [] });
    
    // Progressive callback to add concepts one by one
    const onConceptReady = (concept: any, index: number) => {
      setState(prev => ({
        ...prev,
        concepts: [...prev.concepts, concept],
        selectedConcept: index === 0 ? concept.id : prev.selectedConcept,
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
  }, [state.prompt, state.useCase, state.targetPersona, currentBrand, handleUpdate, generateConcepts]);

  const handleBack = useCallback(() => {
    handleUpdate({ step: 1 });
  }, [handleUpdate]);

  const handleGenerate = useCallback(async () => {
    handleUpdate({ isGenerating: true, generatedImages: [] });
    
    // Generate placeholder images for loading state
    const placeholders: GeneratedImage[] = Array.from({ length: state.imageCount }).map((_, i) => ({
      id: `pending-${i}`,
      imageUrl: '',
      status: 'pending' as const,
      prompt: state.prompt,
      index: i,
    }));
    handleUpdate({ generatedImages: placeholders });
    
    // Call real AI to generate images
    const images = await generateImages(state);
    
    handleUpdate({ 
      isGenerating: false, 
      generatedImages: images.length > 0 ? images : placeholders.map(p => ({ ...p, status: 'failed' as const }))
    });
  }, [state, handleUpdate, generateImages]);

  const handleVariation = useCallback(async (image: GeneratedImage) => {
    const newImages = await generateVariations(state, image);
    if (newImages.length > 0) {
      handleUpdate({ 
        generatedImages: [...state.generatedImages, ...newImages] 
      });
    }
  }, [state, handleUpdate, generateVariations]);

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
                />
                
                {/* Step 1 Footer */}
                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {state.prompt ? '✨ Ready to generate concepts' : 'Enter a brief to continue'}
                  </div>
                  <button
                    onClick={handleContinue}
                    disabled={!state.prompt.trim() || isGeneratingConcepts}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                    style={{
                      boxShadow: state.prompt.trim() ? '0 8px 32px rgba(107, 124, 255, 0.25)' : undefined
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
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
          </CollapsibleContent>
        </Collapsible>
        
        {/* Unified Workspace - Combines Quick Edit Bar + Gallery */}
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
        
        {/* Floating Footer for Step 2 */}
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
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <span className="text-sm text-muted-foreground">
                {state.selectedConcept ? '✓ 1 concept selected' : 'No concept selected'}
              </span>
              
              <button
                onClick={handleGenerate}
                disabled={isGeneratingImages || isAgentMatching}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                style={{
                  boxShadow: !isGeneratingImages && !isAgentMatching ? '0 8px 32px rgba(107, 124, 255, 0.25)' : undefined
                }}
              >
                <Sparkles className="w-5 h-5" />
                {isAgentMatching ? 'Matching...' : isGeneratingImages ? 'Generating...' : `Generate (${state.imageCount} images)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

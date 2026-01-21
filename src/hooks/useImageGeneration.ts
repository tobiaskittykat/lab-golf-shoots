import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreativeStudioState, 
  GeneratedImage, 
  Concept,
  sampleMoodboards,
  sampleProductReferences,
  sampleContextReferences
} from '@/components/creative-studio/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
export function useImageGeneration() {
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [conceptsProgress, setConceptsProgress] = useState(0); // 0-3 concepts loaded
  const { toast } = useToast();
  const { user } = useAuth();

  // Generate concepts from prompt with progressive callback
  const generateConcepts = useCallback(async (
    prompt: string,
    brandName?: string,
    brandPersonality?: string,
    brandIndustry?: string,
    useCase?: string,
    targetPersona?: string,
    onConceptReady?: (concept: Concept, index: number) => void,
    customSystemPrompt?: string // Custom concept agent prompt from brand settings
  ): Promise<Concept[]> => {
    setIsGeneratingConcepts(true);
    setConceptsProgress(0);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-concepts', {
        body: {
          prompt,
          brandName,
          brandPersonality,
          brandIndustry,
          useCase,
          targetPersona,
          customSystemPrompt,
        },
      });

      if (error) {
        console.error('Error generating concepts:', error);
        toast({
          title: 'Failed to generate concepts',
          description: error.message || 'Please try again',
          variant: 'destructive',
        });
        return [];
      }

      const concepts = data.concepts || [];
      
      // Progressive reveal with slight delays for UX
      if (onConceptReady && concepts.length > 0) {
        for (let i = 0; i < concepts.length; i++) {
          setConceptsProgress(i + 1);
          onConceptReady(concepts[i], i);
          // Small delay between concepts for smooth UX
          if (i < concepts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }

      return concepts;
    } catch (err) {
      console.error('Error generating concepts:', err);
      toast({
        title: 'Failed to generate concepts',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsGeneratingConcepts(false);
      setConceptsProgress(0);
    }
  }, [toast]);

  // Generate images from state
  const generateImages = useCallback(async (
    state: CreativeStudioState
  ): Promise<GeneratedImage[]> => {
    setIsGeneratingImages(true);
    
    try {
      // Get the selected concept
      const selectedConcept = state.concepts.find(c => c.id === state.selectedConcept);
      
      // Get moodboard info (description + URL for multimodal)
      let moodboardDescription: string | undefined;
      let moodboardUrl: string | undefined;
      
      // Check custom moodboards first
      let moodboardName: string | undefined;
      let moodboardAnalysis: Record<string, unknown> | undefined;
      
      if (state.moodboard) {
        // Custom moodboards may have 'custom-' prefix OR be raw UUIDs - handle both
        const isCustomMoodboard = state.moodboard.startsWith('custom-') || 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(state.moodboard);
        const moodboardDbId = state.moodboard.startsWith('custom-')
          ? state.moodboard.replace('custom-', '') 
          : state.moodboard;
        
        if (isCustomMoodboard) {
          // Fetch the moodboard URL + visual analysis from database
          const { data: customMoodboard, error: moodboardErr } = await supabase
            .from('custom_moodboards')
            .select('thumbnail_url, description, name, visual_analysis')
            .eq('id', moodboardDbId)
            .maybeSingle();
          
          console.log('Moodboard query:', { moodboardDbId, customMoodboard, error: moodboardErr });
          
          if (customMoodboard) {
            moodboardUrl = customMoodboard.thumbnail_url;
            moodboardDescription = customMoodboard.description || undefined;
            moodboardName = customMoodboard.name;
            moodboardAnalysis = customMoodboard.visual_analysis as Record<string, unknown> | undefined;
          }
        } else {
          // Fallback to sample moodboards (uses 'thumbnail' field)
          const sampleMoodboard = sampleMoodboards.find(m => m.id === state.moodboard);
          if (sampleMoodboard) {
            moodboardUrl = sampleMoodboard.thumbnail;
            moodboardDescription = sampleMoodboard.description;
            moodboardName = sampleMoodboard.name;
          }
        }
      }

      // Resolve product reference URLs and names (supports both sample + scraped products)
      const productReferenceUrls: string[] = [];
      const productNames: string[] = [];
      for (const productRef of state.productReferences) {
        if (productRef.startsWith('scraped-')) {
          const dbId = productRef.replace('scraped-', '');
          const { data: scrapedRow, error: scrapedErr } = await supabase
            .from('scraped_products')
            .select('full_url, thumbnail_url, name')
            .eq('id', dbId)
            .maybeSingle();

          if (!scrapedErr && scrapedRow) {
            const url = scrapedRow.full_url || scrapedRow.thumbnail_url;
            if (url) productReferenceUrls.push(url);
            if (scrapedRow.name) productNames.push(scrapedRow.name);
          }
        } else {
          const ref = sampleProductReferences.find(r => r.id === productRef);
          if (ref?.url) productReferenceUrls.push(ref.url);
          if (ref?.name) productNames.push(ref.name);
        }
      }
      
      // Fetch brand context, custom AI prompts, and Brand Brain
      let brandContext: Record<string, unknown> | undefined;
      let brandName: string | undefined;
      let brandPersonality: string | undefined;
      let customPromptAgentSystemPrompt: string | undefined;
      let brandBrain: Record<string, unknown> | undefined;
      
      if (user?.id) {
        const { data: brand } = await supabase
          .from('brands')
          .select('name, personality, brand_context')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (brand) {
          brandName = brand.name;
          brandPersonality = brand.personality || undefined;
          brandContext = brand.brand_context as Record<string, unknown> | undefined;
          
          // Extract custom prompt agent system prompt if set
          const aiPrompts = (brandContext as any)?.aiPrompts;
          if (aiPrompts?.promptAgent) {
            customPromptAgentSystemPrompt = aiPrompts.promptAgent;
          }
          
          // Extract Brand Brain if set
          if ((brandContext as any)?.brandBrain) {
            brandBrain = (brandContext as any).brandBrain;
          }
        }
      }

      // Extract single shot type prompt (text guidance, not image URL)
      const shotTypePrompt = state.contextReference
        ? sampleContextReferences.find(r => r.id === state.contextReference)?.shotPrompt || null
        : null;
      
      console.log('Generating with references:', {
        moodboardUrl,
        productReferenceUrls,
        shotTypePrompt
      });

      // Track when we started to find newly generated images if timeout occurs
      const generationStartTime = new Date().toISOString();
      
      // Use concept description as the primary prompt (not the raw brief)
      const primaryPrompt = selectedConcept?.description || selectedConcept?.coreIdea || selectedConcept?.title || state.prompt;
      
      console.log('=== GENERATION INPUT DEBUG ===');
      console.log('Primary prompt (from concept):', primaryPrompt);
      console.log('Full concept:', JSON.stringify(selectedConcept, null, 2));
      console.log('Moodboard URL:', moodboardUrl);
      console.log('Product URLs:', productReferenceUrls);
      console.log('Shot prompt:', shotTypePrompt);
      console.log('==============================');
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          // Use concept-derived prompt instead of raw brief
          prompt: primaryPrompt,
          conceptTitle: selectedConcept?.title,
          conceptDescription: selectedConcept?.description,
          coreIdea: selectedConcept?.coreIdea,
          tonality: selectedConcept?.tonality,
          
          // Full 9-point concept data (NEW)
          visualWorld: selectedConcept?.visualWorld,
          contentPillars: selectedConcept?.contentPillars,
          targetAudience: selectedConcept?.targetAudience,
          consumerInsight: selectedConcept?.consumerInsight,
          productFocus: selectedConcept?.productFocus,
          taglines: selectedConcept?.taglines,
          
          moodboardId: state.moodboard,
          moodboardName,
          moodboardDescription,
          moodboardUrl,
          moodboardAnalysis,
          
          artisticStyle: state.artisticStyle,
          lightingStyle: state.lightingStyle,
          cameraAngle: state.cameraAngle,
          
          // Reference URLs and names
          productReferenceUrls,
          productNames,
          // Shot type as single text prompt guidance (null = AI decides)
          shotTypePrompt,
          
          // Brand context for prompt agent
          brandName,
          brandPersonality,
          brandContext,
          
          // Brand Brain (synthesized visual identity)
          brandBrain,
          
          // Custom prompt agent system prompt (from brand settings)
          customPromptAgentSystemPrompt,
          
          extraKeywords: state.extraKeywords,
          negativePrompt: state.negativePrompt,
          textOnImage: state.textOnImage,
          
          imageCount: state.imageCount,
          resolution: state.resolution,
          aspectRatio: state.aspectRatio,
          
          aiModel: state.aiModel,
          guidanceScale: state.guidanceScale,
          seed: state.seed,
          
          folder: state.saveToFolder,
        },
      });

      // Handle timeout/connection errors by checking if images were actually created
      if (error) {
        console.error('Error generating images:', error);
        
        // Check if images were actually generated despite the error (e.g., timeout)
        // Wait a moment then check the database for recently created images
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: recentImages } = await supabase
          .from('generated_images')
          .select('*')
          .gte('created_at', generationStartTime)
          .order('created_at', { ascending: false })
          .limit(state.imageCount);
        
        if (recentImages && recentImages.length > 0) {
          // Images were generated successfully despite connection error
          toast({
            title: 'Images generated!',
            description: `Generated ${recentImages.length} image(s) - connection recovered`,
          });
          
          const recoveredConcept = state.concepts.find(c => c.id === state.selectedConcept);
          return recentImages.map((img: any, idx: number) => ({
            id: img.id,
            imageUrl: img.image_url,
            status: 'completed' as const,
            prompt: img.prompt,
            refinedPrompt: img.refined_prompt,
            conceptTitle: recoveredConcept?.title || img.concept_title || undefined,
            index: idx,
            moodboardId: state.moodboard || undefined,
            moodboardUrl: moodboardUrl || undefined,
            productReferenceUrls: productReferenceUrls.length > 0 ? productReferenceUrls : undefined,
            productReferenceUrl: productReferenceUrls[0],
          }));
        }
        
        toast({
          title: 'Failed to generate images',
          description: error.message || 'Please try again',
          variant: 'destructive',
        });
        return [];
      }

      const images: GeneratedImage[] = (data.images || []).map((img: any) => ({
        id: img.id || `temp-${img.index}`,
        imageUrl: img.imageUrl || '',
        status: img.status || 'failed',
        prompt: state.prompt,
        refinedPrompt: img.refinedPrompt,
        conceptTitle: selectedConcept?.title || undefined,
        error: img.error,
        index: img.index,
        // Attach resolved references so the modal shows them immediately
        moodboardId: state.moodboard || undefined,
        moodboardUrl: moodboardUrl || undefined,
        productReferenceUrls: productReferenceUrls.length > 0 ? productReferenceUrls : undefined,
        productReferenceUrl: productReferenceUrls[0], // Keep first for backwards compat
      }));

      const successCount = images.filter(i => i.status === 'completed').length;
      
      if (successCount > 0) {
        toast({
          title: 'Images generated!',
          description: `Successfully generated ${successCount} of ${state.imageCount} images`,
        });
      } else {
        toast({
          title: 'Generation failed',
          description: 'No images were generated. Please try again.',
          variant: 'destructive',
        });
      }

      return images;
    } catch (err) {
      console.error('Error generating images:', err);
      toast({
        title: 'Failed to generate images',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsGeneratingImages(false);
    }
  }, [toast]);

  // Generate variations of an existing image
  const generateVariations = useCallback(async (
    state: CreativeStudioState,
    sourceImage: GeneratedImage
  ): Promise<GeneratedImage[]> => {
    // Clone state but with 1 image and random seed
    const variationState = {
      ...state,
      imageCount: 1,
      seed: Math.floor(Math.random() * 1000000),
    };
    
    return generateImages(variationState);
  }, [generateImages]);

  // Edit an existing image with a description
  const editImage = useCallback(async (
    sourceImage: GeneratedImage,
    editDescription: string,
    state: CreativeStudioState
  ): Promise<GeneratedImage[]> => {
    setIsGeneratingImages(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: editDescription,
          
          // Pass the source image URL for image-to-image editing
          sourceImageUrl: sourceImage.imageUrl,
          editMode: true,
          
          // Keep other settings
          artisticStyle: state.artisticStyle,
          lightingStyle: state.lightingStyle,
          cameraAngle: state.cameraAngle,
          
          imageCount: state.imageCount,
          resolution: state.resolution,
          aspectRatio: state.aspectRatio,
          
          aiModel: state.aiModel,
          guidanceScale: state.guidanceScale,
        },
      });

      if (error) {
        console.error('Error editing image:', error);
        toast({
          title: 'Failed to edit image',
          description: error.message || 'Please try again',
          variant: 'destructive',
        });
        return [];
      }

      const images: GeneratedImage[] = (data.images || []).map((img: any) => ({
        id: img.id || `temp-${img.index}`,
        imageUrl: img.imageUrl || '',
        status: img.status || 'failed',
        prompt: editDescription,
        refinedPrompt: img.refinedPrompt,
        error: img.error,
        index: img.index,
      }));

      const successCount = images.filter(i => i.status === 'completed').length;
      
      if (successCount > 0) {
        toast({
          title: 'Image edited!',
          description: `Successfully created ${successCount} edited image(s)`,
        });
      }

      return images;
    } catch (err) {
      console.error('Error editing image:', err);
      toast({
        title: 'Failed to edit image',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsGeneratingImages(false);
    }
  }, [toast]);

  // Delete a generated image
  const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Error deleting image:', error);
        toast({
          title: 'Failed to delete image',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Image deleted',
        description: 'The image has been removed',
      });
      return true;
    } catch (err) {
      console.error('Error deleting image:', err);
      return false;
    }
  }, [toast]);

  return {
    isGeneratingConcepts,
    isGeneratingImages,
    conceptsProgress,
    generateConcepts,
    generateImages,
    generateVariations,
    editImage,
    deleteImage,
  };
}

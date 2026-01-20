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

export function useImageGeneration() {
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [conceptsProgress, setConceptsProgress] = useState(0); // 0-3 concepts loaded
  const { toast } = useToast();

  // Generate concepts from prompt with progressive callback
  const generateConcepts = useCallback(async (
    prompt: string,
    brandName?: string,
    brandPersonality?: string,
    brandIndustry?: string,
    useCase?: string,
    targetPersona?: string,
    onConceptReady?: (concept: Concept, index: number) => void
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
      if (state.moodboard) {
        // Fetch the moodboard URL from database
        const { data: customMoodboard } = await supabase
          .from('custom_moodboards')
          .select('thumbnail_url, description')
          .eq('id', state.moodboard)
          .maybeSingle();
        
        if (customMoodboard) {
          moodboardUrl = customMoodboard.thumbnail_url;
          moodboardDescription = customMoodboard.description || undefined;
        } else {
          // Fallback to sample moodboards (uses 'thumbnail' field)
          const sampleMoodboard = sampleMoodboards.find(m => m.id === state.moodboard);
          if (sampleMoodboard) {
            moodboardUrl = sampleMoodboard.thumbnail;
            moodboardDescription = sampleMoodboard.description;
          }
        }
      }

      // Resolve product reference URLs (supports both sample + scraped products, now array)
      const productReferenceUrls: string[] = [];
      for (const productRef of state.productReferences) {
        if (productRef.startsWith('scraped-')) {
          const dbId = productRef.replace('scraped-', '');
          const { data: scrapedRow, error: scrapedErr } = await supabase
            .from('scraped_products')
            .select('full_url, thumbnail_url')
            .eq('id', dbId)
            .maybeSingle();

          if (!scrapedErr && scrapedRow) {
            const url = scrapedRow.full_url || scrapedRow.thumbnail_url;
            if (url) productReferenceUrls.push(url);
          }
        } else {
          const ref = sampleProductReferences.find(r => r.id === productRef);
          if (ref?.url) productReferenceUrls.push(ref.url);
        }
      }

      // Support multiple context references
      const contextRefs = state.contextReferences
        .map(id => sampleContextReferences.find(r => r.id === id))
        .filter(Boolean);
      const contextRefUrls = contextRefs.map(ref => ref?.url).filter(Boolean) as string[];
      
      console.log('Generating with references:', {
        moodboardUrl,
        productReferenceUrls,
        contextRefUrls
      });

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: state.prompt,
          conceptTitle: selectedConcept?.title,
          conceptDescription: selectedConcept?.description,
          
          moodboardId: state.moodboard,
          moodboardDescription,
          moodboardUrl, // NEW: Pass moodboard image URL for multimodal
          artisticStyle: state.artisticStyle,
          lightingStyle: state.lightingStyle,
          cameraAngle: state.cameraAngle,
          
          // Reference URLs (now arrays)
          productReferenceUrls,
          contextReferenceUrls: contextRefUrls,
          
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

      if (error) {
        console.error('Error generating images:', error);
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
        error: img.error,
        index: img.index,
        productReferenceUrl: productReferenceUrls[0], // Keep first for backwards compat
        contextReferenceUrls: contextRefUrls,
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

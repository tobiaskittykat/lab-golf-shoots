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
  const { toast } = useToast();

  // Generate concepts from prompt
  const generateConcepts = useCallback(async (
    prompt: string,
    brandName?: string,
    brandPersonality?: string,
    brandIndustry?: string,
    useCase?: string,
    targetPersona?: string
  ): Promise<Concept[]> => {
    setIsGeneratingConcepts(true);
    
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

      return data.concepts || [];
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
      
      // Get moodboard description
      const moodboard = sampleMoodboards.find(m => m.id === state.moodboard);
      
      // Get reference URLs (for now using placeholder - in real app these would be actual image URLs)
      const productRef = sampleProductReferences.find(r => r.id === state.productReference);
      const contextRef = sampleContextReferences.find(r => r.id === state.contextReference);

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: state.prompt,
          conceptTitle: selectedConcept?.title,
          conceptDescription: selectedConcept?.description,
          
          moodboardId: state.moodboard,
          moodboardDescription: moodboard?.description,
          artisticStyle: state.artisticStyle,
          lightingStyle: state.lightingStyle,
          cameraAngle: state.cameraAngle,
          
          // Reference URLs - these would be actual image URLs in production
          productReferenceUrl: productRef?.url,
          contextReferenceUrl: contextRef?.url,
          
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
        productReferenceUrl: productRef?.url,
        contextReferenceUrl: contextRef?.url,
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
    generateConcepts,
    generateImages,
    generateVariations,
    editImage,
    deleteImage,
  };
}

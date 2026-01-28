import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreativeStudioState, 
  GeneratedImage, 
  Concept,
  Moodboard,
  UserPreference,
  sampleMoodboards,
  sampleProductReferences,
  sampleContextReferences
} from '@/components/creative-studio/types';
import { visualShotTypes } from '@/components/creative-studio/product-shoot/ShotTypeVisualSelector';
import { buildOnFootPrompt, initialOnFootConfig } from '@/components/creative-studio/product-shoot/shotTypeConfigs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';

export function useImageGeneration() {
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingDiscovery, setIsGeneratingDiscovery] = useState(false);
  const [conceptsProgress, setConceptsProgress] = useState(0); // 0-3 concepts loaded
  const { toast } = useToast();
  const { user } = useAuth();
  const { log: auditLog } = useAuditLog();

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
    state: CreativeStudioState,
    logoUrl?: string, // Logo URL for compositing
    brandId?: string  // Brand ID to associate images with
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

      // === PRODUCT SHOOT FLOW: Check state.productShoot for product references ===
      // This handles the Product Shoot workflow which uses a different state path
      if (state.productShoot?.recoloredProductUrl) {
        const shootUrl = state.productShoot.recoloredProductUrl;
        if (!productReferenceUrls.includes(shootUrl)) {
          productReferenceUrls.unshift(shootUrl); // Priority placement
        }
      }

      // If we have a selectedProductId (SKU), fetch composite and individual angles
      if (state.productShoot?.selectedProductId && state.useCase === 'product') {
        const skuId = state.productShoot.selectedProductId;
        
        // Fetch SKU composite image and name
        const { data: sku } = await supabase
          .from('product_skus')
          .select('composite_image_url, name')
          .eq('id', skuId)
          .maybeSingle();
        
        if (sku?.composite_image_url && !productReferenceUrls.includes(sku.composite_image_url)) {
          productReferenceUrls.unshift(sku.composite_image_url);
        }
        if (sku?.name && !productNames.includes(sku.name)) {
          productNames.unshift(sku.name);
        }
        
        // Also fetch individual angles for additional references
        const { data: angles } = await supabase
          .from('scraped_products')
          .select('thumbnail_url, full_url, name')
          .eq('sku_id', skuId)
          .limit(4);
        
        if (angles) {
          for (const angle of angles) {
            const url = angle.full_url || angle.thumbnail_url;
            if (url && !productReferenceUrls.includes(url)) {
              productReferenceUrls.push(url);
            }
          }
        }
      }
      
      // Fetch brand context, custom AI prompts, and Brand Brain
      let brandContext: Record<string, unknown> | undefined;
      let brandName: string | undefined;
      let brandPersonality: string | undefined;
      let customPromptAgentSystemPrompt: string | undefined;
      let brandBrain: Record<string, unknown> | undefined;
      
      if (brandId) {
        // Use specific brand if passed
        const { data: brand } = await supabase
          .from('brands')
          .select('name, personality, brand_context')
          .eq('id', brandId)
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
      } else if (user?.id) {
        // Fallback to first user brand for backward compatibility
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
      // For product shoot flow, use the visual shot type's promptHint
      // For on-foot, we build the full structured prompt with pose/leg/trouser configs
      let shotTypePrompt: string | null = null;
      
      if (state.useCase === 'product' && state.productShoot?.productShotType) {
        const shotType = state.productShoot.productShotType;
        
        if (shotType === 'on-foot') {
          // Build full structured on-foot prompt with all static/dynamic elements
          const onFootConfig = state.productShoot.onFootConfig || initialOnFootConfig;
          shotTypePrompt = buildOnFootPrompt(onFootConfig);
        } else {
          // Other product shot types - use the simple promptHint
          const selectedShotType = visualShotTypes.find(s => s.id === shotType);
          if (selectedShotType) {
            shotTypePrompt = selectedShotType.promptHint;
          }
        }
      } else if (state.contextReference) {
        // Lifestyle flow - use context reference's shot prompt
        shotTypePrompt = sampleContextReferences.find(r => r.id === state.contextReference)?.shotPrompt || null;
      }
      
      console.log('Generating with references:', {
        moodboardUrl,
        productReferenceUrls,
        shotTypePrompt,
        productShootConfig: state.productShoot
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
          
          // Brand ID for storage association
          brandId: brandId || null,
          
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
          
          // Logo placement for server-side compositing
          logoPlacement: state.logoPlacement?.enabled && logoUrl ? {
            enabled: true,
            position: state.logoPlacement.position,
            sizePercent: state.logoPlacement.sizePercent,
            opacity: state.logoPlacement.opacity,
            paddingPx: state.logoPlacement.paddingPx,
            logoUrl: logoUrl,
          } : null,
          
          // Product Shoot configuration (for product use case)
          productShootConfig: state.useCase === 'product' && state.productShoot ? {
            shotType: state.productShoot.productShotType,
            settingType: state.productShoot.settingType,
            backgroundId: state.productShoot.backgroundId,
            customBackgroundPrompt: state.productShoot.customBackgroundPrompt,
            modelConfig: state.productShoot.modelConfig,
            onFootConfig: state.productShoot.productShotType === 'on-foot' 
              ? (state.productShoot.onFootConfig || initialOnFootConfig) 
              : undefined,
          } : undefined,
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
      // Get image details before deletion for audit
      const { data: imageData } = await supabase
        .from('generated_images')
        .select('prompt, concept_title')
        .eq('id', imageId)
        .maybeSingle();
      
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
      
      // Audit log (fire-and-forget)
      auditLog({
        action: 'delete_generated_image',
        resourceType: 'generated_images',
        resourceId: imageId,
        resourceName: imageData?.concept_title || 'Untitled',
        metadata: { prompt: imageData?.prompt?.substring(0, 100) }
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting image:', err);
      return false;
    }
  }, [toast, auditLog]);

  // Generate discovery batch (12 images: 3 concepts × 4 shot types)
  const generateDiscoveryBatch = useCallback(async (
    state: CreativeStudioState,
    concepts: Concept[],
    moodboards: { conceptId: string; moodboardId: string; moodboardUrl: string; productIds: string[] }[],
    logoUrl?: string,
    onImageReady?: (image: GeneratedImage) => void
  ): Promise<GeneratedImage[]> => {
    setIsGeneratingDiscovery(true);
    
    const allImages: GeneratedImage[] = [];
    const shotTypes = sampleContextReferences; // 4 shots
    
    console.log('=== DISCOVERY BATCH GENERATION ===');
    console.log(`Generating ${concepts.length} concepts × ${shotTypes.length} shots = ${concepts.length * shotTypes.length} images`);
    
    // Generate images for each concept in parallel batches
    const batchPromises = concepts.map(async (concept, conceptIdx) => {
      const moodboardInfo = moodboards.find(m => m.conceptId === concept.id);
      
      // Get product IDs for THIS concept only (from smart-match)
      const conceptProductIds = moodboardInfo?.productIds || [];
      console.log(`Concept "${concept.title}" has ${conceptProductIds.length} matched products`);
      
      // Generate all 4 shots for this concept in parallel
      const shotPromises = shotTypes.map(async (shot) => {
        try {
          // Determine max products based on shot type
          // Composition shots can have up to 3 products, others get 1
          const isCompositionShot = shot.id === 'shot-composition';
          const maxProducts = isCompositionShot ? 3 : 1;
          
          // Resolve product references for THIS concept only
          const productReferenceUrls: string[] = [];
          const productNames: string[] = [];
          
          // Only take the allowed number of products for this shot type
          const productIdsToUse = conceptProductIds.slice(0, maxProducts);
          
          for (const productId of productIdsToUse) {
            const { data: scrapedRow } = await supabase
              .from('scraped_products')
              .select('full_url, thumbnail_url, name')
              .eq('id', productId)
              .maybeSingle();
            if (scrapedRow) {
              const url = scrapedRow.full_url || scrapedRow.thumbnail_url;
              if (url) productReferenceUrls.push(url);
              if (scrapedRow.name) productNames.push(scrapedRow.name);
            }
          }
          
          console.log(`Shot "${shot.name}" (${isCompositionShot ? 'composition' : 'standard'}): ${productReferenceUrls.length} products attached`);
          
          // Create a minimal state for this single image
          const singleState: CreativeStudioState = {
            ...state,
            selectedConcept: concept.id,
            concepts: [concept],
            moodboard: moodboardInfo?.moodboardId || null,
            contextReference: shot.id,
            resolution: '512', // Fast generation
            imageCount: 1,
          };
          
          const { data, error } = await supabase.functions.invoke('generate-image', {
            body: {
              prompt: concept.description || concept.coreIdea || concept.title,
              conceptTitle: concept.title,
              conceptDescription: concept.description,
              coreIdea: concept.coreIdea,
              tonality: concept.tonality,
              visualWorld: concept.visualWorld,
              contentPillars: concept.contentPillars,
              targetAudience: concept.targetAudience,
              consumerInsight: concept.consumerInsight,
              productFocus: concept.productFocus,
              taglines: concept.taglines,
              moodboardId: moodboardInfo?.moodboardId,
              moodboardUrl: moodboardInfo?.moodboardUrl,
              productReferenceUrls,
              productNames,
              shotTypePrompt: shot.shotPrompt,
              artisticStyle: state.artisticStyle,
              lightingStyle: state.lightingStyle,
              cameraAngle: state.cameraAngle,
              extraKeywords: state.extraKeywords,
              negativePrompt: state.negativePrompt,
              imageCount: 1,
              resolution: '512',
              aspectRatio: state.aspectRatio,
              aiModel: state.aiModel,
              logoPlacement: state.logoPlacement?.enabled && logoUrl ? {
                enabled: true,
                position: state.logoPlacement.position,
                sizePercent: state.logoPlacement.sizePercent,
                opacity: state.logoPlacement.opacity,
                paddingPx: state.logoPlacement.paddingPx,
                logoUrl,
              } : null,
            },
          });
          
          if (error) {
            console.error(`Error generating ${concept.title} - ${shot.name}:`, error);
            return null;
          }
          
          const images = data.images || [];
          if (images.length > 0) {
            const img = images[0];
            const generatedImage: GeneratedImage = {
              id: img.id || `discovery-${concept.id}-${shot.id}`,
              imageUrl: img.imageUrl || '',
              status: img.status || 'failed',
              prompt: concept.description || '',
              refinedPrompt: img.refinedPrompt,
              conceptTitle: concept.title,
              conceptId: concept.id,
              index: conceptIdx * shotTypes.length + shotTypes.indexOf(shot),
              moodboardId: moodboardInfo?.moodboardId,
              moodboardUrl: moodboardInfo?.moodboardUrl,
              productReferenceUrls: productReferenceUrls.length > 0 ? productReferenceUrls : undefined,
              productIds: productIdsToUse, // Store the product IDs used
              shotType: shot.id,
              liked: null, // Not rated yet
            };
            
            if (onImageReady) {
              onImageReady(generatedImage);
            }
            
            return generatedImage;
          }
          return null;
        } catch (err) {
          console.error(`Error generating ${concept.title} - ${shot.name}:`, err);
          return null;
        }
      });
      
      const shotResults = await Promise.all(shotPromises);
      return shotResults.filter((img): img is GeneratedImage => img !== null);
    });
    
    try {
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(conceptImages => {
        allImages.push(...conceptImages);
      });
      
      const successCount = allImages.filter(img => img.status === 'completed').length;
      toast({
        title: 'Discovery batch complete',
        description: `Generated ${successCount} of ${concepts.length * shotTypes.length} images`,
      });
    } catch (err) {
      console.error('Discovery batch error:', err);
      toast({
        title: 'Discovery generation failed',
        description: 'Some images could not be generated',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingDiscovery(false);
    }
    
    return allImages;
  }, [toast]);

  // Update image like status
  const updateImageLike = useCallback(async (imageId: string, liked: boolean | null): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ liked })
        .eq('id', imageId);
      
      if (error) {
        console.error('Error updating like status:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error updating like status:', err);
      return false;
    }
  }, []);

  // Generate more images from user preferences
  const generateFromPreferences = useCallback(async (
    state: CreativeStudioState,
    preferences: UserPreference[],
    logoUrl?: string,
    imagesPerCombo: number = 2
  ): Promise<GeneratedImage[]> => {
    setIsGeneratingImages(true);
    
    const allImages: GeneratedImage[] = [];
    const likedPrefs = preferences.filter(p => p.liked);
    
    console.log('=== GENERATING FROM PREFERENCES ===');
    console.log(`Generating ${imagesPerCombo} images for each of ${likedPrefs.length} liked combinations`);
    
    for (const pref of likedPrefs) {
      const concept = state.concepts.find(c => c.id === pref.conceptId);
      if (!concept) continue;
      
      // Fetch moodboard URL only if moodboardId exists and is not empty
      let moodboardUrl: string | undefined;
      if (pref.moodboardId && pref.moodboardId.length > 0) {
        const moodboardDbId = pref.moodboardId.startsWith('custom-')
          ? pref.moodboardId.replace('custom-', '')
          : pref.moodboardId;
        const { data: moodboard } = await supabase
          .from('custom_moodboards')
          .select('thumbnail_url')
          .eq('id', moodboardDbId)
          .maybeSingle();
        moodboardUrl = moodboard?.thumbnail_url;
      }
      
      const shotType = sampleContextReferences.find(s => s.id === pref.shotType);
      
      // Determine max products based on shot type (same as discovery)
      const isCompositionShot = pref.shotType === 'shot-composition';
      const maxProducts = isCompositionShot ? 3 : 1;
      
      // Use productIds from preference (carried from discovery), not state.productReferences
      const productIdsToUse = (pref.productIds || []).slice(0, maxProducts);
      
      // Resolve product references from preference productIds
      const productReferenceUrls: string[] = [];
      for (const productId of productIdsToUse) {
        const { data: scrapedRow } = await supabase
          .from('scraped_products')
          .select('full_url, thumbnail_url')
          .eq('id', productId)
          .maybeSingle();
        if (scrapedRow) {
          const url = scrapedRow.full_url || scrapedRow.thumbnail_url;
          if (url) productReferenceUrls.push(url);
        }
      }
      
      console.log(`Preference "${concept.title}" - ${pref.shotType}: ${productReferenceUrls.length} products attached`);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: {
            prompt: concept.description || concept.coreIdea || concept.title,
            conceptTitle: concept.title,
            conceptDescription: concept.description,
            coreIdea: concept.coreIdea,
            tonality: concept.tonality,
            visualWorld: concept.visualWorld,
            moodboardId: pref.moodboardId,
            moodboardUrl,
            productReferenceUrls,
            shotTypePrompt: shotType?.shotPrompt,
            artisticStyle: state.artisticStyle,
            lightingStyle: state.lightingStyle,
            cameraAngle: state.cameraAngle,
            extraKeywords: state.extraKeywords,
            negativePrompt: state.negativePrompt,
            imageCount: imagesPerCombo,
            resolution: '1024', // Higher res for final output
            aspectRatio: state.aspectRatio,
            aiModel: state.aiModel,
            logoPlacement: state.logoPlacement?.enabled && logoUrl ? {
              enabled: true,
              position: state.logoPlacement.position,
              sizePercent: state.logoPlacement.sizePercent,
              opacity: state.logoPlacement.opacity,
              paddingPx: state.logoPlacement.paddingPx,
              logoUrl,
            } : null,
          },
        });
        
        if (!error && data.images) {
          const images: GeneratedImage[] = data.images.map((img: any, idx: number) => ({
            id: img.id || `pref-${pref.conceptId}-${pref.shotType}-${idx}`,
            imageUrl: img.imageUrl || '',
            status: img.status || 'failed',
            prompt: concept.description || '',
            refinedPrompt: img.refinedPrompt,
            conceptTitle: concept.title,
            conceptId: concept.id,
            index: allImages.length + idx,
            moodboardId: pref.moodboardId,
            moodboardUrl,
            productReferenceUrls: productReferenceUrls.length > 0 ? productReferenceUrls : undefined,
            productIds: productIdsToUse, // Store the product IDs used
            shotType: pref.shotType,
            liked: null,
          }));
          allImages.push(...images);
        }
      } catch (err) {
        console.error(`Error generating from preference ${pref.conceptId}-${pref.shotType}:`, err);
      }
    }
    
    setIsGeneratingImages(false);
    
    const successCount = allImages.filter(img => img.status === 'completed').length;
    toast({
      title: 'Generation complete',
      description: `Generated ${successCount} images from your preferences`,
    });
    
    return allImages;
  }, [toast]);

  return {
    isGeneratingConcepts,
    isGeneratingImages,
    isGeneratingDiscovery,
    conceptsProgress,
    generateConcepts,
    generateImages,
    generateVariations,
    editImage,
    deleteImage,
    generateDiscoveryBatch,
    updateImageLike,
    generateFromPreferences,
  };
}

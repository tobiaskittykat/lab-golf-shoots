import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { df3iColors, df3iAlignmentMarks, df3iReferenceImages, buildDF3iRemixPrompt } from '@/lib/labGolfVariants';
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
import { buildOnFootPrompt, buildLifestylePrompt, buildProductFocusPrompt, initialOnFootConfig, initialLifestyleConfig, initialProductFocusConfig, BackgroundContext } from '@/components/creative-studio/product-shoot/shotTypeConfigs';
import { updateSkuLastUsed } from '@/components/creative-studio/product-shoot/ProductSKUPicker';
import { parseSkuDisplayInfo, type SKUDisplayInfo } from '@/lib/skuDisplayUtils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { triggerIntegrityAnalysis } from '@/hooks/useIntegrityResults';
import { pollForPendingImages, invokeAndPollGeneration } from '@/lib/imagePolling';

export function useImageGeneration() {
  const [isGeneratingConcepts, setIsGeneratingConcepts] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isGeneratingDiscovery, setIsGeneratingDiscovery] = useState(false);
  const [conceptsProgress, setConceptsProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const { log: auditLog } = useAuditLog();

  const generateConcepts = useCallback(async (
    prompt: string,
    brandName?: string,
    brandPersonality?: string,
    brandIndustry?: string,
    useCase?: string,
    targetPersona?: string,
    onConceptReady?: (concept: Concept, index: number) => void,
    customSystemPrompt?: string
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

      if (onConceptReady && concepts.length > 0) {
        for (let i = 0; i < concepts.length; i++) {
          setConceptsProgress(i + 1);
          onConceptReady(concepts[i], i);
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

  const generateImages = useCallback(async (
    state: CreativeStudioState,
    logoUrl?: string,
    brandId?: string,
    onImageReady?: (image: GeneratedImage) => void
  ): Promise<GeneratedImage[]> => {
    setIsGeneratingImages(true);

    try {
      const selectedConcept = state.concepts.find(c => c.id === state.selectedConcept);

      let moodboardDescription: string | undefined;
      let moodboardUrl: string | undefined;
      let moodboardName: string | undefined;
      let moodboardAnalysis: Record<string, unknown> | undefined;

      if (state.moodboard && state.useCase !== 'product') {
        const isCustomMoodboard = state.moodboard.startsWith('custom-') ||
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(state.moodboard);
        const moodboardDbId = state.moodboard.startsWith('custom-')
          ? state.moodboard.replace('custom-', '')
          : state.moodboard;

        if (isCustomMoodboard) {
          const { data: customMoodboard, error: moodboardErr } = await (supabase
            .from('custom_moodboards' as any)
            .select('thumbnail_url, description, name, visual_analysis')
            .eq('id', moodboardDbId)
            .maybeSingle() as any);

          if (customMoodboard) {
            moodboardUrl = customMoodboard.thumbnail_url;
            moodboardDescription = customMoodboard.description || undefined;
            moodboardName = customMoodboard.name;
            moodboardAnalysis = customMoodboard.visual_analysis as Record<string, unknown> | undefined;
          }
        } else {
          const sampleMoodboard = sampleMoodboards.find(m => m.id === state.moodboard);
          if (sampleMoodboard) {
            moodboardUrl = sampleMoodboard.thumbnail;
            moodboardDescription = sampleMoodboard.description;
            moodboardName = sampleMoodboard.name;
          }
        }
      }

      const productReferenceUrls: string[] = [];
      const productNames: string[] = [];
      if (state.useCase !== 'product') {
        for (const productRef of state.productReferences) {
          if (productRef.startsWith('scraped-')) {
            const dbId = productRef.replace('scraped-', '');
            const { data: scrapedRow, error: scrapedErr } = await (supabase
              .from('scraped_products' as any)
              .select('full_url, thumbnail_url, name')
              .eq('id', dbId)
              .maybeSingle() as any);

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
      }

      if (state.productShoot?.recoloredProductUrl) {
        const shootUrl = state.productShoot.recoloredProductUrl;
        if (!productReferenceUrls.includes(shootUrl)) {
          productReferenceUrls.unshift(shootUrl);
        }
      }

      let productIdentity: SKUDisplayInfo | undefined;
      let originalComponents: Record<string, any> | undefined;

      if (state.productShoot?.selectedProductId && state.useCase === 'product') {
        const skuId = state.productShoot.selectedProductId;

        const { data: sku } = await (supabase
          .from('product_skus' as any)
          .select('composite_image_url, name, description, components')
          .eq('id', skuId)
          .maybeSingle() as any);

        if (sku?.composite_image_url && !productReferenceUrls.includes(sku.composite_image_url)) {
          productReferenceUrls.unshift(sku.composite_image_url);
        }
        if (sku?.name && !productNames.includes(sku.name)) {
          productNames.unshift(sku.name);
        }

        if (sku?.name) {
          productIdentity = parseSkuDisplayInfo(sku.name, sku.description as any);
        }

        if (sku?.components) {
          originalComponents = sku.components as Record<string, any>;
        }

        const { data: angles } = await (supabase
          .from('scraped_products' as any)
          .select('thumbnail_url, full_url, name')
          .eq('sku_id', skuId)
          .limit(10) as any);

        if (angles) {
          for (const angle of angles) {
            const url = angle.full_url || angle.thumbnail_url;
            if (url && !productReferenceUrls.includes(url)) {
              productReferenceUrls.push(url);
            }
          }
        }
      }

      let brandContext: Record<string, unknown> | undefined;
      let brandName: string | undefined;
      let brandPersonality: string | undefined;
      let customPromptAgentSystemPrompt: string | undefined;
      let brandBrain: Record<string, unknown> | undefined;

      if (brandId) {
        const { data: brand } = await supabase
          .from('brands')
          .select('name, personality, brand_context')
          .eq('id', brandId)
          .maybeSingle();

        if (brand) {
          brandName = brand.name;
          brandPersonality = brand.personality || undefined;
          brandContext = brand.brand_context as Record<string, unknown> | undefined;

          const aiPrompts = (brandContext as any)?.aiPrompts;
          if (aiPrompts?.promptAgent) {
            customPromptAgentSystemPrompt = aiPrompts.promptAgent;
          }

          if ((brandContext as any)?.brandBrain) {
            brandBrain = (brandContext as any).brandBrain;
          }
        }
      } else if (user?.id) {
        const { data: brand } = await supabase
          .from('brands')
          .select('name, personality, brand_context')
          .eq('user_id', user.id)
          .maybeSingle();

        if (brand) {
          brandName = brand.name;
          brandPersonality = brand.personality || undefined;
          brandContext = brand.brand_context as Record<string, unknown> | undefined;

          const aiPrompts = (brandContext as any)?.aiPrompts;
          if (aiPrompts?.promptAgent) {
            customPromptAgentSystemPrompt = aiPrompts.promptAgent;
          }

          if ((brandContext as any)?.brandBrain) {
            brandBrain = (brandContext as any).brandBrain;
          }
        }
      }

      const buildShotTypePromptForProduct = (): string | null => {
        if (!state.useCase || state.useCase !== 'product' || !state.productShoot?.productShotType) {
          return null;
        }

        const shotType = state.productShoot.productShotType;

        const bgContext: BackgroundContext = {
          settingType: state.productShoot.settingType || 'studio',
          backgroundId: state.productShoot.backgroundId,
          customBackgroundPrompt: state.productShoot.customBackgroundPrompt,
          weatherCondition: state.productShoot.weatherCondition,
        };

        if (shotType === 'on-foot') {
          const onFootConfig = state.productShoot.onFootConfig || initialOnFootConfig;
          return buildOnFootPrompt(onFootConfig, bgContext);
        } else if (shotType === 'lifestyle') {
          const lifestyleConfig = state.productShoot.lifestyleConfig || initialLifestyleConfig;
          return buildLifestylePrompt(lifestyleConfig, bgContext);
        } else if (shotType === 'product-focus') {
          const productFocusConfig = state.productShoot.productFocusConfig || initialProductFocusConfig;
          return buildProductFocusPrompt(productFocusConfig, bgContext);
        } else {
          const selectedShotType = visualShotTypes.find(s => s.id === shotType);
          if (selectedShotType) {
            return selectedShotType.promptHint;
          }
        }
        return null;
      };

      let shotTypePrompt: string | null = null;

      if (state.useCase === 'product' && state.productShoot?.productShotType) {
        shotTypePrompt = buildShotTypePromptForProduct();
      } else if (state.contextReference) {
        shotTypePrompt = sampleContextReferences.find(r => r.id === state.contextReference)?.shotPrompt || null;
      }

      const primaryPrompt = selectedConcept?.description || selectedConcept?.coreIdea || selectedConcept?.title || state.prompt;

      const buildRequestBody = (shotPromptOverride?: string | null, imgCount?: number) => {
        let imageTitle: string | undefined = state.useCase === 'product'
          ? (productNames[0] || 'Product Shot')
          : selectedConcept?.title;

        if (state.useCase === 'product' && state.productShoot?.componentOverrides && productIdentity) {
          const overrides = state.productShoot.componentOverrides;
          const upperOverride = overrides.upper;
          if (upperOverride) {
            const newColor = upperOverride.color || productIdentity.color;
            const newMaterial = upperOverride.material || productIdentity.material;
            const parts = [
              productIdentity.brandName,
              productIdentity.modelName,
              newColor,
              newMaterial
            ].filter(Boolean);
            if (parts.length > 1) {
              imageTitle = parts.join(' ');
            }
          }
        }

        return {
          prompt: primaryPrompt,
          conceptTitle: imageTitle,
          conceptDescription: selectedConcept?.description,
          coreIdea: selectedConcept?.coreIdea,
          tonality: selectedConcept?.tonality,

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

          productReferenceUrls,
          productNames,
          shotTypePrompt: shotPromptOverride !== undefined ? shotPromptOverride : shotTypePrompt,

          brandName,
          brandPersonality,
          brandContext,

          brandId: brandId || null,
          brandBrain,
          customPromptAgentSystemPrompt,

          productIdentity: state.useCase === 'product' ? productIdentity : undefined,

          extraKeywords: state.extraKeywords,
          negativePrompt: state.negativePrompt,
          textOnImage: state.textOnImage,

          imageCount: imgCount ?? state.imageCount,
          resolution: state.resolution,
          aspectRatio: state.aspectRatio,

          aiModel: state.aiModel,
          guidanceScale: state.guidanceScale,
          seed: state.seed,

          folder: state.saveToFolder,

          logoPlacement: state.logoPlacement?.enabled && logoUrl ? {
            enabled: true,
            position: state.logoPlacement.position,
            sizePercent: state.logoPlacement.sizePercent,
            opacity: state.logoPlacement.opacity,
            paddingPx: state.logoPlacement.paddingPx,
            logoUrl: logoUrl,
          } : null,

          productShootConfig: state.useCase === 'product' && state.productShoot ? {
            shotType: state.productShoot.productShotType,
            settingType: state.productShoot.settingType,
            backgroundId: state.productShoot.backgroundId,
            customBackgroundPrompt: state.productShoot.customBackgroundPrompt,
            weatherCondition: state.productShoot.weatherCondition,
            sceneImageUrl: state.productShoot.sceneImageUrl,
            modelConfig: state.productShoot.modelConfig,
            onFootConfig: state.productShoot.productShotType === 'on-foot'
              ? (state.productShoot.onFootConfig || initialOnFootConfig)
              : undefined,
            lifestyleConfig: state.productShoot.productShotType === 'lifestyle'
              ? (state.productShoot.lifestyleConfig || initialLifestyleConfig)
              : undefined,
            productFocusConfig: state.productShoot.productShotType === 'product-focus'
              ? (state.productShoot.productFocusConfig || initialProductFocusConfig)
              : undefined,
          } : undefined,

          componentOverrides: state.productShoot?.componentOverrides || undefined,
          originalComponents: originalComponents || undefined,

          componentSampleImages: (() => {
            const overrides = state.productShoot?.componentOverrides;
            if (!overrides) return undefined;
            const samples: { component: string; url: string }[] = [];
            for (const [comp, ov] of Object.entries(overrides)) {
              if (ov?.sampleImageUrl && ov?.attachSampleToGen) {
                samples.push({ component: comp, url: ov.sampleImageUrl });
              }
            }
            return samples.length > 0 ? samples : undefined;
          })(),

          attachReferenceImages: state.productShoot?.attachReferenceImages ?? true,
        };
      };

      let allPendingIds: string[] = [];

      if (state.useCase === 'product' && state.productShoot?.shootMode === 'remix' && state.productShoot.remixSourceImages.length > 0) {
        const sourceImages = state.productShoot.remixSourceImages;
        const BATCH_SIZE = 2;
        for (let batchStart = 0; batchStart < sourceImages.length; batchStart += BATCH_SIZE) {
          const batchEnd = Math.min(batchStart + BATCH_SIZE, sourceImages.length);
          const batchPromises: Promise<any>[] = [];

          for (let i = batchStart; i < batchEnd; i++) {
            // Build variant-aware remix prompt
            let remixPrompt = state.productShoot.remixCustomPrompt || '';
            const variantRefs: string[] = [];

            if (!remixPrompt) {
              const variantColorId = state.productShoot.selectedVariantColor;
              const variantMarkId = state.productShoot.selectedVariantMark;
              const selectedColor = variantColorId ? df3iColors.find(c => c.id === variantColorId) : null;
              const selectedMark = variantMarkId ? df3iAlignmentMarks.find(m => m.id === variantMarkId) : null;

              remixPrompt = buildDF3iRemixPrompt({ selectedColor, selectedMark });

              if (selectedMark) {
                variantRefs.push(selectedMark.publicUrl);
              }
            } else {
              // Still attach mark reference even with custom prompt
              const variantMarkId = state.productShoot.selectedVariantMark;
              const selectedMark = variantMarkId ? df3iAlignmentMarks.find(m => m.id === variantMarkId) : null;
              if (selectedMark) variantRefs.push(selectedMark.publicUrl);
            }

            // Add DF3i reference images
            const allProductRefs = [...(productReferenceUrls || [])];
            for (const refImg of df3iReferenceImages) {
              if (!allProductRefs.includes(refImg)) allProductRefs.push(refImg);
            }

            const remixBody = {
              ...buildRequestBody(null, state.imageCount),
              remixMode: true,
              remixRemoveText: state.productShoot.remixRemoveText ?? false,
              editMode: true,
              sourceImageUrl: sourceImages[i],
              prompt: remixPrompt,
              productReferenceUrls: allProductRefs,
              variantReferenceUrls: variantRefs.length > 0 ? variantRefs : undefined,
            };
            batchPromises.push(
              supabase.functions.invoke('generate-image', { body: remixBody })
            );
          }

          const batchResults = await Promise.all(batchPromises);
          for (const result of batchResults) {
            if (result.data?.pendingIds) {
              allPendingIds.push(...result.data.pendingIds);
            } else if (result.error) {
              console.error('Remix request failed:', result.error);
            }
          }
        }
      }
      else if (state.sequentialGeneration && state.useCase === 'product' && state.imageCount > 1) {
        const BATCH_SIZE = 2;
        for (let batchStart = 0; batchStart < state.imageCount; batchStart += BATCH_SIZE) {
          const batchEnd = Math.min(batchStart + BATCH_SIZE, state.imageCount);
          const batchPromises: Promise<any>[] = [];
          for (let i = batchStart; i < batchEnd; i++) {
            const freshShotTypePrompt = buildShotTypePromptForProduct();
            batchPromises.push(
              supabase.functions.invoke('generate-image', {
                body: buildRequestBody(freshShotTypePrompt, 1),
              })
            );
          }
          const batchResults = await Promise.all(batchPromises);
          for (const result of batchResults) {
            if (result.data?.pendingIds) {
              allPendingIds.push(...result.data.pendingIds);
            } else if (result.error) {
              console.error('Sequential request failed:', result.error);
            }
          }
        }
      } else {
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: buildRequestBody(),
        });
        if (data?.pendingIds) {
          allPendingIds = data.pendingIds;
        } else if (error) {
          console.error('Error starting image generation:', error);
          toast({
            title: 'Failed to start generation',
            description: error.message || 'Please try again',
            variant: 'destructive',
          });
          return [];
        }
      }

      if (state.productShoot?.selectedProductId) {
        updateSkuLastUsed(state.productShoot.selectedProductId);
      }

      if (allPendingIds.length === 0) {
        toast({
          title: 'Failed to start generation',
          description: 'No image jobs were created. Please try again.',
          variant: 'destructive',
        });
        return [];
      }

      const notifiedIds = new Set<string>();
      const rows = await pollForPendingImages(allPendingIds, {
        maxWaitMs: 480000,
        intervalMs: 4000,
        onRowReady: (row) => {
          if (row.status === 'completed' && onImageReady && !notifiedIds.has(row.id)) {
            notifiedIds.add(row.id);
            const image: GeneratedImage = {
              id: row.id,
              imageUrl: row.image_url || '',
              status: 'completed',
              prompt: row.prompt || state.prompt,
              refinedPrompt: row.refined_prompt,
              conceptTitle: row.concept_title || selectedConcept?.title,
              index: notifiedIds.size - 1,
              moodboardId: state.moodboard || undefined,
              moodboardUrl: moodboardUrl || undefined,
              productReferenceUrls: productReferenceUrls.length > 0 ? productReferenceUrls : undefined,
              productReferenceUrl: productReferenceUrls[0],
              settings: row.settings as Record<string, unknown> || undefined,
            };
            onImageReady(image);
            if (productReferenceUrls.length > 0 && image.imageUrl) {
              triggerIntegrityAnalysis(image.id, image.imageUrl, productReferenceUrls, productNames[0]);
            }
          }
        },
      });

      const images: GeneratedImage[] = rows.map((row, idx) => ({
        id: row.id,
        imageUrl: row.image_url || '',
        status: (row.status || 'failed') as any,
        prompt: row.prompt || state.prompt,
        refinedPrompt: row.refined_prompt,
        conceptTitle: row.concept_title || selectedConcept?.title,
        index: idx,
        moodboardId: state.moodboard || undefined,
        moodboardUrl: moodboardUrl || undefined,
        productReferenceUrls: productReferenceUrls.length > 0 ? productReferenceUrls : undefined,
        productReferenceUrl: productReferenceUrls[0],
        error: row.error_message,
        settings: row.settings as Record<string, unknown> || undefined,
      }));

      const successCount = images.filter(i => i.status === 'completed').length;

      if (successCount > 0) {
        toast({
          title: 'Images generated!',
          description: `Successfully generated ${successCount} of ${state.imageCount} images`,
        });
        if (productReferenceUrls.length > 0) {
          images
            .filter(i => i.status === 'completed' && i.imageUrl && !notifiedIds.has(i.id))
            .forEach(img => {
              triggerIntegrityAnalysis(img.id, img.imageUrl, productReferenceUrls, productNames[0]);
            });
        }
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

  const generateVariations = useCallback(async (
    state: CreativeStudioState,
    sourceImage: GeneratedImage,
    onImageReady?: (image: GeneratedImage) => void
  ): Promise<GeneratedImage[]> => {
    setIsGeneratingImages(true);

    try {
      const settings = sourceImage.settings || {};
      const refs = (settings.references as Record<string, unknown>) || {};

      const productReferenceUrls = (refs.productReferenceUrls as string[]) ||
        sourceImage.productReferenceUrls ||
        (sourceImage.productReferenceUrl ? [sourceImage.productReferenceUrl] : []);

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: sourceImage.refinedPrompt || sourceImage.prompt || '',
          conceptTitle: sourceImage.conceptTitle,
          productReferenceUrls,
          moodboardId: sourceImage.moodboardId || refs.moodboardId,
          moodboardUrl: refs.moodboardUrl || sourceImage.moodboardUrl,
          shotTypePrompt: refs.shotTypePrompt,
          artisticStyle: settings.artisticStyle || state.artisticStyle,
          lightingStyle: settings.lightingStyle || state.lightingStyle,
          cameraAngle: settings.cameraAngle || state.cameraAngle,
          imageCount: 1,
          resolution: settings.resolution || state.resolution,
          aspectRatio: settings.aspectRatio || state.aspectRatio,
          aiModel: settings.aiModel || state.aiModel,
          seed: Math.floor(Math.random() * 1000000),
          brandId: settings.brandId,
          componentOverrides: settings.componentOverrides || refs.componentOverrides,
          originalComponents: settings.originalComponents || refs.originalComponents,
          attachReferenceImages: settings.attachReferenceImages ?? true,
          productIdentity: settings.productIdentity || refs.productIdentity,
          productShootConfig: settings.productShootConfig || refs.productShootConfig,
          productNames: settings.productNames || refs.productNames,
        },
      });

      if (error) {
        console.error('Error regenerating:', error);
        toast({
          title: 'Failed to regenerate',
          description: error.message || 'Please try again',
          variant: 'destructive',
        });
        return [];
      }

      const pendingIds = data?.pendingIds || [];
      if (pendingIds.length === 0) {
        toast({
          title: 'Failed to regenerate',
          description: 'No image jobs were created. Please try again.',
          variant: 'destructive',
        });
        return [];
      }

      const notifiedIds = new Set<string>();
      const rows = await pollForPendingImages(pendingIds, {
        maxWaitMs: 480000,
        intervalMs: 4000,
        onRowReady: (row) => {
          if (row.status === 'completed' && onImageReady && !notifiedIds.has(row.id)) {
            notifiedIds.add(row.id);
            const img: GeneratedImage = {
              id: row.id,
              imageUrl: row.image_url || '',
              status: 'completed',
              prompt: row.prompt || sourceImage.prompt || '',
              refinedPrompt: row.refined_prompt,
              conceptTitle: row.concept_title || sourceImage.conceptTitle,
              index: 0,
              productReferenceUrls,
              productReferenceUrl: productReferenceUrls[0],
              moodboardId: sourceImage.moodboardId,
              settings: row.settings as GeneratedImage['settings'],
            };
            onImageReady(img);
            if (productReferenceUrls.length > 0 && img.imageUrl) {
              triggerIntegrityAnalysis(img.id, img.imageUrl, productReferenceUrls, sourceImage.conceptTitle);
            }
          }
        },
      });

      const images: GeneratedImage[] = rows.map((row, idx) => ({
        id: row.id,
        imageUrl: row.image_url || '',
        status: (row.status || 'failed') as any,
        prompt: row.prompt || sourceImage.prompt || '',
        refinedPrompt: row.refined_prompt,
        conceptTitle: row.concept_title || sourceImage.conceptTitle,
        index: idx,
        productReferenceUrls,
        productReferenceUrl: productReferenceUrls[0],
        moodboardId: sourceImage.moodboardId,
        error: row.error_message,
        settings: row.settings as GeneratedImage['settings'],
      }));

      const successCount = images.filter(i => i.status === 'completed').length;
      if (successCount > 0) {
        toast({
          title: 'Regenerated!',
          description: `Created ${successCount} new image(s)`,
        });
        if (productReferenceUrls.length > 0) {
          images
            .filter(i => i.status === 'completed' && i.imageUrl && !notifiedIds.has(i.id))
            .forEach(img => {
              triggerIntegrityAnalysis(img.id, img.imageUrl, productReferenceUrls, sourceImage.conceptTitle);
            });
        }
      }

      return images;
    } catch (err) {
      console.error('Error regenerating:', err);
      toast({
        title: 'Failed to regenerate',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsGeneratingImages(false);
    }
  }, [toast]);

  const editImage = useCallback(async (
    sourceImage: GeneratedImage,
    editDescription: string,
    state: CreativeStudioState
  ): Promise<GeneratedImage[]> => {
    setIsGeneratingImages(true);

    try {
      const { rows, error: genError } = await invokeAndPollGeneration({
        prompt: editDescription,
        sourceImageUrl: sourceImage.imageUrl,
        editMode: true,
        artisticStyle: state.artisticStyle,
        lightingStyle: state.lightingStyle,
        cameraAngle: state.cameraAngle,
        imageCount: state.imageCount,
        resolution: state.resolution,
        aspectRatio: state.aspectRatio,
        aiModel: state.aiModel,
        guidanceScale: state.guidanceScale,
      });

      if (genError || rows.length === 0) {
        console.error('Error editing image:', genError);
        toast({
          title: 'Failed to edit image',
          description: genError || 'Please try again',
          variant: 'destructive',
        });
        return [];
      }

      const images: GeneratedImage[] = rows
        .filter(r => r.status === 'completed')
        .map((row, idx) => ({
          id: row.id,
          imageUrl: row.image_url || '',
          status: 'completed' as const,
          prompt: editDescription,
          refinedPrompt: row.refined_prompt,
          error: row.error_message,
          index: idx,
        }));

      if (images.length > 0) {
        toast({
          title: 'Image edited!',
          description: `Successfully created ${images.length} edited image(s)`,
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

  const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    try {
      const { data: imageData } = await (supabase
        .from('generated_images' as any)
        .select('prompt, concept_title')
        .eq('id', imageId)
        .maybeSingle() as any);

      const { error } = await (supabase
        .from('generated_images' as any)
        .delete()
        .eq('id', imageId) as any);

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

  const generateDiscoveryBatch = useCallback(async (
    state: CreativeStudioState,
    concepts: Concept[],
    moodboards: { conceptId: string; moodboardId: string; moodboardUrl: string; productIds: string[] }[],
    logoUrl?: string,
    onImageReady?: (image: GeneratedImage) => void
  ): Promise<GeneratedImage[]> => {
    setIsGeneratingDiscovery(true);

    const allImages: GeneratedImage[] = [];
    const shotTypes = sampleContextReferences;

    const batchPromises = concepts.map(async (concept, conceptIdx) => {
      const moodboardInfo = moodboards.find(m => m.conceptId === concept.id);
      const conceptProductIds = moodboardInfo?.productIds || [];

      const shotPromises = shotTypes.map(async (shot) => {
        try {
          const isCompositionShot = shot.id === 'shot-composition';
          const maxProducts = isCompositionShot ? 3 : 1;

          const productReferenceUrls: string[] = [];
          const productNames: string[] = [];

          const productIdsToUse = conceptProductIds.slice(0, maxProducts);

          for (const productId of productIdsToUse) {
            const { data: scrapedRow } = await (supabase
              .from('scraped_products' as any)
              .select('full_url, thumbnail_url, name')
              .eq('id', productId)
              .maybeSingle() as any);
            if (scrapedRow) {
              const url = scrapedRow.full_url || scrapedRow.thumbnail_url;
              if (url) productReferenceUrls.push(url);
              if (scrapedRow.name) productNames.push(scrapedRow.name);
            }
          }

          const { rows, error: genError } = await invokeAndPollGeneration({
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
          });

          if (genError) {
            console.error(`Error generating ${concept.title} - ${shot.name}:`, genError);
            return null;
          }

          const successRow = rows.find(r => r.status === 'completed');
          if (successRow) {
            const generatedImage: GeneratedImage = {
              id: successRow.id,
              imageUrl: successRow.image_url || '',
              status: 'completed',
              prompt: concept.description || '',
              refinedPrompt: successRow.refined_prompt,
              conceptTitle: concept.title,
              conceptId: concept.id,
              index: conceptIdx * shotTypes.length + shotTypes.indexOf(shot),
              moodboardId: moodboardInfo?.moodboardId,
              moodboardUrl: moodboardInfo?.moodboardUrl,
              productReferenceUrls: productReferenceUrls.length > 0 ? productReferenceUrls : undefined,
              productIds: productIdsToUse,
              shotType: shot.id,
              liked: null,
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

  const updateImageLike = useCallback(async (imageId: string, liked: boolean | null): Promise<boolean> => {
    try {
      const { error } = await (supabase
        .from('generated_images' as any)
        .update({ liked })
        .eq('id', imageId) as any);

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

  const generateFromPreferences = useCallback(async (
    state: CreativeStudioState,
    preferences: UserPreference[],
    logoUrl?: string,
    imagesPerCombo: number = 2
  ): Promise<GeneratedImage[]> => {
    setIsGeneratingImages(true);

    const allImages: GeneratedImage[] = [];
    const likedPrefs = preferences.filter(p => p.liked);

    for (const pref of likedPrefs) {
      const concept = state.concepts.find(c => c.id === pref.conceptId);
      if (!concept) continue;

      let moodboardUrl: string | undefined;
      if (pref.moodboardId && pref.moodboardId.length > 0) {
        const moodboardDbId = pref.moodboardId.startsWith('custom-')
          ? pref.moodboardId.replace('custom-', '')
          : pref.moodboardId;
        const { data: moodboard } = await (supabase
          .from('custom_moodboards' as any)
          .select('thumbnail_url')
          .eq('id', moodboardDbId)
          .maybeSingle() as any);
        moodboardUrl = moodboard?.thumbnail_url;
      }

      const shotType = sampleContextReferences.find(s => s.id === pref.shotType);

      const isCompositionShot = pref.shotType === 'shot-composition';
      const maxProducts = isCompositionShot ? 3 : 1;

      const productIdsToUse = (pref.productIds || []).slice(0, maxProducts);

      const productReferenceUrls: string[] = [];
      for (const productId of productIdsToUse) {
        const { data: scrapedRow } = await (supabase
          .from('scraped_products' as any)
          .select('full_url, thumbnail_url')
          .eq('id', productId)
          .maybeSingle() as any);
        if (scrapedRow) {
          const url = scrapedRow.full_url || scrapedRow.thumbnail_url;
          if (url) productReferenceUrls.push(url);
        }
      }

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
            resolution: '1024',
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
            productIds: productIdsToUse,
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

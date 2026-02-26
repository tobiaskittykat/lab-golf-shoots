import { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, Check, RefreshCw, Save, Clock, Loader2, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';
import { useShoeComponents, useComponentOverrides } from '@/hooks/useShoeComponents';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { ProductPickerModal } from './ProductPickerModal';
import { SmartUploadModal } from './SmartUploadModal';
import { CreateSKUModal } from './CreateSKUModal';
import { ShoeComponentsPanel } from './ShoeComponentsPanel';
import { ProductShootState } from './types';
import { ProductSKU } from './ProductSKUPicker';
import { parseSkuDisplayInfo, formatSkuAttributes } from '@/lib/skuDisplayUtils';
import type { ProductFocusAngle } from './shotTypeConfigs';
import { ImageDetailModal } from '../ImageDetailModal';
import type { GeneratedImage } from '../types';

// Angles to generate for setup product
const SETUP_ANGLES: { id: ProductFocusAngle; label: string; description: string }[] = [
  { id: 'hero', label: 'Hero (3/4 Front)', description: 'Classic hero shot at 45° angle' },
  { id: 'side-profile', label: 'Side Profile', description: 'Pure lateral silhouette' },
  { id: 'top-down', label: 'Top Down', description: 'Overhead view showing footbed' },
  { id: 'sole-view', label: 'Sole View', description: 'Outsole tread pattern' },
];

interface AngleResult {
  angleId: ProductFocusAngle;
  imageUrl: string | null;
  isGenerating: boolean;
  approved: boolean;
  error?: string;
  generatedImage?: GeneratedImage;
}

interface SetupProductStep2Props {
  state: ProductShootState;
  onStateChange: (updates: Partial<ProductShootState>) => void;
}

export function SetupProductStep2({ state, onStateChange }: SetupProductStep2Props) {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const { toast } = useToast();
  const { generateImages } = useImageGeneration();

  const [showProductPickerModal, setShowProductPickerModal] = useState(false);
  const [showSmartUploadModal, setShowSmartUploadModal] = useState(false);
  const [showCreateSKUModal, setShowCreateSKUModal] = useState(false);
  const [selectedSku, setSelectedSku] = useState<ProductSKU | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Angle selection & results
  const [selectedAngles, setSelectedAngles] = useState<Set<ProductFocusAngle>>(
    new Set(SETUP_ANGLES.map(a => a.id))
  );
  const [angleResults, setAngleResults] = useState<AngleResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [detailImage, setDetailImage] = useState<GeneratedImage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Shoe components
  const {
    components,
    isLoading: isLoadingComponents,
    isAnalyzing,
    triggerAnalysis,
    error: componentsError,
  } = useShoeComponents({ skuId: state.selectedProductId });

  const {
    overrides,
    setComponentOverride,
    resetOverrides,
    hasOverrides,
  } = useComponentOverrides(components);

  // Sync overrides
  useEffect(() => {
    onStateChange({ componentOverrides: hasOverrides ? overrides : undefined });
  }, [overrides, hasOverrides]);

  // Fetch recent SKUs
  const { data: recentSkus = [] } = useQuery({
    queryKey: ['recent-skus-setup', user?.id, currentBrand?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = supabase
        .from('product_skus')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(6);
      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }
      const { data: skus } = await query;
      if (!skus) return [];
      const withImages = await Promise.all(
        skus.map(async (sku) => {
          if (sku.composite_image_url) return { ...sku, display_image_url: sku.composite_image_url };
          const { data: angles } = await supabase
            .from('scraped_products')
            .select('thumbnail_url')
            .eq('sku_id', sku.id)
            .limit(1);
          return { ...sku, display_image_url: angles?.[0]?.thumbnail_url || null };
        })
      );
      return withImages;
    },
    enabled: !!user?.id,
  });

  // Fetch selected SKU
  const { data: fetchedSku } = useQuery({
    queryKey: ['selected-sku-setup', state.selectedProductId],
    queryFn: async () => {
      if (!state.selectedProductId || !user?.id) return null;
      const { data: sku } = await supabase
        .from('product_skus')
        .select('*')
        .eq('id', state.selectedProductId)
        .maybeSingle();
      if (!sku) return null;
      const { data: angles } = await supabase
        .from('scraped_products')
        .select('id, thumbnail_url, angle')
        .eq('sku_id', sku.id);
      return {
        id: sku.id, name: sku.name, sku_code: sku.sku_code,
        composite_image_url: sku.composite_image_url, brand_id: sku.brand_id,
        last_used_at: sku.last_used_at,
        angles: (angles || []).map(a => ({ id: a.id, thumbnail_url: a.thumbnail_url, angle: a.angle })),
      } as ProductSKU;
    },
    enabled: !!state.selectedProductId && !selectedSku && !!user?.id,
  });

  useEffect(() => {
    if (fetchedSku && !selectedSku) setSelectedSku(fetchedSku);
  }, [fetchedSku, selectedSku]);

  useEffect(() => {
    if (!hasAutoSelected && recentSkus.length > 0 && !state.selectedProductId) {
      const first = recentSkus[0];
      handleSkuSelect({
        id: first.id, name: first.name, sku_code: first.sku_code,
        composite_image_url: first.composite_image_url, brand_id: first.brand_id,
        last_used_at: first.last_used_at, angles: [],
      });
      setHasAutoSelected(true);
    }
  }, [recentSkus, state.selectedProductId, hasAutoSelected]);

  const handleSkuSelect = (sku: ProductSKU) => {
    setSelectedSku(sku);
    onStateChange({ selectedProductId: sku.id });
    setAngleResults([]); // Reset results when changing product
  };

  const toggleAngle = (angle: ProductFocusAngle) => {
    setSelectedAngles(prev => {
      const next = new Set(prev);
      if (next.has(angle)) next.delete(angle);
      else next.add(angle);
      return next;
    });
  };

  const isAnyGenerating = angleResults.some(r => r.isGenerating);

  // Generate images for selected angles
  const handleGenerate = useCallback(async () => {
    if (!state.selectedProductId || selectedAngles.size === 0) return;

    const anglesToGen = SETUP_ANGLES.filter(a => selectedAngles.has(a.id));
    
    // Initialize results
    const initial: AngleResult[] = anglesToGen.map(a => ({
      angleId: a.id,
      imageUrl: null,
      isGenerating: true,
      approved: false,
    }));
    setAngleResults(initial);

    // Generate each angle sequentially
    for (const angle of anglesToGen) {
      try {
        const setupState = {
          prompt: '',
          useCase: 'product' as const,
          step: 2,
          imageCount: 1,
          resolution: '1024x1024',
          aspectRatio: '1:1',
          sequentialGeneration: false,
          productShoot: {
            ...state,
            shootMode: 'new' as const,
            productShotType: 'product-focus' as const,
            settingType: 'studio' as const,
            backgroundId: 'studio-white',
            productFocusConfig: {
              cameraAngle: angle.id,
              lighting: 'auto' as const,
            },
            attachReferenceImages: true,
          },
          // Required fields for generateImages
          selectedConcept: null,
          moodboard: null,
          productReferences: [],
          contextReference: null,
          concepts: [],
          generatedImages: [],
          isLoadingConcepts: false,
          isGenerating: false,
          savedConcepts: [],
          artisticStyle: null,
          lightingStyle: 'auto',
          cameraAngle: 'auto',
          extraKeywords: [],
          editMode: 'generate' as const,
          editDescription: '',
          baseImage: null,
          displayedMoodboardIds: [],
          displayedProductIds: [],
          curatedMoodboards: [],
          curatedProducts: [],
          discoveryMode: false,
          discoveryImages: [],
          userPreferences: [],
          isDiscoveryGenerating: false,
          targetPersona: null,
        };

        const images = await generateImages(setupState as any, undefined, currentBrand?.id);
        
        setAngleResults(prev => prev.map(r => 
          r.angleId === angle.id
            ? { ...r, imageUrl: images[0]?.imageUrl || null, generatedImage: images[0] || undefined, isGenerating: false, error: images[0]?.status === 'failed' ? 'Generation failed' : undefined }
            : r
        ));
      } catch (err) {
        setAngleResults(prev => prev.map(r => 
          r.angleId === angle.id
            ? { ...r, isGenerating: false, error: 'Generation failed' }
            : r
        ));
      }
    }
  }, [state, selectedAngles, generateImages, currentBrand?.id]);

  // Regenerate single angle
  const handleRegenerate = useCallback(async (angleId: ProductFocusAngle) => {
    setAngleResults(prev => prev.map(r =>
      r.angleId === angleId ? { ...r, isGenerating: true, error: undefined } : r
    ));

    try {
      const setupState = {
        prompt: '',
        useCase: 'product' as const,
        step: 2,
        imageCount: 1,
        resolution: '1024x1024',
        aspectRatio: '1:1',
        sequentialGeneration: false,
        productShoot: {
          ...state,
          shootMode: 'new' as const,
          productShotType: 'product-focus' as const,
          settingType: 'studio' as const,
          backgroundId: 'studio-white',
          productFocusConfig: {
            cameraAngle: angleId,
            lighting: 'auto' as const,
          },
          attachReferenceImages: true,
        },
        selectedConcept: null,
        moodboard: null,
        productReferences: [],
        contextReference: null,
        concepts: [],
        generatedImages: [],
        isLoadingConcepts: false,
        isGenerating: false,
        savedConcepts: [],
        artisticStyle: null,
        lightingStyle: 'auto',
        cameraAngle: 'auto',
        extraKeywords: [],
        editMode: 'generate' as const,
        editDescription: '',
        baseImage: null,
        displayedMoodboardIds: [],
        displayedProductIds: [],
        curatedMoodboards: [],
        curatedProducts: [],
        discoveryMode: false,
        discoveryImages: [],
        userPreferences: [],
        isDiscoveryGenerating: false,
        targetPersona: null,
      };

      const images = await generateImages(setupState as any, undefined, currentBrand?.id);
      
      setAngleResults(prev => prev.map(r =>
        r.angleId === angleId
          ? { ...r, imageUrl: images[0]?.imageUrl || null, generatedImage: images[0] || undefined, isGenerating: false }
          : r
      ));
    } catch {
      setAngleResults(prev => prev.map(r =>
        r.angleId === angleId ? { ...r, isGenerating: false, error: 'Regeneration failed' } : r
      ));
    }
  }, [state, generateImages, currentBrand?.id]);

  // Save as new product
  const handleSave = useCallback(async () => {
    if (!user?.id || !selectedSku) return;
    
    const approvedResults = angleResults.filter(r => r.approved && r.imageUrl);
    if (approvedResults.length === 0) {
      toast({ title: 'No images approved', description: 'Approve at least one image to save', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      // Build name from base shoe + overrides
      const overrideSummary = hasOverrides
        ? Object.values(overrides).filter(o => o).map(o => `${o!.color} ${o!.material}`).join(', ')
        : 'Variant';
      const newName = `${selectedSku.name} – ${overrideSummary}`;

      // Merge components
      const baseComponents = (selectedSku as any).components || components || {};
      const mergedComponents = { ...baseComponents };
      if (hasOverrides) {
        for (const [key, override] of Object.entries(overrides)) {
          if (override) {
            mergedComponents[key] = {
              ...mergedComponents[key],
              material: override.material,
              color: override.color,
              colorHex: override.colorHex,
            };
          }
        }
      }

      // Create new SKU
      const { data: newSku, error: skuError } = await supabase
        .from('product_skus')
        .insert({
          user_id: user.id,
          brand_id: currentBrand?.id || selectedSku.brand_id || null,
          name: newName,
          components: mergedComponents,
          category: 'product',
        })
        .select()
        .single();

      if (skuError || !newSku) throw skuError || new Error('Failed to create SKU');

      // Upload images & create scraped_products
      for (const result of approvedResults) {
        const angleLabel = SETUP_ANGLES.find(a => a.id === result.angleId)?.label || result.angleId;

        // Download image and upload to product-images bucket
        const response = await fetch(result.imageUrl!);
        const blob = await response.blob();
        const path = `${user.id}/${newSku.id}/${result.angleId}.jpg`;
        
        await supabase.storage
          .from('product-images')
          .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '3600' });
        
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        const publicUrl = urlData.publicUrl;

        await supabase.from('scraped_products').insert({
          user_id: user.id,
          brand_id: currentBrand?.id || selectedSku.brand_id || null,
          sku_id: newSku.id,
          external_id: `setup-${newSku.id}-${result.angleId}`,
          name: `${newName} - ${angleLabel}`,
          thumbnail_url: publicUrl,
          full_url: publicUrl,
          storage_path: path,
          angle: result.angleId,
          category: 'product',
        });
      }

      // Trigger composite image generation
      try {
        await supabase.functions.invoke('composite-product-images', {
          body: { skuId: newSku.id },
        });
      } catch {
        console.warn('Composite generation skipped');
      }

      toast({ title: 'Product saved!', description: `${newName} added to your product library` });
      
      // Reset state
      setAngleResults([]);

    } catch (err) {
      console.error('Save failed:', err);
      toast({ title: 'Save failed', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, selectedSku, angleResults, overrides, hasOverrides, components, currentBrand?.id, toast]);

  const approvedCount = angleResults.filter(r => r.approved).length;
  const completedCount = angleResults.filter(r => r.imageUrl && !r.isGenerating).length;

  return (
    <div className="space-y-6 mt-8">
      {/* Product Picker */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-accent" />
            </div>
            <span className="font-medium text-foreground">Base Product</span>
            {selectedSku && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                {selectedSku.name}
              </span>
            )}
          </div>

          {recentSkus.length > 0 && (
            <div className="space-y-2 mb-3">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Your Products
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {recentSkus.map(sku => {
                  const isSelected = state.selectedProductId === sku.id;
                  const imageUrl = (sku as any).display_image_url || sku.composite_image_url;
                  return (
                    <button
                      key={sku.id}
                      onClick={() => handleSkuSelect({
                        id: sku.id, name: sku.name, sku_code: sku.sku_code,
                        composite_image_url: sku.composite_image_url, brand_id: sku.brand_id,
                        last_used_at: sku.last_used_at, angles: [],
                      })}
                      className={cn(
                        'relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
                        isSelected
                          ? 'border-accent ring-2 ring-accent/30'
                          : 'border-transparent hover:border-muted-foreground/30'
                      )}
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt={sku.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <Check className="w-3 h-3 text-accent-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowProductPickerModal(true)}>
            Browse More Products
          </Button>
        </div>
      </div>

      {/* Shoe Components */}
      {state.selectedProductId && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden p-4">
          <ShoeComponentsPanel
            components={components}
            overrides={overrides}
            onOverrideChange={setComponentOverride}
            onResetAll={resetOverrides}
            attachReferenceImages={true}
            onAttachReferenceImagesChange={() => {}}
            isLoading={isLoadingComponents}
            isAnalyzing={isAnalyzing}
            onTriggerAnalysis={triggerAnalysis}
            error={componentsError}
          />
        </div>
      )}

      {/* Angle Selection */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden p-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-medium text-foreground">Angles to Generate</span>
          <span className="text-xs text-muted-foreground">{selectedAngles.size} of {SETUP_ANGLES.length}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SETUP_ANGLES.map(angle => (
            <label
              key={angle.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                selectedAngles.has(angle.id)
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-muted-foreground/40'
              )}
            >
              <Checkbox
                checked={selectedAngles.has(angle.id)}
                onCheckedChange={() => toggleAngle(angle.id)}
              />
              <div>
                <p className="text-sm font-medium">{angle.label}</p>
                <p className="text-xs text-muted-foreground">{angle.description}</p>
              </div>
            </label>
          ))}
        </div>

        <Button
          className="w-full mt-4"
          onClick={handleGenerate}
          disabled={!state.selectedProductId || selectedAngles.size === 0 || isAnyGenerating}
        >
          {isAnyGenerating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
          ) : (
            `Generate ${selectedAngles.size} Product Images`
          )}
        </Button>
      </div>

      {/* Results Grid */}
      {angleResults.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-foreground">Results</span>
            <span className="text-xs text-muted-foreground">{approvedCount} approved / {completedCount} completed</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {angleResults.map(result => {
              const angleInfo = SETUP_ANGLES.find(a => a.id === result.angleId);
              return (
                <div key={result.angleId} className="space-y-2">
                  <div className={cn(
                    'relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
                    result.approved ? 'border-accent' : 'border-border'
                  )}>
                    {result.isGenerating ? (
                      <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-accent" />
                        <p className="text-xs text-muted-foreground">Generating...</p>
                      </div>
                    ) : result.imageUrl ? (
                      <div 
                        className="w-full h-full cursor-pointer group/img"
                        onClick={() => {
                          if (result.generatedImage) {
                            setDetailImage(result.generatedImage);
                            setIsDetailOpen(true);
                          }
                        }}
                      >
                        <img src={result.imageUrl} alt={angleInfo?.label} className="w-full h-full object-cover" />
                        {result.generatedImage && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <Expand className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <p className="text-xs text-destructive">{result.error || 'Failed'}</p>
                      </div>
                    )}
                    
                    {result.approved && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                        <Check className="w-4 h-4 text-accent-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">{angleInfo?.label}</p>
                    <div className="flex gap-1">
                      {result.imageUrl && !result.isGenerating && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleRegenerate(result.angleId)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Redo
                          </Button>
                          <Button
                            variant={result.approved ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setAngleResults(prev => prev.map(r =>
                              r.angleId === result.angleId ? { ...r, approved: !r.approved } : r
                            ))}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            {result.approved ? 'Approved' : 'Approve'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          {completedCount > 0 && (
            <Button
              className="w-full mt-4"
              onClick={handleSave}
              disabled={approvedCount === 0 || isSaving}
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save as New Product ({approvedCount} images)</>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <ProductPickerModal
        open={showProductPickerModal}
        onOpenChange={setShowProductPickerModal}
        selectedSkuId={selectedSku?.id || null}
        onSelectSku={(sku) => { handleSkuSelect(sku); setShowProductPickerModal(false); }}
        onCreateNew={() => setShowCreateSKUModal(true)}
        onSmartUpload={() => setShowSmartUploadModal(true)}
      />
      <SmartUploadModal open={showSmartUploadModal} onOpenChange={setShowSmartUploadModal} />
      <CreateSKUModal
        open={showCreateSKUModal}
        onClose={() => setShowCreateSKUModal(false)}
        onCreated={() => {}}
      />
      <ImageDetailModal
        image={detailImage}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onVariation={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}

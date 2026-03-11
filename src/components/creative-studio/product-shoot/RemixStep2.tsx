import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, ChevronRight, Upload, Package, Settings2, Clock, Check, X, ImageIcon, Trash2, Expand, FolderOpen, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ProductSKU } from "./ProductSKUPicker";
import { ProductPickerModal } from "./ProductPickerModal";
import { SmartUploadModal } from "./SmartUploadModal";
import { CreateSKUModal } from "./CreateSKUModal";
import { EditSKUModal } from "./EditSKUModal";
import { ShoeComponentsPanel } from "./ShoeComponentsPanel";
import { PutterVariantSelector } from "./PutterVariantSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import { useShoeComponents, useComponentOverrides } from "@/hooks/useShoeComponents";
import { useQuery } from "@tanstack/react-query";
import { parseSkuDisplayInfo, formatSkuAttributes } from "@/lib/skuDisplayUtils";
import { ProductShootState, initialProductShootState } from "./types";
import { aspectRatios, resolutions } from "../types";
import { AdGalleryModal } from "./AdGalleryModal";
import { useAdCreatives } from "@/hooks/useAdCreatives";
import { df3iColors, df3iAlignmentMarks, df3iReferenceImages } from "@/lib/labGolfVariants";
import { Textarea } from "@/components/ui/textarea";

interface RemixStep2Props {
  state: ProductShootState;
  onStateChange: (updates: Partial<ProductShootState>) => void;
  imageCount: number;
  resolution: string;
  aspectRatio: string;
  onOutputSettingsChange: (updates: {
    imageCount?: number;
    resolution?: string;
    aspectRatio?: string;
  }) => void;
}

const MAX_SOURCE_IMAGES = 10;

export const RemixStep2 = ({
  state,
  onStateChange,
  imageCount,
  resolution,
  aspectRatio,
  onOutputSettingsChange,
}: RemixStep2Props) => {
  const { user } = useAuth();
  const { currentBrand } = useBrands();

  // Defensive defaults for remix fields that may be undefined on older state objects
  const remixSourceImages = state.remixSourceImages ?? [];
  const remixRemoveText = state.remixRemoveText ?? false;

  const [openSections, setOpenSections] = useState({
    source: true,
    product: true,
    prompt: true,
    options: true,
    output: true,
  });

  const [showProductPickerModal, setShowProductPickerModal] = useState(false);
  const [showSmartUploadModal, setShowSmartUploadModal] = useState(false);
  const [showCreateSKUModal, setShowCreateSKUModal] = useState(false);
  const [showEditSKUModal, setShowEditSKUModal] = useState(false);
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<ProductSKU | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [displayedSkuIds, setDisplayedSkuIds] = useState<string[]>([]);
  const [skuCache, setSkuCache] = useState<Map<string, ProductSKU>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; name: string } | null>(null);
  const [showAdGallery, setShowAdGallery] = useState(false);
  const [autoSaveToGallery, setAutoSaveToGallery] = useState(true);
  const { saveCreative } = useAdCreatives();

  // Shoe component analysis hooks
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

  // Sync overrides to parent state
  useEffect(() => {
    onStateChange({ componentOverrides: hasOverrides ? overrides : undefined });
  }, [overrides, hasOverrides]);

  // Fetch top 3 SKUs for inline display
  const { data: recentSkus = [] } = useQuery({
    queryKey: ['recent-skus-inline', user?.id, currentBrand?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = supabase
        .from('product_skus')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(3);
      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }
      const { data: skus } = await query;
      if (!skus || skus.length === 0) return [];
      const skusWithImages = await Promise.all(
        skus.map(async (sku) => {
          if (sku.composite_image_url) {
            return { ...sku, display_image_url: sku.composite_image_url };
          }
          const { data: angles } = await supabase
            .from('scraped_products')
            .select('thumbnail_url')
            .eq('sku_id', sku.id)
            .limit(1);
          return { ...sku, display_image_url: angles?.[0]?.thumbnail_url || null };
        })
      );
      return skusWithImages;
    },
    enabled: !!user?.id,
  });

  // Fetch selected SKU if needed
  const { data: fetchedSku } = useQuery({
    queryKey: ['selected-sku', state.selectedProductId],
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
    if (displayedSkuIds.length === 0 && recentSkus.length > 0) {
      setDisplayedSkuIds(recentSkus.slice(0, 3).map(s => s.id));
    }
  }, [recentSkus, displayedSkuIds.length]);

  useEffect(() => {
    if (!hasAutoSelected && recentSkus.length > 0 && !state.selectedProductId) {
      const mostRecent = recentSkus[0];
      handleSkuSelect({
        id: mostRecent.id, name: mostRecent.name, sku_code: mostRecent.sku_code,
        composite_image_url: mostRecent.composite_image_url, brand_id: mostRecent.brand_id,
        last_used_at: mostRecent.last_used_at, angles: [],
      }, false);
      setHasAutoSelected(true);
    }
  }, [recentSkus, state.selectedProductId, hasAutoSelected]);

  const displayedProducts = useMemo(() => {
    if (displayedSkuIds.length === 0) return recentSkus.slice(0, 3);
    return displayedSkuIds
      .map(id => {
        const fromRecent = recentSkus.find(s => s.id === id);
        if (fromRecent) return fromRecent;
        const fromCache = skuCache.get(id);
        if (fromCache) {
          return {
            id: fromCache.id, name: fromCache.name, sku_code: fromCache.sku_code,
            composite_image_url: fromCache.composite_image_url, brand_id: fromCache.brand_id,
            last_used_at: fromCache.last_used_at,
            display_image_url: fromCache.composite_image_url || fromCache.angles?.[0]?.thumbnail_url,
            description: null,
          };
        }
        return null;
      })
      .filter(Boolean) as typeof recentSkus;
  }, [displayedSkuIds, recentSkus, skuCache]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSkuSelect = (sku: ProductSKU, fromModal: boolean = false) => {
    setSelectedSku(sku);
    onStateChange({
      selectedProductId: sku.id,
      recoloredProductUrl: sku.composite_image_url || sku.angles[0]?.thumbnail_url,
      componentOverrides: state.componentOverrides,
    });
    if (fromModal) {
      setSkuCache(prev => { const next = new Map(prev); next.set(sku.id, sku); return next; });
      setDisplayedSkuIds(prev => [sku.id, ...prev.filter(id => id !== sku.id)].slice(0, 3));
    }
  };

  // === Source Image Upload ===
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    if (!user?.id) return;
    const fileArray = Array.from(files);
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    const validFiles = fileArray.filter(f => allowed.includes(f.type));
    
    if (validFiles.length === 0) return;
    
    const currentCount = remixSourceImages.length;
    const remaining = MAX_SOURCE_IMAGES - currentCount;
    const toUpload = validFiles.slice(0, remaining);
    
    if (toUpload.length === 0) return;
    
    setIsUploading(true);
    
    const uploadedUrls: string[] = [];
    for (const file of toUpload) {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${user.id}/remix-sources/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from('generated-images')
        .upload(path, file, { contentType: file.type });
      
      if (!error) {
        const { data: urlData } = supabase.storage
          .from('generated-images')
          .getPublicUrl(path);
        if (urlData?.publicUrl) uploadedUrls.push(urlData.publicUrl);
      }
    }
    
    if (uploadedUrls.length > 0) {
      onStateChange({
        remixSourceImages: [...remixSourceImages, ...uploadedUrls],
      });
      // Auto-save to ad gallery
      if (autoSaveToGallery) {
        for (const url of uploadedUrls) {
          saveCreative(url);
        }
      }
    }
    
    setIsUploading(false);
  }, [user?.id, remixSourceImages, onStateChange]);

  const handleRemoveSource = (index: number) => {
    onStateChange({
      remixSourceImages: remixSourceImages.filter((_, i) => i !== index),
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Auto-generate the remix prompt based on current variant selections
  const autoGeneratedPrompt = useMemo(() => {
    const variantColorId = state.selectedVariantColor;
    const variantMarkId = state.selectedVariantMark;
    const selectedColor = variantColorId ? df3iColors.find(c => c.id === variantColorId) : null;
    const selectedMark = variantMarkId ? df3iAlignmentMarks.find(m => m.id === variantMarkId) : null;

    if (selectedColor || selectedMark) {
      const parts = ['Replace the golf putter/club in this image with the L.A.B. Golf DF3i putter'];
      if (selectedColor) parts.push(`in ${selectedColor.name} color (${selectedColor.promptDescription})`);
      if (selectedMark) parts.push(`with ${selectedMark.promptDescription}`);
      parts.push('Keep exact composition, lighting, and background unchanged.');
      return parts.join(' ');
    }
    return 'Remix: swap the golf club/putter with the selected product';
  }, [state.selectedVariantColor, state.selectedVariantMark]);

  // Collect all reference image URLs that will be attached
  const attachedReferenceUrls = useMemo(() => {
    const refs: { url: string; label: string }[] = [];
    for (let i = 0; i < df3iReferenceImages.length; i++) {
      refs.push({ url: df3iReferenceImages[i], label: `DF3i ref ${i + 1}` });
    }
    const markId = state.selectedVariantMark;
    if (markId) {
      const mark = df3iAlignmentMarks.find(m => m.id === markId);
      if (mark) refs.push({ url: mark.thumbnail, label: mark.name });
    }
    return refs;
  }, [state.selectedVariantMark]);

  // Sync auto-generated prompt when selections change (only if user hasn't customised)
  useEffect(() => {
    if (!state.remixCustomPrompt) return; // user hasn't touched it yet or it matches auto
    // If user prompt matches the previous auto-generated, update it
  }, [autoGeneratedPrompt]);

    icon: Icon,
    title,
    section,
    badge,
  }: {
    icon: typeof Upload;
    title: string;
    section: keyof typeof openSections;
    badge?: string;
  }) => (
    <CollapsibleTrigger
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-4 hover:bg-muted/50 rounded-xl transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        <span className="font-medium text-foreground">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      {openSections[section] ? (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </CollapsibleTrigger>
  );

  return (
    <div className="space-y-4 mt-8">
      {/* Section 1: Source Images */}
      <Collapsible open={openSections.source}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={Upload}
            title="Source Images"
            section="source"
            badge={remixSourceImages.length > 0 ? `${remixSourceImages.length} uploaded` : undefined}
          />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {/* Upload area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                  isDragging
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-muted-foreground/40",
                  remixSourceImages.length >= MAX_SOURCE_IMAGES && "opacity-50 pointer-events-none"
                )}
                onClick={() => {
                  if (remixSourceImages.length >= MAX_SOURCE_IMAGES) return;
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/png,image/jpeg,image/webp';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) handleFileUpload(files);
                  };
                  input.click();
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className={cn("w-8 h-8", isUploading ? "animate-pulse text-accent" : "text-muted-foreground")} />
                  <p className="text-sm font-medium text-foreground">
                    {isUploading ? 'Uploading...' : 'Drop ad creatives here or click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPEG, WebP · Max {MAX_SOURCE_IMAGES} images
                  </p>
                </div>
              </div>

              {/* Ad Gallery button + auto-save toggle */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdGallery(true)}
                  className="gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Browse Ad Gallery
                </Button>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={autoSaveToGallery}
                    onCheckedChange={(v) => setAutoSaveToGallery(v === true)}
                  />
                  <span className="text-xs text-muted-foreground">Auto-save uploads</span>
                </label>
              </div>

              {/* Uploaded thumbnails */}
              {remixSourceImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {remixSourceImages.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={url} alt={`Source ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveSource(idx); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFullscreenImage({ url, name: `Source ${idx + 1}` }); }}
                        className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Expand className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Section 2: Product Selection (reuses same pattern as ProductShootStep2) */}
      <Collapsible open={openSections.product}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={Package}
            title="Swap Product"
            section="product"
            badge={selectedSku?.name}
          />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              {displayedProducts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Your Products
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {displayedProducts.map(sku => {
                      const isSelected = state.selectedProductId === sku.id;
                      const imageUrl = (sku as any).display_image_url || sku.composite_image_url;
                      const displayInfo = parseSkuDisplayInfo(sku.name, sku.description as any);
                      return (
                        <HoverCard key={sku.id} openDelay={300} closeDelay={100}>
                          <HoverCardTrigger asChild>
                            <button
                              onClick={() => handleSkuSelect({
                                id: sku.id, name: sku.name, sku_code: sku.sku_code,
                                composite_image_url: sku.composite_image_url, brand_id: sku.brand_id,
                                last_used_at: sku.last_used_at, angles: [],
                              }, false)}
                              className={cn(
                                "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                                isSelected
                                  ? "border-accent ring-2 ring-accent/30"
                                  : "border-transparent hover:border-muted-foreground/30"
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
                          </HoverCardTrigger>
                          <HoverCardContent side="top" className="w-48 p-2">
                            <p className="text-xs font-medium">{displayInfo.modelName || sku.name}</p>
                            {formatSkuAttributes(displayInfo) && (
                              <p className="text-[10px] text-muted-foreground">{formatSkuAttributes(displayInfo)}</p>
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowProductPickerModal(true)}
              >
                Browse More Products
              </Button>

              {/* SKU Variant Selector (DF3i colors + alignment marks) */}
              {state.selectedProductId && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">SKU Variant</span>
                  <PutterVariantSelector
                    selectedColor={state.selectedVariantColor}
                    selectedAlignmentMark={state.selectedVariantMark}
                    onColorChange={(colorId) => onStateChange({ selectedVariantColor: colorId })}
                    onAlignmentMarkChange={(markId) => onStateChange({ selectedVariantMark: markId })}
                  />
                </div>
              )}

              {/* Shoe Component Overrides */}
              {state.selectedProductId && (
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
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Section 3: Remix Options */}
      <Collapsible open={openSections.options}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={Settings2}
            title="Remix Options"
            section="options"
          />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Remove text / ad copy</label>
                  <p className="text-xs text-muted-foreground">
                    AI will inpaint and remove any overlaid text
                  </p>
                </div>
                <Switch
                  checked={remixRemoveText}
                  onCheckedChange={(v) => onStateChange({ remixRemoveText: v })}
                />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Section 3.5: Prompt Preview */}
      <Collapsible open={openSections.prompt}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={FileText}
            title="Prompt & References"
            section="prompt"
          />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Prompt (editable)</label>
                <Textarea
                  value={state.remixCustomPrompt ?? autoGeneratedPrompt}
                  onChange={(e) => onStateChange({ remixCustomPrompt: e.target.value })}
                  placeholder={autoGeneratedPrompt}
                  className="min-h-[80px] text-sm bg-muted/50 border-0 resize-y"
                />
                {state.remixCustomPrompt && state.remixCustomPrompt !== autoGeneratedPrompt && (
                  <button
                    onClick={() => onStateChange({ remixCustomPrompt: undefined })}
                    className="text-[11px] text-accent hover:underline"
                  >
                    Reset to auto-generated
                  </button>
                )}
              </div>

              {/* Attached reference images */}
              {attachedReferenceUrls.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Reference images attached ({attachedReferenceUrls.length})
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {attachedReferenceUrls.map((ref, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-md overflow-hidden border border-border" title={ref.label}>
                        <img src={ref.url} alt={ref.label} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <Collapsible open={openSections.output}>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <SectionHeader
            icon={ImageIcon}
            title="Output"
            section="output"
          />
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Per Source</label>
                  <Select
                    value={String(imageCount)}
                    onValueChange={(v) => onOutputSettingsChange({ imageCount: Number(v) })}
                  >
                    <SelectTrigger className="bg-muted/50 border-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 4].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Resolution</label>
                  <Select
                    value={resolution}
                    onValueChange={(v) => onOutputSettingsChange({ resolution: v })}
                  >
                    <SelectTrigger className="bg-muted/50 border-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {resolutions.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Aspect Ratio</label>
                  <Select
                    value={aspectRatio}
                    onValueChange={(v) => onOutputSettingsChange({ aspectRatio: v })}
                  >
                    <SelectTrigger className="bg-muted/50 border-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map(ar => (
                        <SelectItem key={ar} value={ar}>{ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Total images info */}
              {remixSourceImages.length > 0 && (
                <p className="text-xs text-muted-foreground border-t border-border pt-3">
                  Total: {remixSourceImages.length} source{remixSourceImages.length > 1 ? 's' : ''} × {imageCount} = <strong>{remixSourceImages.length * imageCount} images</strong>
                </p>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Modals */}
      <AdGalleryModal
        open={showAdGallery}
        onOpenChange={setShowAdGallery}
        onSelect={(urls) => {
          onStateChange({
            remixSourceImages: [...remixSourceImages, ...urls].slice(0, MAX_SOURCE_IMAGES),
          });
        }}
      />
      <ProductPickerModal
        open={showProductPickerModal}
        onOpenChange={setShowProductPickerModal}
        selectedSkuId={selectedSku?.id || null}
        onSelectSku={(sku) => handleSkuSelect(sku, true)}
        onCreateNew={() => setShowCreateSKUModal(true)}
        onSmartUpload={() => setShowSmartUploadModal(true)}
      />
      <SmartUploadModal open={showSmartUploadModal} onOpenChange={setShowSmartUploadModal} />
      <CreateSKUModal
        open={showCreateSKUModal}
        onClose={() => setShowCreateSKUModal(false)}
        onCreated={() => {}}
      />
      {editingSkuId && (
        <EditSKUModal
          open={showEditSKUModal}
          onClose={() => { setShowEditSKUModal(false); setEditingSkuId(null); }}
          skuId={editingSkuId}
          onUpdated={() => { if (selectedSku?.id === editingSkuId) setSelectedSku(null); }}
          onDeleted={() => {
            if (selectedSku?.id === editingSkuId) {
              setSelectedSku(null);
              onStateChange({ selectedProductId: undefined, recoloredProductUrl: undefined });
            }
          }}
        />
      )}

      {/* Fullscreen Image Dialog */}
      <Dialog open={!!fullscreenImage} onOpenChange={(open) => !open && setFullscreenImage(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{fullscreenImage?.name}</DialogTitle>
            <DialogDescription>Full size image</DialogDescription>
          </DialogHeader>
          {fullscreenImage && (
            <img src={fullscreenImage.url} alt={fullscreenImage.name} className="w-full max-h-[70vh] object-contain bg-secondary" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

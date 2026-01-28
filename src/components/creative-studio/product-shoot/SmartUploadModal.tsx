import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, X, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { UploadProgressView } from './UploadProgressView';
import { GroupReviewCard } from './GroupReviewCard';
import { UngroupedSection } from './UngroupedSection';

interface SmartUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  url?: string;
  uploading?: boolean;
}

interface ProductGroup {
  id: string;
  suggestedName: string;
  suggestedSku: string;
  confidence: number;
  images: Array<{
    id: string;
    url: string;
    detectedAngle: string;
    angleConfidence: number;
  }>;
  productAnalysis: {
    summary: string;
    product_type: string;
    colors: string[];
    materials: string[];
    style_keywords: string[];
  };
}

interface UngroupedImage {
  id: string;
  url: string;
  reason: string;
}

type Step = 'upload' | 'analyzing' | 'review';

export function SmartUploadModal({ open, onOpenChange }: SmartUploadModalProps) {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>('upload');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [ungrouped, setUngrouped] = useState<UngroupedImage[]>([]);
  const [saving, setSaving] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const newImages: UploadedImage[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 20));
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const uploadImages = async (): Promise<{ id: string; url: string }[]> => {
    const uploaded: { id: string; url: string }[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const fileName = `${user?.id}/${Date.now()}-${img.file.name}`;
      
      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, img.file);

      if (error) {
        console.error('Upload error:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      uploaded.push({ id: img.id, url: urlData.publicUrl });
      setUploadProgress(Math.round(((i + 1) / images.length) * 100));
    }

    return uploaded;
  };

  const startAnalysis = async () => {
    if (images.length === 0) return;

    setStep('analyzing');
    setUploadProgress(0);
    setAnalysisProgress(0);

    try {
      // Step 1: Upload all images
      const uploadedImages = await uploadImages();
      
      if (uploadedImages.length === 0) {
        throw new Error('No images were uploaded successfully');
      }

      setAnalysisProgress(20);

      // Step 2: Call AI analysis
      const { data, error } = await supabase.functions.invoke('analyze-bulk-products', {
        body: { images: uploadedImages }
      });

      if (error) throw error;

      setAnalysisProgress(100);

      // Add unique IDs to groups
      const groupsWithIds = (data.groups || []).map((g: any) => ({
        ...g,
        id: crypto.randomUUID(),
      }));

      setGroups(groupsWithIds);
      setUngrouped(data.ungrouped || []);
      setStep('review');

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Could not analyze images',
        variant: 'destructive',
      });
      setStep('upload');
    }
  };

  const updateGroup = (groupId: string, updates: Partial<ProductGroup>) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ));
  };

  const moveToGroup = (imageId: string, fromGroupId: string | null, toGroupId: string) => {
    // Find the image
    let imageData: ProductGroup['images'][0] | undefined;
    
    if (fromGroupId) {
      const fromGroup = groups.find(g => g.id === fromGroupId);
      imageData = fromGroup?.images.find(i => i.id === imageId);
      if (imageData) {
        setGroups(prev => prev.map(g => 
          g.id === fromGroupId 
            ? { ...g, images: g.images.filter(i => i.id !== imageId) }
            : g
        ));
      }
    } else {
      const ungroupedImg = ungrouped.find(u => u.id === imageId);
      if (ungroupedImg) {
        imageData = {
          id: ungroupedImg.id,
          url: ungroupedImg.url,
          detectedAngle: 'unknown',
          angleConfidence: 50,
        };
        setUngrouped(prev => prev.filter(u => u.id !== imageId));
      }
    }

    if (imageData) {
      setGroups(prev => prev.map(g =>
        g.id === toGroupId
          ? { ...g, images: [...g.images, imageData!] }
          : g
      ));
    }
  };

  const createGroupFromUngrouped = (imageIds: string[]) => {
    const imagesToGroup = ungrouped.filter(u => imageIds.includes(u.id));
    if (imagesToGroup.length === 0) return;

    const newGroup: ProductGroup = {
      id: crypto.randomUUID(),
      suggestedName: 'New Product',
      suggestedSku: 'NEW-PRODUCT-001',
      confidence: 50,
      images: imagesToGroup.map(u => ({
        id: u.id,
        url: u.url,
        detectedAngle: 'unknown',
        angleConfidence: 50,
      })),
      productAnalysis: {
        summary: '',
        product_type: '',
        colors: [],
        materials: [],
        style_keywords: [],
      },
    };

    setGroups(prev => [...prev, newGroup]);
    setUngrouped(prev => prev.filter(u => !imageIds.includes(u.id)));
  };

  const saveAllSKUs = async () => {
    if (!user?.id) return;
    setSaving(true);

    try {
      for (const group of groups) {
        if (group.images.length === 0) continue;

        // Create SKU
        const { data: sku, error: skuError } = await supabase
          .from('product_skus')
          .insert({
            user_id: user.id,
            brand_id: currentBrand?.id || null,
            name: group.suggestedName,
            sku_code: group.suggestedSku,
            description: group.productAnalysis,
          })
          .select()
          .single();

        if (skuError) throw skuError;

        // Create product entries for each angle
        for (const img of group.images) {
          await supabase.from('scraped_products').insert({
            user_id: user.id,
            brand_id: currentBrand?.id || null,
            sku_id: sku.id,
            name: group.suggestedName,
            external_id: img.id,
            thumbnail_url: img.url,
            full_url: img.url,
            angle: img.detectedAngle,
            description: group.productAnalysis,
          });
        }

        // Generate composite image
        try {
          await supabase.functions.invoke('composite-product-images', {
            body: {
              skuId: sku.id,
              imageUrls: group.images.map(i => i.url),
              layout: group.images.length <= 4 ? '2x2' : '1x4',
            }
          });
        } catch (e) {
          console.warn('Composite generation failed:', e);
        }
      }

      toast({
        title: 'Products saved!',
        description: `Created ${groups.length} product SKU${groups.length !== 1 ? 's' : ''} with ${groups.reduce((sum, g) => sum + g.images.length, 0)} images`,
      });

      queryClient.invalidateQueries({ queryKey: ['product-skus'] });
      onOpenChange(false);
      resetState();

    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Could not save products',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetState = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setGroups([]);
    setUngrouped([]);
    setStep('upload');
    setUploadProgress(0);
    setAnalysisProgress(0);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Smart Product Upload
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('smart-upload-input')?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Drag & drop product photos here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse (max 20 images)
                </p>
                <input
                  id="smart-upload-input"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Image grid */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {images.length} image{images.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setImages([])}>
                      Clear all
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {images.map(img => (
                      <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                        <img
                          src={img.preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Start button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={startAnalysis}
                  disabled={images.length === 0}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Start AI Sorting
                </Button>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <UploadProgressView
              uploadProgress={uploadProgress}
              analysisProgress={analysisProgress}
              imageCount={images.length}
            />
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <span className="text-sm text-muted-foreground">
                  AI found {groups.length} product{groups.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Product groups */}
              <div className="space-y-4">
                {groups.map(group => (
                  <GroupReviewCard
                    key={group.id}
                    group={group}
                    allGroups={groups}
                    onUpdate={(updates) => updateGroup(group.id, updates)}
                    onMoveImage={(imageId, toGroupId) => moveToGroup(imageId, group.id, toGroupId)}
                  />
                ))}
              </div>

              {/* Ungrouped images */}
              {ungrouped.length > 0 && (
                <UngroupedSection
                  images={ungrouped}
                  groups={groups}
                  onCreateGroup={createGroupFromUngrouped}
                  onMoveToGroup={(imageId, groupId) => moveToGroup(imageId, null, groupId)}
                />
              )}

              {/* Save button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={saveAllSKUs}
                  disabled={saving || groups.length === 0}
                  className="gap-2"
                >
                  {saving ? 'Saving...' : `Save ${groups.length} Product${groups.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

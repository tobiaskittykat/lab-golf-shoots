import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useBrands } from "./useBrands";
import { useToast } from "./use-toast";
import { useAuditLog } from "./useAuditLog";

export interface BrandImage {
  id: string;
  brand_id: string;
  user_id: string;
  image_url: string;
  thumbnail_url: string | null;
  category: string;
  visual_analysis: any;
  created_at: string;
  updated_at: string;
}

export interface ColorPalette {
  description: string;
  foundation: string[];
  accents: string[];
  seasonalPops?: string[];
}

export interface ModelStyling {
  usesModels: boolean;
  demographics: string;
  expression: string;
  poseStyle: string;
  stylingAesthetic: string;
  hairAndMakeup: string;
  bodyLanguage: string;
}

export interface VisualDNA {
  colorPalette: ColorPalette;
  primaryColors?: string[];
  colorMood: string;
  photographyStyle: string;
  texturePreferences: string[];
  lightingStyle: string;
  compositionStyle: string;
  avoidElements: string[];
  modelStyling?: ModelStyling;
}

export interface BrandVoice {
  personality: string;
  toneDescriptors: string[];
  messagingStyle: string;
}

export interface BrandBrain {
  generatedAt: string;
  visualDNA: VisualDNA;
  brandVoice: BrandVoice;
  creativeDirectionSummary: string;
}

export function useBrandImages() {
  const { user } = useAuth();
  const { currentBrand, updateBrand, refetch: refetchBrands } = useBrands();
  const { toast } = useToast();
  const { log: auditLog } = useAuditLog();

  const [images, setImages] = useState<BrandImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const fetchImages = useCallback(async () => {
    if (!user || !currentBrand) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("brand_images" as any)
        .select("*")
        .eq("brand_id", currentBrand.id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages((data || []) as unknown as BrandImage[]);
    } catch (err) {
      console.error("Error fetching brand images:", err);
      toast({
        title: "Failed to load brand images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentBrand, toast]);

  const uploadImage = useCallback(async (file: File, category: string = "general") => {
    if (!user || !currentBrand) {
      toast({
        title: "No brand selected",
        description: "Please select a brand first",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || 'png';
      const fileName = `${user.id}/${currentBrand.id}/${Date.now()}.${fileExt}`;
      const isLogo = category === 'logo';

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("brand-assets")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: isLogo ? file.type : undefined,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(uploadData.path);

      const imageUrl = urlData.publicUrl;

      const { data: imageRecord, error: dbError } = await (supabase
        .from("brand_images" as any)
        .insert({
          brand_id: currentBrand.id,
          user_id: user.id,
          image_url: imageUrl,
          thumbnail_url: imageUrl,
          category,
        })
        .select()
        .single() as any);

      if (dbError) throw dbError;

      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.access_token) {
        supabase.functions.invoke("analyze-brand-images", {
          body: { brandId: currentBrand.id, imageId: imageRecord.id },
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }).catch(err => {
          console.error("Background image analysis failed:", err);
        });
      }

      setImages(prev => [imageRecord as BrandImage, ...prev]);
      toast({
        title: "Image uploaded",
        description: "The image is being analyzed in the background",
      });

      auditLog({
        action: 'upload_brand_image',
        resourceType: 'brand_images',
        resourceId: imageRecord.id,
        metadata: { category }
      });

      return imageRecord as BrandImage;
    } catch (err) {
      console.error("Error uploading image:", err);
      toast({
        title: "Failed to upload image",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user, currentBrand, toast, auditLog]);

  const deleteImage = useCallback(async (imageId: string) => {
    if (!user) return false;

    try {
      const { error } = await (supabase
        .from("brand_images" as any)
        .delete()
        .eq("id", imageId)
        .eq("user_id", user.id) as any);

      if (error) throw error;

      setImages(prev => prev.filter(img => img.id !== imageId));
      toast({ title: "Image deleted" });

      auditLog({
        action: 'delete_brand_image',
        resourceType: 'brand_images',
        resourceId: imageId
      });

      return true;
    } catch (err) {
      console.error("Error deleting image:", err);
      toast({
        title: "Failed to delete image",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, auditLog]);

  const regenerateBrandBrain = useCallback(async (): Promise<BrandBrain | null> => {
    if (!user || !currentBrand) {
      toast({ title: "No brand selected", variant: "destructive" });
      return null;
    }

    setIsRegenerating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("analyze-brand-images", {
        body: { brandId: currentBrand.id, regenerateBrain: true },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.processing) {
        toast({
          title: "Analyzing images...",
          description: data.message || `Processing ${data.imagesToAnalyze} images. This may take a few minutes.`,
        });

        const pollForCompletion = async () => {
          let attempts = 0;
          const maxAttempts = 60;

          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;

            await refetchBrands();

            const { data: updatedBrand } = await supabase
              .from('brands')
              .select('brand_context')
              .eq('id', currentBrand.id)
              .single();

            const updatedBrain = (updatedBrand?.brand_context as any)?.brandBrain;
            if (updatedBrain?.generatedAt) {
              const generatedTime = new Date(updatedBrain.generatedAt).getTime();
              const now = Date.now();
              if (now - generatedTime < 120000) {
                toast({
                  title: "Brand Brain updated!",
                  description: "Your brand's visual DNA has been regenerated.",
                });
                await refetchBrands();
                return;
              }
            }
          }

          toast({
            title: "Still processing",
            description: "Brand Brain regeneration is taking longer than expected. Please check back later.",
          });
        };

        pollForCompletion();
        return null;
      }

      if (data?.brandBrain) {
        await refetchBrands();
        toast({
          title: "Brand Brain generated",
          description: "Your brand's visual DNA has been updated",
        });
        return data.brandBrain as BrandBrain;
      }

      return null;
    } catch (err) {
      console.error("Error regenerating Brand Brain:", err);
      toast({
        title: "Failed to generate Brand Brain",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRegenerating(false);
    }
  }, [user, currentBrand, refetchBrands, toast]);

  const getBrandBrain = useCallback((): BrandBrain | null => {
    if (!currentBrand?.brand_context) return null;
    return (currentBrand.brand_context as any)?.brandBrain || null;
  }, [currentBrand]);

  const updateBrandBrain = useCallback(async (updates: Partial<BrandBrain>) => {
    if (!currentBrand) return false;

    try {
      const existingContext = currentBrand.brand_context || {};
      const existingBrain = (existingContext as any).brandBrain || {};

      const newBrain = {
        ...existingBrain,
        ...updates,
        generatedAt: new Date().toISOString(),
      };

      const newContext = {
        ...existingContext,
        brandBrain: newBrain,
      };

      const { error } = await updateBrand(currentBrand.id, {
        brand_context: newContext,
      });

      if (error) throw error;

      toast({ title: "Brand Brain updated" });
      return true;
    } catch (err) {
      console.error("Error updating Brand Brain:", err);
      toast({
        title: "Failed to update Brand Brain",
        variant: "destructive",
      });
      return false;
    }
  }, [currentBrand, updateBrand, toast]);

  const scrapeFromWebsite = useCallback(async (url?: string) => {
    if (!user || !currentBrand) {
      toast({ title: "No brand selected", variant: "destructive" });
      return null;
    }

    const targetUrl = url || currentBrand.website;
    if (!targetUrl) {
      toast({
        title: "No website configured",
        description: "Please add a website URL to your brand settings first",
        variant: "destructive",
      });
      return null;
    }

    setIsScraping(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("scrape-brand-images", {
        body: { brandId: currentBrand.id, url: targetUrl },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: `Scraped ${data.imagesAdded} images`,
        description: "Images are being analyzed in the background",
      });

      await fetchImages();
      return data;
    } catch (err) {
      console.error("Error scraping brand images:", err);
      toast({
        title: "Failed to scrape images",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsScraping(false);
    }
  }, [user, currentBrand, fetchImages, toast]);

  const getPrimaryLogoId = useCallback((): string | null => {
    if (!currentBrand?.brand_context) return null;
    return (currentBrand.brand_context as any)?.primary_logo_id || null;
  }, [currentBrand]);

  const setPrimaryLogo = useCallback(async (imageId: string) => {
    if (!currentBrand) return false;

    try {
      const existingContext = currentBrand.brand_context || {};
      const newContext = {
        ...existingContext,
        primary_logo_id: imageId,
      };

      const { error } = await updateBrand(currentBrand.id, {
        brand_context: newContext,
      });

      if (error) throw error;

      toast({ title: "Primary logo updated" });
      return true;
    } catch (err) {
      console.error("Error setting primary logo:", err);
      toast({
        title: "Failed to set primary logo",
        variant: "destructive",
      });
      return false;
    }
  }, [currentBrand, updateBrand, toast]);

  const getBrandLogo = useCallback((): BrandImage | null => {
    const logoImages = images.filter(img => img.category === 'logo');
    if (logoImages.length === 0) return null;

    const primaryId = (currentBrand?.brand_context as any)?.primary_logo_id;
    if (primaryId) {
      const primary = logoImages.find(img => img.id === primaryId);
      if (primary) return primary;
    }

    return logoImages[0];
  }, [images, currentBrand]);

  return {
    images,
    isLoading,
    isUploading,
    isRegenerating,
    isScraping,
    fetchImages,
    uploadImage,
    deleteImage,
    regenerateBrandBrain,
    getBrandBrain,
    updateBrandBrain,
    scrapeFromWebsite,
    getBrandLogo,
    getPrimaryLogoId,
    setPrimaryLogo,
  };
}

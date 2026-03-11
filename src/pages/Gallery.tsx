import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';
import { useToast } from '@/hooks/use-toast';
import { GeneratedImageCard, GeneratedImageCardSkeleton } from '@/components/creative-studio/GeneratedImageCard';
import { ImageDetailModal } from '@/components/creative-studio/ImageDetailModal';
import { GeneratedImage } from '@/components/creative-studio/types';
import { Button } from '@/components/ui/button';
import BrandSelector from '@/components/BrandSelector';
import kittykatLogo from '@/assets/kittykat-logo-transparent.png';

const PAGE_SIZE = 50;

const Gallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const { toast } = useToast();
  
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchTotalCount = useCallback(async () => {
    if (!user) return;
    let query = (supabase
      .from('generated_images' as any)
      .select('*', { count: 'exact', head: true }) as any)
      .eq('user_id', user.id);
    if (currentBrand?.id) {
      query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
    }
    const { count, error } = await query;
    if (!error && count !== null) setTotalCount(count);
  }, [user, currentBrand?.id]);

  const fetchImages = useCallback(async (pageNum: number, append = false) => {
    if (!user) return;
    const start = pageNum * PAGE_SIZE;
    const end = start + PAGE_SIZE - 1;
    let query = (supabase
      .from('generated_images' as any)
      .select('*') as any)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(start, end);
    if (currentBrand?.id) {
      query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching images:', error);
      toast({ title: "Error loading images", description: error.message, variant: "destructive" });
      return;
    }
    const mappedImages: GeneratedImage[] = (data || []).map((img: any, index: number) => ({
      id: img.id,
      prompt: img.prompt,
      refinedPrompt: img.refined_prompt || undefined,
      imageUrl: img.image_url,
      productReferenceUrl: img.product_reference_url || undefined,
      moodboardId: img.moodboard_id || undefined,
      conceptId: img.concept_id || undefined,
      conceptTitle: img.concept_title || undefined,
      status: (img.status as 'pending' | 'completed' | 'failed') || 'completed',
      error: img.error_message || undefined,
      index: start + index,
      settings: img.settings as Record<string, unknown> || {}
    }));
    if (append) {
      setImages(prev => [...prev, ...mappedImages]);
    } else {
      setImages(mappedImages);
    }
    setHasMore(mappedImages.length === PAGE_SIZE);
  }, [user, currentBrand?.id, toast]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setPage(0);
      setImages([]);
      await Promise.all([fetchTotalCount(), fetchImages(0)]);
      setIsLoading(false);
    };
    init();
  }, [fetchTotalCount, fetchImages, currentBrand?.id]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    await fetchImages(nextPage, true);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsDetailModalOpen(true);
  };

  const handleVariation = (image: GeneratedImage) => {
    navigate('/', { state: { variationImage: image } });
  };

  const handleEdit = (image: GeneratedImage) => {
    navigate('/edit-image', { state: { imageToEdit: image } });
  };

  const handleDelete = async (image: GeneratedImage) => {
    const { error } = await (supabase.from('generated_images' as any).delete() as any).eq('id', image.id);
    if (error) {
      toast({ title: "Error deleting image", description: error.message, variant: "destructive" });
      return;
    }
    setImages(prev => prev.filter(img => img.id !== image.id));
    setTotalCount(prev => prev - 1);
    setIsDetailModalOpen(false);
    toast({ title: "Image deleted", description: "The image has been removed from your gallery." });
  };

  const loadedCount = images.length;
  const remainingCount = Math.max(0, totalCount - loadedCount);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <img src={kittykatLogo} alt="KittyKat" className="h-12" />
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Gallery</h1>
            <BrandSelector />
          </div>
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading...</span>
            ) : (
              <span>{totalCount.toLocaleString()} images</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <GeneratedImageCardSkeleton key={i} />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <span className="text-4xl">🖼️</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">No images yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start creating in the Visual Editor to build your gallery of generated images.
            </p>
            <Button onClick={() => navigate('/')}>Go to Visual Editor</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(image => (
                <GeneratedImageCard
                  key={image.id}
                  image={image}
                  onVariation={handleVariation}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSelect={handleImageClick}
                />
              ))}
            </div>
            {hasMore && (
              <div className="flex flex-col items-center gap-2 mt-8">
                <p className="text-sm text-muted-foreground">Showing {loadedCount} of {totalCount} images</p>
                <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore} className="gap-2">
                  {isLoadingMore ? (<><Loader2 className="w-4 h-4 animate-spin" />Loading...</>) : (<>Load More ({Math.min(PAGE_SIZE, remainingCount)} remaining)</>)}
                </Button>
              </div>
            )}
            {!hasMore && images.length > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-8">All {totalCount} images loaded</p>
            )}
          </>
        )}
      </main>

      <ImageDetailModal
        image={selectedImage}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onVariation={handleVariation}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Gallery;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Plus, Sparkles, Pencil, Trash2, ArrowLeft, Clock, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';
import { toast } from 'sonner';
import { parseSkuDisplayInfo, formatSkuSubtitle } from '@/lib/skuDisplayUtils';
import { EditSKUModal } from '@/components/creative-studio/product-shoot/EditSKUModal';
import { SmartUploadModal } from '@/components/creative-studio/product-shoot/SmartUploadModal';
import { CreateSKUModal } from '@/components/creative-studio/product-shoot/CreateSKUModal';

interface ProductAngle {
  id: string;
  thumbnail_url: string;
  angle: string | null;
}

interface ProductSKU {
  id: string;
  name: string;
  sku_code: string | null;
  composite_image_url: string | null;
  brand_id: string | null;
  last_used_at: string | null;
  category: string | null;
  description: any;
  components: any;
  created_at: string | null;
  angles: ProductAngle[];
}

export default function Products() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [smartUploadOpen, setSmartUploadOpen] = useState(false);
  const [createSkuOpen, setCreateSkuOpen] = useState(false);

  // Fetch all SKUs
  const { data: skus = [], isLoading } = useQuery({
    queryKey: ['products-page-skus', user?.id, currentBrand?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('product_skus')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }

      const { data: skuData, error: skuError } = await query;
      if (skuError) throw skuError;

      const skuIds = skuData?.map(s => s.id) || [];
      if (skuIds.length === 0) return [];

      const { data: products, error: prodError } = await supabase
        .from('scraped_products')
        .select('id, thumbnail_url, angle, sku_id')
        .in('sku_id', skuIds);

      if (prodError) throw prodError;

      return (skuData || []).map(sku => ({
        id: sku.id,
        name: sku.name,
        sku_code: sku.sku_code,
        composite_image_url: sku.composite_image_url,
        brand_id: sku.brand_id,
        last_used_at: sku.last_used_at,
        category: sku.category,
        description: sku.description,
        components: sku.components,
        created_at: sku.created_at,
        angles: (products || [])
          .filter(p => p.sku_id === sku.id)
          .map(p => ({ id: p.id, thumbnail_url: p.thumbnail_url, angle: p.angle })),
      })) as ProductSKU[];
    },
    enabled: !!user?.id,
  });

  // Filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return skus;
    const q = searchQuery.toLowerCase();
    return skus.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.sku_code?.toLowerCase().includes(q)
    );
  }, [skus, searchQuery]);

  const handleDelete = async (sku: ProductSKU) => {
    if (!user?.id) return;
    try {
      // Delete angles from storage
      for (const angle of sku.angles) {
        // We don't have storage_path here but the DB cascade or EditSKU handles it
      }
      await supabase.from('scraped_products').delete().eq('sku_id', sku.id);
      await supabase.from('product_skus').delete().eq('id', sku.id);
      queryClient.invalidateQueries({ queryKey: ['products-page-skus'] });
      queryClient.invalidateQueries({ queryKey: ['product-skus'] });
      toast.success(`Deleted "${sku.name}"`);
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Products
              </h1>
              <p className="text-sm text-muted-foreground">
                {skus.length} product{skus.length !== 1 ? 's' : ''} in your library
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="gap-2" onClick={() => setSmartUploadOpen(true)}>
              <Sparkles className="w-4 h-4" />
              Smart Upload
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setCreateSkuOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Search */}
        {skus.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 max-w-md"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : skus.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h2 className="text-lg font-medium mb-2">No products yet</h2>
            <p className="text-muted-foreground mb-6">Upload product images to start generating AI product shots.</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setSmartUploadOpen(true)} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Smart Upload
              </Button>
              <Button variant="outline" onClick={() => setCreateSkuOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Manually
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="font-medium">No products match "{searchQuery}"</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(sku => {
              const info = parseSkuDisplayInfo(sku.name, sku.description);
              const subtitle = formatSkuSubtitle(info);
              const componentCount = sku.components
                ? Object.keys(sku.components).filter(k => !['analysisVersion', 'analyzedAt', 'branding', 'strapConstruction'].includes(k) && typeof (sku.components as any)[k] === 'object').length
                : 0;

              return (
                <div
                  key={sku.id}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent/40 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {sku.composite_image_url ? (
                      <img src={sku.composite_image_url} alt={sku.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : sku.angles[0]?.thumbnail_url ? (
                      <img src={sku.angles[0].thumbnail_url} alt={sku.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{info.modelName || sku.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {sku.angles.length} angle{sku.angles.length !== 1 ? 's' : ''}
                      </Badge>
                      {sku.sku_code && (
                        <Badge variant="outline" className="text-xs font-mono">
                          {sku.sku_code}
                        </Badge>
                      )}
                      {componentCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {componentCount} components
                        </Badge>
                      )}
                      {sku.last_used_at && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Used {new Date(sku.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Angle thumbnails */}
                  <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                    {sku.angles.slice(0, 4).map(angle => (
                      <div key={angle.id} className="w-10 h-10 rounded overflow-hidden bg-muted">
                        <img src={angle.thumbnail_url} alt={angle.angle || ''} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                    {sku.angles.length > 4 && (
                      <span className="text-xs text-muted-foreground ml-1">+{sku.angles.length - 4}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setEditingSkuId(sku.id)}
                      title="Edit product"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{sku.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this product and all {sku.angles.length} associated images.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(sku)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      {editingSkuId && (
        <EditSKUModal
          open={!!editingSkuId}
          onClose={() => setEditingSkuId(null)}
          skuId={editingSkuId}
          onUpdated={() => queryClient.invalidateQueries({ queryKey: ['products-page-skus'] })}
          onDeleted={() => queryClient.invalidateQueries({ queryKey: ['products-page-skus'] })}
        />
      )}
      <SmartUploadModal open={smartUploadOpen} onOpenChange={setSmartUploadOpen} />
      <CreateSKUModal
        open={createSkuOpen}
        onClose={() => setCreateSkuOpen(false)}
        onCreated={() => {
          setCreateSkuOpen(false);
          queryClient.invalidateQueries({ queryKey: ['products-page-skus'] });
        }}
      />
    </div>
  );
}

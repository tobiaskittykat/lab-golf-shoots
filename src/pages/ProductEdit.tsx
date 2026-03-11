import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Upload, Loader2, AlertTriangle, X, Save, Expand } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { EditableAnalysisPanel, ComponentsJson, DescriptionJson } from '@/components/creative-studio/product-shoot/EditableAnalysisPanel';

interface Angle {
  id: string;
  thumbnail_url: string;
  storage_path: string | null;
  angle: string | null;
}

interface PendingUpload {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ProductEdit() {
  const { id: skuId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [description, setDescription] = useState('');
  const [angles, setAngles] = useState<Angle[]>([]);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [deletedAngleIds, setDeletedAngleIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedComponents, setEditedComponents] = useState<ComponentsJson | null>(null);
  const [editedDescription, setEditedDescription] = useState<DescriptionJson | null>(null);
  const [originalComponents, setOriginalComponents] = useState<ComponentsJson | null>(null);
  const [originalDescription, setOriginalDescription] = useState<DescriptionJson | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const { data: skuData, isLoading } = useQuery({
    queryKey: ['edit-sku', skuId],
    queryFn: async () => {
      const { data: sku, error: skuError } = await (supabase.from('product_skus' as any).select('*') as any).eq('id', skuId!).maybeSingle();
      if (skuError) throw skuError;
      if (!sku) return null;
      const { data: angleData, error: angleError } = await (supabase.from('scraped_products' as any).select('id, thumbnail_url, storage_path, angle') as any).eq('sku_id', skuId!);
      if (angleError) throw angleError;
      return { ...sku, angles: angleData || [] };
    },
    enabled: !!skuId,
  });

  useEffect(() => {
    if (skuData) {
      setName(skuData.name);
      setSkuCode(skuData.sku_code || '');
      const rawDesc = skuData.description as any;
      setDescription(rawDesc?.summary || '');
      setAngles(skuData.angles);
      setDeletedAngleIds([]);
      setPendingUploads([]);
      const comps = (skuData.components as ComponentsJson) || null;
      const descJson = (skuData.description as DescriptionJson) || null;
      setEditedComponents(comps ? JSON.parse(JSON.stringify(comps)) : null);
      setEditedDescription(descJson ? JSON.parse(JSON.stringify(descJson)) : null);
      setOriginalComponents(comps ? JSON.parse(JSON.stringify(comps)) : null);
      setOriginalDescription(descJson ? JSON.parse(JSON.stringify(descJson)) : null);
    }
  }, [skuData]);

  const handleDeleteAngle = (angleId: string) => {
    setDeletedAngleIds(prev => [...prev, angleId]);
    setAngles(prev => prev.filter(a => a.id !== angleId));
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newUploads: PendingUpload[] = files.map(file => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) }));
    setPendingUploads(prev => [...prev, ...newUploads]);
    e.target.value = '';
  }, []);

  const handleRemovePending = (id: string) => {
    setPendingUploads(prev => {
      const item = prev.find(p => p.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const handleSave = async () => {
    if (!user?.id || !skuData || !skuId) return;
    setIsSaving(true);
    try {
      for (const angleId of deletedAngleIds) {
        const angle = skuData.angles.find((a: Angle) => a.id === angleId);
        if (angle?.storage_path) await supabase.storage.from('product-images').remove([angle.storage_path]);
        await (supabase.from('scraped_products' as any).delete() as any).eq('id', angleId);
      }
      for (const upload of pendingUploads) {
        const fileName = `${user.id}/${skuId}/${Date.now()}-${upload.file.name}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, upload.file);
        if (uploadError) { console.error('Upload error:', uploadError); continue; }
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        await (supabase.from('scraped_products' as any).insert({
          user_id: user.id, sku_id: skuId, name, external_id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          full_url: publicUrl, thumbnail_url: publicUrl, storage_path: fileName, angle: null, brand_id: skuData.brand_id,
        }) as any);
      }
      const syncedDescription = { ...(editedDescription || {}) } as any;
      if (editedComponents?.upper?.color) syncedDescription.colors = [editedComponents.upper.color];
      if (editedComponents?.upper?.material) syncedDescription.materials = [editedComponents.upper.material];
      const finalDescription = { ...syncedDescription, summary: description };
      const updatePayload: any = { name, sku_code: skuCode || null, description: finalDescription };
      if (editedComponents) updatePayload.components = editedComponents;
      await (supabase.from('product_skus' as any).update(updatePayload) as any).eq('id', skuId);
      pendingUploads.forEach(p => URL.revokeObjectURL(p.previewUrl));
      queryClient.invalidateQueries({ queryKey: ['product-skus'] });
      queryClient.invalidateQueries({ queryKey: ['recent-skus-inline'] });
      queryClient.invalidateQueries({ queryKey: ['selected-sku'] });
      queryClient.invalidateQueries({ queryKey: ['edit-sku'] });
      queryClient.invalidateQueries({ queryKey: ['products-page-skus'] });
      toast.success('Product updated successfully');
      navigate('/products');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSku = async () => {
    if (!user?.id || !skuData || !skuId) return;
    setIsDeleting(true);
    try {
      for (const angle of skuData.angles) {
        if (angle.storage_path) await supabase.storage.from('product-images').remove([angle.storage_path]);
      }
      await (supabase.from('scraped_products' as any).delete() as any).eq('sku_id', skuId);
      await (supabase.from('product_skus' as any).delete() as any).eq('id', skuId);
      queryClient.invalidateQueries({ queryKey: ['product-skus'] });
      queryClient.invalidateQueries({ queryKey: ['recent-skus-inline'] });
      queryClient.invalidateQueries({ queryKey: ['products-page-skus'] });
      toast.success('Product deleted');
      navigate('/products');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalAngles = angles.length + pendingUploads.length;

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!skuData) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Product not found</p>
      <Button variant="outline" onClick={() => navigate('/products')}><ArrowLeft className="w-4 h-4 mr-2" />Back to Products</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/products')} className="gap-2"><ArrowLeft className="w-4 h-4" />Products</Button>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-lg font-semibold truncate max-w-[300px]">{name || 'Untitled'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"><Trash2 className="w-4 h-4" />Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete "{name}" and all {skuData.angles.length} associated images.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSku} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleSave} disabled={isSaving || totalAngles === 0 || !name.trim()} className="gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Changes
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Boston Shearling Clog" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku-code">SKU Code (optional)</Label>
                <Input id="edit-sku-code" value={skuCode} onChange={(e) => setSkuCode(e.target.value)} placeholder="e.g., BIRK-BOSTON-SHEAR" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Product Description</Label>
                <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Auto-generated product summary..." rows={4} className="text-sm resize-none" />
                <p className="text-xs text-muted-foreground">Auto-generated summary used in image prompts. Edit to correct any inaccuracies.</p>
              </div>
            </div>
            <EditableAnalysisPanel
              components={editedComponents}
              description={editedDescription}
              onComponentsChange={setEditedComponents}
              onDescriptionChange={setEditedDescription}
              originalComponents={originalComponents}
              originalDescription={originalDescription}
              initialOpen={true}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <Label className="mb-3 block">Product Images ({totalAngles})</Label>
              <div className="grid grid-cols-2 gap-3">
                {angles.map(angle => (
                  <div key={angle.id} className="relative aspect-square group rounded-lg overflow-hidden bg-muted">
                    <img src={angle.thumbnail_url} alt="Product angle" className="w-full h-full object-cover cursor-pointer" onClick={() => setEnlargedImage(angle.thumbnail_url)} />
                    <button onClick={() => setEnlargedImage(angle.thumbnail_url)} className="absolute top-1.5 left-1.5 w-7 h-7 bg-foreground/60 text-background rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="View full size">
                      <Expand className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteAngle(angle.id)} className="absolute top-1.5 right-1.5 w-7 h-7 bg-destructive text-destructive-foreground rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Remove image">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {angle.angle && <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-foreground/60 text-background text-xs rounded">{angle.angle}</div>}
                  </div>
                ))}
                {pendingUploads.map(upload => (
                  <div key={upload.id} className="relative aspect-square group rounded-lg overflow-hidden bg-muted ring-2 ring-accent">
                    <img src={upload.previewUrl} alt="New upload" className="w-full h-full object-cover cursor-pointer" onClick={() => setEnlargedImage(upload.previewUrl)} />
                    <button onClick={() => setEnlargedImage(upload.previewUrl)} className="absolute top-1.5 left-1.5 w-7 h-7 bg-foreground/60 text-background rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="View full size">
                      <Expand className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleRemovePending(upload.id)} className="absolute top-1.5 right-1.5 w-7 h-7 bg-destructive text-destructive-foreground rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded">New</div>
                  </div>
                ))}
                <label className={cn(
                  "aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30",
                  "flex flex-col items-center justify-center gap-1.5 cursor-pointer",
                  "hover:border-accent hover:bg-accent/5 transition-colors"
                )}>
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Images</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                </label>
              </div>
              {totalAngles === 0 && (
                <p className="text-sm text-destructive flex items-center gap-2 mt-3"><AlertTriangle className="w-4 h-4" />At least one image is required</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
        <DialogContent className="max-w-3xl p-1 overflow-hidden">
          {enlargedImage && <img src={enlargedImage} alt="Product image full size" className="w-full max-h-[80vh] object-contain rounded bg-secondary" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

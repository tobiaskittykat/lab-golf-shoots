import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2, Upload, Package, Loader2, AlertTriangle, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

interface EditSKUModalProps {
  open: boolean;
  onClose: () => void;
  skuId: string;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export function EditSKUModal({ open, onClose, skuId, onUpdated, onDeleted }: EditSKUModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [angles, setAngles] = useState<Angle[]>([]);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [deletedAngleIds, setDeletedAngleIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch SKU data with angles
  const { data: skuData, isLoading } = useQuery({
    queryKey: ['edit-sku', skuId],
    queryFn: async () => {
      const { data: sku, error: skuError } = await supabase
        .from('product_skus')
        .select('*')
        .eq('id', skuId)
        .maybeSingle();

      if (skuError) throw skuError;
      if (!sku) return null;

      const { data: angleData, error: angleError } = await supabase
        .from('scraped_products')
        .select('id, thumbnail_url, storage_path, angle')
        .eq('sku_id', skuId);

      if (angleError) throw angleError;

      return {
        ...sku,
        angles: angleData || [],
      };
    },
    enabled: open && !!skuId,
  });

  // Initialize local state from fetched data
  useEffect(() => {
    if (skuData) {
      setName(skuData.name);
      setSkuCode(skuData.sku_code || '');
      setAngles(skuData.angles);
      setDeletedAngleIds([]);
      setPendingUploads([]);
    }
  }, [skuData]);

  const handleDeleteAngle = (angleId: string) => {
    setDeletedAngleIds(prev => [...prev, angleId]);
    setAngles(prev => prev.filter(a => a.id !== angleId));
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newUploads: PendingUpload[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
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
    if (!user?.id || !skuData) return;
    setIsSaving(true);

    try {
      // 1. Delete marked angles from storage and DB
      for (const angleId of deletedAngleIds) {
        const angle = skuData.angles.find((a: Angle) => a.id === angleId);
        if (angle?.storage_path) {
          await supabase.storage.from('product-images').remove([angle.storage_path]);
        }
        await supabase.from('scraped_products').delete().eq('id', angleId);
      }

      // 2. Upload new angles
      for (const upload of pendingUploads) {
        const fileName = `${user.id}/${skuId}/${Date.now()}-${upload.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, upload.file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        // Insert new scraped_products record
        await supabase.from('scraped_products').insert({
          user_id: user.id,
          sku_id: skuId,
          name: name,
          external_id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          full_url: publicUrl,
          thumbnail_url: publicUrl,
          storage_path: fileName,
          angle: null,
          brand_id: skuData.brand_id,
        });
      }

      // 3. Update SKU name/code if changed
      if (name !== skuData.name || skuCode !== (skuData.sku_code || '')) {
        await supabase
          .from('product_skus')
          .update({ name, sku_code: skuCode || null })
          .eq('id', skuId);
      }

      // Clean up preview URLs
      pendingUploads.forEach(p => URL.revokeObjectURL(p.previewUrl));

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['product-skus'] });
      queryClient.invalidateQueries({ queryKey: ['recent-skus-inline'] });
      queryClient.invalidateQueries({ queryKey: ['selected-sku'] });
      queryClient.invalidateQueries({ queryKey: ['edit-sku'] });

      toast.success('Product updated successfully');
      onUpdated?.();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSku = async () => {
    if (!user?.id || !skuData) return;
    setIsDeleting(true);

    try {
      // Delete all angles from storage and DB
      for (const angle of skuData.angles) {
        if (angle.storage_path) {
          await supabase.storage.from('product-images').remove([angle.storage_path]);
        }
      }
      await supabase.from('scraped_products').delete().eq('sku_id', skuId);

      // Delete the SKU
      await supabase.from('product_skus').delete().eq('id', skuId);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['product-skus'] });
      queryClient.invalidateQueries({ queryKey: ['recent-skus-inline'] });

      toast.success('Product deleted');
      onDeleted?.();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalAngles = angles.length + pendingUploads.length;
  const hasChanges = deletedAngleIds.length > 0 || 
    pendingUploads.length > 0 || 
    name !== skuData?.name || 
    skuCode !== (skuData?.sku_code || '');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Edit Product
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !skuData ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-muted-foreground">Product not found</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-6">
                {/* Name & SKU Code */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-sku-name">Product Name</Label>
                    <Input
                      id="edit-sku-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Boston Shearling Clog"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sku-code">SKU Code (optional)</Label>
                    <Input
                      id="edit-sku-code"
                      value={skuCode}
                      onChange={(e) => setSkuCode(e.target.value)}
                      placeholder="e.g., BIRK-BOSTON-SHEAR"
                    />
                  </div>
                </div>

                {/* Existing Angles */}
                <div className="space-y-3">
                  <Label>Product Images ({totalAngles})</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {angles.map(angle => (
                      <div key={angle.id} className="relative aspect-square group">
                        <img
                          src={angle.thumbnail_url}
                          alt="Product angle"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleDeleteAngle(angle.id)}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {angle.angle && (
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded">
                            {angle.angle}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Pending uploads */}
                    {pendingUploads.map(upload => (
                      <div key={upload.id} className="relative aspect-square group">
                        <img
                          src={upload.previewUrl}
                          alt="New upload"
                          className="w-full h-full object-cover rounded-lg ring-2 ring-accent"
                        />
                        <button
                          onClick={() => handleRemovePending(upload.id)}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-accent text-white text-[10px] rounded">
                          New
                        </div>
                      </div>
                    ))}

                    {/* Add more button */}
                    <label className={cn(
                      "aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30",
                      "flex flex-col items-center justify-center gap-1 cursor-pointer",
                      "hover:border-accent hover:bg-accent/5 transition-colors"
                    )}>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                  
                  {totalAngles === 0 && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      At least one image is required
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="px-6 py-4 border-t border-border flex-shrink-0 flex items-center justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Product
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{name}" and all {skuData.angles.length} associated images. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteSku}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || totalAngles === 0 || !name.trim()}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import { toast } from "sonner";

interface CreateSKUModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateSKUModal = ({ open, onClose, onCreated }: CreateSKUModalProps) => {
  const { user } = useAuth();
  const { currentBrand } = useBrands();

  const [name, setName] = useState("");
  const [skuCode, setSkuCode] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviews((prev) => [...prev, ...selectedFiles.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setIsSaving(true);

    try {
      const { data: sku, error: skuError } = await (supabase
        .from("product_skus" as any)
        .insert({
          user_id: user.id,
          brand_id: currentBrand?.id || null,
          name: name.trim(),
          sku_code: skuCode.trim() || null,
        })
        .select()
        .single() as any);

      if (skuError) throw skuError;

      // Upload images
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "png";
        const path = `${user.id}/${sku.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("brand-assets")
          .upload(path, file, { upsert: true });

        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage.from("brand-assets").getPublicUrl(path);

        await (supabase
          .from("scraped_products" as any)
          .insert({
            user_id: user.id,
            sku_id: sku.id,
            brand_id: currentBrand?.id || null,
            name: name.trim(),
            full_url: publicUrl,
            thumbnail_url: publicUrl,
            storage_path: path,
          }) as any);
      }

      // Set composite image
      if (files.length > 0) {
        const { data: firstAngle } = await (supabase
          .from("scraped_products" as any)
          .select("thumbnail_url")
          .eq("sku_id", sku.id)
          .limit(1)
          .single() as any);

        if (firstAngle?.thumbnail_url) {
          await (supabase
            .from("product_skus" as any)
            .update({ composite_image_url: firstAngle.thumbnail_url })
            .eq("id", sku.id) as any);
        }
      }

      toast.success(`Product "${name}" created`);
      handleClose();
      onCreated();
    } catch (err) {
      console.error("Create SKU error:", err);
      toast.error("Failed to create product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setName("");
    setSkuCode("");
    setFiles([]);
    setPreviews([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>Create a new product SKU manually.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku-name">Product Name *</Label>
            <Input
              id="sku-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Nike Air Max 90"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku-code">SKU Code (optional)</Label>
            <Input
              id="sku-code"
              value={skuCode}
              onChange={(e) => setSkuCode(e.target.value)}
              placeholder="e.g., NK-AM90-BLK"
            />
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {previews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors cursor-pointer block">
              <Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Add images</p>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || isSaving} className="flex-1 gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Product
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

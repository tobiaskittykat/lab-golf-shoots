import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Sparkles, X, ImageIcon, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SmartUploadModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

type Phase = "upload" | "uploading" | "analyzing" | "done";

export const SmartUploadModal = ({ open, onOpenChange }: SmartUploadModalProps) => {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const queryClient = useQueryClient();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [productName, setProductName] = useState("");
  const [phase, setPhase] = useState<Phase>("upload");
  const [uploadedCount, setUploadedCount] = useState(0);

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

  const handleUpload = useCallback(async () => {
    if (!user || files.length === 0) return;

    setPhase("uploading");
    setUploadedCount(0);

    try {
      // 1. Create the SKU
      const { data: sku, error: skuError } = await (supabase
        .from("product_skus" as any)
        .insert({
          user_id: user.id,
          brand_id: currentBrand?.id || null,
          name: productName.trim() || `Product ${new Date().toLocaleDateString()}`,
        })
        .select()
        .single() as any);

      if (skuError) throw skuError;

      // 2. Upload each file and create scraped_products entries
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() || "png";
        const path = `${user.id}/${sku.id}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("brand-assets")
          .upload(path, file, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("brand-assets").getPublicUrl(path);

        await (supabase
          .from("scraped_products" as any)
          .insert({
            user_id: user.id,
            sku_id: sku.id,
            brand_id: currentBrand?.id || null,
            name: productName.trim() || file.name,
            full_url: publicUrl,
            thumbnail_url: publicUrl,
            storage_path: path,
            angle: i === 0 ? "front" : null,
          }) as any);

        setUploadedCount(i + 1);
      }

      // 3. Set composite image to first uploaded image
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

      // 4. Trigger AI analysis
      setPhase("analyzing");
      try {
        await supabase.functions.invoke("analyze-shoe-components", {
          body: { skuId: sku.id },
        });
      } catch (err) {
        console.error("Analysis trigger failed:", err);
      }

      setPhase("done");
      queryClient.invalidateQueries({ queryKey: ["products-page-skus"] });
      queryClient.invalidateQueries({ queryKey: ["product-skus"] });
      toast.success(`Product "${productName || "New Product"}" created with ${files.length} images`);
    } catch (err) {
      console.error("Smart upload error:", err);
      toast.error("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"));
      setPhase("upload");
    }
  }, [user, currentBrand, files, productName, queryClient]);

  const handleClose = () => {
    if (phase === "uploading" || phase === "analyzing") return;
    // Cleanup
    previews.forEach((p) => URL.revokeObjectURL(p));
    setFiles([]);
    setPreviews([]);
    setProductName("");
    setPhase("upload");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Upload
          </DialogTitle>
          <DialogDescription>
            Upload product images — AI will automatically analyze components, materials, and colors.
          </DialogDescription>
        </DialogHeader>

        {phase === "upload" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Birkenstock Boston Suede Taupe"
              />
            </div>

            <div className="space-y-2">
              <Label>Product Images</Label>
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
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
              <label className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer block">
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to add images (front, side, back, detail)
                </p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
              </label>
            </div>

            <Button onClick={handleUpload} disabled={files.length === 0} className="w-full gap-2">
              <Sparkles className="w-4 h-4" />
              Upload & Analyze ({files.length} image{files.length !== 1 ? "s" : ""})
            </Button>
          </div>
        )}

        {phase === "uploading" && (
          <div className="text-center py-8">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="font-medium">Uploading images...</p>
            <p className="text-sm text-muted-foreground mt-1">
              {uploadedCount} of {files.length} uploaded
            </p>
          </div>
        )}

        {phase === "analyzing" && (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4 animate-pulse" />
            <p className="font-medium">AI is analyzing your product...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Detecting materials, colors, and components
            </p>
          </div>
        )}

        {phase === "done" && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-medium">Product created!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {files.length} images uploaded. AI analysis is running in the background.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

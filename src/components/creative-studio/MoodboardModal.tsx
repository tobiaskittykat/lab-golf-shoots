import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Plus, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import { toast } from "sonner";
import { MoodboardThumbnail } from "./MoodboardThumbnail";
import { Moodboard } from "./types";

interface MoodboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMoodboard: string | null;
  onSelect: (moodboardId: string, fromGallery?: boolean) => void;
}

export const MoodboardModal = ({ isOpen, onClose, selectedMoodboard, onSelect }: MoodboardModalProps) => {
  const { user } = useAuth();
  const { currentBrand } = useBrands();

  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMoodboards = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let query = (supabase
        .from("custom_moodboards" as any)
        .select("*") as any)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setMoodboards(
          data.map((m: any) => ({
            id: m.id,
            name: m.name,
            thumbnail: m.thumbnail_url || "",
            description: m.description,
            visualAnalysis: m.visual_analysis,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching moodboards:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentBrand?.id]);

  useEffect(() => {
    if (isOpen) fetchMoodboards();
  }, [isOpen, fetchMoodboards]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!user || !uploadFile) return;
    setIsUploading(true);

    try {
      const ext = uploadFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/moodboards/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("brand-assets")
        .upload(path, uploadFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("brand-assets").getPublicUrl(path);

      await (supabase
        .from("custom_moodboards" as any)
        .insert({
          user_id: user.id,
          brand_id: currentBrand?.id || null,
          name: uploadName.trim() || "Untitled Moodboard",
          thumbnail_url: publicUrl,
        }) as any);

      toast.success("Moodboard uploaded");
      setShowUpload(false);
      setUploadName("");
      setUploadFile(null);
      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
      setUploadPreview(null);
      fetchMoodboards();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload moodboard");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Moodboard Gallery</DialogTitle>
        </DialogHeader>

        {showUpload ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Moodboard name"
              />
            </div>
            {uploadPreview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
                <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain" />
                <button
                  onClick={() => {
                    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
                    setUploadFile(null);
                    setUploadPreview(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer block">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload moodboard image</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpload(false);
                  if (uploadPreview) URL.revokeObjectURL(uploadPreview);
                  setUploadFile(null);
                  setUploadPreview(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!uploadFile || isUploading} className="flex-1 gap-2">
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Upload
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <Button variant="outline" size="sm" onClick={() => setShowUpload(true)} className="gap-1.5">
                <Plus className="w-4 h-4" />
                Upload New
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : moodboards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No moodboards yet</p>
                <Button onClick={() => setShowUpload(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Upload your first moodboard
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {moodboards.map((mb) => (
                  <MoodboardThumbnail
                    key={mb.id}
                    moodboard={mb}
                    isSelected={selectedMoodboard === mb.id}
                    onSelect={() => {
                      onSelect(mb.id, true);
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

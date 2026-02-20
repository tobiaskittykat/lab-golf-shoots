import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Sparkles, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface CreateCustomBackgroundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    prompt: string;
    thumbnail_url: string | null;
    reference_urls: string[];
    ai_analysis: Record<string, any> | null;
  }) => void;
  isSaving: boolean;
}

export const CreateCustomBackgroundModal = ({
  open,
  onOpenChange,
  onSave,
  isSaving,
}: CreateCustomBackgroundModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, any> | null>(null);

  const resetForm = useCallback(() => {
    setName("");
    setPrompt("");
    setReferenceUrls([]);
    setAiAnalysis(null);
  }, []);

  const handleClose = (val: boolean) => {
    if (!val) resetForm();
    onOpenChange(val);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user?.id) return;
    const remaining = 3 - referenceUrls.length;
    if (remaining <= 0) {
      toast({ title: "Maximum 3 reference images", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/custom-bg/${Date.now()}-${i}.${ext}`;

      const { error } = await supabase.storage
        .from("brand-assets")
        .upload(path, file, { upsert: true });

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(path);

      if (urlData?.publicUrl) {
        newUrls.push(urlData.publicUrl);
      }
    }

    setReferenceUrls((prev) => [...prev, ...newUrls]);
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setReferenceUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (referenceUrls.length === 0) return;
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-custom-background", {
        body: { imageUrls: referenceUrls },
      });

      if (error) throw error;

      setPrompt(data.prompt);
      setAiAnalysis(data.analysis);
      toast({ title: "Background analyzed!", description: "Edit the prompt if you'd like to refine it." });
    } catch (err) {
      console.error("Analysis error:", err);
      toast({ title: "Analysis failed", description: "Please try again or write a prompt manually.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !prompt.trim()) {
      toast({ title: "Name and prompt are required", variant: "destructive" });
      return;
    }
    onSave({
      name: name.trim(),
      prompt: prompt.trim(),
      thumbnail_url: referenceUrls[0] || null,
      reference_urls: referenceUrls,
      ai_analysis: aiAnalysis,
    });
    resetForm();
  };

  const canAnalyze = referenceUrls.length > 0 && !isAnalyzing;
  const canSave = name.trim() && prompt.trim() && !isSaving;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Custom Background</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rustic Terracotta Wall"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Reference Images <span className="text-muted-foreground font-normal">({referenceUrls.length}/3)</span>
            </label>

            {/* Thumbnails */}
            {referenceUrls.length > 0 && (
              <div className="flex gap-2">
                {referenceUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            {referenceUrls.length < 3 && (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-accent/50 transition-colors">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Drop images or click to upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          {/* Analyze Button */}
          {referenceUrls.length > 0 && (
            <Button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              variant="outline"
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {prompt ? "Re-analyze with AI" : "Analyze with AI"}
                </>
              )}
            </Button>
          )}

          {/* Prompt */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Background Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the background environment for product shots..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {aiAnalysis ? "AI-generated — feel free to edit" : "Upload images and click Analyze, or write your own"}
            </p>
          </div>

          {/* AI Analysis Tags */}
          {aiAnalysis && (
            <div className="flex flex-wrap gap-1.5">
              {aiAnalysis.colors?.map((c: string, i: number) => (
                <span key={`c${i}`} className="px-2 py-0.5 rounded-full bg-accent/10 text-xs text-accent">
                  {c}
                </span>
              ))}
              {aiAnalysis.textures?.map((t: string, i: number) => (
                <span key={`t${i}`} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Save */}
          <Button onClick={handleSave} disabled={!canSave} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Background"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

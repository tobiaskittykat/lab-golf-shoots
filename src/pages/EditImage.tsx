import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Wand2,
  Download,
  RefreshCw,
  Eraser,
  Palette,
  Maximize,
  Type,
  Layers,
  Loader2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const editTools = [
  { id: "enhance", label: "Enhance", icon: Wand2, description: "AI-powered improvements", promptTemplate: "Enhance this image: improve lighting, sharpness, and overall quality while maintaining the original composition" },
  { id: "remove-bg", label: "Remove BG", icon: Eraser, description: "Remove background", promptTemplate: "Remove the background from this image, keeping only the main subject on a clean white background" },
  { id: "recolor", label: "Recolor", icon: Palette, description: "Change colors", promptTemplate: "Recolor this image:" },
  { id: "expand", label: "Expand", icon: Maximize, description: "Extend canvas", promptTemplate: "Expand the canvas of this image, extending the scene naturally in all directions" },
  { id: "add-text", label: "Add Text", icon: Type, description: "Overlay text", promptTemplate: "Add text overlay to this image:" },
  { id: "variations", label: "Variations", icon: Layers, description: "Create variants", promptTemplate: "Create a variation of this image with similar style but different composition:" },
];

const EditImage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const initialImage = (location.state as any)?.imageToEdit;

  const [uploadedImage, setUploadedImage] = useState<string | null>(initialImage?.imageUrl || null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setEditedImage(null);
    }
  };

  const handleApplyEdit = useCallback(async () => {
    if (!selectedTool || !uploadedImage) return;
    setIsProcessing(true);

    try {
      const tool = editTools.find(t => t.id === selectedTool);
      const fullPrompt = editPrompt.trim()
        ? `${tool?.promptTemplate} ${editPrompt}`
        : tool?.promptTemplate || editPrompt;

      // For blob URLs, we need to upload first
      let imageUrl = uploadedImage;
      if (uploadedImage.startsWith("blob:") && user) {
        const resp = await fetch(uploadedImage);
        const blob = await resp.blob();
        const path = `${user.id}/edit/${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("brand-assets")
          .upload(path, blob, { upsert: true });
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("brand-assets")
            .getPublicUrl(path);
          imageUrl = publicUrl;
        }
      }

      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: fullPrompt,
          editMode: true,
          sourceImageUrl: imageUrl,
          imageCount: 1,
          resolution: "1024",
          aspectRatio: "1:1",
          aiModel: "auto",
        },
      });

      if (error) throw error;

      const pendingIds = data?.pendingIds || [];
      if (pendingIds.length === 0) {
        toast({ title: "Edit failed", description: "No jobs created", variant: "destructive" });
        return;
      }

      // Poll for results
      const { pollForPendingImages } = await import("@/lib/imagePolling");
      const rows = await pollForPendingImages(pendingIds, { maxWaitMs: 300000, intervalMs: 3000 });

      const completed = rows.find(r => r.status === "completed");
      if (completed?.image_url) {
        setEditedImage(completed.image_url);
        toast({ title: "Edit applied!", description: "Your edited image is ready" });
      } else {
        toast({ title: "Edit failed", description: rows[0]?.error_message || "Please try again", variant: "destructive" });
      }
    } catch (err) {
      console.error("Edit error:", err);
      toast({ title: "Edit failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTool, uploadedImage, editPrompt, user, toast]);

  const displayImage = editedImage || uploadedImage;

  const handleDownload = async () => {
    if (!displayImage) return;
    try {
      const response = await fetch(displayImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kittykat-edit-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:bg-secondary/80 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">Edit Image</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 animate-fade-in">
                {!uploadedImage ? (
                  <label className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-colors block">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 flex items-center justify-center mb-4">
                      <Upload className="w-10 h-10 text-blue-500" />
                    </div>
                    <p className="font-medium mb-1">Upload an image to edit</p>
                    <p className="text-sm text-muted-foreground">Drag & drop or click to browse</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{editedImage ? "Edited Image" : "Your Image"}</h3>
                      <div className="flex gap-2">
                        <label className="px-3 py-1.5 text-sm rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                          Replace
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <button onClick={handleDownload} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="aspect-video rounded-xl bg-secondary overflow-hidden relative">
                      {isProcessing && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Applying edits...</p>
                          </div>
                        </div>
                      )}
                      <img src={displayImage} alt="Image" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              {uploadedImage && selectedTool && (
                <div className="glass-card p-6 animate-fade-in">
                  <label className="block text-sm font-semibold mb-3">Describe your edit</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder={`Describe how you want to ${editTools.find(t => t.id === selectedTool)?.label.toLowerCase()}...`}
                      className="flex-1 input-field"
                      onKeyDown={(e) => { if (e.key === "Enter") handleApplyEdit(); }}
                    />
                    <button
                      onClick={handleApplyEdit}
                      disabled={isProcessing}
                      className="px-6 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <h3 className="font-semibold mb-4">Edit Tools</h3>
                <div className="space-y-2">
                  {editTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        disabled={!uploadedImage}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedTool === tool.id
                            ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                            : "border-border hover:border-blue-500/30"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedTool === tool.id
                            ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white"
                            : "bg-secondary"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{tool.label}</p>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditImage;

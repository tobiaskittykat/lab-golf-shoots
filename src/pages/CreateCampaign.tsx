import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Cat,
  Image,
  Wand2,
  ChevronRight,
  Loader2,
  Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import { useToast } from "@/hooks/use-toast";
import { pollForPendingImages, PollResult } from "@/lib/imagePolling";

const platformOptions = [
  { id: "instagram", name: "Instagram", sizes: ["1080x1080", "1080x1350", "1080x1920"] },
  { id: "facebook", name: "Facebook", sizes: ["1200x628", "1080x1080"] },
  { id: "tiktok", name: "TikTok", sizes: ["1080x1920"] },
  { id: "pinterest", name: "Pinterest", sizes: ["1000x1500", "1080x1080"] },
];

const sizeToAspectRatio: Record<string, string> = {
  "1080x1080": "1:1",
  "1080x1350": "4:5",
  "1080x1920": "9:16",
  "1200x628": "16:9",
  "1000x1500": "3:4",
};

const CreateCampaign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPrompt = location.state?.prompt || "";
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    prompt: initialPrompt,
    platform: "",
    sizes: [] as string[],
    mood: "",
    count: 4,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<PollResult[]>([]);

  const handleGenerate = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const aspectRatio = campaignData.sizes.length > 0
        ? sizeToAspectRatio[campaignData.sizes[0]] || "1:1"
        : "1:1";

      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: `${campaignData.mood} campaign: ${campaignData.prompt}. Platform: ${campaignData.platform}`,
          imageCount: campaignData.count,
          aspectRatio,
          resolution: "1024",
          aiModel: "auto",
          brandId: currentBrand?.id || null,
          brandName: currentBrand?.name,
        },
      });

      if (error) throw error;

      const pendingIds = data?.pendingIds || [];
      if (pendingIds.length === 0) {
        toast({ title: "Generation failed", variant: "destructive" });
        setIsGenerating(false);
        return;
      }

      const rows = await pollForPendingImages(pendingIds, {
        maxWaitMs: 480000,
        intervalMs: 4000,
        onRowReady: (row) => {
          if (row.status === "completed") {
            setGeneratedImages((prev) => [...prev, row]);
          }
        },
      });

      setGeneratedImages(rows.filter((r) => r.status === "completed"));
      setStep(3);
      toast({ title: "Campaign ready!", description: `${rows.filter(r => r.status === "completed").length} images generated` });
    } catch (err) {
      console.error("Campaign generation error:", err);
      toast({ title: "Generation failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [campaignData, user, currentBrand, toast]);

  const handleDownloadAll = async () => {
    for (const img of generatedImages) {
      if (!img.image_url) continue;
      try {
        const response = await fetch(img.image_url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `campaign-${img.id.slice(0, 8)}.png`;
        a.click();
        URL.revokeObjectURL(url);
      } catch { /* skip */ }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" /><span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <Cat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">KittyKat</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-0.5 ${step > s ? "bg-primary" : "bg-secondary"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold mb-2">Describe your campaign</h1>
                <p className="text-muted-foreground">Tell us what you want to create</p>
              </div>
              <div className="glass-card p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign Description</label>
                  <textarea value={campaignData.prompt} onChange={(e) => setCampaignData({ ...campaignData, prompt: e.target.value })} placeholder="Describe your ad creative in detail..." rows={4} className="input-field resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Select Platform</label>
                  <div className="grid grid-cols-2 gap-3">
                    {platformOptions.map((platform) => (
                      <button key={platform.id} onClick={() => setCampaignData({ ...campaignData, platform: platform.id, sizes: [] })} className={`p-4 rounded-xl text-left transition-all ${campaignData.platform === platform.id ? "bg-primary/20 border border-primary/50" : "bg-secondary/50 border border-border hover:border-primary/30"}`}>
                        <span className="font-medium">{platform.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {campaignData.platform && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium mb-3">Image Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {platformOptions.find((p) => p.id === campaignData.platform)?.sizes.map((size) => (
                        <button key={size} onClick={() => { const sizes = campaignData.sizes.includes(size) ? campaignData.sizes.filter((s) => s !== size) : [...campaignData.sizes, size]; setCampaignData({ ...campaignData, sizes }); }} className={`px-4 py-2 rounded-lg text-sm transition-all ${campaignData.sizes.includes(size) ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => setStep(2)} disabled={!campaignData.prompt || !campaignData.platform} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  Continue<ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold mb-2">Choose your style</h1>
                <p className="text-muted-foreground">Select the mood and aesthetic</p>
              </div>
              <div className="glass-card p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Visual Mood</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Minimal & Clean", "Bold & Vibrant", "Luxury & Elegant", "Natural & Organic", "Modern & Edgy", "Warm & Inviting"].map((mood) => (
                      <button key={mood} onClick={() => setCampaignData({ ...campaignData, mood })} className={`p-4 rounded-xl text-left transition-all ${campaignData.mood === mood ? "bg-primary/20 border border-primary/50" : "bg-secondary/50 border border-border hover:border-primary/30"}`}>
                        <span className={campaignData.mood === mood ? "text-foreground" : "text-muted-foreground"}>{mood}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Number of variations</label>
                  <div className="flex gap-3">
                    {[2, 4, 6, 8].map((count) => (
                      <button key={count} onClick={() => setCampaignData({ ...campaignData, count })} className={`flex-1 py-3 rounded-xl transition-all ${campaignData.count === count ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                  <button onClick={handleGenerate} disabled={!campaignData.mood || isGenerating} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {isGenerating ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold mb-2">Your creatives are ready!</h1>
                <p className="text-muted-foreground">{generatedImages.length} images generated</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {generatedImages.map((img) => (
                  <div key={img.id} className="aspect-square rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-colors cursor-pointer">
                    {img.image_url ? (
                      <img src={img.image_url} alt="Campaign" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Image className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setStep(2); setGeneratedImages([]); }} className="btn-secondary flex-1">Regenerate</button>
                <button onClick={handleDownloadAll} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />Export All
                </button>
              </div>
            </div>
          )}

          {isGenerating && step === 2 && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold mb-2">Creating your campaign...</h2>
                <p className="text-muted-foreground">{generatedImages.length} of {campaignData.count} images ready</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateCampaign;

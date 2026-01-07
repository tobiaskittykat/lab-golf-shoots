import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  Sparkles, 
  Image, 
  Target, 
  Palette,
  Wand2,
  ChevronRight,
  Loader2
} from "lucide-react";

const platformOptions = [
  { id: "instagram", name: "Instagram", sizes: ["1080x1080", "1080x1350", "1080x1920"] },
  { id: "facebook", name: "Facebook", sizes: ["1200x628", "1080x1080"] },
  { id: "tiktok", name: "TikTok", sizes: ["1080x1920"] },
  { id: "pinterest", name: "Pinterest", sizes: ["1000x1500", "1080x1080"] },
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPrompt = location.state?.prompt || "";

  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    prompt: initialPrompt,
    platform: "",
    sizes: [] as string[],
    mood: "",
    count: 4,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      setStep(3);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">AdCraft</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-0.5 ${step > s ? "bg-primary" : "bg-secondary"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Describe */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold mb-2">Describe your campaign</h1>
                <p className="text-muted-foreground">Tell us what you want to create</p>
              </div>

              <div className="glass-card p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign Description</label>
                  <textarea
                    value={campaignData.prompt}
                    onChange={(e) => setCampaignData({ ...campaignData, prompt: e.target.value })}
                    placeholder="Describe your ad creative in detail..."
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Select Platform</label>
                  <div className="grid grid-cols-2 gap-3">
                    {platformOptions.map((platform) => (
                      <button
                        key={platform.id}
                        onClick={() => setCampaignData({ ...campaignData, platform: platform.id, sizes: [] })}
                        className={`p-4 rounded-xl text-left transition-all ${
                          campaignData.platform === platform.id
                            ? "bg-primary/20 border border-primary/50"
                            : "bg-secondary/50 border border-white/5 hover:border-white/20"
                        }`}
                      >
                        <span className="font-medium">{platform.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {campaignData.platform && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium mb-3">Image Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {platformOptions
                        .find((p) => p.id === campaignData.platform)
                        ?.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => {
                              const sizes = campaignData.sizes.includes(size)
                                ? campaignData.sizes.filter((s) => s !== size)
                                : [...campaignData.sizes, size];
                              setCampaignData({ ...campaignData, sizes });
                            }}
                            className={`px-4 py-2 rounded-lg text-sm transition-all ${
                              campaignData.sizes.includes(size)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={!campaignData.prompt || !campaignData.platform}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Style */}
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
                      <button
                        key={mood}
                        onClick={() => setCampaignData({ ...campaignData, mood })}
                        className={`p-4 rounded-xl text-left transition-all ${
                          campaignData.mood === mood
                            ? "bg-primary/20 border border-primary/50"
                            : "bg-secondary/50 border border-white/5 hover:border-white/20"
                        }`}
                      >
                        <span className={campaignData.mood === mood ? "text-foreground" : "text-muted-foreground"}>
                          {mood}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Number of variations</label>
                  <div className="flex gap-3">
                    {[2, 4, 6, 8].map((count) => (
                      <button
                        key={count}
                        onClick={() => setCampaignData({ ...campaignData, count })}
                        className={`flex-1 py-3 rounded-xl transition-all ${
                          campaignData.count === count
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!campaignData.mood}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && !isGenerating && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold mb-2">Your creatives are ready!</h1>
                <p className="text-muted-foreground">Select the ones you like and export</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {Array.from({ length: campaignData.count }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gradient-to-br from-secondary to-muted rounded-2xl flex items-center justify-center border border-white/5 hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <Image className="w-12 h-12 text-muted-foreground" />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                  Regenerate
                </button>
                <button className="btn-primary flex-1">
                  Export Selected
                </button>
              </div>
            </div>
          )}

          {/* Generating State */}
          {isGenerating && (
            <div className="animate-fade-in text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Creating your campaign...</h2>
              <p className="text-muted-foreground">This usually takes about 30 seconds</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateCampaign;

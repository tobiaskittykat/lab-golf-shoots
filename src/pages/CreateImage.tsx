import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Cat,
  ArrowLeft,
  Upload,
  Sparkles,
  Image,
  Wand2,
  Download,
  RefreshCw
} from "lucide-react";

const styleOptions = [
  { id: "lifestyle", label: "Lifestyle", description: "Natural, everyday settings" },
  { id: "studio", label: "Studio", description: "Clean, professional backdrop" },
  { id: "artistic", label: "Artistic", description: "Creative, stylized look" },
  { id: "minimal", label: "Minimal", description: "Simple, focused composition" },
];

const aspectRatios = [
  { id: "1:1", label: "Square", icon: "◼" },
  { id: "4:5", label: "Portrait", icon: "▮" },
  { id: "16:9", label: "Landscape", icon: "▬" },
  { id: "9:16", label: "Story", icon: "▯" },
];

const CreateImage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPrompt = location.state?.prompt || "";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState("lifestyle");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedImage("/placeholder.svg");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:bg-secondary/80 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Image className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">Create Image</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25">
              K
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="glass-card p-6 animate-fade-in">
                <label className="block text-sm font-semibold mb-3">Describe your image</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A stunning product shot of a gold necklace on white marble..."
                  rows={4}
                  className="command-input resize-none"
                />
              </div>

              <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <label className="block text-sm font-semibold mb-3">Style</label>
                <div className="grid grid-cols-2 gap-3">
                  {styleOptions.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedStyle === style.id
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className="font-medium mb-1">{style.label}</p>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <label className="block text-sm font-semibold mb-3">Aspect Ratio</label>
                <div className="flex gap-3">
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setSelectedRatio(ratio.id)}
                      className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                        selectedRatio === ratio.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{ratio.icon}</span>
                      <span className="text-xs font-medium">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <label className="block text-sm font-semibold mb-3">Reference Image (Optional)</label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drop an image or click to upload</p>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-pink-500/25"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Image
                  </>
                )}
              </button>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="glass-card p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Preview</h3>
                  {generatedImage && (
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="aspect-square rounded-xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center overflow-hidden">
                  {isGenerating ? (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Creating your masterpiece...</p>
                    </div>
                  ) : generatedImage ? (
                    <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-4">
                        <Wand2 className="w-10 h-10 text-pink-500" />
                      </div>
                      <p className="text-muted-foreground">Your generated image will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateImage;

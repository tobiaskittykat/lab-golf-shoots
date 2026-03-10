import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Plus,
  Trash2,
  Play,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface BatchItem {
  id: string;
  prompt: string;
  status: "pending" | "generating" | "complete" | "error";
  result?: string;
}

const BatchGenerate = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<BatchItem[]>([
    { id: "1", prompt: "", status: "pending" }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), prompt: "", status: "pending" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updatePrompt = (id: string, prompt: string) => {
    setItems(items.map(item => item.id === id ? { ...item, prompt } : item));
  };

  const runBatch = async () => {
    setIsRunning(true);
    for (let i = 0; i < items.length; i++) {
      if (!items[i].prompt.trim()) continue;

      setItems(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: "generating" } : item
      ));

      await new Promise(resolve => setTimeout(resolve, 1500));

      setItems(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: "complete", result: "/placeholder.svg" } : item
      ));
    }
    setIsRunning(false);
  };

  const getStatusIcon = (status: BatchItem["status"]) => {
    switch (status) {
      case "complete": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "generating": return <Clock className="w-5 h-5 text-primary animate-pulse" />;
      case "error": return <AlertCircle className="w-5 h-5 text-destructive" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-border" />;
    }
  };

  const validItems = items.filter(item => item.prompt.trim());

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:bg-secondary/80 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">Batch Generate</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{validItems.length} items</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25">
              K
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-4 mb-6 flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-400/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="font-medium">Generate multiple images at once</p>
              <p className="text-sm text-muted-foreground">Add prompts below and run them all in a single batch</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="glass-card p-4 animate-fade-in flex gap-4"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center">
                  {getStatusIcon(item.status)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                  </div>
                  <textarea
                    value={item.prompt}
                    onChange={(e) => updatePrompt(item.id, e.target.value)}
                    placeholder="Enter your prompt..."
                    rows={2}
                    disabled={isRunning}
                    className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                  />
                </div>

                {item.result && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                    <img src={item.result} alt="Result" className="w-full h-full object-cover" />
                  </div>
                )}

                <button
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1 || isRunning}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={addItem}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-border hover:border-primary/30 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add another prompt
            </button>

            <div className="flex gap-3">
              {items.some(i => i.status === "complete") && (
                <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border hover:bg-secondary transition-colors">
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              )}
              <button
                onClick={runBatch}
                disabled={validItems.length === 0 || isRunning}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-400 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/25"
              >
                <Play className="w-4 h-4" />
                {isRunning ? "Generating..." : `Generate ${validItems.length} Images`}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BatchGenerate;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Image, 
  Megaphone, 
  Wand2, 
  Layers, 
  Send,
  Cat,
  History,
  Settings,
  ChevronRight
} from "lucide-react";

const quickActions = [
  { id: "create-image", label: "Create an image", icon: Image, color: "from-pink-500 to-rose-500" },
  { id: "create-campaign", label: "Create a campaign", icon: Megaphone, color: "from-primary to-purple-400" },
  { id: "edit-image", label: "Edit an image", icon: Wand2, color: "from-blue-500 to-cyan-400" },
  { id: "batch-generate", label: "Batch generate", icon: Layers, color: "from-violet-500 to-purple-400" },
];

const recentProjects = [
  { id: 1, name: "Summer Collection Launch", type: "Campaign", date: "2 hours ago" },
  { id: 2, name: "Product Hero Shot - Necklace", type: "Image", date: "Yesterday" },
  { id: 3, name: "Holiday Sale Banner", type: "Image", date: "3 days ago" },
];

const Index = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate("/create-campaign", { state: { prompt } });
    }
  };

  const handleQuickAction = (actionId: string) => {
    navigate(`/${actionId}`);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-violet-400/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Floating shapes */}
        <div className="absolute top-32 right-1/4 w-3 h-3 bg-primary/40 rounded-full animate-float" />
        <div className="absolute top-1/2 left-20 w-2 h-2 bg-purple-400/50 rounded-full animate-float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-1/3 right-32 w-4 h-4 bg-violet-300/30 rounded-full animate-float" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-violet-400 flex items-center justify-center shadow-lg shadow-primary/25">
              <Cat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">KittyKat</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl hover:bg-secondary/80 transition-all hover:shadow-md">
              <History className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-secondary/80 transition-all hover:shadow-md">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-500 to-violet-400 flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 ring-2 ring-background">
              K
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl">
          {/* Greeting */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">AI-Powered Creative Studio</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              What would you like to{" "}
              <span className="relative">
                <span className="text-gradient">create</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                      <stop stopColor="#7c3aed"/>
                      <stop offset="1" stopColor="#a855f7"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              {" "}today?
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Describe your vision and let AI bring it to life with stunning ad creatives
            </p>
          </div>

          {/* Command Input */}
          <form onSubmit={handleSubmit} className="relative mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-violet-400 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity" />
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your ad creative... e.g., 'A lifestyle shot of our new summer jewelry collection with a beachy vibe'"
                rows={3}
                className="relative command-input resize-none pr-16 shadow-xl shadow-primary/5"
              />
            </div>
            <button
              type="submit"
              className="absolute right-4 bottom-4 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
              disabled={!prompt.trim()}
            >
              <Send className="w-5 h-5 text-primary-foreground" />
            </button>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-16 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="action-chip group hover:scale-105 hover:shadow-lg hover:shadow-primary/10 transition-all"
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  {action.label}
                </button>
              );
            })}
          </div>

          {/* Recent Projects */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 text-center uppercase tracking-wider">Recent Projects</h3>
            <div className="grid gap-3">
              {recentProjects.map((project, index) => (
                <button
                  key={project.id}
                  className="glass-card p-5 flex items-center justify-between hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all text-left group hover:-translate-y-0.5"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                      {project.type === "Campaign" ? (
                        <Megaphone className="w-5 h-5 text-primary" />
                      ) : (
                        <Image className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium mb-0.5 group-hover:text-primary transition-colors">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.type} · {project.date}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

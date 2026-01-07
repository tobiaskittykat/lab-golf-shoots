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

const Dashboard = () => {
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <Cat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">KittyKat</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <History className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-primary-foreground font-medium text-sm">
              K
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl">
          {/* Greeting */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              What would you like to <span className="text-gradient">create</span> today?
            </h1>
            <p className="text-muted-foreground text-lg">
              Describe your vision and let AI bring it to life
            </p>
          </div>

          {/* Command Input */}
          <form onSubmit={handleSubmit} className="relative mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your ad creative... e.g., 'A lifestyle shot of our new summer jewelry collection with a beachy vibe'"
              rows={3}
              className="command-input resize-none pr-14"
            />
            <button
              type="submit"
              className="absolute right-4 bottom-4 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors disabled:opacity-50"
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
                  className="action-chip group"
                >
                  <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  {action.label}
                </button>
              );
            })}
          </div>

          {/* Recent Projects */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">Recent Projects</h3>
            <div className="grid gap-3">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  className="glass-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left group"
                >
                  <div>
                    <p className="font-medium mb-0.5">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.type} · {project.date}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

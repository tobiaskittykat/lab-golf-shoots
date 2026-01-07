import { useState } from "react";
import { Globe, Instagram, Youtube, ShoppingBag, Image, Play, Check } from "lucide-react";

interface DigitalFootprintScreenProps {
  connections: {
    website: boolean;
    instagram: boolean;
    tiktok: boolean;
    pinterest: boolean;
    youtube: boolean;
    paidAds: boolean;
  };
  onChange: (connections: DigitalFootprintScreenProps["connections"]) => void;
}

const sources = [
  { id: "website", label: "Website", description: "Crawl your entire domain", icon: Globe },
  { id: "instagram", label: "Instagram", description: "Posts, reels & stories", icon: Instagram },
  { id: "tiktok", label: "TikTok", description: "Video content & trends", icon: Play },
  { id: "pinterest", label: "Pinterest", description: "Boards & pins", icon: Image },
  { id: "youtube", label: "YouTube", description: "Videos & thumbnails", icon: Youtube },
  { id: "paidAds", label: "Paid Ads Library", description: "Meta & Google ads", icon: ShoppingBag },
];

const DigitalFootprintScreen = ({ connections, onChange }: DigitalFootprintScreenProps) => {
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      onChange({ ...connections, [id]: !connections[id as keyof typeof connections] });
      setConnectingId(null);
    }, 1000);
  };

  const connectedCount = Object.values(connections).filter(Boolean).length;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Connect your digital footprint</h1>
      <p className="text-muted-foreground mb-2">
        Your channels teach me how your brand behaves in the wild — not just how it's meant to behave.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        I'll analyze patterns, top-performing content, and visual consistency.
      </p>

      <div className="space-y-4 mb-8">
        {sources.map((source) => {
          const Icon = source.icon;
          const isConnected = connections[source.id as keyof typeof connections];
          const isConnecting = connectingId === source.id;

          return (
            <div
              key={source.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                isConnected 
                  ? "bg-primary/5 border-2 border-primary" 
                  : "bg-card border border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isConnected ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">{source.label}</p>
                  <p className="text-sm text-muted-foreground">{source.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(source.id)}
                disabled={isConnecting}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isConnected
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {isConnecting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </span>
                ) : isConnected ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Connected
                  </span>
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Thumbnail Preview */}
      {connectedCount > 0 && (
        <div className="p-6 rounded-2xl bg-card border border-border">
          <p className="text-sm font-medium mb-4">Visual patterns detected</p>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse"
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            {connectedCount} source{connectedCount > 1 ? "s" : ""} connected • Analyzing content...
          </p>
        </div>
      )}
    </div>
  );
};

export default DigitalFootprintScreen;

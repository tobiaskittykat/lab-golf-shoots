import { useState } from "react";
import { Globe, Instagram, Youtube, ShoppingBag, Image, Play, Check, ExternalLink, Pencil, X, Facebook, Twitter } from "lucide-react";

interface SocialLink {
  url: string;
  connected: boolean;
}

interface DigitalFootprintScreenProps {
  connections: {
    website: SocialLink;
    instagram: SocialLink;
    tiktok: SocialLink;
    pinterest: SocialLink;
    youtube: SocialLink;
    facebook: SocialLink;
    twitter: SocialLink;
    paidAds: SocialLink;
  };
  onChange: (connections: DigitalFootprintScreenProps["connections"]) => void;
}

const sources = [
  { id: "website", label: "Website", description: "Crawl your entire domain", icon: Globe },
  { id: "instagram", label: "Instagram", description: "Posts, reels & stories", icon: Instagram },
  { id: "facebook", label: "Facebook", description: "Posts & page content", icon: Facebook },
  { id: "twitter", label: "X (Twitter)", description: "Posts & threads", icon: Twitter },
  { id: "tiktok", label: "TikTok", description: "Video content & trends", icon: Play },
  { id: "pinterest", label: "Pinterest", description: "Boards & pins", icon: Image },
  { id: "youtube", label: "YouTube", description: "Videos & thumbnails", icon: Youtube },
  { id: "paidAds", label: "Paid Ads Library", description: "Meta & Google ads", icon: ShoppingBag },
];

const DigitalFootprintScreen = ({ connections, onChange }: DigitalFootprintScreenProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = (id: string) => {
    const connection = connections[id as keyof typeof connections];
    
    if (connection.url) {
      // If there's a URL, simulate connecting
      setConnectingId(id);
      setTimeout(() => {
        onChange({
          ...connections,
          [id]: { ...connection, connected: true }
        });
        setConnectingId(null);
      }, 1000);
    } else {
      // Open edit mode to enter URL
      setEditingId(id);
      setEditValue("");
    }
  };

  const handleDisconnect = (id: string) => {
    onChange({
      ...connections,
      [id]: { url: "", connected: false }
    });
  };

  const handleEdit = (id: string) => {
    const connection = connections[id as keyof typeof connections];
    setEditingId(id);
    setEditValue(connection.url);
  };

  const handleSaveEdit = (id: string) => {
    onChange({
      ...connections,
      [id]: { url: editValue, connected: false }
    });
    setEditingId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const connectedCount = Object.values(connections).filter(c => c.connected).length;
  const foundCount = Object.values(connections).filter(c => c.url && !c.connected).length;

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Connect your digital footprint</h1>
      <p className="text-muted-foreground mb-2">
        Your channels teach me how your brand behaves in the wild — not just how it's meant to behave.
      </p>
      {foundCount > 0 && (
        <p className="text-sm text-primary mb-2">
          ✨ We found {foundCount} social profile{foundCount > 1 ? 's' : ''} from your website!
        </p>
      )}
      <p className="text-sm text-muted-foreground mb-8">
        I'll analyze patterns, top-performing content, and visual consistency.
      </p>

      <div className="space-y-4 mb-8">
        {sources.map((source) => {
          const Icon = source.icon;
          const connection = connections[source.id as keyof typeof connections];
          const isConnected = connection.connected;
          const hasUrl = Boolean(connection.url);
          const isConnecting = connectingId === source.id;
          const isEditing = editingId === source.id;

          return (
            <div
              key={source.id}
              className={`p-4 rounded-xl transition-all duration-200 ${
                isConnected 
                  ? "bg-primary/10 border-2 border-primary" 
                  : hasUrl
                  ? "bg-primary/5 border-2 border-primary/40"
                  : "bg-card border border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isConnected ? "bg-primary text-primary-foreground" : hasUrl ? "bg-primary/20 text-primary" : "bg-secondary"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{source.label}</p>
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="url"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder={`Enter ${source.label} URL`}
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(source.id)}
                          className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : hasUrl ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-muted-foreground truncate">{connection.url}</p>
                        <button
                          onClick={() => handleEdit(source.id)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <a
                          href={connection.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {isConnected ? (
                      <>
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary">
                          <Check className="w-4 h-4" />
                          Connected
                        </span>
                        <button
                          onClick={() => handleDisconnect(source.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(source.id)}
                        disabled={isConnecting}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          hasUrl
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-secondary text-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                      >
                        {isConnecting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Enabling...
                          </span>
                        ) : hasUrl ? (
                          "Enable"
                        ) : (
                          "Add Manually"
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
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

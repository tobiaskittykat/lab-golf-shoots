import { useState, useRef, useEffect, useMemo } from "react";
import { Globe, Instagram, Youtube, ShoppingBag, Image, Play, Check, ExternalLink, Pencil, X, Facebook, Twitter, Sparkles } from "lucide-react";

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

// Mock thumbnails for each platform
const mockThumbnails: Record<string, { colors: string[]; type: 'image' | 'video' }[]> = {
  website: [
    { colors: ['from-blue-400', 'to-blue-600'], type: 'image' },
    { colors: ['from-slate-300', 'to-slate-500'], type: 'image' },
    { colors: ['from-blue-300', 'to-indigo-400'], type: 'image' },
  ],
  instagram: [
    { colors: ['from-pink-400', 'to-rose-500'], type: 'image' },
    { colors: ['from-purple-400', 'to-pink-500'], type: 'image' },
    { colors: ['from-orange-400', 'to-pink-500'], type: 'image' },
    { colors: ['from-rose-400', 'to-purple-500'], type: 'image' },
  ],
  facebook: [
    { colors: ['from-blue-500', 'to-blue-700'], type: 'image' },
    { colors: ['from-blue-400', 'to-indigo-500'], type: 'image' },
  ],
  twitter: [
    { colors: ['from-sky-400', 'to-blue-500'], type: 'image' },
    { colors: ['from-slate-600', 'to-slate-800'], type: 'image' },
  ],
  tiktok: [
    { colors: ['from-pink-500', 'to-cyan-400'], type: 'video' },
    { colors: ['from-black', 'to-gray-800'], type: 'video' },
    { colors: ['from-red-400', 'to-pink-500'], type: 'video' },
  ],
  pinterest: [
    { colors: ['from-red-400', 'to-red-600'], type: 'image' },
    { colors: ['from-amber-300', 'to-orange-400'], type: 'image' },
    { colors: ['from-emerald-400', 'to-teal-500'], type: 'image' },
  ],
  youtube: [
    { colors: ['from-red-500', 'to-red-700'], type: 'video' },
    { colors: ['from-gray-700', 'to-gray-900'], type: 'video' },
    { colors: ['from-red-400', 'to-orange-500'], type: 'video' },
  ],
  paidAds: [
    { colors: ['from-green-400', 'to-emerald-500'], type: 'image' },
    { colors: ['from-yellow-400', 'to-amber-500'], type: 'image' },
  ],
};

// AI insights based on connected platforms
const getInsights = (connectedPlatforms: string[]): string[] => {
  const insights: string[] = [];
  
  if (connectedPlatforms.includes('instagram') && connectedPlatforms.includes('website')) {
    insights.push("Your social content is more expressive than your website — consider bridging the gap.");
  }
  if (connectedPlatforms.includes('tiktok') || connectedPlatforms.includes('youtube')) {
    insights.push("Video content detected — I'll analyze pacing, hooks, and visual rhythm.");
  }
  if (connectedPlatforms.includes('pinterest')) {
    insights.push("Pinterest boards reveal your aspirational aesthetic direction.");
  }
  if (connectedPlatforms.length >= 3) {
    insights.push("Strong cross-platform presence — checking for visual consistency.");
  }
  if (connectedPlatforms.includes('paidAds')) {
    insights.push("Ad creatives often diverge from organic — I'll flag any brand drift.");
  }
  
  if (insights.length === 0) {
    insights.push("Analyzing visual patterns and content themes...");
  }
  
  return insights.slice(0, 2); // Max 2 insights
};

interface VisualPatternsSectionProps {
  connections: DigitalFootprintScreenProps["connections"];
  connectedCount: number;
}

const VisualPatternsSection = ({ connections, connectedCount }: VisualPatternsSectionProps) => {
  const [visibleThumbnails, setVisibleThumbnails] = useState<number>(0);
  
  // Get connected platform IDs
  const connectedPlatforms = useMemo(() => 
    Object.entries(connections)
      .filter(([_, conn]) => conn.connected)
      .map(([id]) => id),
    [connections]
  );
  
  // Build thumbnail list from connected platforms
  const thumbnails = useMemo(() => {
    const allThumbnails: { platform: string; colors: string[]; type: 'image' | 'video'; index: number }[] = [];
    connectedPlatforms.forEach(platform => {
      const platformThumbs = mockThumbnails[platform] || [];
      platformThumbs.forEach((thumb, idx) => {
        allThumbnails.push({ platform, ...thumb, index: idx });
      });
    });
    return allThumbnails.slice(0, 12); // Max 12 thumbnails
  }, [connectedPlatforms]);
  
  // Animate thumbnails appearing
  useEffect(() => {
    if (thumbnails.length === 0) {
      setVisibleThumbnails(0);
      return;
    }
    
    // Reset and animate when thumbnails change
    setVisibleThumbnails(0);
    const timer = setInterval(() => {
      setVisibleThumbnails(prev => {
        if (prev >= thumbnails.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 150);
    
    return () => clearInterval(timer);
  }, [thumbnails.length, connectedPlatforms.join(',')]);
  
  const insights = useMemo(() => getInsights(connectedPlatforms), [connectedPlatforms]);
  const isAnalyzing = visibleThumbnails < thumbnails.length;
  
  return (
    <div className="p-6 rounded-2xl bg-card border border-border animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium">Visual patterns detected</p>
        {isAnalyzing && (
          <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Scanning...
          </span>
        )}
      </div>
      
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
        {thumbnails.map((thumb, i) => (
          <div
            key={`${thumb.platform}-${thumb.index}`}
            className={`relative aspect-square rounded-lg bg-gradient-to-br ${thumb.colors[0]} ${thumb.colors[1]} overflow-hidden transition-all duration-300 ${
              i < visibleThumbnails 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-90'
            }`}
          >
            {thumb.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
            )}
            <div className="absolute bottom-1 right-1">
              <div className="w-4 h-4 rounded bg-black/20 backdrop-blur-sm flex items-center justify-center">
                {thumb.platform === 'instagram' && <Instagram className="w-2.5 h-2.5 text-white" />}
                {thumb.platform === 'youtube' && <Youtube className="w-2.5 h-2.5 text-white" />}
                {thumb.platform === 'tiktok' && <Play className="w-2.5 h-2.5 text-white" />}
                {thumb.platform === 'pinterest' && <Image className="w-2.5 h-2.5 text-white" />}
                {thumb.platform === 'facebook' && <Facebook className="w-2.5 h-2.5 text-white" />}
                {thumb.platform === 'twitter' && <Twitter className="w-2.5 h-2.5 text-white" />}
                {thumb.platform === 'website' && <Globe className="w-2.5 h-2.5 text-white" />}
                {thumb.platform === 'paidAds' && <ShoppingBag className="w-2.5 h-2.5 text-white" />}
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty slots while loading */}
        {isAnalyzing && [...Array(Math.min(3, thumbnails.length - visibleThumbnails))].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square rounded-lg bg-muted/50 animate-pulse"
          />
        ))}
      </div>
      
      {/* AI Insights */}
      {!isAnalyzing && insights.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-border">
          {insights.map((insight, i) => (
            <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary shrink-0">✦</span>
              {insight}
            </p>
          ))}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        {connectedCount} source{connectedCount > 1 ? "s" : ""} connected • {visibleThumbnails} assets analyzed
      </p>
    </div>
  );
};

const DigitalFootprintScreen = ({ connections, onChange }: DigitalFootprintScreenProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);
  
  // Keep a ref to always have the latest connections for async operations
  const connectionsRef = useRef(connections);
  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  const handleConnect = (id: string) => {
    const connection = connections[id as keyof typeof connections];
    
    if (connection.url) {
      // If there's a URL, simulate connecting
      setConnectingId(id);
      setTimeout(() => {
        // Use ref to get the latest connections state
        const currentConnections = connectionsRef.current;
        const currentConnection = currentConnections[id as keyof typeof currentConnections];
        onChange({
          ...currentConnections,
          [id]: { ...currentConnection, connected: true }
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
    const connection = connections[id as keyof typeof connections];
    onChange({
      ...connections,
      [id]: { ...connection, connected: false }
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
          ✨ We found {foundCount} social profile{foundCount > 1 ? 's' : ''} from your website — click Connect to enable them.
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{source.label}</p>
                      {hasUrl && !isConnected && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          Found
                        </span>
                      )}
                    </div>
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
                            Connecting...
                          </span>
                        ) : hasUrl ? (
                          "Connect"
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

      {/* Visual Patterns Detected */}
      {connectedCount > 0 && (
        <VisualPatternsSection 
          connections={connections} 
          connectedCount={connectedCount} 
        />
      )}
    </div>
  );
};

export default DigitalFootprintScreen;

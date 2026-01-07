import { Check, Sparkles, Palette, MessageSquare, Shield, Database, Brain } from "lucide-react";

interface SummaryScreenProps {
  brandData: {
    basics: { name: string; personality: string };
    connections: Record<string, boolean>;
    guardrails: { photographyStyle: string };
    voiceTone: { formalCasual: number; emotionalRational: number; boldSubtle: number };
    files: File[];
  };
}

const SummaryScreen = ({ brandData }: SummaryScreenProps) => {
  const connectedCount = Object.values(brandData.connections).filter(Boolean).length;
  
  const getVoiceDescription = () => {
    const { formalCasual, emotionalRational, boldSubtle } = brandData.voiceTone;
    const parts = [];
    
    if (formalCasual < 35) parts.push("Formal");
    else if (formalCasual > 65) parts.push("Casual");
    
    if (emotionalRational < 35) parts.push("Emotional");
    else if (emotionalRational > 65) parts.push("Rational");
    
    if (boldSubtle < 35) parts.push("Bold");
    else if (boldSubtle > 65) parts.push("Subtle");
    
    return parts.length > 0 ? parts.join(", ") : "Balanced";
  };

  const summaryCards = [
    {
      icon: Sparkles,
      title: "Visual DNA",
      status: "Learned",
      details: brandData.basics.personality 
        ? `${brandData.basics.personality.charAt(0).toUpperCase() + brandData.basics.personality.slice(1)} personality`
        : "Defined",
    },
    {
      icon: MessageSquare,
      title: "Brand Voice",
      status: "Configured",
      details: getVoiceDescription(),
    },
    {
      icon: Shield,
      title: "Guardrails",
      status: "Active",
      details: brandData.guardrails.photographyStyle 
        ? `${brandData.guardrails.photographyStyle.charAt(0).toUpperCase() + brandData.guardrails.photographyStyle.slice(1)} photography`
        : "Set",
    },
    {
      icon: Database,
      title: "Sources Ingested",
      status: "Processing",
      details: `${brandData.files.length} files, ${connectedCount} channels`,
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Status Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium text-green-600">Brand Brain v1.0 Ready</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        {brandData.basics.name ? `${brandData.basics.name}'s` : "Your"} Brand Brain is ready
      </h1>
      <p className="text-muted-foreground mb-8">
        Here's everything I've learned about your brand.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title}
              className="p-5 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">{card.status}</span>
                </div>
              </div>
              <p className="font-medium">{card.title}</p>
              <p className="text-sm text-muted-foreground">{card.details}</p>
            </div>
          );
        })}
      </div>

      {/* AI Message */}
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium mb-2">I'll keep learning</p>
            <p className="text-sm text-muted-foreground">
              Your Brand Brain will improve with every campaign, asset, and performance signal. 
              The more we work together, the better I understand your brand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryScreen;

import { Cat, Sparkles, Brain, Shield, Zap } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
  onStartManual?: () => void;
}

const WelcomeScreen = ({ onStart, onStartManual }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Cat className="w-12 h-12 text-primary" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold mb-4">
          Let's build your <span className="text-gradient">Brand Brain</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
          I'm KittyKat, your AI visual specialist. Just give me your website URL and I'll automatically extract your brand identity — colors, tone, social profiles, and more.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-4">
            <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Auto-Extract</p>
            <p className="text-xs text-muted-foreground">From your website</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <Brain className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">AI Analysis</p>
            <p className="text-xs text-muted-foreground">Tone & personality</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Review & Edit</p>
            <p className="text-xs text-muted-foreground">You stay in control</p>
          </div>
        </div>

        {/* CTAs */}
        <button onClick={onStart} className="btn-primary text-lg px-8 py-4">
          Start with my website URL
        </button>

        {onStartManual && (
          <button
            onClick={onStartManual}
            className="block mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Or set up manually →
          </button>
        )}

        <p className="text-sm text-muted-foreground mt-6">
          Takes about 2 minutes · AI-powered setup
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;

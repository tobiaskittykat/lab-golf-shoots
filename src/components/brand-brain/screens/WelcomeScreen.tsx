import { Cat, Sparkles, Brain, Shield } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
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
          I'm KittyKat, your AI visual specialist. Over the next few minutes, I'll learn how your brand looks, feels, and behaves — so I can create on-brand content at scale.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-4">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Visual DNA</p>
            <p className="text-xs text-muted-foreground">Colors, typography, imagery</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <Brain className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Brand Voice</p>
            <p className="text-xs text-muted-foreground">Tone, personality, style</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Guardrails</p>
            <p className="text-xs text-muted-foreground">Rules & boundaries</p>
          </div>
        </div>

        {/* CTA */}
        <button onClick={onStart} className="btn-primary text-lg px-8 py-4">
          Start training my Brand Brain
        </button>

        <p className="text-sm text-muted-foreground mt-6">
          Takes about 10-15 minutes · Save anytime
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;

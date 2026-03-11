import { Sparkles, PenLine } from "lucide-react";
import kittykatLogo from "@/assets/kittykat-logo-transparent.png";
interface WelcomeScreenProps { onStart: () => void; onStartManual: () => void; }
const WelcomeScreen = ({ onStart, onStartManual }: WelcomeScreenProps) => (
  <div className="min-h-screen bg-background flex items-center justify-center px-6">
    <div className="max-w-lg text-center space-y-8">
      <img src={kittykatLogo} alt="KittyKat" className="h-16 w-16 mx-auto" />
      <div><h1 className="font-display text-3xl font-bold mb-3">Set up your <span className="text-gradient">Brand</span></h1><p className="text-muted-foreground text-lg">Let's configure your brand identity for on-brand content.</p></div>
      <div className="grid gap-4">
        <button onClick={onStart} className="glass-card p-6 text-left hover:border-primary/40 transition-all group"><div className="flex items-start gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"><Sparkles className="w-6 h-6 text-primary"/></div><div><h3 className="font-semibold text-lg mb-1">AI-Guided Setup</h3><p className="text-sm text-muted-foreground">Paste your website URL and AI will extract your brand identity.</p></div></div></button>
        <button onClick={onStartManual} className="glass-card p-6 text-left hover:border-primary/40 transition-all group"><div className="flex items-start gap-4"><div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"><PenLine className="w-6 h-6 text-foreground"/></div><div><h3 className="font-semibold text-lg mb-1">Manual Setup</h3><p className="text-sm text-muted-foreground">Fill in your brand details step by step.</p></div></div></button>
      </div>
    </div>
  </div>
);
export default WelcomeScreen;

import { ReactNode } from "react";
import { ArrowLeft, ArrowRight, X, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import kittykatLogo from "@/assets/kittykat-logo-transparent.png";

interface BrandBrainLayoutProps {
  currentStep: number; totalSteps: number; onBack: () => void; onNext: () => void; onSkip?: () => void; onCancel: () => void; nextLabel?: string; showBack?: boolean; showSkip?: boolean; children: ReactNode;
}

const BrandBrainLayout = ({ currentStep, totalSteps, onBack, onNext, onSkip, onCancel, nextLabel = "Continue", showBack = true, showSkip = false, children }: BrandBrainLayoutProps) => {
  const stepLabels = ["Brand Basics", "Upload Assets", "Digital Footprint", "Summary"];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><img src={kittykatLogo} alt="KittyKat" className="h-8 w-8" /><span className="font-display text-lg font-bold">Brand Setup</span></div>
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
      </header>
      <div className="border-b border-border"><div className="max-w-3xl mx-auto px-6 py-3"><div className="flex items-center gap-2">{stepLabels.map((label, i) => (<div key={i} className="flex items-center gap-2 flex-1"><div className={`flex items-center gap-2 text-sm ${i+1<=currentStep?'text-primary font-medium':'text-muted-foreground'}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${i+1<currentStep?'bg-primary text-primary-foreground':i+1===currentStep?'border-2 border-primary text-primary':'border-2 border-border text-muted-foreground'}`}>{i+1}</div><span className="hidden sm:inline">{label}</span></div>{i<stepLabels.length-1&&<div className={`flex-1 h-0.5 ${i+1<currentStep?'bg-primary':'bg-border'}`}/>}</div>))}</div></div></div>
      <main className="flex-1 overflow-y-auto"><div className="max-w-3xl mx-auto px-6 py-8">{children}</div></main>
      <footer className="border-t border-border px-6 py-4"><div className="max-w-3xl mx-auto flex items-center justify-between"><div>{showBack&&<Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4"/>Back</Button>}</div><div className="flex items-center gap-3">{showSkip&&onSkip&&<Button variant="ghost" onClick={onSkip} className="gap-2 text-muted-foreground">Skip<SkipForward className="w-4 h-4"/></Button>}<Button onClick={onNext} className="gap-2">{nextLabel}<ArrowRight className="w-4 h-4"/></Button></div></div></footer>
    </div>
  );
};
export default BrandBrainLayout;

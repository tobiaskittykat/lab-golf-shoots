// Stub - BrandBrainLayout
import { ReactNode } from "react";

interface BrandBrainLayoutProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onCancel: () => void;
  nextLabel: string;
  showBack: boolean;
  showSkip: boolean;
  children: ReactNode;
}

export default function BrandBrainLayout({ currentStep, totalSteps, onBack, onNext, onSkip, onCancel, nextLabel, showBack, showSkip, children }: BrandBrainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`w-8 h-1 rounded-full ${i + 1 <= currentStep ? 'bg-accent' : 'bg-muted'}`} />
          ))}
        </div>
        {showSkip && <button onClick={onSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Skip</button>}
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-8 max-w-2xl mx-auto w-full">
        {children}
      </main>
      <footer className="border-t border-border px-6 py-4 flex items-center justify-between">
        {showBack ? (
          <button onClick={onBack} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">Back</button>
        ) : <div />}
        <button onClick={onNext} className="px-6 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-colors">{nextLabel}</button>
      </footer>
    </div>
  );
}

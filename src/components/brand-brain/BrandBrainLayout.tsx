import { ReactNode } from "react";
import { Cat, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BrandBrainLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  agentMessage: string;
  agentThinking?: boolean;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  showSkip?: boolean;
}

const BrandBrainLayout = ({
  children,
  currentStep,
  totalSteps,
  agentMessage,
  agentThinking = false,
  onBack,
  onNext,
  onSkip,
  nextLabel = "Continue",
  showBack = true,
  showSkip = true,
}: BrandBrainLayoutProps) => {
  const navigate = useNavigate();
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Cat className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">KittyKat</span>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Brand Brain Training:</span>
          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-primary">{progress}%</span>
        </div>

        {/* Save & Exit */}
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Save className="w-4 h-4" />
          Save & Exit
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-12">
            {children}
          </div>
        </main>

        {/* AI Agent Panel */}
        <aside className="w-80 border-l border-border bg-secondary/30 p-6 hidden lg:flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Cat className="w-7 h-7 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <p className="font-medium">KittyKat</p>
              <p className="text-xs text-muted-foreground">Brand Brain Agent</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              {agentThinking && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-muted-foreground">Learning...</span>
                </div>
              )}
              <p className="text-sm text-foreground/80 leading-relaxed">{agentMessage}</p>
            </div>
          </div>

          {/* Learning Stats */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Learning Progress</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Visual DNA</span>
                <span className="text-foreground">{currentStep >= 3 ? "Analyzing" : "Waiting"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Brand Voice</span>
                <span className="text-foreground">{currentStep >= 6 ? "Learning" : "Waiting"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guardrails</span>
                <span className="text-foreground">{currentStep >= 5 ? "Configuring" : "Waiting"}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Navigation */}
      <footer className="h-20 border-t border-border px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <div>
          {showBack && currentStep > 0 && onBack && (
            <button onClick={onBack} className="btn-secondary">
              Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {showSkip && onSkip && (
            <button 
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          )}
          <button onClick={onNext} className="btn-primary">
            {nextLabel}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default BrandBrainLayout;

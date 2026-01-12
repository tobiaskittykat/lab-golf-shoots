import { ReactNode } from "react";
import { Cat, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BrandBrainLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onNext: () => void;
  onSkip?: () => void;
  onSaveAndExit?: () => void;
  onCancel?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  showSkip?: boolean;
}

const BrandBrainLayout = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  onSaveAndExit,
  onCancel,
  nextLabel = "Continue",
  showBack = true,
  showSkip = true,
}: BrandBrainLayoutProps) => {
  const navigate = useNavigate();
  const progress = Math.round((currentStep / totalSteps) * 100);

  const handleSaveAndExit = () => {
    if (onSaveAndExit) {
      onSaveAndExit();
    }
    navigate("/");
  };

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

        {/* Actions */}
        <div className="flex items-center gap-4">
          {onCancel && (
            <button 
              onClick={onCancel}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button 
            onClick={handleSaveAndExit}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Save className="w-4 h-4" />
            Save & Exit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {children}
        </div>
      </main>

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

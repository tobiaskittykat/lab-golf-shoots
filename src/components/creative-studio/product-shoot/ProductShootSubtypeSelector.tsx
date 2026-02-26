import { Sparkles, RefreshCw, Package } from "lucide-react";
import { ShootMode } from "./types";

interface ProductShootSubtypeSelectorProps {
  // New API: onSelectMode callback for integration with wizard
  onSelectMode?: (mode: ShootMode) => void;
  // Legacy API: controlled mode
  selectedMode?: ShootMode;
  onModeSelect?: (mode: ShootMode) => void;
}

export const ProductShootSubtypeSelector = ({ 
  onSelectMode,
  selectedMode, 
  onModeSelect 
}: ProductShootSubtypeSelectorProps) => {
  // Use new callback if provided, otherwise fall back to legacy
  const handleSelect = (mode: ShootMode) => {
    if (onSelectMode) {
      onSelectMode(mode);
    } else if (onModeSelect) {
      onModeSelect(mode);
    }
  };
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          What would you like to create?
        </h2>
        <p className="text-muted-foreground">
          Start fresh, remix an existing shoot, or set up a new product
        </p>
      </div>
      
      <div className="flex gap-4 w-full max-w-lg">
        {/* New Shoot Card */}
        <button
          onClick={() => handleSelect('new')}
          className={`flex-1 p-6 rounded-2xl border-2 transition-all duration-200 text-left group ${
            selectedMode === 'new'
              ? 'border-accent bg-accent/10 shadow-md'
              : 'border-border bg-card hover:border-accent/40 hover:shadow-sm'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            selectedMode === 'new'
              ? 'bg-accent text-accent-foreground'
              : 'bg-muted text-muted-foreground group-hover:bg-accent/20'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">New Shoot</h3>
          <p className="text-sm text-muted-foreground">
            Choose your product, background, and model from scratch
          </p>
        </button>
        
        {/* Remix Existing Card */}
        <button
          onClick={() => handleSelect('remix')}
          className={`flex-1 p-6 rounded-2xl border-2 transition-all duration-200 text-left group ${
            selectedMode === 'remix'
              ? 'border-accent bg-accent/10 shadow-md'
              : 'border-border bg-card hover:border-accent/40 hover:shadow-sm'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            selectedMode === 'remix'
              ? 'bg-accent text-accent-foreground'
              : 'bg-muted text-muted-foreground group-hover:bg-accent/20'
          }`}>
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Remix Existing</h3>
          <p className="text-sm text-muted-foreground">
            Upload an ad creative and swap the shoes with your product
          </p>
        </button>
        
        {/* Set Up Product Card */}
        <button
          onClick={() => handleSelect('setup')}
          className={`flex-1 p-6 rounded-2xl border-2 transition-all duration-200 text-left group ${
            selectedMode === 'setup'
              ? 'border-accent bg-accent/10 shadow-md'
              : 'border-border bg-card hover:border-accent/40 hover:shadow-sm'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
            selectedMode === 'setup'
              ? 'bg-accent text-accent-foreground'
              : 'bg-muted text-muted-foreground group-hover:bg-accent/20'
          }`}>
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Set Up Product</h3>
          <p className="text-sm text-muted-foreground">
            Create a new colorway from an existing shoe
          </p>
        </button>
      </div>
    </div>
  );
};

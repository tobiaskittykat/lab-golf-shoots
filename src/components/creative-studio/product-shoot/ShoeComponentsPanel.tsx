import React from 'react';
import { RefreshCw, Loader2, AlertCircle, Sparkles, ImageOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoeComponents, 
  ComponentOverrides, 
  ComponentType, 
  COMPONENT_LABELS,
  ShoeComponent,
} from '@/lib/birkenstockMaterials';
import { ComponentOverridePopover } from './ComponentOverridePopover';
import { cn } from '@/lib/utils';

interface ShoeComponentsPanelProps {
  components: ShoeComponents | null;
  overrides: ComponentOverrides;
  onOverrideChange: (type: ComponentType, override: { material: string; color: string; colorHex?: string } | null) => void;
  onResetAll: () => void;
  attachReferenceImages: boolean;
  onAttachReferenceImagesChange: (attach: boolean) => void;
  isLoading?: boolean;
  isAnalyzing?: boolean;
  onTriggerAnalysis?: () => void;
  error?: string | null;
}

// Color swatch component
function ColorSwatch({ hex, size = 'sm' }: { hex?: string; size?: 'sm' | 'md' }) {
  if (!hex) return null;
  
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div
      className={cn(
        sizeClasses,
        'rounded border border-border/50 flex-shrink-0'
      )}
      style={{ backgroundColor: hex }}
      title={hex}
    />
  );
}

// Single component row
function ComponentRow({
  type,
  component,
  override,
  onOverrideChange,
}: {
  type: ComponentType;
  component: ShoeComponent | null | undefined;
  override?: { material: string; color: string; colorHex?: string };
  onOverrideChange: (override: { material: string; color: string; colorHex?: string } | null) => void;
}) {
  const displayMaterial = override?.material || component?.material || 'Unknown';
  const displayColor = override?.color || component?.color || 'Unknown';
  const displayHex = override?.colorHex || component?.colorHex;
  const isOverridden = !!override;

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border transition-colors',
        isOverridden 
          ? 'border-accent/50 bg-accent/5' 
          : 'border-border/40 bg-muted/20 hover:bg-muted/30'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <ColorSwatch hex={displayHex} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {COMPONENT_LABELS[type]}
            </span>
            {isOverridden && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-medium">
                Modified
              </span>
            )}
          </div>
          <p className="text-sm text-foreground truncate">
            {displayMaterial} • {displayColor}
          </p>
        </div>
      </div>

      <ComponentOverridePopover
        componentType={type}
        currentMaterial={component?.material || ''}
        currentColor={component?.color || ''}
        currentColorHex={component?.colorHex}
        override={override}
        onApply={onOverrideChange}
      />
    </div>
  );
}

export function ShoeComponentsPanel({
  components,
  overrides,
  onOverrideChange,
  onResetAll,
  attachReferenceImages,
  onAttachReferenceImagesChange,
  isLoading = false,
  isAnalyzing = false,
  onTriggerAnalysis,
  error,
}: ShoeComponentsPanelProps) {
  const componentTypes: ComponentType[] = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'];
  const hasOverrides = Object.keys(overrides).length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-card/50">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Analyzing state
  if (isAnalyzing) {
    return (
      <div className="p-6 rounded-xl border border-border/50 bg-card/50 text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-accent" />
        <p className="font-medium">Analyzing shoe components...</p>
        <p className="text-sm text-muted-foreground mt-1">
          AI is identifying materials, colors, and details
        </p>
      </div>
    );
  }

  // No components yet
  if (!components) {
    return (
      <div className="p-6 rounded-xl border border-dashed border-border/50 bg-card/50 text-center">
        <Sparkles className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="font-medium text-foreground">Component Analysis Available</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Analyze this product to customize materials and colors
        </p>
        {onTriggerAnalysis && (
          <Button variant="outline" size="sm" onClick={onTriggerAnalysis}>
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze Components
          </Button>
        )}
        {error && (
          <p className="text-xs text-destructive mt-3 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  // Filter to only show components that exist
  const existingComponents = componentTypes.filter(type => {
    const comp = components[type];
    return comp && comp.material;
  });

  return (
    <div className="space-y-4">
      {/* Header with reference toggle */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Shoe Components</h4>
        <div className="flex items-center gap-3">
          {hasOverrides && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetAll}
              className="text-xs h-7 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset All
            </Button>
          )}
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <ImageOff className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Ref. Images</span>
            <Switch
              checked={attachReferenceImages}
              onCheckedChange={onAttachReferenceImagesChange}
            />
          </div>
        </div>
      </div>

      {/* Component rows */}
      <div className="space-y-2">
        {existingComponents.map(type => (
          <ComponentRow
            key={type}
            type={type}
            component={components[type]}
            override={overrides[type]}
            onOverrideChange={(override) => onOverrideChange(type, override)}
          />
        ))}
      </div>

      {/* Info text */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        💡 Override any component to customize before generation
        <br />
        <span className="text-muted-foreground/70">No overrides = exact product reproduction</span>
      </p>

      {/* Re-analyze button */}
      {onTriggerAnalysis && (
        <div className="pt-2 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTriggerAnalysis}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Re-analyze Components
          </Button>
        </div>
      )}
    </div>
  );
}

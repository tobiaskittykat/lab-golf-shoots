import React from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface QuickCustomizationInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  isProcessing: boolean;
  error?: string | null;
  disabled?: boolean;
}

export function QuickCustomizationInput({
  input,
  onInputChange,
  onApply,
  onClear,
  isProcessing,
  error,
  disabled = false,
}: QuickCustomizationInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim() && !isProcessing && !disabled) {
      e.preventDefault();
      onApply();
    }
    if (e.key === 'Escape') {
      onClear();
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
        <Input
          placeholder="Describe changes... e.g. 'all black leather with white sole'"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-24 bg-muted/30 border-border/50 focus:border-accent"
          disabled={isProcessing || disabled}
        />
        {input && !isProcessing && (
          <button
            onClick={onClear}
            className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        <Button
          size="sm"
          onClick={onApply}
          disabled={!input.trim() || isProcessing || disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              <span className="sr-only md:not-sr-only">Applying</span>
            </>
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive pl-1">{error}</p>
      )}
      <p className="text-[10px] text-muted-foreground pl-1">
        Examples: "hot pink upper" • "white sole" • "all black leather" • "vegan taupe"
      </p>
    </div>
  );
}

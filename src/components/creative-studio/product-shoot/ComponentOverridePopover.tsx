import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, RotateCcw, Pipette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ComponentType, 
  getMaterialsForComponent, 
  COLOR_PRESETS,
  findColorPreset,
} from '@/lib/birkenstockMaterials';
import { cn } from '@/lib/utils';

interface ComponentOverridePopoverProps {
  componentType: ComponentType;
  currentMaterial: string;
  currentColor: string;
  currentColorHex?: string;
  override?: { material: string; color: string; colorHex?: string };
  onApply: (override: { material: string; color: string; colorHex?: string } | null) => void;
}

export function ComponentOverridePopover({
  componentType,
  currentMaterial,
  currentColor,
  currentColorHex,
  override,
  onApply,
}: ComponentOverridePopoverProps) {
  const [open, setOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(override?.material || currentMaterial);
  const [selectedColor, setSelectedColor] = useState(override?.color || currentColor);
  const [selectedHex, setSelectedHex] = useState(override?.colorHex || currentColorHex || '');
  const [customHex, setCustomHex] = useState('');

  const materials = getMaterialsForComponent(componentType);
  const isModified = selectedMaterial !== currentMaterial || selectedColor !== currentColor;

  // Reset local state when popover opens
  useEffect(() => {
    if (open) {
      setSelectedMaterial(override?.material || currentMaterial);
      setSelectedColor(override?.color || currentColor);
      setSelectedHex(override?.colorHex || currentColorHex || '');
      setCustomHex('');
    }
  }, [open, override, currentMaterial, currentColor, currentColorHex]);

  const handleColorPresetClick = (preset: typeof COLOR_PRESETS[number]) => {
    setSelectedColor(preset.name);
    setSelectedHex(preset.hex);
    setCustomHex('');
  };

  const handleCustomHexChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const preset = findColorPreset(hex);
      setSelectedColor(preset?.name || 'Custom');
      setSelectedHex(hex);
    }
  };

  const handleApply = () => {
    if (isModified) {
      onApply({
        material: selectedMaterial,
        color: selectedColor,
        colorHex: selectedHex || undefined,
      });
    } else {
      onApply(null);
    }
    setOpen(false);
  };

  const handleReset = () => {
    setSelectedMaterial(currentMaterial);
    setSelectedColor(currentColor);
    setSelectedHex(currentColorHex || '');
    onApply(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'text-xs h-7 gap-1',
            override ? 'text-accent' : 'text-muted-foreground'
          )}
        >
          {override ? 'Edit' : 'Override'}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          {/* Material Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Material
            </Label>
            <RadioGroup
              value={selectedMaterial}
              onValueChange={setSelectedMaterial}
              className="grid grid-cols-2 gap-1.5"
            >
              {materials.map((mat) => (
                <div key={mat.value} className="flex items-center">
                  <RadioGroupItem
                    value={mat.value}
                    id={`${componentType}-mat-${mat.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`${componentType}-mat-${mat.value}`}
                    className={cn(
                      'flex items-center justify-between w-full px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors',
                      selectedMaterial === mat.value
                        ? 'border-accent bg-accent/10 text-foreground'
                        : 'border-border/50 hover:border-border hover:bg-muted/30 text-muted-foreground'
                    )}
                  >
                    <span className="truncate">{mat.label}</span>
                    {mat.value === currentMaterial && (
                      <span className="text-[9px] text-muted-foreground ml-1">(current)</span>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Color
            </Label>
            
            {/* Color swatches */}
            <div className="grid grid-cols-5 gap-1.5">
              {COLOR_PRESETS.slice(0, 10).map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleColorPresetClick(preset)}
                  className={cn(
                    'relative w-full aspect-square rounded-md border-2 transition-all',
                    selectedColor === preset.name
                      ? 'border-accent ring-1 ring-accent/30 scale-105'
                      : 'border-transparent hover:border-border'
                  )}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                >
                  {selectedColor === preset.name && (
                    <Check className="w-3 h-3 absolute inset-0 m-auto text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>

            {/* Show more colors */}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                More colors...
              </summary>
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {COLOR_PRESETS.slice(10).map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleColorPresetClick(preset)}
                    className={cn(
                      'relative w-full aspect-square rounded-md border-2 transition-all',
                      selectedColor === preset.name
                        ? 'border-accent ring-1 ring-accent/30 scale-105'
                        : 'border-transparent hover:border-border'
                    )}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  >
                    {selectedColor === preset.name && (
                      <Check className="w-3 h-3 absolute inset-0 m-auto text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </details>

            {/* Custom hex input */}
            <div className="flex items-center gap-2 pt-2">
              <div className="relative flex-1">
                <Pipette className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="#FFFFFF"
                  value={customHex}
                  onChange={(e) => handleCustomHexChange(e.target.value)}
                  className="pl-8 h-8 text-xs font-mono"
                  maxLength={7}
                />
              </div>
              {selectedHex && (
                <div
                  className="w-8 h-8 rounded-md border border-border"
                  style={{ backgroundColor: selectedHex }}
                />
              )}
            </div>
            
            <p className="text-[10px] text-muted-foreground">
              Selected: {selectedColor} {selectedHex && `(${selectedHex})`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs h-8"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="text-xs h-8"
              disabled={!isModified && !override}
            >
              <Check className="w-3 h-3 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useState } from "react";
import { X, Loader2, Check, Paintbrush, Wand2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecolorOption, colorPresets } from "./types";

interface ProductRecolorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImageUrl: string;
  productName: string;
  onRecolor: (option: RecolorOption, targetColor: string) => Promise<string | null>;
  currentOption: RecolorOption;
  currentColor?: string;
}

export const ProductRecolorModal = ({
  isOpen,
  onClose,
  productImageUrl,
  productName,
  onRecolor,
  currentOption,
  currentColor,
}: ProductRecolorModalProps) => {
  const [selectedColor, setSelectedColor] = useState(currentColor || '');
  const [customColor, setCustomColor] = useState('');
  const [recolorOption, setRecolorOption] = useState<RecolorOption>(currentOption || 'during-generation');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setCustomColor('');
  };

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value);
    setSelectedColor('');
  };

  const finalColor = customColor || selectedColor;

  const handleApply = async () => {
    if (!finalColor) return;
    
    if (recolorOption === 'pre-generation') {
      setIsProcessing(true);
      const newUrl = await onRecolor('pre-generation', finalColor);
      setIsProcessing(false);
      if (newUrl) {
        setPreviewUrl(newUrl);
      }
    } else {
      await onRecolor('during-generation', finalColor);
      onClose();
    }
  };

  const handleConfirmPreview = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paintbrush className="w-5 h-5 text-accent" />
            Recolor Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Product Preview */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">Original</div>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img 
                  src={productImageUrl} 
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {previewUrl && (
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Recolored</div>
                <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-accent">
                  <img 
                    src={previewUrl} 
                    alt={`${productName} - recolored`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recolor Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Recolor Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRecolorOption('pre-generation')}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  recolorOption === 'pre-generation'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wand2 className="w-4 h-4 text-accent" />
                  <span className="font-medium text-sm">Recolor Now</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  AI creates a new color variant before generation
                </p>
              </button>
              
              <button
                onClick={() => setRecolorOption('during-generation')}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  recolorOption === 'during-generation'
                    ? 'border-accent bg-accent/10'
                    : 'border-border hover:border-accent/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Paintbrush className="w-4 h-4 text-accent" />
                  <span className="font-medium text-sm">Apply During Gen</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tell AI to use this color in the final image
                </p>
              </button>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Target Color</label>
            
            {/* Preset Colors */}
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleColorSelect(preset.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === preset.value
                      ? 'border-accent ring-2 ring-accent/30'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                >
                  {selectedColor === preset.value && (
                    <Check className={`w-4 h-4 mx-auto ${
                      preset.value === '#FFFFFF' || preset.value === '#FFD700' 
                        ? 'text-black' 
                        : 'text-white'
                    }`} />
                  )}
                </button>
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="flex gap-2">
              <Input
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="Or type a color (e.g., 'cobalt blue', '#3366CC')"
                className="flex-1"
              />
              {customColor && (
                <div 
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: customColor.startsWith('#') ? customColor : undefined }}
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            
            {previewUrl ? (
              <Button onClick={handleConfirmPreview} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Use This Color
              </Button>
            ) : (
              <Button 
                onClick={handleApply} 
                disabled={!finalColor || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {recolorOption === 'pre-generation' ? 'Generate Preview' : 'Apply Color'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

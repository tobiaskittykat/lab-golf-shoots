import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { df3iColors, df3iAlignmentMarks, type PutterColor, type AlignmentMark } from "@/lib/labGolfVariants";

interface PutterVariantSelectorProps {
  selectedColor?: string;
  selectedAlignmentMark?: string;
  onColorChange: (colorId: string) => void;
  onAlignmentMarkChange: (markId: string) => void;
}

export const PutterVariantSelector = ({
  selectedColor,
  selectedAlignmentMark,
  onColorChange,
  onAlignmentMarkChange,
}: PutterVariantSelectorProps) => {
  return (
    <div className="space-y-4">
      {/* Putter Color */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Putter Color</label>
        <div className="flex flex-wrap gap-2">
          {df3iColors.map((color) => {
            const isSelected = selectedColor === color.id;
            return (
              <button
                key={color.id}
                onClick={() => onColorChange(color.id)}
                title={color.name}
                className={cn(
                  "w-9 h-9 rounded-full border-2 transition-all relative flex items-center justify-center",
                  isSelected
                    ? "border-accent ring-2 ring-accent/30 scale-110"
                    : "border-border hover:border-muted-foreground/50 hover:scale-105"
                )}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
        {selectedColor && (
          <p className="text-[11px] text-muted-foreground">
            {df3iColors.find(c => c.id === selectedColor)?.name}
          </p>
        )}
      </div>

      {/* Alignment Mark */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Alignment Mark</label>
        <div className="flex gap-2">
          {df3iAlignmentMarks.map((mark) => {
            const isSelected = selectedAlignmentMark === mark.id;
            return (
              <button
                key={mark.id}
                onClick={() => onAlignmentMarkChange(mark.id)}
                title={mark.name}
                className={cn(
                  "w-16 h-16 rounded-lg border-2 overflow-hidden transition-all",
                  isSelected
                    ? "border-accent ring-2 ring-accent/30 scale-105"
                    : "border-border hover:border-muted-foreground/50 hover:scale-105"
                )}
              >
                <img
                  src={mark.thumbnail}
                  alt={mark.name}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
        {selectedAlignmentMark && (
          <p className="text-[11px] text-muted-foreground">
            {df3iAlignmentMarks.find(m => m.id === selectedAlignmentMark)?.name}
          </p>
        )}
      </div>
    </div>
  );
};

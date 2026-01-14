import { useState } from "react";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { Check, Expand } from "lucide-react";
import { Moodboard } from "./types";

interface MoodboardThumbnailProps {
  moodboard: Moodboard;
  isSelected: boolean;
  onSelect: () => void;
}

export const MoodboardThumbnail = ({ 
  moodboard, 
  isSelected, 
  onSelect 
}: MoodboardThumbnailProps) => {
  const [isFullView, setIsFullView] = useState(false);

  return (
    <>
      <button
        onClick={onSelect}
        className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all hover:shadow-md ${
          isSelected
            ? 'border-accent ring-2 ring-accent/30 shadow-md'
            : 'border-border hover:border-accent/50'
        }`}
      >
        {/* Gradient Background */}
        <div 
          className="absolute inset-0"
          style={{ background: moodboard.thumbnail }}
        />
        
        {/* Gradient overlay for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <h4 className="font-medium text-white text-xs leading-tight">{moodboard.name}</h4>
        </div>

        {/* Selected check */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-3 h-3 text-accent-foreground" />
          </div>
        )}

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullView(true);
          }}
          className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          <Expand className="w-3 h-3 text-white" />
        </button>
      </button>

      {/* Full View Dialog */}
      <Dialog open={isFullView} onOpenChange={setIsFullView}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div 
            className="aspect-video w-full"
            style={{ background: moodboard.thumbnail }}
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg">{moodboard.name}</h3>
            {moodboard.description && (
              <p className="text-sm text-muted-foreground mt-1">{moodboard.description}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

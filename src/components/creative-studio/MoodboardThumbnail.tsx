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
  size?: 'default' | 'large';
}

export const MoodboardThumbnail = ({ 
  moodboard, 
  isSelected, 
  onSelect,
  size = 'default'
}: MoodboardThumbnailProps) => {
  const [isFullView, setIsFullView] = useState(false);

  // Toggle selection - clicking selected moodboard deselects it
  const handleClick = () => {
    onSelect(); // Parent will handle toggle logic
  };

  const isLarge = size === 'large';

  return (
    <>
      <button
        onClick={handleClick}
        className={`group relative rounded-xl overflow-hidden border-2 transition-all hover:shadow-md ${
          isLarge ? 'aspect-[4/3]' : 'aspect-[4/3]'
        } ${
          isSelected
            ? 'border-accent ring-2 ring-accent/30 shadow-md'
            : 'border-border hover:border-accent/50'
        }`}
      >
        {/* Background Image */}
        <img 
          src={moodboard.thumbnail} 
          alt={moodboard.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient overlay for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Content */}
        <div className={`absolute bottom-0 left-0 right-0 ${isLarge ? 'p-4' : 'p-2.5'}`}>
          <h4 className={`font-medium text-white leading-tight ${isLarge ? 'text-sm' : 'text-xs'}`}>
            {moodboard.name}
          </h4>
          {isLarge && moodboard.description && (
            <p className="text-xs text-white/70 mt-1 line-clamp-2">{moodboard.description}</p>
          )}
        </div>

        {/* Selected check */}
        {isSelected && (
          <div className={`absolute ${isLarge ? 'top-3 right-3 w-6 h-6' : 'top-2 right-2 w-5 h-5'} rounded-full bg-accent flex items-center justify-center`}>
            <Check className={isLarge ? 'w-4 h-4 text-accent-foreground' : 'w-3 h-3 text-accent-foreground'} />
          </div>
        )}

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullView(true);
          }}
          className={`absolute ${isLarge ? 'top-3 left-3 w-7 h-7' : 'top-2 left-2 w-6 h-6'} rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70`}
        >
          <Expand className={isLarge ? 'w-4 h-4 text-white' : 'w-3 h-3 text-white'} />
        </button>
      </button>

      {/* Full View Dialog */}
      <Dialog open={isFullView} onOpenChange={setIsFullView}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <img 
            src={moodboard.thumbnail} 
            alt={moodboard.name}
            className="aspect-video w-full object-cover"
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

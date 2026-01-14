import { Check, Plus, Bookmark, BookmarkCheck } from "lucide-react";
import { Concept, SavedConcept } from "./types";

interface ConceptCardProps {
  concept: Concept;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  showSaveButton?: boolean;
}

export const ConceptCard = ({ 
  concept, 
  index, 
  isSelected, 
  onSelect,
  onSave,
  isSaved = false,
  showSaveButton = true
}: ConceptCardProps) => {
  return (
    <div
      className={`w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
        isSelected 
          ? 'border-accent shadow-lg ring-2 ring-accent/20' 
          : 'border-border bg-card hover:border-accent/50 hover:shadow-md'
      }`}
    >
      <div className="flex">
        {/* Accent bar like Gamma */}
        <button 
          onClick={onSelect}
          className={`w-2 shrink-0 ${isSelected ? 'bg-accent' : 'bg-accent/30'} hover:bg-accent/60 transition-colors`} 
        />
        
        <button onClick={onSelect} className="flex-1 p-5 text-left">
          <div className="flex items-start gap-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
              isSelected 
                ? 'bg-accent text-accent-foreground' 
                : 'bg-secondary text-muted-foreground'
            }`}>
              {isSelected ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-foreground text-base mb-2">{concept.title}</h4>
                {showSaveButton && onSave && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSave();
                    }}
                    className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                      isSaved 
                        ? 'text-accent bg-accent/10' 
                        : 'text-muted-foreground hover:text-accent hover:bg-accent/10'
                    }`}
                    title={isSaved ? 'Saved' : 'Save concept'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{concept.description}</p>
              {concept.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {concept.tags.slice(0, 4).map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {/* Show presets indicator if concept has them */}
              {concept.presets && (
                <div className="mt-2 flex items-center gap-1 text-xs text-accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Has style presets
                </div>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

interface AddConceptCardProps {
  onClick: () => void;
}

export const AddConceptCard = ({ onClick }: AddConceptCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-6 rounded-xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-secondary/30 transition-all duration-200 flex items-center justify-center gap-2 text-muted-foreground hover:text-accent"
    >
      <Plus className="w-5 h-5" />
      <span className="font-medium">Add concept</span>
    </button>
  );
};

interface SavedConceptCardProps {
  concept: SavedConcept;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

export const SavedConceptCard = ({ 
  concept, 
  isSelected, 
  onSelect,
  onDelete
}: SavedConceptCardProps) => {
  return (
    <div
      className={`w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
        isSelected 
          ? 'border-accent shadow-lg ring-2 ring-accent/20' 
          : 'border-border bg-card hover:border-accent/50 hover:shadow-md'
      }`}
    >
      <div className="flex">
        <button 
          onClick={onSelect}
          className={`w-2 shrink-0 ${isSelected ? 'bg-accent' : 'bg-purple-400/30'} hover:bg-accent/60 transition-colors`} 
        />
        
        <button onClick={onSelect} className="flex-1 p-4 text-left">
          <div className="flex items-start gap-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isSelected 
                ? 'bg-accent text-accent-foreground' 
                : 'bg-purple-100 text-purple-600'
            }`}>
              <BookmarkCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-foreground text-sm">{concept.title}</h4>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="shrink-0 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">{concept.description}</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

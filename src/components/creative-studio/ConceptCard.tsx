import { Check, Plus } from "lucide-react";
import { Concept } from "./types";

interface ConceptCardProps {
  concept: Concept;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const ConceptCard = ({ concept, index, isSelected, onSelect }: ConceptCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        isSelected 
          ? 'border-accent bg-accent/5 shadow-md' 
          : 'border-border bg-card hover:border-accent/50 hover:bg-secondary/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
          isSelected 
            ? 'bg-accent text-accent-foreground' 
            : 'bg-secondary text-muted-foreground'
        }`}>
          {isSelected ? <Check className="w-4 h-4" /> : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground mb-1 truncate">{concept.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{concept.description}</p>
          {concept.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {concept.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

interface AddConceptCardProps {
  onClick: () => void;
}

export const AddConceptCard = ({ onClick }: AddConceptCardProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-secondary/30 transition-all duration-200 flex items-center justify-center gap-2 text-muted-foreground hover:text-accent"
    >
      <Plus className="w-5 h-5" />
      <span className="font-medium">Add concept</span>
    </button>
  );
};

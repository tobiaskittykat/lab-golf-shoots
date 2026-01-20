import { Check, Plus, Bookmark, BookmarkCheck, Pencil, Target, Users } from "lucide-react";
import { Concept, SavedConcept, campaignObjectives, targetPersonas } from "./types";

interface ConceptCardProps {
  concept: Concept;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onSave?: () => void;
  onEdit?: () => void;
  isSaved?: boolean;
  showSaveButton?: boolean;
}

// Helper to get label from value
const getObjectiveLabel = (value?: string) => 
  campaignObjectives.find(o => o.value === value)?.label || value;

const getPersonaLabel = (value?: string) => 
  targetPersonas.find(p => p.value === value)?.label || value;

export const ConceptCard = ({ 
  concept, 
  index, 
  isSelected, 
  onSelect,
  onSave,
  onEdit,
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
        {/* Accent bar - clicking selects the concept */}
        <button 
          onClick={onSelect}
          className={`w-2 shrink-0 ${isSelected ? 'bg-accent' : 'bg-accent/30'} hover:bg-accent/60 transition-colors`} 
        />
        
        {/* Main content area */}
        <div className="flex-1 p-5">
          <div className="flex items-start gap-4">
            {/* Number/Check indicator - clicking selects */}
            <button 
              onClick={onSelect}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                isSelected 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {isSelected ? <Check className="w-4 h-4" /> : index + 1}
            </button>
            
            {/* Content - clicking selects */}
            <button onClick={onSelect} className="flex-1 min-w-0 text-left">
              <h4 className="font-semibold text-foreground text-base mb-2">{concept.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{concept.description}</p>
              
              {/* Campaign context badges (NEW) */}
              {(concept.targetPersona || concept.objective) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {concept.targetPersona && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
                      <Users className="w-3 h-3" />
                      {getPersonaLabel(concept.targetPersona)}
                    </span>
                  )}
                  {concept.objective && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                      <Target className="w-3 h-3" />
                      {getObjectiveLabel(concept.objective)}
                    </span>
                  )}
                </div>
              )}
              
              {/* Tags */}
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
              
              {/* Presets indicator */}
              {concept.presets && (
                <div className="mt-2 flex items-center gap-1 text-xs text-accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Has style presets
                </div>
              )}
            </button>
            
            {/* Action buttons - isolated from selection */}
            <div className="flex items-start gap-1 shrink-0">
              {/* Edit button */}
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Edit concept"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              
              {/* Save button */}
              {showSaveButton && onSave && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
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
          </div>
        </div>
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
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SavedConceptCard = ({ 
  concept, 
  isSelected, 
  onSelect,
  onEdit,
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
        
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            {/* Icon - clicking selects */}
            <button 
              onClick={onSelect}
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isSelected 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
            </button>
            
            {/* Content - clicking selects */}
            <button onClick={onSelect} className="flex-1 min-w-0 text-left">
              <h4 className="font-semibold text-foreground text-sm">{concept.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">{concept.description}</p>
              
              {/* Campaign badges */}
              {(concept.targetPersona || concept.objective) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {concept.targetPersona && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-medium">
                      <Users className="w-2.5 h-2.5" />
                      {getPersonaLabel(concept.targetPersona)}
                    </span>
                  )}
                  {concept.objective && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-medium">
                      <Target className="w-2.5 h-2.5" />
                      {getObjectiveLabel(concept.objective)}
                    </span>
                  )}
                </div>
              )}
            </button>
            
            {/* Actions - isolated */}
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors px-1.5 py-0.5"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Check, Plus, Bookmark, BookmarkCheck, Pencil, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { Concept, SavedConcept } from "./types";

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if concept has rich data
  const hasRichData = !!(concept.productFocus || concept.visualWorld || concept.taglines?.length || concept.contentPillars?.length);
  
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
              <h4 className="font-semibold text-foreground text-base mb-1">{concept.title}</h4>
              
              {/* Core Idea (prominent) */}
              {concept.coreIdea && (
                <p className="text-sm text-accent italic mb-2">"{concept.coreIdea}"</p>
              )}
              
              {/* Description / Visual World preview */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {concept.description || concept.visualWorld?.atmosphere}
              </p>
              
              {/* Summary info - no truncation, no emoji prefixes */}
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {/* Product Category */}
                {concept.productFocus?.productCategory && (
                  <p>{concept.productFocus.productCategory}</p>
                )}
                
                {/* Palette - inline with dots */}
                {concept.visualWorld?.palette && concept.visualWorld.palette.length > 0 && (
                  <p>{concept.visualWorld.palette.join(' · ')}</p>
                )}
                
                {/* Full Target Audience - persona + situation */}
                {concept.targetAudience && (
                  <div className="mt-2">
                    {concept.targetAudience.persona && (
                      <p>{concept.targetAudience.persona}</p>
                    )}
                    {concept.targetAudience.situation && (
                      <p className="text-muted-foreground/70">{concept.targetAudience.situation}</p>
                    )}
                  </div>
                )}
              </div>
            </button>
            
            {/* Action buttons - isolated from selection */}
            <div className="flex items-start gap-1 shrink-0">
              {/* Expand button for rich concepts */}
              {hasRichData && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title={isExpanded ? "Collapse details" : "Expand details"}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
              
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
          
          {/* Expanded Details */}
          {isExpanded && hasRichData && (
            <div className="mt-4 pt-4 border-t border-border space-y-4 text-sm">
              {/* Product Focus */}
              {concept.productFocus && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Product Category</p>
                  <p className="text-foreground">{concept.productFocus.productCategory}</p>
                  {concept.productFocus.visualGuidance && (
                    <p className="text-muted-foreground mt-1">{concept.productFocus.visualGuidance}</p>
                  )}
                </div>
              )}
              
              {/* Visual World */}
              {concept.visualWorld && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Visual World</p>
                  <p className="text-foreground">{concept.visualWorld.atmosphere}</p>
                  {concept.visualWorld.composition && (
                    <p className="text-muted-foreground mt-1">Composition: {concept.visualWorld.composition}</p>
                  )}
                </div>
              )}
              
              {/* Taglines */}
              {concept.taglines && concept.taglines.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Taglines</p>
                  <ul className="space-y-1">
                    {concept.taglines.map((tagline, i) => (
                      <li key={i} className="text-foreground">
                        "{tagline}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Content Pillars */}
              {concept.contentPillars && concept.contentPillars.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Content Pillars</p>
                  <div className="space-y-1">
                    {concept.contentPillars.map((pillar, i) => (
                      <p key={i} className="text-foreground">
                        <span className="font-medium">{pillar.name}</span>
                        <span className="text-muted-foreground"> — {pillar.description}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tonality */}
              {concept.tonality && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Tonality</p>
                  <p className="text-foreground">
                    {concept.tonality.adjectives.join(', ')}
                    {concept.tonality.neverRules.length > 0 && (
                      <span className="text-muted-foreground">
                        {' '}· Never: {concept.tonality.neverRules.join(', ')}
                      </span>
                    )}
                  </p>
                </div>
              )}
              
              {/* Consumer Insight */}
              {concept.consumerInsight && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Consumer Insight</p>
                  <p className="text-foreground italic">"{concept.consumerInsight}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading skeleton for concept cards
export const ConceptCardSkeleton = ({ index }: { index: number }) => {
  return (
    <div className="w-full rounded-xl border-2 border-border bg-card overflow-hidden animate-pulse">
      <div className="flex">
        <div className="w-2 shrink-0 bg-accent/20" />
        <div className="flex-1 p-5">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-secondary rounded w-3/4" />
              <div className="h-4 bg-secondary rounded w-full" />
              <div className="h-4 bg-secondary rounded w-2/3" />
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
          className={`w-2 shrink-0 ${isSelected ? 'bg-accent' : 'bg-accent/30'} hover:bg-accent/60 transition-colors`} 
        />
        
        <div className="flex-1 p-4">
          <div className="flex items-start gap-3">
            {/* Icon - clicking selects */}
            <button 
              onClick={onSelect}
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isSelected 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
            </button>
            
            {/* Content - clicking selects */}
            <button onClick={onSelect} className="flex-1 min-w-0 text-left">
              <h4 className="font-semibold text-foreground text-sm">{concept.title}</h4>
              
              {/* Core idea preview */}
              {concept.coreIdea && (
                <p className="text-xs text-accent italic mt-0.5">"{concept.coreIdea}"</p>
              )}
              
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                {concept.description || concept.visualWorld?.atmosphere}
              </p>
              
              {/* Full Target Audience */}
              {concept.targetAudience && (
                <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
                  {concept.targetAudience.persona && (
                    <p>{concept.targetAudience.persona}</p>
                  )}
                  {concept.targetAudience.situation && (
                    <p className="text-muted-foreground/70">{concept.targetAudience.situation}</p>
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

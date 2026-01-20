import { Check, Plus, Bookmark, BookmarkCheck, Pencil, Users, Palette, MessageSquareQuote, ChevronDown, ChevronUp } from "lucide-react";
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
              
              {/* Quick info badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* Target Audience */}
                {concept.targetAudience?.persona && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
                    <Users className="w-3 h-3" />
                    {concept.targetAudience.persona.slice(0, 30)}
                    {concept.targetAudience.persona.length > 30 && '...'}
                  </span>
                )}
                
                {/* Visual World indicator */}
                {concept.visualWorld?.palette && concept.visualWorld.palette.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-medium">
                    <Palette className="w-3 h-3" />
                    {concept.visualWorld.palette.slice(0, 3).join(', ')}
                  </span>
                )}
                
                {/* Taglines indicator */}
                {concept.taglines && concept.taglines.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
                    <MessageSquareQuote className="w-3 h-3" />
                    {concept.taglines.length} tagline{concept.taglines.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
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
                  {concept.tags.length > 4 && (
                    <span className="px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
                      +{concept.tags.length - 4}
                    </span>
                  )}
                </div>
              )}
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
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Product Focus</p>
                  <p className="text-foreground">{concept.productFocus.heroProduct}</p>
                  {concept.productFocus.keyDetails.length > 0 && (
                    <p className="text-muted-foreground mt-1">
                      Details: {concept.productFocus.keyDetails.join(', ')}
                    </p>
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
                  <div className="flex flex-wrap gap-2">
                    {concept.taglines.map((tagline, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-secondary text-foreground">
                        "{tagline}"
                      </span>
                    ))}
                  </div>
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
              
              {/* Core idea preview */}
              {concept.coreIdea && (
                <p className="text-xs text-accent italic mt-0.5">"{concept.coreIdea}"</p>
              )}
              
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                {concept.description || concept.visualWorld?.atmosphere}
              </p>
              
              {/* Quick badges */}
              {(concept.targetAudience?.persona || concept.taglines?.length) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {concept.targetAudience?.persona && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-medium">
                      <Users className="w-2.5 h-2.5" />
                      {concept.targetAudience.persona.slice(0, 20)}...
                    </span>
                  )}
                  {concept.taglines && concept.taglines.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-medium">
                      <MessageSquareQuote className="w-2.5 h-2.5" />
                      {concept.taglines.length}
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

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bookmark, ImageIcon, Package, Trash2 } from "lucide-react";
import { SavedConcept } from "./types";

interface SavedConceptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedConcepts: SavedConcept[];
  onLoadConcept: (concept: SavedConcept) => void;
  onDeleteConcept?: (conceptId: string) => void;
}

export const SavedConceptsModal = ({ isOpen, onClose, savedConcepts, onLoadConcept, onDeleteConcept }: SavedConceptsModalProps) => {
  const handleLoad = (concept: SavedConcept) => { onLoadConcept(concept); onClose(); };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-accent" />
            Saved Concepts
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {savedConcepts.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-10 h-10 mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-muted-foreground">No saved concepts yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Save concepts from Step 2 to reuse them later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {savedConcepts.map((concept) => (
                <div key={concept.id} className="group flex items-start gap-4 p-4 rounded-xl bg-secondary/30 border border-border hover:border-accent/40 transition-all">
                  <button onClick={() => handleLoad(concept)} className="flex-1 text-left">
                    <div className="font-medium text-sm text-foreground group-hover:text-accent transition-colors mb-1">{concept.title}</div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{concept.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {concept.presets?.moodboardId && (
                        <span className="inline-flex items-center gap-1 text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full"><ImageIcon className="w-3 h-3" />Moodboard</span>
                      )}
                      {(concept.presets?.productIds?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full"><Package className="w-3 h-3" />{concept.presets!.productIds!.length} Product{concept.presets!.productIds!.length > 1 ? "s" : ""}</span>
                      )}
                      {concept.presets?.artisticStyle && (
                        <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{concept.presets.artisticStyle}</span>
                      )}
                    </div>
                  </button>
                  {onDeleteConcept && (
                    <button onClick={() => onDeleteConcept(concept.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Delete concept">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

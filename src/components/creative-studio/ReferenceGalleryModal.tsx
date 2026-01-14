import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Upload, Check } from "lucide-react";
import { ReferenceImage } from "./types";

interface ReferenceGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  references: ReferenceImage[];
  selectedReference: string | null;
  onSelect: (referenceId: string) => void;
}

export const ReferenceGalleryModal = ({ 
  isOpen, 
  onClose, 
  title,
  references,
  selectedReference, 
  onSelect 
}: ReferenceGalleryModalProps) => {
  const handleSelect = (referenceId: string) => {
    onSelect(referenceId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-6">
          {/* Reference Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {references.map((ref) => (
              <button
                key={ref.id}
                onClick={() => handleSelect(ref.id)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] hover:shadow-md ${
                  selectedReference === ref.id
                    ? 'border-accent ring-2 ring-accent/30'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div 
                  className="absolute inset-0"
                  style={{ background: ref.thumbnail }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs font-medium text-white truncate">{ref.name}</p>
                </div>
                {selectedReference === ref.id && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-accent-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Upload Section */}
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Or upload your own</p>
            <button className="w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex flex-col items-center justify-center gap-2 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium text-foreground text-sm">Upload image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

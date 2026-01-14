import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Upload, Check } from "lucide-react";
import { ReferenceImage } from "./types";
import { ReferenceThumbnail } from "./ReferenceThumbnail";

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
              <ReferenceThumbnail
                key={ref.id}
                reference={ref}
                isSelected={selectedReference === ref.id}
                onSelect={() => handleSelect(ref.id)}
                showLabel={true}
              />
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

import { GeneratedImage } from "./types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Pencil, Trash2, X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImageDetailModalProps {
  image: GeneratedImage | null;
  isOpen: boolean;
  onClose: () => void;
  onVariation?: (image: GeneratedImage) => void;
  onEdit?: (image: GeneratedImage) => void;
  onDelete?: (image: GeneratedImage) => void;
}

export const ImageDetailModal = ({ image, isOpen, onClose, onVariation, onEdit, onDelete }: ImageDetailModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!image) return null;

  const handleDownload = async () => {
    if (!image.imageUrl) return;
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kittykat-${image.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  };

  const handleCopyPrompt = () => {
    const text = image.refinedPrompt || image.prompt;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0">
        <div className="grid md:grid-cols-5 gap-0">
          {/* Image */}
          <div className="md:col-span-3 bg-secondary flex items-center justify-center min-h-[300px]">
            {image.imageUrl ? (
              <img
                src={image.imageUrl}
                alt={image.conceptTitle || "Generated"}
                className="max-h-[70vh] w-full object-contain"
              />
            ) : (
              <div className="text-muted-foreground p-8 text-center">
                {image.status === "pending" ? "Generating..." : "Generation failed"}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2 p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-lg">
                {image.conceptTitle || "Generated Image"}
              </h3>
              {image.settings?.artisticStyle && (
                <span className="text-xs text-muted-foreground">
                  Style: {String(image.settings.artisticStyle)}
                </span>
              )}
            </div>

            {/* Prompt */}
            {(image.refinedPrompt || image.prompt) && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Prompt</span>
                  <button onClick={handleCopyPrompt} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-6">
                  {image.refinedPrompt || image.prompt}
                </p>
              </div>
            )}

            {/* Settings */}
            {image.settings && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Settings</span>
                <div className="flex flex-wrap gap-1.5">
                  {image.settings.aspectRatio && (
                    <span className="px-2 py-0.5 bg-secondary rounded text-xs">{String(image.settings.aspectRatio)}</span>
                  )}
                  {image.settings.aiModel && (
                    <span className="px-2 py-0.5 bg-secondary rounded text-xs">{String(image.settings.aiModel)}</span>
                  )}
                  {image.shotType && (
                    <span className="px-2 py-0.5 bg-secondary rounded text-xs">{image.shotType}</span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              {image.imageUrl && (
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                  <Download className="w-3.5 h-3.5" />Download
                </Button>
              )}
              {onVariation && (
                <Button variant="outline" size="sm" onClick={() => onVariation(image)} className="gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />Variation
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(image)} className="gap-1.5">
                  <Pencil className="w-3.5 h-3.5" />Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(image)} className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useRef, useCallback } from "react";
import { Upload, Trash2, Star, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrandImage } from "@/hooks/useBrandImages";

interface LogoUploadSectionProps {
  logos: BrandImage[];
  primaryLogoId: string | null;
  onUpload: (file: File) => Promise<BrandImage | null>;
  onDelete: (id: string) => Promise<boolean>;
  onSetPrimary: (id: string) => Promise<boolean>;
  isUploading: boolean;
}

export function LogoUploadSection({
  logos,
  primaryLogoId,
  onUpload,
  onDelete,
  onSetPrimary,
  isUploading,
}: LogoUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          await onUpload(file);
        }
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          await onUpload(file);
        }
      }
    },
    [onUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Determine which logo is effectively primary
  const effectivePrimaryId = primaryLogoId || logos[0]?.id || null;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Brand Logos
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Primary logo is used for image overlays in Creative Studio
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload Logo"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          logos.length === 0 && "min-h-[120px] flex items-center justify-center"
        )}
      >
        {logos.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Drop logo images here or click upload</p>
            <p className="text-xs mt-1">
              PNG with transparent background recommended (min 500px width)
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 items-center">
            {logos.map((logo) => {
              const isPrimary = logo.id === effectivePrimaryId;
              return (
                <div
                  key={logo.id}
                  className={cn(
                    "relative group h-20 min-w-[80px] max-w-[160px] rounded-lg border-2 overflow-hidden cursor-pointer transition-all flex items-center justify-center",
                    isPrimary
                      ? "border-primary bg-primary/5"
                      : "border-border bg-secondary/30 hover:border-muted-foreground"
                  )}
                  onClick={() => onSetPrimary(logo.id)}
                  title={isPrimary ? "Primary logo" : "Click to set as primary"}
                >
                  <img
                    src={logo.image_url}
                    alt="Brand logo"
                    className="w-auto h-full max-w-full object-contain p-2"
                  />

                  {/* Primary indicator */}
                  {isPrimary && (
                    <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Star className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
                    </div>
                  )}

                  {/* Delete button on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:text-destructive hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(logo.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {logos.length > 1 && (
        <p className="text-xs text-muted-foreground mt-3">
          Click a logo to set it as primary • Hover to delete
        </p>
      )}
    </div>
  );
}

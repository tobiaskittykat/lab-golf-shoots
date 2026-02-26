import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Trash2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdCreatives, AdCreative } from '@/hooks/useAdCreatives';

interface AdGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (urls: string[]) => void;
}

export function AdGalleryModal({ open, onOpenChange, onSelect }: AdGalleryModalProps) {
  const { creatives, isLoading, deleteCreative } = useAdCreatives();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (url: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const handleConfirm = () => {
    onSelect(Array.from(selected));
    setSelected(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ad Gallery</DialogTitle>
          <DialogDescription>Select source images from your saved ad creatives</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : creatives.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
            <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No saved ads yet</p>
            <p className="text-xs text-muted-foreground">Upload source images and they'll be saved here automatically</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-1">
              {creatives.map((creative) => {
                const isSelected = selected.has(creative.image_url);
                return (
                  <div key={creative.id} className="relative group">
                    <button
                      onClick={() => toggleSelect(creative.image_url)}
                      className={cn(
                        'aspect-square w-full rounded-lg overflow-hidden border-2 transition-all',
                        isSelected
                          ? 'border-accent ring-2 ring-accent/30'
                          : 'border-transparent hover:border-muted-foreground/30'
                      )}
                    >
                      <img src={creative.image_url} alt={creative.name || 'Ad'} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <Check className="w-3 h-3 text-accent-foreground" />
                        </div>
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCreative(creative.id); }}
                      className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {creative.name && (
                      <p className="text-[10px] text-muted-foreground truncate mt-1 px-0.5">{creative.name}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {selected.size > 0 ? `${selected.size} selected` : 'Click images to select'}
          </p>
          <Button size="sm" onClick={handleConfirm} disabled={selected.size === 0}>
            Add Selected
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

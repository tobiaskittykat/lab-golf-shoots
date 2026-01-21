import { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Check, Upload, RefreshCw, Loader2, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProductItem {
  id: string;
  name: string;
  thumbnailUrl: string;
  fullUrl: string;
  category: string;
}

interface ProductReferencePickerProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  maxSelection?: number;
  isLoading?: boolean;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const ProductReferencePicker = ({
  isOpen,
  onClose,
  products,
  selectedIds,
  onSelectionChange,
  maxSelection = 3,
  isLoading = false,
  onSync,
  isSyncing = false,
}: ProductReferencePickerProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['phone-case', 'bag', 'strap', 'pouch', 'accessory', 'other']));
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups = new Map<string, ProductItem[]>();
    for (const product of products) {
      const cat = product.category || 'other';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(product);
    }
    // Sort categories alphabetically
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const formatCategoryLabel = (cat: string) => {
    return cat
      .split(/[-_]+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const toggleCategory = (cat: string) => {
    const next = new Set(expandedCategories);
    if (next.has(cat)) {
      next.delete(cat);
    } else {
      next.add(cat);
    }
    setExpandedCategories(next);
  };

  const handleSelect = (productId: string) => {
    const isSelected = selectedIds.includes(productId);
    if (isSelected) {
      onSelectionChange(selectedIds.filter(id => id !== productId));
    } else if (selectedIds.length < maxSelection) {
      onSelectionChange([...selectedIds, productId]);
    }
  };

  const handleImageError = (productId: string) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Product Reference</DialogTitle>
            {selectedIds.length > 0 && (
              <span className="text-sm bg-accent/20 text-accent px-3 py-1 rounded-full">
                {selectedIds.length} selected
              </span>
            )}
          </div>
          <DialogDescription className="sr-only">
            Select up to {maxSelection} products to use as reference images
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
          {/* Sync button */}
          {onSync && (
            <div className="flex justify-end">
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="action-chip text-sm"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isSyncing ? 'Syncing...' : 'Sync from Bandolier'}
              </button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && products.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No products found.</p>
              {onSync && <p className="text-sm mt-1">Click "Sync from Bandolier" to import products.</p>}
            </div>
          )}

          {/* Product categories */}
          {!isLoading && groupedProducts.map(([category, items]) => (
            <Collapsible
              key={category}
              open={expandedCategories.has(category)}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-foreground hover:text-accent transition-colors">
                <span>{formatCategoryLabel(category)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    expandedCategories.has(category) ? "rotate-180" : ""
                  )} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 pt-2 pb-4">
                  {items.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    const hasError = imageErrors.has(product.id);
                    const atLimit = selectedIds.length >= maxSelection && !isSelected;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelect(product.id)}
                        disabled={atLimit}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                          "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                          isSelected
                            ? "border-accent ring-1 ring-accent/30 shadow-md"
                            : "border-border hover:border-accent/50",
                          atLimit && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {/* Image or fallback */}
                        {!hasError ? (
                          <img
                            src={product.thumbnailUrl}
                            alt={product.name}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={() => handleImageError(product.id)}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-secondary flex items-center justify-center p-2">
                            <span className="text-xs text-muted-foreground text-center line-clamp-3">
                              {product.name}
                            </span>
                          </div>
                        )}

                        {/* Gradient overlay for label */}
                        {!hasError && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-white truncate">
                              {product.name}
                            </span>
                          </>
                        )}

                        {/* Selected check */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                            <Check className="w-3 h-3 text-accent-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Upload section */}
          <div className="pt-4 border-t border-border">
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

        {/* Done button */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Check, Upload, RefreshCw, Loader2, X, ChevronDown, Trash2 } from "lucide-react";
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
  onSelectionChange: (ids: string[], fromGallery: boolean) => void;
  maxSelection?: number;
  isLoading?: boolean;
  onSync?: () => void;
  isSyncing?: boolean;
  onClearAll?: () => void;
  onDeleteProduct?: (productId: string) => void;
  onUploadProduct?: (file: File) => Promise<void>;
  isUploading?: boolean;
  brandName?: string; // Dynamic brand name for labels
}

// Proxy external Shopify CDN URLs through our edge function to bypass hotlink protection
const getProxiedUrl = (url: string) => {
  if (url.includes('cdn.shopify.com') && !url.includes('supabase')) {
    const base = import.meta.env.VITE_SUPABASE_URL;
    return `${base}/functions/v1/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

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
  onClearAll,
  onDeleteProduct,
  onUploadProduct,
  isUploading = false,
  brandName,
}: ProductReferencePickerProps) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
      onSelectionChange(selectedIds.filter(id => id !== productId), true); // fromGallery = true
    } else if (selectedIds.length < maxSelection) {
      onSelectionChange([...selectedIds, productId], true); // fromGallery = true
    }
  };

  const handleImageError = (productId: string) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };

  const handleDelete = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation(); // Prevent selecting the product
    if (onDeleteProduct) {
      setDeletingId(productId);
      onDeleteProduct(productId);
      // Reset after a short delay
      setTimeout(() => setDeletingId(null), 500);
    }
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
          {/* Action buttons */}
          {(onSync || onClearAll) && (
            <div className="flex justify-between items-center">
              {/* Clear button */}
              {onClearAll && products.length > 0 && (
                <div>
                  {showClearConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Clear all {products.length} products?</span>
                      <button
                        onClick={() => {
                          onClearAll();
                          setShowClearConfirm(false);
                        }}
                        className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, clear
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="action-chip text-sm text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Library
                    </button>
                  )}
                </div>
              )}
              
              {/* Sync button */}
              {onSync && (
                <button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="action-chip text-sm ml-auto"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {isSyncing ? 'Syncing...' : `Sync from ${brandName || 'website'}`}
                </button>
              )}
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
              {onSync && <p className="text-sm mt-1">Click "Sync from {brandName || 'website'}" to import products.</p>}
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
                      <div
                        key={product.id}
                        className={cn(
                          "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                          isSelected
                            ? "border-accent ring-1 ring-accent/30 shadow-md"
                            : "border-border hover:border-accent/50",
                          atLimit && "opacity-50"
                        )}
                      >
                        {/* Main clickable area for selection */}
                        <button
                          type="button"
                          onClick={() => handleSelect(product.id)}
                          disabled={atLimit}
                          className="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg"
                        >
                          {/* Image - proxied through edge function to bypass hotlink protection */}
                          {!hasError ? (
                            <img
                              src={getProxiedUrl(product.thumbnailUrl)}
                              alt={product.name}
                              loading="lazy"
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
                              <span className="absolute bottom-1 left-1 right-6 text-[10px] font-medium text-white truncate">
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

                        {/* Delete button - shows on hover */}
                        {onDeleteProduct && !isSelected && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, product.id)}
                            disabled={deletingId === product.id}
                            className={cn(
                              "absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-destructive flex items-center justify-center",
                              "opacity-0 group-hover:opacity-100 transition-opacity",
                              "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive",
                              deletingId === product.id && "opacity-100"
                            )}
                            title="Delete product"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="w-3 h-3 text-white animate-spin" />
                            ) : (
                              <X className="w-3 h-3 text-white" />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Upload section */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-3">Or upload your own</p>
            <label className={cn(
              "relative w-full py-8 rounded-xl border-2 border-dashed bg-secondary/30 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer",
              isUploading 
                ? "border-accent/50 cursor-wait" 
                : "border-border hover:border-accent/50"
            )}>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isUploading}
                onChange={async (e) => {
                  if (e.target.files && onUploadProduct) {
                    for (const file of Array.from(e.target.files)) {
                      await onUploadProduct(file);
                    }
                  }
                  // Reset input so same file can be uploaded again
                  e.target.value = '';
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
              />
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-accent animate-spin" />
                  <div className="text-center">
                    <p className="font-medium text-accent text-sm">Analyzing product...</p>
                    <p className="text-xs text-muted-foreground">AI is extracting details</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="font-medium text-foreground text-sm">Upload image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </>
              )}
            </label>
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



# Add Selection Highlighting + Fix Product Grid Display

## Summary

The selection styling (frame + checkmark) is already implemented correctly in the code. The visual issue you're seeing is because the selected product from "Browse All" isn't appearing in the grid due to the caching issue we identified earlier.

This plan combines both fixes:
1. Fix the `skuCache` to ensure selected products always appear in the grid
2. Confirm the selection styling matches the shot type pattern (already done in code)
3. Remove the inline Edit button as requested

---

## Current Selection Styling (Already Correct)

The product grid already has the same styling as shot type options:

```typescript
// Border + ring for selected items
className={cn(
  "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
  isSelected 
    ? "border-accent ring-2 ring-accent/30"   // ← Same as ShotTypeVisualSelector
    : "border-transparent hover:border-muted-foreground/30"
)}

// Checkmark badge (top-right corner)
{isSelected && (
  <div className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
    <Check className="w-3 h-3 text-white" />
  </div>
)}
```

---

## Technical Changes

### File: `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`

**1. Add SKU cache state** (after line ~265):

```typescript
// Cache for SKU data (for products selected from modal that aren't in recentSkus)
const [skuCache, setSkuCache] = useState<Map<string, ProductSKU>>(new Map());
```

**2. Update `handleSkuSelect` to cache the full SKU data** (~line 275):

```typescript
const handleSkuSelect = (sku: ProductSKU, fromModal: boolean = false) => {
  setSelectedSku(sku);
  onStateChange({
    selectedProductId: sku.id,
    recoloredProductUrl: sku.composite_image_url || sku.angles[0]?.thumbnail_url,
  });
  
  if (fromModal) {
    // Cache the SKU data for display
    setSkuCache(prev => {
      const next = new Map(prev);
      next.set(sku.id, sku);
      return next;
    });
    
    // Move new selection to front
    setDisplayedSkuIds(prev => {
      const newOrder = [sku.id, ...prev.filter(id => id !== sku.id)].slice(0, 3);
      return newOrder;
    });
  }
};
```

**3. Update `displayedProducts` to use cache fallback** (~line 295):

```typescript
const displayedProducts = useMemo(() => {
  if (displayedSkuIds.length === 0) return recentSkus.slice(0, 3);
  
  return displayedSkuIds
    .map(id => {
      // First try to find in recentSkus
      const fromRecent = recentSkus.find(s => s.id === id);
      if (fromRecent) return fromRecent;
      
      // Fall back to cache (for products selected from modal)
      const fromCache = skuCache.get(id);
      if (fromCache) {
        return {
          id: fromCache.id,
          name: fromCache.name,
          sku_code: fromCache.sku_code,
          composite_image_url: fromCache.composite_image_url,
          brand_id: fromCache.brand_id,
          last_used_at: fromCache.last_used_at,
          display_image_url: fromCache.composite_image_url || fromCache.angles?.[0]?.thumbnail_url,
          description: null,
        };
      }
      
      return null;
    })
    .filter(Boolean);
}, [displayedSkuIds, recentSkus, skuCache]);
```

**4. Remove the Edit button** from Selected Product Info Row (~lines 401-412):

Delete this button:
```typescript
<Button
  variant="outline"
  size="sm"
  className="gap-1.5"
  onClick={() => {
    setEditingSkuId(selectedSku.id);
    setShowEditSKUModal(true);
  }}
>
  <Pencil className="w-3.5 h-3.5" />
  Edit
</Button>
```

---

## Visual Result

After fix, when selecting "Boston Shearling" from Browse All:

```
┌─────────────────────────────────────────────────────────┐
│ Your Products                                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│ │  ✓      │ │          │ │          │                 │
│ │[Boston] │ │[Arizona] │ │ [EVA]    │                 │
│ │ ──────  │ │          │ │          │                 │
│ └──────────┘ └──────────┘ └──────────┘                 │
│  ↑ accent border + ring + checkmark                     │
│                                                         │
│ Selected: Boston Shearling Clog                         │
│ BIRK-BOSTON-SHEAR-TOB • 5 angles                       │
│                                                         │
│ [Browse All Products...]                                │
└─────────────────────────────────────────────────────────┘
```

---

## File Summary

| File | Changes |
|------|---------|
| `ProductShootStep2.tsx` | Add `skuCache` state, update `handleSkuSelect` to cache SKU data, update `displayedProducts` to use cache, remove inline Edit button |


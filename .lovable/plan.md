
# Add Inline Recent Products & Auto-Preselection

## Overview

Enhance the Product section to show the last 3 recently used products directly inline, with the most recent automatically pre-selected when entering Step 2.

---

## Current State

The Product section shows either:
- A "Select a product" CTA with Smart Upload/Create buttons (when no product selected)
- A product preview card (when a product is selected)

The modal has "Recently Used" but it's hidden until opened.

---

## Proposed UI

```
┌─────────────────────────────────────────────────────────┐
│  🔲 Product                                        ▾    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Recently Used                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │  [img]  │  │  [img]  │  │  [img]  │                 │
│  │ ✓ Name  │  │  Name   │  │  Name   │                 │
│  └─────────┘  └─────────┘  └─────────┘                 │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │            Browse All Products...                 │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Smart Upload ─┐  ┌─ + Create SKU ─┐                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Key behaviors:**
- First card is pre-selected automatically (most recent)
- Clicking a card selects it immediately (no modal)
- "Browse All Products" opens the full modal for 1000+ SKU support
- Cards show thumbnail + name + checkmark if selected

---

## Changes

### 1. Fetch Recent SKUs Inline

**File: `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`**

Add a query to fetch the top 3 recently used SKUs:

```typescript
// Fetch recent SKUs for inline display
const { data: recentSkus = [] } = useQuery({
  queryKey: ['recent-skus', user?.id, currentBrand?.id],
  queryFn: async () => {
    if (!user?.id) return [];
    
    let query = supabase
      .from('product_skus')
      .select('*')
      .eq('user_id', user.id)
      .not('last_used_at', 'is', null)
      .order('last_used_at', { ascending: false })
      .limit(3);
    
    if (currentBrand?.id) {
      query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
    }
    
    const { data } = await query;
    return data || [];
  },
  enabled: !!user?.id,
});
```

### 2. Auto-Preselect Most Recent

Add effect to auto-select when entering step with no selection:

```typescript
const [hasAutoSelected, setHasAutoSelected] = useState(false);

useEffect(() => {
  // Auto-select the most recently used product if none selected
  if (!hasAutoSelected && recentSkus.length > 0 && !state.selectedProductId) {
    const mostRecent = recentSkus[0];
    handleSkuSelect({
      id: mostRecent.id,
      name: mostRecent.name,
      sku_code: mostRecent.sku_code,
      composite_image_url: mostRecent.composite_image_url,
      brand_id: mostRecent.brand_id,
      last_used_at: mostRecent.last_used_at,
      angles: [],  // Will be fetched if needed
    });
    setHasAutoSelected(true);
  }
}, [recentSkus, state.selectedProductId, hasAutoSelected]);
```

### 3. Render Recent Products Inline

Replace the current empty-state CTA with a grid showing recent products:

```tsx
{/* Recent Products Grid */}
{recentSkus.length > 0 && (
  <div className="space-y-2">
    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
      <Clock className="w-3 h-3" />
      Recently Used
    </span>
    <div className="grid grid-cols-3 gap-2">
      {recentSkus.map(sku => {
        const isSelected = state.selectedProductId === sku.id;
        const imageUrl = sku.composite_image_url;
        
        return (
          <button
            key={sku.id}
            onClick={() => handleSkuSelect({
              id: sku.id,
              name: sku.name,
              sku_code: sku.sku_code,
              composite_image_url: sku.composite_image_url,
              brand_id: sku.brand_id,
              last_used_at: sku.last_used_at,
              angles: [],
            })}
            className={cn(
              "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
              isSelected 
                ? "border-accent ring-2 ring-accent/30" 
                : "border-transparent hover:border-muted-foreground/30"
            )}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={sku.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <span className="text-xs text-white font-medium truncate block">
                {sku.name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  </div>
)}

{/* Browse All Button */}
<Button
  variant="outline"
  className="w-full"
  onClick={() => setShowProductPickerModal(true)}
>
  Browse All Products...
</Button>
```

### 4. Conditionally Show Selected Preview

Only show the detailed preview card when a product is selected AND it's not in the recent grid (or always show but more compact):

Actually, simpler approach: When a product is selected, the recent grid still shows with the selected one highlighted, plus we show the selected product info below for actions (Change/Clear).

---

## File Summary

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Add recent SKUs query, auto-preselection, inline grid UI |

---

## Expected Result

1. When entering Step 2, the most recently used product is automatically pre-selected
2. The Product section shows 3 recent products as clickable thumbnail cards
3. Clicking a card immediately selects it (no modal needed for recent products)
4. "Browse All Products..." button opens the full modal for searching 1000+ SKUs
5. Smart Upload and Create SKU buttons remain available


# Fix Product Selection Order in Product Shoot Flow

## Problem

When selecting a product from the "Browse All Products" modal, the inline "Recently Used" grid reorders based on database `last_used_at` timestamps. This causes visual jumps and inconsistent behavior.

**Expected behavior (matching lifestyle flow):**
1. Selecting from "Browse More" modal → newly selected product moves to position 1
2. Clicking between the visible 3 products → order stays the same
3. Only re-order when explicitly selecting a NEW product from the full list

## Solution

Add a local `displayedSkuIds` state that controls the display order, separate from the database query. This mirrors the `displayedProductIds` pattern used in the lifestyle flow.

---

## Technical Changes

### File: `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`

**1. Add local display order state:**

```typescript
// Track stable display order for inline product grid
const [displayedSkuIds, setDisplayedSkuIds] = useState<string[]>([]);
```

**2. Initialize display order from database on first load:**

```typescript
// Initialize displayedSkuIds from database query (only once)
useEffect(() => {
  if (displayedSkuIds.length === 0 && recentSkus.length > 0) {
    setDisplayedSkuIds(recentSkus.slice(0, 3).map(s => s.id));
  }
}, [recentSkus, displayedSkuIds.length]);
```

**3. Modify handleSkuSelect to accept `fromModal` flag:**

```typescript
const handleSkuSelect = (sku: ProductSKU, fromModal: boolean = false) => {
  setSelectedSku(sku);
  onStateChange({
    selectedProductId: sku.id,
    recoloredProductUrl: sku.composite_image_url || sku.angles[0]?.thumbnail_url,
  });
  
  // Only update display order if selecting from modal (Browse More)
  if (fromModal && !displayedSkuIds.includes(sku.id)) {
    // Move new selection to front, keep existing order for rest
    setDisplayedSkuIds(prev => {
      const newOrder = [sku.id, ...prev.filter(id => id !== sku.id)].slice(0, 3);
      return newOrder;
    });
  }
};
```

**4. Update inline grid to use displayedSkuIds for order:**

Instead of mapping over `recentSkus` directly, use the `displayedSkuIds` to determine display order:

```typescript
// Build displayed products from stable order
const displayedProducts = useMemo(() => {
  if (displayedSkuIds.length === 0) return recentSkus.slice(0, 3);
  
  return displayedSkuIds
    .map(id => recentSkus.find(s => s.id === id))
    .filter(Boolean);
}, [displayedSkuIds, recentSkus]);
```

**5. Update inline thumbnail click to NOT change order:**

```typescript
// In the grid, clicking a visible product does NOT update display order
<button onClick={() => handleSkuSelect(sku, false)} ...>
```

**6. Update ProductPickerModal callback to trigger order update:**

```typescript
// In ProductPickerModal onSelectSku prop
onSelectSku={(sku) => {
  handleSkuSelect(sku, true); // fromModal = true
  setShowProductPickerModal(false);
}}
```

---

## Flow Diagram

```text
User clicks inline product (one of 3 visible)
  → handleSkuSelect(sku, false)
  → Updates selectedSku
  → Does NOT update displayedSkuIds
  → Grid order stays the same

User clicks "Browse All" → selects product
  → handleSkuSelect(sku, true)
  → Updates selectedSku
  → IF sku not in displayedSkuIds:
      → Prepends sku.id to displayedSkuIds
      → Grid re-renders with new product at position 1
```

---

## File Summary

| File | Changes |
|------|---------|
| `ProductShootStep2.tsx` | Add `displayedSkuIds` state, modify `handleSkuSelect` to accept `fromModal` flag, use stable order for inline grid |

---

## Visual Comparison

**Before (current behavior):**
```
Initial: [Boston, Arizona, EVA]
Click "Browse More" → select "Madrid"
Grid jumps: [Madrid, Boston, Arizona] (instant re-order from DB query)
Click Boston inline
Grid may jump again based on last_used_at update
```

**After (fixed behavior):**
```
Initial: [Boston, Arizona, EVA]
Click "Browse More" → select "Madrid"
Grid: [Madrid, Boston, Arizona] (controlled by displayedSkuIds)
Click Boston inline
Grid stays: [Madrid, Boston, Arizona] (no order change)
Click Arizona inline
Grid stays: [Madrid, Boston, Arizona] (no order change)
```

---

## Consistency with Lifestyle Flow

This implementation matches the lifestyle flow's `displayedProductIds` pattern:
- Stable local state controls display order
- Only "Browse More" selections update the order
- Inline clicks do not disturb the layout

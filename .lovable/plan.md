

# Remove Redundant Product Info + Fix Selection Indicator

## Summary

Two UI fixes for the Product Shoot workflow:
1. Remove the redundant "Selected Product Info Row" below the product grid
2. Fix the bottom bar "Product" chip to show checkmark when a product is selected

---

## Issue #1: Remove Redundant Product Info Row

### Current Behavior
Below the 3-product grid, there's a grey info row showing:
- "Birkenstock Arizona Dark Brown Sandals"
- "BIRK-ARIZONA-DBR"

This is redundant because:
- The product name is already shown in the collapsible header
- The product grid thumbnails already show names and selection state

### Fix

**File:** `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`

Remove lines 419-433:
```typescript
{/* Selected Product Info Row - DELETE THIS */}
{selectedSku && (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
    <div className="flex-1 min-w-0">
      <div className="font-medium text-foreground truncate">{selectedSku.name}</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {selectedSku.sku_code && <span className="truncate">{selectedSku.sku_code}</span>}
        {selectedSku.sku_code && selectedSku.angles?.length > 0 && <span>•</span>}
        {selectedSku.angles?.length > 0 && (
          <span>{selectedSku.angles.length} angle{selectedSku.angles.length !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  </div>
)}
```

---

## Issue #2: Fix Product Selection Indicator

### Current Behavior
The bottom bar shows "Product" without a checkmark even when a product is selected.

### Root Cause
In `ProductShootIndicators.tsx`, line 46:
```typescript
const hasProduct = !!state.recoloredProductUrl;
```

This checks for `recoloredProductUrl`, but the correct check should be for `selectedProductId` since:
- `selectedProductId` is set immediately when a product is selected
- `recoloredProductUrl` may be undefined if the product has no composite image or angles

### Fix

**File:** `src/components/creative-studio/product-shoot/ProductShootIndicators.tsx`

Change line 46 from:
```typescript
const hasProduct = !!state.recoloredProductUrl;
```

To:
```typescript
const hasProduct = !!state.selectedProductId;
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `ProductShootStep2.tsx` | Remove "Selected Product Info Row" (lines 419-433) |
| `ProductShootIndicators.tsx` | Change `hasProduct` check from `recoloredProductUrl` to `selectedProductId` |

---

## Expected Result

After fix:

```text
┌─────────────────────────────────────────────────────────┐
│ Your Products                                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│ │  ✓       │ │          │ │          │                 │
│ │[Arizona] │ │[Boston]  │ │[Arizona] │                 │
│ │Dark Brn  │ │Taupe     │ │EVA       │                 │
│ └──────────┘ └──────────┘ └──────────┘                 │
│                                                         │
│ [Browse All Products...]  ← No redundant info row      │
└─────────────────────────────────────────────────────────┘

Bottom bar:
✓ Product · ✓ Shot Type: Product Focus · ✓ Background: Auto
↑ Now shows checkmark correctly
```


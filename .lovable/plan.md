

# Fix: Toggle State Reset Bug in Product Shoot Grid

## Problem Summary

When you toggle OFF "Attach Reference Images" and then click any product in the grid (even the one already selected), the system secretly resets the toggle back to `true`. The UI switch stays in the "off" position, but the actual state sent to the generation engine is `true` - causing reference images to be attached against your intention.

---

## Root Cause

In `ProductShootStep2.tsx`, the `handleSkuSelect` function has two issues:

1. **Variable Shadowing**: The function parameter `attachReferenceImages` shadows the local state variable of the same name
2. **Default to True**: When clicking the grid, the function is called with `undefined` for this parameter, which then defaults to `true`:

```typescript
// Line 290 in handleSkuSelect
onStateChange({
  attachReferenceImages: attachReferenceImages ?? true, // ❌ Resets to true if undefined!
});

// Line 405: Grid click passes undefined
<button onClick={() => handleSkuSelect(sku, null, undefined, undefined, false)}>
```

---

## Fix Overview

Change the default behavior to **preserve existing state** instead of resetting to `true`:

```text
BEFORE: attachReferenceImages ?? true        // Resets to true when undefined
AFTER:  attachReferenceImages ?? state.attachReferenceImages ?? true  // Preserves current state
```

---

## Technical Changes

### File: `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`

**Change 1:** Update `handleSkuSelect` to preserve the current toggle state (around line 290):

```typescript
const handleSkuSelect = (
  sku: ProductSKU, 
  components?: ShoeComponents | null,
  overrides?: ComponentOverrides,
  attachReferenceImages?: boolean,
  fromModal: boolean = false
) => {
  setSelectedSku(sku);
  onStateChange({
    selectedProductId: sku.id,
    recoloredProductUrl: sku.composite_image_url || sku.angles[0]?.thumbnail_url,
    // Preserve existing overrides if none provided (don't wipe them out)
    componentOverrides: overrides !== undefined ? overrides : state.componentOverrides,
    // Preserve current toggle state if not explicitly provided
    attachReferenceImages: attachReferenceImages ?? state.attachReferenceImages ?? true,
  });
  // ...
};
```

**Change 2:** Also preserve component overrides when clicking grid products (prevents losing hot pink changes):

The same pattern applies - when `overrides` is `undefined`, preserve the current state instead of wiping it out.

---

## Data Flow After Fix

```text
User toggles OFF reference images
        │
        ▼
state.attachReferenceImages = false
        │
        ▼
User clicks product in grid
        │
        ▼
handleSkuSelect called with attachReferenceImages = undefined
        │
        ▼
Uses: attachReferenceImages ?? state.attachReferenceImages ?? true
        │
        ▼
Resolves to: false (preserves current state) ✓
        │
        ▼
Generation correctly skips reference images
```

---

## Expected Result

| Action | Before Fix | After Fix |
|--------|-----------|-----------|
| Toggle OFF, then click product | Secretly resets to ON | Stays OFF |
| Toggle OFF, then generate | Attaches refs anyway | Correctly skips refs |
| Set color override, click product | Loses override | Preserves override |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Preserve `attachReferenceImages` and `componentOverrides` state when not explicitly provided |


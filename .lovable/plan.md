
# Fix Background Indicator Display

## Issue

The bottom bar shows "Background: Auto" even when a studio background (White Cyclorama) is selected. The indicator should reflect the actual selection.

---

## Root Cause

The `getBackgroundLabel` function in `ProductShootIndicators.tsx` only checks `state.settingType`:

```typescript
const getBackgroundLabel = () => {
  if (state.settingType === 'studio') return 'Background: Studio';
  if (state.settingType === 'outdoor') return 'Background: Outdoor';
  return 'Background: Auto';
};
```

However, when a specific background is selected from the Studio/Outdoor tabs, the `backgroundId` is set (e.g., `studio-white`), but `settingType` may not be properly synced. The indicator should also consider the `backgroundId` prefix to correctly determine the background category.

---

## Fix

Update `getBackgroundLabel` to check both `settingType` AND the `backgroundId` prefix:

**File:** `src/components/creative-studio/product-shoot/ProductShootIndicators.tsx`

**Current (lines 55-59):**
```typescript
const getBackgroundLabel = () => {
  if (state.settingType === 'studio') return 'Background: Studio';
  if (state.settingType === 'outdoor') return 'Background: Outdoor';
  return 'Background: Auto';
};
```

**Updated:**
```typescript
const getBackgroundLabel = () => {
  // Check backgroundId prefix first (most reliable indicator of actual selection)
  if (state.backgroundId?.startsWith('studio-')) return 'Background: Studio';
  if (state.backgroundId?.startsWith('outdoor-')) return 'Background: Outdoor';
  
  // Fall back to settingType
  if (state.settingType === 'studio') return 'Background: Studio';
  if (state.settingType === 'outdoor') return 'Background: Outdoor';
  
  return 'Background: Auto';
};
```

---

## Expected Result

When "White Cyclorama" (studio-white) is selected:

```text
✓ Product · ✓ Shot Type: Full Body · ✓ Background: Studio
                                                      ↑ Now correctly shows "Studio"
```

When an outdoor background is selected:
```text
✓ Product · ✓ Shot Type: Full Body · ✓ Background: Outdoor
```

When "Auto" is selected (no specific background):
```text
✓ Product · ✓ Shot Type: Full Body · ✓ Background: Auto
```

---

## File Changes

| File | Changes |
|------|---------|
| `ProductShootIndicators.tsx` | Update `getBackgroundLabel` to check `backgroundId` prefix in addition to `settingType` |

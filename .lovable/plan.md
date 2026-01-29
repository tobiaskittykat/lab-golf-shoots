
# Clean Flow Isolation: Product Shoot vs Lifestyle

## Overview

The current architecture allows users to click between "Product Shot" and "Lifestyle" chips at any step, but state from one flow bleeds into the other, causing:
- Lifestyle moodboards appearing on Product Shoot generations
- Wrong product references attached
- Lifestyle concept names on Product Shoot images

This plan implements **proper flow isolation** by locking the flow type once in Step 2 and adding a complete state reset when switching flows.

---

## Architecture Decision

**Chosen approach: Lock flow type in Step 2**

| Option | Description | Recommendation |
|--------|-------------|----------------|
| Lock in Step 2 | Type chips disabled after entering Step 2 | **Selected** - cleanest UX |
| Reset on switch | Allow switch but force back to Step 1 | Alternative |

---

## Changes Required

### 1. Disable Type Chips in Step 2

**File: `src/components/creative-studio/CreativeStudioHeader.tsx`**

Add a new prop `disableTypeSwitch` and use it to lock the chips:

```typescript
interface CreativeStudioHeaderProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
  hideBriefInput?: boolean;
  disableTypeSwitch?: boolean;  // NEW - locks type selection
}
```

In the chip rendering, when `disableTypeSwitch` is true:
- Selected chip stays styled as selected
- Other chips are grayed out (like "Coming Soon" chips)
- Clicking does nothing (or shows tooltip: "Go back to Step 1 to change")

### 2. Pass Prop from Wizard

**File: `src/components/creative-studio/CreativeStudioWizard.tsx`**

Pass `disableTypeSwitch={state.step === 2}` to all `CreativeStudioHeader` usages in Step 2:

```typescript
<CreativeStudioHeader
  state={state}
  onUpdate={handleUpdate}
  disableTypeSwitch={state.step === 2}  // Lock in step 2
  ...
/>
```

### 3. Clear Cross-Flow State on Back

When user clicks "Back" from Step 2 to Step 1, clear the OTHER flow's state:

**File: `src/components/creative-studio/CreativeStudioWizard.tsx`**

Update `handleBack` to reset step-2-specific state so Step 1 is clean:

```typescript
const handleBack = useCallback(() => {
  handleUpdate({ 
    step: 1,
    // Clear step 2 selections so they don't persist
    concepts: [],
    selectedConcept: null,
    moodboard: null,
    productReferences: [],
    curatedMoodboards: [],
    curatedProducts: [],
    displayedMoodboardIds: [],
    displayedProductIds: [],
    discoveryMode: false,
    discoveryImages: [],
    userPreferences: [],
    // Reset product shoot to defaults
    productShoot: initialProductShootState,
  });
}, [handleUpdate]);
```

### 4. Fix Product Shoot Image Naming

**File: `src/hooks/useImageGeneration.ts`**

Currently passes `conceptTitle: selectedConcept?.title` which comes from lifestyle. For Product Shoot, use the SKU/product name instead:

```typescript
// Around line 351 in buildRequestBody
conceptTitle: state.useCase === 'product' 
  ? (productNames[0] || 'Product Shot')
  : selectedConcept?.title,
```

### 5. Skip Lifestyle References in Product Shoot

**File: `src/hooks/useImageGeneration.ts`**

The lifestyle `productReferences` array (lines 152-172) and moodboard (lines 115-148) should be skipped for product flow:

```typescript
// Only process lifestyle product references for non-product flows
if (state.useCase !== 'product') {
  for (const productRef of state.productReferences) {
    // ... existing loop
  }
}

// Only fetch moodboard for non-product flows
if (state.moodboard && state.useCase !== 'product') {
  // ... existing moodboard logic
}
```

---

## Visual Behavior

### Step 1
- All available type chips are clickable
- User picks "Product Shot" or "Lifestyle"
- Clicks "Continue" to proceed

### Step 2
- Selected type chip is highlighted
- Other type chips are grayed out with reduced opacity
- Hovering shows tooltip: "Return to Step 1 to change"
- User configures the selected flow
- "Back" button returns to Step 1 with clean state

---

## File Summary

| File | Change |
|------|--------|
| `src/components/creative-studio/CreativeStudioHeader.tsx` | Add `disableTypeSwitch` prop, gray out non-selected chips |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Pass `disableTypeSwitch` in Step 2, reset state on Back |
| `src/hooks/useImageGeneration.ts` | Skip lifestyle refs for product flow, fix naming |

---

## Result

After these changes:
1. **No accidental flow switching** - Step 2 locks the selected flow
2. **Clean state on Back** - returning to Step 1 resets everything
3. **Correct image naming** - Product Shoot uses SKU names, not concept titles
4. **No cross-contamination** - Lifestyle moodboards/products won't appear in Product Shoot generations

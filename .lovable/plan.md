

# Add "Translucent Plastic (Color-Matched)" Buckle Option

## What's Missing

There are currently two translucent buckle options — "Translucent (Clear)" and "Translucent (Rose Gold)" — but neither auto-syncs with the upper's color. A color-matched translucent plastic option should exist alongside the existing Matte Plastic and Metal color-matched variants.

## Changes

### 1. `src/lib/birkenstockMaterials.ts` -- Add new material entry

Add a new buckle material in the **Plastic** or **Special** category:

```
{ value: 'Translucent (Coordinated)', label: 'Translucent Plastic (Color-Matched)', category: 'Special' }
```

This sits alongside the existing translucent options.

### 2. `src/hooks/useShoeComponents.ts` -- Extend sync logic

Update the buckle auto-sync condition to also trigger for `Translucent (Coordinated)`:

```
Before: material === 'Matte Plastic (Coordinated)' || material === 'Metal (Coordinated)'
After:  material === 'Matte Plastic (Coordinated)' || material === 'Metal (Coordinated)' || material === 'Translucent (Coordinated)'
```

### 3. `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` -- Extend locked-color detection

Update the `isColorMatched` check to include the new translucent option so the color picker locks and shows "Matches Upper: [color]" when selected.

## Behavior

When a user selects "Translucent Plastic (Color-Matched)" for buckles:
- The color picker locks and displays "Matches Upper: [Color]"
- The buckle color auto-syncs with the upper
- The prompt describes it as e.g. "Translucent (Coordinated) in Moss Green" so the AI generates a tinted translucent buckle matching the upper

## Files Changed

- `src/lib/birkenstockMaterials.ts` (1 line added)
- `src/hooks/useShoeComponents.ts` (1 condition expanded)
- `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` (1 condition expanded)


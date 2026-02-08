

# Clean Up Buckle Material Options

## Problem

The current buckle options have two issues:

1. **No generic "Metal" with color picker** -- All metal options (Brass, Silver, Copper, Rose Gold) have their color baked into the name, but there's no way to pick a custom metal color for creative exploration
2. **"Translucent Rose Gold" is odd** -- This isn't a real Birkenstock category. Birkenstock has translucent clear buckles (on EVA models) and that's it for translucent
3. **"Metallic (Rose Gold Big Buckle)" is too specific** -- Big Buckles come in various metallic finishes (silver, copper, gold), not just rose gold

## Revised Buckle Options

Here's the cleaned-up list with clear logic for each:

| Material | Color Picker? | Why |
|----------|--------------|-----|
| **Metal (Brass/Gold)** | No - fixed color | Inherent finish |
| **Metal (Silver)** | No - fixed color | Inherent finish |
| **Metal (Copper)** | No - fixed color | Inherent finish |
| **Metal (Rose Gold)** | No - fixed color | Inherent finish |
| **Antique Brass** | No - fixed color | Inherent finish |
| **Metal (Custom Color)** | Yes - color picker | NEW -- for creative/non-standard metal colors |
| **Metal (Color-Matched)** | No - syncs with upper | Existing coordinated behavior |
| **Matte Plastic** | Yes - color picker | Can be any color |
| **Matte Plastic (Color-Matched)** | No - syncs with upper | Existing coordinated behavior |
| **Translucent (Clear)** | No - fixed color | Inherent finish |
| **Translucent (Color-Matched)** | No - syncs with upper | Existing coordinated behavior |
| **Metallic Big Buckle** | Yes - color picker | NEW -- replaces Rose Gold-only option, can be any metallic color |

**Removed:**
- "Translucent Rose Gold" -- not a real Birkenstock category
- "Metallic (Rose Gold Big Buckle)" -- replaced by generic "Metallic Big Buckle" with color picker

**Added:**
- "Metal (Custom Color)" -- generic metal with color picker for creative use
- "Metallic Big Buckle" -- generic big buckle with color picker (silver, copper, gold, rose gold, etc.)

## Changes

### 1. `src/lib/birkenstockMaterials.ts`

**Extend `MaterialOption` interface** with optional `fixedColor` and `fixedColorHex`:

```typescript
export interface MaterialOption {
  value: string;
  label: string;
  category?: string;
  fixedColor?: string;
  fixedColorHex?: string;
}
```

**Update buckle entries** with fixed colors and restructured options:

```typescript
buckles: [
  // Metal finishes (fixed color)
  { value: 'Metal (Brass)', label: 'Metal (Brass/Gold)', category: 'Metal', fixedColor: 'Brass/Gold', fixedColorHex: '#B5A642' },
  { value: 'Metal (Silver)', label: 'Metal (Silver)', category: 'Metal', fixedColor: 'Silver', fixedColorHex: '#C0C0C0' },
  { value: 'Metal (Copper)', label: 'Metal (Copper)', category: 'Metal', fixedColor: 'Copper', fixedColorHex: '#B87333' },
  { value: 'Metal (Rose Gold)', label: 'Metal (Rose Gold)', category: 'Metal', fixedColor: 'Rose Gold', fixedColorHex: '#B76E79' },
  { value: 'Antique Brass', label: 'Antique Brass', category: 'Metal', fixedColor: 'Antique Brass', fixedColorHex: '#6B5B3E' },
  // Metal with color picker
  { value: 'Metal (Custom)', label: 'Metal (Custom Color)', category: 'Metal' },
  { value: 'Metal (Coordinated)', label: 'Metal (Color-Matched)', category: 'Metal' },
  // Plastic
  { value: 'Matte Plastic', label: 'Matte Plastic', category: 'Plastic' },
  { value: 'Matte Plastic (Coordinated)', label: 'Matte Plastic (Color-Matched)', category: 'Plastic' },
  // Special
  { value: 'Translucent', label: 'Translucent (Clear)', category: 'Special', fixedColor: 'Clear', fixedColorHex: '#E8E8E8' },
  { value: 'Translucent (Coordinated)', label: 'Translucent (Color-Matched)', category: 'Special' },
  { value: 'Metallic Big Buckle', label: 'Metallic Big Buckle', category: 'Special' },
]
```

### 2. `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`

**Add fixed-color detection** -- look up the selected material in the materials list and check for `fixedColor`:

```typescript
const selectedMaterialOption = materials.find(m => m.value === selectedMaterial);
const hasFixedColor = selectedMaterialOption?.fixedColor != null;
```

**Auto-set color when a fixed-color material is selected** -- add an effect:

```typescript
useEffect(() => {
  if (hasFixedColor && selectedMaterialOption) {
    setSelectedColor(selectedMaterialOption.fixedColor!);
    setSelectedHex(selectedMaterialOption.fixedColorHex || '');
  }
}, [selectedMaterial, hasFixedColor]);
```

**Show locked state for fixed-color materials** -- similar to the existing color-matched display, but showing the material's inherent color:

```
Color section has 3 states:
1. Normal -- full color picker (Matte Plastic, Metal Custom, Metallic Big Buckle, non-buckle components)
2. Color-matched -- locked to upper color (Coordinated materials, already implemented)
3. Fixed color -- locked to material's inherent color (Metal Brass, Silver, etc.)
```

The fixed-color display shows a small swatch with the inherent color name and a note like "Inherent finish -- color defined by material."

## Files Changed

| File | Change |
|------|--------|
| `src/lib/birkenstockMaterials.ts` | Add `fixedColor`/`fixedColorHex` to interface; restructure buckle entries; remove Translucent Rose Gold and Metallic Rose Gold Big Buckle; add Metal Custom and Metallic Big Buckle |
| `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` | Add fixed-color detection; show locked state for fixed-color materials; auto-set color on selection |


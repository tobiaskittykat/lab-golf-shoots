

# Add EVA to Lining & Visual Category Headers in Material Picker

## Issues Found

1. **Missing Material**: `EVA` is not in the `lining` array - needed for molded sandals
2. **No Visual Categorization**: The material list has category comments in the code but the UI shows all materials in a flat grid with no groupings

---

## Changes

### 1. Add EVA to Lining Materials

**File: `src/lib/birkenstockMaterials.ts`**

```typescript
lining: [
  { value: 'Shearling (Cream)', label: 'Shearling (Cream)' },
  { value: 'Shearling (Black)', label: 'Shearling (Black)' },
  { value: 'Suede', label: 'Suede' },
  { value: 'Wool Felt', label: 'Wool Felt' },
  { value: 'Microfiber', label: 'Microfiber' },
  { value: 'EVA', label: 'EVA (Molded)' },  // NEW
],
```

### 2. Add Category Metadata to Materials

Update the data structure to include category info for UI rendering:

**File: `src/lib/birkenstockMaterials.ts`**

```typescript
upper: [
  // Natural Leathers
  { value: 'Oiled Leather', label: 'Oiled Leather', category: 'Natural Leathers' },
  { value: 'Smooth Leather', label: 'Smooth Leather', category: 'Natural Leathers' },
  { value: 'Nubuck', label: 'Nubuck (Leather)', category: 'Natural Leathers' },
  // ... etc
  // Synthetics
  { value: 'Birko-Flor', label: 'Birko-Flor (Smooth)', category: 'Synthetics' },
  // ... etc
  // Textiles
  { value: 'Canvas', label: 'Canvas', category: 'Textiles' },
  // ... etc
],
```

### 3. Update UI to Show Category Headers

**File: `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`**

Group materials by category and render section headers:

```typescript
// Group materials by category
const groupedMaterials = useMemo(() => {
  const groups: Record<string, typeof materials> = {};
  materials.forEach(mat => {
    const cat = mat.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(mat);
  });
  return groups;
}, [materials]);

// In render:
{Object.entries(groupedMaterials).map(([category, mats]) => (
  <div key={category} className="space-y-1.5">
    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
      {category}
    </p>
    <div className="grid grid-cols-2 gap-1.5">
      {mats.map((mat) => (
        // existing material button...
      ))}
    </div>
  </div>
))}
```

---

## Visual Result

**Before** (flat list):
```
┌─────────────┬─────────────┐
│ Oiled       │ Smooth      │
│ Nubuck      │ Suede       │
│ Patent      │ Shearling   │
│ Birko-Flor  │ Birko-Flor  │
│ ...         │ ...         │
└─────────────┴─────────────┘
```

**After** (grouped with headers):
```
NATURAL LEATHERS
┌─────────────┬─────────────┐
│ Oiled       │ Smooth      │
│ Nubuck      │ Suede       │
│ Patent      │ Shearling   │
└─────────────┴─────────────┘

SYNTHETICS  
┌─────────────┬─────────────┐
│ Birko-Flor  │ Birko-Flor  │
│ Birkibuc    │ EVA (Molded)│
└─────────────┴─────────────┘

TEXTILES
┌─────────────┬─────────────┐
│ Wool Felt   │ Canvas      │
│ Fabric      │ Mesh        │
└─────────────┴─────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/birkenstockMaterials.ts` | Add EVA to lining; add `category` property to all materials in `upper`, `buckles`, `heelstrap` |
| `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` | Group materials by category and render with section headers |


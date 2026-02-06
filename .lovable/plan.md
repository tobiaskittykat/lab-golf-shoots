

# Add Fabric/Textile Material Options

## What's Missing

The Arizona in your screenshot uses a soft woven **fabric** upper, but this material isn't available in the current component override system. Birkenstock has expanded their material range to include various textile options for their vegan and summer lines.

## Proposed Changes

### File: `src/lib/birkenstockMaterials.ts`

Add these missing upper materials:

```typescript
upper: [
  { value: 'Suede', label: 'Suede' },
  { value: 'Oiled Leather', label: 'Oiled Leather' },
  { value: 'Smooth Leather', label: 'Smooth Leather' },
  { value: 'Nubuck', label: 'Nubuck' },
  { value: 'Birko-Flor', label: 'Birko-Flor' },
  { value: 'Birkibuc', label: 'Birkibuc' },
  { value: 'Wool Felt', label: 'Wool Felt' },
  { value: 'EVA', label: 'EVA' },
  { value: 'Patent Leather', label: 'Patent Leather' },
  { value: 'Shearling', label: 'Shearling' },
  // NEW: Fabric/textile options
  { value: 'Fabric', label: 'Fabric (Woven)' },
  { value: 'Canvas', label: 'Canvas' },
  { value: 'Mesh', label: 'Mesh (Breathable)' },
  { value: 'Recycled PET', label: 'Recycled PET (Eco)' },
],
```

Also add buckle option for the matte plastic style:
```typescript
buckles: [
  // ... existing ...
  { value: 'Matte Plastic (Coordinated)', label: 'Matte Plastic (Color-Matched)' },
],
```

And add new colors from this Arizona:
```typescript
// Add to COLOR_PRESETS
{ name: 'Apricot', hex: '#E6A57E', category: 'color' },
{ name: 'Coral', hex: '#FF7F50', category: 'color' },
{ name: 'Peach', hex: '#FFDAB9', category: 'color' },
```

## Result

After this change, when you select an Arizona (or any product with fabric upper), you'll be able to:
- Override to fabric/canvas/mesh materials
- Use color-matched matte plastic buckles
- Pick from summer colorways like Apricot/Coral

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/birkenstockMaterials.ts` | Add Fabric, Canvas, Mesh, Recycled PET to upper materials; add color-matched matte plastic buckle; add summer color presets |


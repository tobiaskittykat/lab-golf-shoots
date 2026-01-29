

# Make Camera Angle Thumbnails Smaller + Add Lifestyle Angle

## Summary

Two changes to the Product Focus camera angle selector:
1. **Reduce thumbnail size** - Make the visual grid more compact
2. **Add "Lifestyle" angle** - A new creative option that gives the AI compositional freedom

---

## Changes

### 1. Reduce Thumbnail Size

**File: `src/components/creative-studio/product-shoot/CameraAngleSelector.tsx`**

Current grid uses `grid-cols-4` which creates ~80px thumbnails on typical screens. We'll make them smaller:

| Property | Current | New |
|----------|---------|-----|
| Grid columns | `grid-cols-4` | `grid-cols-5` |
| Gap | `gap-2` | `gap-1.5` |
| Auto icon | `w-6 h-6` | `w-5 h-5` |
| Label font | `text-[10px]` | `text-[9px]` |
| Label padding | `px-1.5 py-1.5` | `px-1 py-1` |

This will make each thumbnail approximately 20-25% smaller while maintaining readability.

---

### 2. Add "Lifestyle" Angle Option

**File: `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`**

Add a new angle that encourages creative, dynamic compositions:

```typescript
export type ProductFocusAngle = 
  | 'auto'
  | 'hero'
  | 'side-profile'
  | 'top-down'
  | 'sole-view'
  | 'detail-closeup'
  | 'pair-shot'
  | 'lifestyle';  // NEW

// Add to productFocusAngleOptions:
{ 
  value: 'lifestyle' as ProductFocusAngle, 
  label: 'Lifestyle', 
  prompt: 'dynamic lifestyle composition with creative freedom, product artfully placed in context with props or environmental elements, editorial product photography with mood and atmosphere, AI determines optimal angle and arrangement',
  thumbnail: null, // No thumbnail - uses icon like "Auto"
}
```

**Key differences from other angles:**
- No fixed camera position
- Allows props and environmental context
- Focus on mood/atmosphere over clinical precision
- AI has creative latitude on composition
- Uses a sparkle/wand icon instead of a fixed thumbnail (since the output is dynamic)

---

### 3. Update CameraAngleSelector for Lifestyle Icon

**File: `src/components/creative-studio/product-shoot/CameraAngleSelector.tsx`**

Add a special icon for the "Lifestyle" option (since it doesn't have a fixed thumbnail):

```typescript
import { Grid3X3, Sparkles } from 'lucide-react';

// In the render:
{thumbnailSrc ? (
  <img src={thumbnailSrc} ... />
) : option.value === 'lifestyle' ? (
  <div className="w-full h-full flex items-center justify-center bg-muted/50">
    <Sparkles className="w-5 h-5 text-muted-foreground" />
  </div>
) : (
  <div className="w-full h-full flex items-center justify-center bg-muted/50">
    <Grid3X3 className="w-5 h-5 text-muted-foreground" />
  </div>
)}
```

---

## Visual Preview

```text
Before (4 cols, larger):
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Auto   │ │  Hero   │ │  Side   │ │Top Down │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
┌─────────┐ ┌─────────┐ ┌─────────┐
│  Sole   │ │ Detail  │ │  Pair   │
└─────────┘ └─────────┘ └─────────┘

After (5 cols, smaller + Lifestyle):
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ Auto  │ │ Hero  │ │ Side  │ │TopDwn │ │ Sole  │
└───────┘ └───────┘ └───────┘ └───────┘ └───────┘
┌───────┐ ┌───────┐ ┌───────┐
│Detail │ │ Pair  │ │Lifestl│
└───────┘ └───────┘ └───────┘
```

---

## Prompt Output for "Lifestyle" Angle

When user selects **Lifestyle**, the camera angle section becomes:

```text
CAMERA ANGLE:
- dynamic lifestyle composition with creative freedom, product artfully placed in context with props or environmental elements, editorial product photography with mood and atmosphere, AI determines optimal angle and arrangement
```

This gives the prompt agent freedom to create visually interesting compositions rather than strict e-commerce angles.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/creative-studio/product-shoot/CameraAngleSelector.tsx` | Reduce sizes: 5 cols, smaller gaps, smaller icons/text; add Sparkles icon for lifestyle |
| `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` | Add `'lifestyle'` to `ProductFocusAngle` type and `productFocusAngleOptions` array |


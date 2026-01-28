
# Add Output Settings to Product Shoot Workflow

## Overview

Add the same "Output Settings" section from the lifestyle shoot flow to the Product Shoot Step 2 configuration. This will allow users to configure:
- Number of images to generate (1, 2, 4, 8)
- Resolution (512px, 1024px, 2048px)
- Aspect Ratio (1:1, 4:5, 16:9, 9:16, 4:3, 3:4)

## Current State

The lifestyle flow (`StepTwoCustomize.tsx`) has a dedicated "Output" section with three dropdown selects for image count, resolution, and aspect ratio. The product shoot flow (`ProductShootStep2.tsx`) currently lacks this - it only has sections for Product, Shot Type, Background, and Model.

## Implementation Approach

Since the Product Shoot workflow shares the parent `CreativeStudioState` (which already has `imageCount`, `resolution`, and `aspectRatio` fields), we just need to:

1. Add UI controls in `ProductShootStep2.tsx` that update the parent state
2. Pass the necessary props from `CreativeStudioWizard.tsx` to `ProductShootStep2`

This approach reuses existing state management and type definitions rather than duplicating them.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Add "Output Settings" collapsible section with dropdowns for image count, resolution, and aspect ratio |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Pass output settings props to ProductShootStep2 component |

## UI Changes

Add a new collapsible section to ProductShootStep2 after the Model section:

```text
┌─────────────────────────────────────────────────────┐
│  ⚙️ Output Settings                                 │
│  ┌───────────┬───────────┬───────────┐              │
│  │  Images   │Resolution │   AR      │              │
│  │  [4x  ▼]  │[1024px ▼] │ [1:1  ▼]  │              │
│  └───────────┴───────────┴───────────┘              │
└─────────────────────────────────────────────────────┘
```

## Technical Details

### Props to Add to ProductShootStep2

```typescript
interface ProductShootStep2Props {
  // ... existing props
  
  // Output settings (from parent CreativeStudioState)
  imageCount: number;
  resolution: string;
  aspectRatio: string;
  onOutputSettingsChange: (updates: { 
    imageCount?: number; 
    resolution?: string; 
    aspectRatio?: string; 
  }) => void;
}
```

### Section Implementation

The Output Settings section will use:
- `Select` component from `@/components/ui/select`
- Same styling as other collapsible sections in ProductShootStep2
- Import `aspectRatios` and `resolutions` from `../types.ts`
- Settings2 icon from lucide-react for the section header

### Section Order

The sections will be ordered as:
1. Product
2. Shot Type  
3. Background
4. Model
5. **Output Settings** (new)

This places output configuration at the end, following the same pattern as the lifestyle flow where "Output" comes after the creative configuration sections.

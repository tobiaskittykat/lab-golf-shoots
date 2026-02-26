

# Add Prompt and Meta View to Set-Up Product Results

## Overview
The Set-Up Product flow generates images but currently only shows a basic grid with Approve/Redo buttons. Unlike other modules (New Shoot, Remix, Lifestyle) that use `ImageDetailModal` to display prompt text, reference images, generation settings, and integrity analysis, the setup flow discards all this metadata. This plan adds a click-to-view detail flow.

## Changes

### File: `src/components/creative-studio/product-shoot/SetupProductStep2.tsx`

**1. Store full GeneratedImage data in angle results**

Update the `AngleResult` interface to include the full `GeneratedImage` object:
```typescript
interface AngleResult {
  angleId: ProductFocusAngle;
  imageUrl: string | null;
  isGenerating: boolean;
  approved: boolean;
  error?: string;
  generatedImage?: GeneratedImage; // Full metadata for detail view
}
```

Update the `handleGenerate` and `handleRegenerate` callbacks to store `images[0]` in the result:
```typescript
{ ...r, imageUrl: images[0]?.imageUrl || null, generatedImage: images[0] || undefined, isGenerating: false, ... }
```

**2. Add ImageDetailModal integration**

- Import `ImageDetailModal` and `GeneratedImage` type
- Add state for selected image and modal visibility:
  ```typescript
  const [detailImage, setDetailImage] = useState<GeneratedImage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  ```
- Make each result image clickable -- clicking opens the detail modal with the stored `GeneratedImage`
- Add the `ImageDetailModal` component at the bottom of the JSX, wired to the state

**3. Make result images clickable**

Wrap the image in the results grid with a click handler:
```typescript
<div 
  className="cursor-pointer" 
  onClick={() => {
    if (result.generatedImage) {
      setDetailImage(result.generatedImage);
      setIsDetailOpen(true);
    }
  }}
>
```

Add a subtle hover overlay with an "info" or "expand" icon to signal clickability.

## What Users Will See
- After generating setup product images, clicking any result image opens the same detail modal used across all other modules
- The modal shows: the refined prompt sent to the AI, reference images used, AI model, resolution, aspect ratio, and product integrity analysis (if available)
- All existing functionality (Approve, Redo, Save) remains unchanged

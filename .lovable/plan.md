

# Progressive Image Display & Parallel Sequential Generation

## Summary

Currently, when generating multiple images in Sequential Generation mode, all images are generated one by one (sequentially), and the UI only displays them after **all** images are complete. This creates a poor user experience where users stare at skeletons for 2-3 minutes.

The solution is two-fold:
1. **Progressive display**: Show each image as soon as it completes (like Discovery Mode already does)
2. **Parallel execution**: Generate images in parallel batches (groups of 2-3) to significantly reduce total wait time

---

## Current Behavior Analysis

### Sequential Generation (lines 464-492 in useImageGeneration.ts)

```typescript
// CURRENT: Loop that waits for each image before starting the next
for (let i = 0; i < state.imageCount; i++) {
  const { data } = await supabase.functions.invoke('generate-image', { ... });
  allImages.push(...data.images);  // Collected but not shown yet
}
// ONLY NOW are images returned to the UI
return { images: allImages };
```

**Problems:**
- Each image takes ~30-60 seconds to generate
- 4 images = 2-4 minutes of waiting with no visual feedback
- No parallelization despite independent operations

### Discovery Mode (already has progressive display)

Discovery mode uses an `onImageReady` callback that progressively adds images to the UI as they complete:

```typescript
// DISCOVERY: Parallel + progressive
const shotPromises = shotTypes.map(async (shot) => {
  const result = await generateSingleImage(...);
  if (onImageReady) onImageReady(result);  // Immediately visible!
  return result;
});
await Promise.all(shotPromises);
```

---

## Solution Architecture

```text
  Sequential Mode (Current)          Sequential Mode (New)
  ========================          =====================
  
  [Start] ─→ [Generate #1] ─→      [Start] ─┬→ [Gen #1] ─→ [Show #1]
              ↓                              │
          [Wait 45s]                         ├→ [Gen #2] ─→ [Show #2]
              ↓                              │     (parallel batch 1)
          [Generate #2] ─→                   ↓
              ↓                         [Wait ~45s for batch]
          [Wait 45s]                         │
              ↓                         ─┬→ [Gen #3] ─→ [Show #3]
          [Generate #3] ─→               │
              ...                        ├→ [Gen #4] ─→ [Show #4]
              ↓                               (parallel batch 2)
          [Show ALL]                         
                                    Total: ~90s for 4 images
  Total: ~180s for 4 images         (50% faster + progressive feedback)
```

---

## Technical Changes

### 1. Update `generateImages` in `useImageGeneration.ts`

Add an `onImageReady` callback parameter (same pattern as `generateDiscoveryBatch`):

```typescript
const generateImages = useCallback(async (
  state: CreativeStudioState,
  logoUrl?: string,
  brandId?: string,
  onImageReady?: (image: GeneratedImage) => void  // NEW: progressive callback
): Promise<GeneratedImage[]> => {
```

### 2. Rewrite Sequential Generation Block

Replace the sequential `for` loop with parallel batches:

```typescript
if (state.sequentialGeneration && state.useCase === 'product' && state.imageCount > 1) {
  console.log(`Sequential mode: generating ${state.imageCount} images with parallel batches`);
  
  const BATCH_SIZE = 2; // Generate 2-3 images in parallel at a time
  const allImages: GeneratedImage[] = [];
  
  // Create all generation promises (but don't execute yet)
  const generateOne = async (index: number): Promise<GeneratedImage | null> => {
    const freshShotTypePrompt = buildShotTypePromptForProduct();
    console.log(`Sequential image ${index + 1}/${state.imageCount} - starting`);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: buildRequestBody(freshShotTypePrompt, 1),
      });
      
      if (error || !data?.images?.[0]) return null;
      
      const img = data.images[0];
      const generatedImage: GeneratedImage = {
        id: img.id || `seq-${Date.now()}-${index}`,
        imageUrl: img.imageUrl || '',
        status: img.status || 'failed',
        prompt: state.prompt,
        refinedPrompt: img.refinedPrompt,
        conceptTitle: productNames[0] || 'Product Shot',
        index,
        productReferenceUrls: productReferenceUrls.length > 0 ? productReferenceUrls : undefined,
        productReferenceUrl: productReferenceUrls[0],
      };
      
      // PROGRESSIVE DISPLAY: Immediately notify caller
      if (onImageReady && generatedImage.status === 'completed') {
        onImageReady(generatedImage);
      }
      
      return generatedImage;
    } catch (err) {
      console.error(`Sequential image ${index + 1} failed:`, err);
      return null;
    }
  };
  
  // Process in parallel batches to avoid overwhelming the API
  for (let batchStart = 0; batchStart < state.imageCount; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, state.imageCount);
    const batchPromises = [];
    
    for (let i = batchStart; i < batchEnd; i++) {
      batchPromises.push(generateOne(i));
    }
    
    const batchResults = await Promise.all(batchPromises);
    const successfulImages = batchResults.filter((img): img is GeneratedImage => img !== null);
    allImages.push(...successfulImages);
  }
  
  data = { images: allImages };
  error = allImages.length === 0 ? { message: 'All sequential generations failed' } : null;
}
```

### 3. Update `handleGenerate` in `CreativeStudioWizard.tsx`

Use the callback to progressively add images to state:

```typescript
const handleGenerate = useCallback(async () => {
  handleUpdate({ isGenerating: true, generatedImages: [] });
  
  // Generate placeholder images for loading state (show remaining slots)
  const placeholders: GeneratedImage[] = Array.from({ length: state.imageCount }).map((_, i) => ({
    id: `pending-${i}`,
    imageUrl: '',
    status: 'pending' as const,
    prompt: state.prompt,
    index: i,
  }));
  handleUpdate({ generatedImages: placeholders });
  
  // Progressive callback: replace placeholder with real image as each completes
  const onImageReady = (image: GeneratedImage) => {
    setState(prev => {
      // Find the first pending placeholder and replace it, OR just add to end
      const newImages = [...prev.generatedImages];
      const pendingIdx = newImages.findIndex(img => img.status === 'pending');
      
      if (pendingIdx >= 0) {
        newImages[pendingIdx] = image;
      } else {
        newImages.push(image);
      }
      
      return { ...prev, generatedImages: newImages };
    });
  };
  
  // Call with progressive callback
  const images = await generateImages(state, logoUrl, currentBrand?.id, onImageReady);
  
  // Final update (replaces any remaining placeholders with failed status)
  handleUpdate({ 
    isGenerating: false, 
    generatedImages: images.length > 0 
      ? images 
      : placeholders.map(p => ({ ...p, status: 'failed' as const }))
  });
}, [state, handleUpdate, generateImages, logoUrl, currentBrand?.id]);
```

### 4. Update Gallery to Handle Mixed State

The `GeneratedImagesGallery` already supports mixed states (pending + completed), but we should ensure it gracefully handles the transition:

```typescript
// In GeneratedImagesGallery.tsx - existing logic handles this well
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
  {images.map((image) => (
    image.status === 'pending' ? (
      <GeneratedImageCardSkeleton key={image.id} />
    ) : (
      <GeneratedImageCard key={image.id} image={image} ... />
    )
  ))}
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useImageGeneration.ts` | Add `onImageReady` callback parameter; rewrite sequential loop to use parallel batches with progressive callbacks |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Update `handleGenerate` to use progressive callback |
| `src/components/creative-studio/GeneratedImagesGallery.tsx` | Minor: ensure mixed pending/completed rendering works smoothly |

---

## Performance Impact

| Scenario | Current Time | New Time | Improvement |
|----------|-------------|----------|-------------|
| 4 images (sequential) | ~180s | ~90s | 50% faster |
| 4 images (first visible) | ~180s | ~45s | 75% faster perceived |
| 8 images | ~360s | ~180s | 50% faster |

---

## Edge Cases

1. **Partial failures**: If 2/4 images fail, the successful ones still appear immediately
2. **All failures**: Remaining placeholders convert to failed state at the end
3. **Rate limiting**: Batch size of 2-3 prevents API overload while still providing parallelism
4. **Integrity analysis**: Already triggers per-image, so progressive display works seamlessly


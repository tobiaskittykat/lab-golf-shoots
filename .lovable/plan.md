
# Fix: AI-Built Moodboard Images Not Properly Combined

## Problem Summary

When you build a moodboard with the AI tool, you carefully select 9 images that work together. However:

1. **Display Issue**: The moodboard thumbnail only shows 1 of your 9 images - not the full collection
2. **Generation Issue**: When generating images, only that single thumbnail is sent to the AI - losing the other 8 reference images you selected

This means your curated moodboard aesthetic is reduced to just one image, which explains why results don't capture the full mood you intended.

---

## Current Behavior

```text
You select 9 beautiful Mediterranean images:
  [Image1] [Image2] [Image3]
  [Image4] [Image5] [Image6]
  [Image7] [Image8] [Image9]

But the system only uses Image1 as the moodboard thumbnail and reference.
The other 8 images are stored in the database but never used.
```

---

## Solution Overview

**Two-Part Fix:**

1. **Create a Collage Thumbnail** - When saving an AI-built moodboard, create a composite 3x3 grid image showing all selected images. This gives users a proper visual representation.

2. **Pass All Images to Generation** - When generating images, if the moodboard has multiple `imageUrls` in its visual analysis, pass ALL of them to the AI as style references (up to 4-5 for token limits).

---

## Technical Implementation

### Part 1: Collage Thumbnail Creation

**File: `src/components/creative-studio/MoodboardBuilder.tsx`**

Add a function to create a 3x3 collage using HTML Canvas:

```typescript
// Create a 3x3 collage from selected images
async function createMoodboardCollage(imageUrls: string[]): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const gridSize = Math.min(3, Math.ceil(Math.sqrt(imageUrls.length)));
  const cellSize = 400; // Each cell is 400x400
  canvas.width = gridSize * cellSize;
  canvas.height = gridSize * cellSize;
  
  const ctx = canvas.getContext('2d');
  // Load and draw each image into grid cells
  // ... (detailed implementation)
  
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
}
```

Then in `handleSave`:
1. Create the collage from selected images
2. Upload to storage
3. Use the uploaded collage URL as `thumbnail_url`

### Part 2: Pass Multiple Images to Generation

**File: `supabase/functions/generate-image/index.ts`**

Update the moodboard attachment logic (around line 726):

```typescript
// Check if moodboard has multiple curated images
const moodboardImageUrls = moodboardAnalysis?.imageUrls as string[] | undefined;

if (moodboardImageUrls && moodboardImageUrls.length > 1) {
  // AI-built moodboard - attach multiple reference images (up to 4)
  const refUrls = moodboardImageUrls.slice(0, 4);
  for (const url of refUrls) {
    messageContent.push({
      type: "image_url",
      image_url: { url }
    });
  }
  messageContent.push({
    type: "text",
    text: `PRIMARY STYLE REFERENCE: These ${refUrls.length} moodboard images define the visual aesthetic...`
  });
} else if (moodboardUrl) {
  // Single-image moodboard (uploaded) - existing logic
  messageContent.push({
    type: "image_url", 
    image_url: { url: moodboardUrl }
  });
  // ...
}
```

**File: `src/hooks/useImageGeneration.ts`**

Update to pass the full `visual_analysis` including `imageUrls` to the generation function.

---

## Display Improvements

**File: `src/components/creative-studio/MoodboardThumbnail.tsx`**

For AI-built moodboards, optionally show a mini-grid preview in the full-view dialog:

```typescript
// In the full view dialog, show all images in a grid
{moodboard.visualAnalysis?.imageUrls?.length > 0 && (
  <div className="grid grid-cols-3 gap-2 mt-4">
    {moodboard.visualAnalysis.imageUrls.map((url, i) => (
      <img key={i} src={url} className="aspect-square object-cover rounded" />
    ))}
  </div>
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/creative-studio/MoodboardBuilder.tsx` | Add collage creation function, upload composite on save |
| `src/lib/imageCompositing.ts` | Add `createMoodboardCollage()` utility function |
| `supabase/functions/generate-image/index.ts` | Check for `imageUrls` array and attach multiple references |
| `src/hooks/useImageGeneration.ts` | Ensure `visual_analysis` with `imageUrls` is passed through |
| `src/components/creative-studio/MoodboardThumbnail.tsx` | Show all images in full-view dialog for AI-built moodboards |

---

## Expected Results

| Before | After |
|--------|-------|
| Thumbnail shows 1 image | Thumbnail shows 3x3 collage of all 9 images |
| Generation uses 1 reference | Generation uses up to 4 curated references |
| Moodboard mood is lost | Full aesthetic captured in generation |
| Dialog shows single image | Dialog shows full image grid |

---

## Summary

The fix ensures your carefully curated 9-image moodboard:
1. Displays as a proper visual collage (not just one image)
2. Passes multiple reference images to the AI during generation
3. Shows all images when you view the moodboard details

This will dramatically improve the quality and consistency of generated images matching your intended mood.



# Five Fixes for the Creative Studio

## 1. Make Shoe Components Panel Collapsible (Default: Collapsed)

**Problem:** The ShoeComponentsPanel always shows all component rows, taking up significant sidebar space even when the user doesn't need to customize them.

**Fix:** Wrap the component rows, quick customization input, and re-analyze button inside a `Collapsible` component. The header ("Shoe Components" + Reset All + Ref. Images toggle) becomes the trigger. Default state is collapsed. When overrides exist, it auto-expands.

**File:** `src/components/creative-studio/product-shoot/ShoeComponentsPanel.tsx`
- Import `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` from radix
- Add `isOpen` state, defaulting to `false`
- Auto-expand when `hasOverrides` is true
- Add a chevron indicator to the header
- Wrap QuickCustomizationInput, component rows, and re-analyze button inside `CollapsibleContent`

---

## 2. Failed Generations: Dismissible Bar + Delete Button on Failed Tiles

**Problem:** The red "X image(s) failed" bar persists with no way to dismiss it. Failed image tiles in the grid have no delete button, so users can't remove them.

**Fix (A) - Failed bar dismissible:** Add a close/dismiss button (X icon) to the failed-images summary bar in `GeneratedImagesGallery.tsx`. Clicking it hides the bar.

**Fix (B) - Delete button on failed tiles:** In `GeneratedImageCard.tsx`, show the delete button in the overlay for failed/NSFW images (currently the overlay only shows for `status === 'completed'`). Show a minimal overlay with just the Trash icon when hovering failed tiles.

**Files:**
- `src/components/creative-studio/GeneratedImagesGallery.tsx` -- add dismiss state + X button on failed bar
- `src/components/creative-studio/GeneratedImageCard.tsx` -- show delete button overlay for failed/NSFW status

---

## 3. "Generate Variations" Becomes "Regenerate" (Same Settings)

**Problem:** The RefreshCw button on image hover says "Generate Variations" but the user wants it to regenerate with the exact same settings and prompt, and have the new image properly enter the generation queue.

**Fix:** Rename the action from "Generate Variations" to "Regenerate". Update the handler so it re-uses the exact same prompt, settings, and references from the original image instead of creating a variation with a new seed. The regenerated image uses the `generateImages` flow (which includes proper polling and progressive display) rather than `generateVariations`.

**Files:**
- `src/components/creative-studio/GeneratedImageCard.tsx` -- rename tooltip from "Generate Variations" to "Regenerate"
- `src/components/creative-studio/CreativeStudioWizard.tsx` -- update `handleVariation` to re-invoke generation using the same state/settings, using the progressive `onImageReady` callback to slot the new image into the gallery properly
- `src/hooks/useImageGeneration.ts` -- update `generateVariations` to pass the identical prompt (not refined), same seed concept, and same settings; OR create a dedicated `regenerateImage` function that re-fires the same request body

---

## 4. Regenerate Button Works for Selected Images + Fix Select

**Problem:** The "Regenerate" button at the top of the gallery currently re-runs the full generation. The user wants it to only regenerate selected images. Additionally, clicking an image card doesn't visually select it (no selection state is tracked).

**Fix:**
- Add a `selectedImages` state (Set of image IDs) to `UnifiedWorkspace` or `GeneratedImagesGallery`
- Clicking an image toggles its selection (checkmark overlay) instead of opening the detail modal. Double-click or a dedicated "View" button opens the detail modal.
- The top "Regenerate" button regenerates only the selected images (one-by-one, same settings)
- When no images are selected, the Regenerate button is disabled or hidden
- Add a visual selection indicator (checkmark badge) on selected cards

**Files:**
- `src/components/creative-studio/GeneratedImagesGallery.tsx` -- add selection state, pass `isSelected` to cards, update regenerate to use selected images
- `src/components/creative-studio/GeneratedImageCard.tsx` -- add `isSelected` prop, show selection checkmark, differentiate click (select) vs. action buttons
- `src/components/creative-studio/UnifiedWorkspace.tsx` -- wire up selection-based regeneration logic

---

## 5. Better Image Naming (Reflect Color/Material Overrides)

**Problem:** Generated images are named using the raw SKU name (e.g., "Birkenstock Arizona Taupe Suede"). When the user changes the color to Hot Pink, the image is still named "Taupe Suede" because the `conceptTitle` is set from `productNames[0]` which comes from the database SKU name, not the customized version.

**Fix:** When component overrides are present, build a dynamic image title that reflects the overrides. For example, if the user overrides the upper to "Hot Pink Suede", the title becomes "Birkenstock Arizona Hot Pink Suede" instead of the original "Taupe Suede".

**File:** `src/hooks/useImageGeneration.ts`
- In `buildRequestBody`, after setting `imageTitle` from `productNames[0]`, check if `componentOverrides` exist
- If the upper color/material has been overridden, replace the color/material portion of the SKU name with the overridden values using the `productIdentity` data (which has parsed color and material)
- This produces titles like "Birkenstock Arizona Hot Pink Leather" reflecting the actual generation

---

## Summary of Files Changed

| File | Changes |
|------|---------|
| `ShoeComponentsPanel.tsx` | Wrap in Collapsible, default collapsed, auto-expand on overrides |
| `GeneratedImagesGallery.tsx` | Dismissible failed bar, selection state, selection-based regenerate |
| `GeneratedImageCard.tsx` | Delete button on failed tiles, "Regenerate" tooltip, selection checkmark |
| `UnifiedWorkspace.tsx` | Wire selection-based regeneration |
| `CreativeStudioWizard.tsx` | Update handleVariation to regenerate with same settings |
| `useImageGeneration.ts` | Dynamic image title from overrides, regenerate-same-settings logic |


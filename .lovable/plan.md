

## Issues Found

### 1. No visible prompt field in the Remix UI
The Remix step has no textarea or preview showing the prompt that will be sent to the AI. The prompt is built entirely inside `useImageGeneration.ts` at generation time (lines 442-458) — the user never sees it. We need to add a prompt preview or editable prompt field to `RemixStep2.tsx`.

### 2. Alignment mark images ARE being attached — but only when selected
The pipeline is correctly wired:
- `useImageGeneration.ts` line 455: pushes `selectedMark.publicUrl` into `variantRefs`
- `useImageGeneration.ts` line 475: sends `variantReferenceUrls` to the edge function
- `generate-image/index.ts` lines 148-152: attaches them as `image_url` content to the AI prompt
- DF3i product reference images (6 angles) are also attached (lines 461-465)

So it works — but there's no visual confirmation to the user.

### Plan

**Add a "Remix Prompt Preview" section to RemixStep2**

In `RemixStep2.tsx`, add a collapsible section between "Remix Options" and "Output" that shows:
- A read-only (or editable) textarea displaying the auto-generated prompt based on current selections
- Below it, a row of small thumbnails showing which reference images will be attached (product refs + variant mark thumbnail)
- The prompt updates live as the user picks color/mark

This requires:
- Import `df3iColors`, `df3iAlignmentMarks`, `df3iReferenceImages` from `labGolfVariants.ts`
- Build the prompt string using the same logic as `useImageGeneration.ts` lines 442-458
- Display attached reference image thumbnails
- Optionally allow the user to edit/append to the prompt via a textarea, storing a `remixCustomPrompt` field on `ProductShootState`

**Files to change:**
| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/RemixStep2.tsx` | Add prompt preview section with reference image thumbnails |
| `src/components/creative-studio/product-shoot/types.ts` | Add optional `remixCustomPrompt` field |
| `src/hooks/useImageGeneration.ts` | Use `remixCustomPrompt` if provided, falling back to auto-generated |


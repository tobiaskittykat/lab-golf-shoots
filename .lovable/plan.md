

## Issue: Variant Reference Images Not Reaching the AI Model

There are **two problems** preventing reference images from being used effectively:

### Problem 1: `variantReferenceUrls` ignored by edge function
The client sends alignment mark thumbnails as `variantReferenceUrls`, but the `generate-image` edge function never destructures or attaches them to the AI prompt. They're silently dropped.

### Problem 2: Local asset paths won't work server-side
The DF3i reference images (`df3i_0.png` etc.) and alignment mark thumbnails are imported as Vite assets. In the browser build, these resolve to relative paths like `/assets/df3i_0-abc123.png`. When sent to the edge function and then to the AI gateway, these **aren't valid public URLs** — the AI model can't fetch them.

### Fix

**1. Upload DF3i assets to the `brand-assets` storage bucket**
- Upload the 9 reference images (6 angles + 3 marks) to `brand-assets` storage so they have proper public URLs.
- Create a utility or migration seed that stores these URLs (or do it via the SmartUpload flow).
- Update `labGolfVariants.ts` to reference public storage URLs instead of local imports.

**2. Update `generate-image` edge function**
- Destructure `variantReferenceUrls` from the request body.
- After attaching product references, also attach variant reference images (alignment mark thumbnails) to the `content` array so the AI sees exactly which mark style to render.

**3. Update client-side reference building**
- In `useImageGeneration.ts`, ensure the DF3i reference images and alignment mark thumbnails use the public storage URLs instead of local asset imports.

### Files to change

| File | Change |
|------|--------|
| `src/lib/labGolfVariants.ts` | Switch from local imports to public storage URLs |
| `supabase/functions/generate-image/index.ts` | Destructure and attach `variantReferenceUrls` |
| `src/hooks/useImageGeneration.ts` | Use public URLs for DF3i refs |
| Storage upload (one-time) | Upload 9 images to `brand-assets` bucket |


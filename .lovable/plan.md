

# Scene Gallery with Categories and Auto-Sorting

## Overview
Replace the current single-upload scene experience with a persistent **Scene Gallery**. Users can upload scene images that are saved permanently, automatically categorized by AI, and browsable by category. Selecting a scene from the gallery sets it as the scene reference for product placement.

## Database

### New table: `scene_images`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid | RLS-based ownership |
| brand_id | uuid | Scoped to brand |
| name | text | Auto-generated or user-provided |
| image_url | text | Public URL from brand-assets bucket |
| category | text | AI-assigned: "indoor", "outdoor-urban", "outdoor-nature", "cafe-restaurant", "retail-store", "home", "workspace", "beach-pool", "other" |
| created_at | timestamptz | |

RLS policies: standard user_id = auth.uid() for SELECT, INSERT, DELETE.

## AI Auto-Categorization

When a scene image is uploaded, call a lightweight AI classification (via an edge function `classify-scene`) that returns:
- **category**: one of the predefined categories
- **name**: a short descriptive name (e.g., "Sunlit Kitchen Counter", "Urban Brick Alley")

This uses the Lovable AI model `google/gemini-2.5-flash-lite` (fast/cheap) with a simple prompt: "Classify this scene image into one category and give it a short name."

### Edge function: `supabase/functions/classify-scene/index.ts`
- Accepts `{ imageUrl: string }`
- Returns `{ category: string, name: string }`
- Uses gemini-2.5-flash-lite for fast classification

## UI Changes

### BackgroundSelector.tsx -- Scene tab redesign
Replace the current single-upload area with a gallery layout:

1. **Category filter row** -- horizontal scrollable pills showing categories (All, Indoor, Outdoor, Cafe, etc.) with count badges
2. **Image grid** -- 4-column grid of saved scene thumbnails (same card style as studio/outdoor presets)
3. **Upload tile** -- "+" tile at the end to upload new scenes (uploads, classifies via AI, saves to DB)
4. **Selected state** -- clicking a scene card sets `sceneImageUrl` and `selectedBackgroundId = 'scene-{id}'`
5. **Delete on hover** -- X button like custom backgrounds
6. **Placement direction input** -- kept below the grid when a scene is selected

### Flow when uploading a new scene:
1. User clicks "+" upload tile or drops an image
2. Image uploads to `brand-assets/{userId}/scene/`
3. Edge function `classify-scene` is called with the image URL
4. Scene is saved to `scene_images` table with AI-assigned category and name
5. Gallery refreshes, new image appears in correct category
6. Image is auto-selected as the active scene

## New Hook: `src/hooks/useSceneImages.ts`
- `useQuery` to fetch scene images for current brand, ordered by created_at desc
- `createScene` mutation (upload + classify + insert)
- `deleteScene` mutation
- Follows the same pattern as `useCustomBackgrounds`

## Files Modified
1. **Migration SQL** -- Create `scene_images` table with RLS
2. **`supabase/functions/classify-scene/index.ts`** -- New edge function for AI categorization
3. **`src/hooks/useSceneImages.ts`** -- New hook for CRUD operations
4. **`src/components/creative-studio/product-shoot/BackgroundSelector.tsx`** -- Redesign Scene tab with gallery, categories, upload
5. **`src/components/creative-studio/product-shoot/ProductShootStep2.tsx`** -- Minor: no prop changes needed since sceneImageUrl is already wired

## Scene Categories
```text
indoor | outdoor-urban | outdoor-nature | cafe-restaurant
retail-store | home | workspace | beach-pool | other
```

## Technical Notes
- The existing `sceneImageUrl` state and edge function attachment logic remain unchanged -- the gallery simply provides a better way to select which scene image URL to use
- Scene images are per-brand (like custom backgrounds), so switching brands shows different galleries
- No changes needed to the generate-image edge function -- it already handles `sceneImageUrl`

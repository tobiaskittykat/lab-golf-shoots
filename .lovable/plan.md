

# Custom Backgrounds Feature

## Overview
Add a "Custom" tab to the background selector where users can create their own reusable backgrounds per brand. The flow: upload 1-3 reference images, AI analyzes them and generates a background prompt, user can edit/refine, then save. These custom backgrounds appear as selectable tiles just like the built-in Studio/Outdoor presets.

## User Flow

1. User clicks the **Custom** tab in the background selector
2. They see their saved custom backgrounds (if any) as tiles, plus a prominent **"+ New Background"** button
3. Clicking "New Background" opens a modal:
   - Upload 1-3 reference images (drag-and-drop or click)
   - Give it a name (e.g., "Rustic Terracotta Wall")
   - AI analyzes the images and generates a background prompt
   - User can edit the AI-generated prompt before saving
4. Saved custom backgrounds appear as tiles with their reference image as thumbnail
5. Selecting a custom background works identically to selecting a preset -- its prompt gets injected into the generation pipeline

## Technical Plan

### 1. Database: New `custom_backgrounds` table

```sql
CREATE TABLE custom_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  thumbnail_url TEXT,        -- first reference image as preview
  reference_urls TEXT[],     -- all uploaded reference image URLs
  ai_analysis JSONB,         -- raw AI analysis (colors, textures, mood)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
- RLS: standard user_id-based policies (SELECT, INSERT, UPDATE, DELETE)
- Reference images stored in the existing `brand-assets` storage bucket

### 2. Edge Function: `analyze-custom-background`

- Receives 1-3 image URLs
- Calls Gemini 2.5 Flash with the images to extract:
  - Scene description (textures, colors, materials, mood, lighting)
  - A ready-to-use background prompt (matching the style of existing presets)
- Returns `{ prompt: string, analysis: { colors, textures, mood, lighting } }`

### 3. UI Components

**A. BackgroundSelector.tsx changes:**
- Add a third "Custom" tab alongside Studio/Outdoor
- When Custom tab is active, fetch custom backgrounds for current brand
- Display saved custom backgrounds as tiles (same card style as presets)
- Show a "+ New Background" tile that opens the creation modal
- Include an "Auto (AI)" tile for custom backgrounds too
- Allow deleting custom backgrounds (X button on hover)

**B. New component: `CreateCustomBackgroundModal.tsx`**
- Modal with:
  - Name input field
  - Image upload zone (1-3 images, uploaded to `brand-assets` bucket)
  - "Analyze" button that calls the edge function
  - Generated prompt displayed in an editable textarea
  - Save button

### 4. Integration with Generation Pipeline

- Custom backgrounds use the ID format `custom-{uuid}`
- The `generate-image` edge function already supports `customBackgroundPrompt` -- when a custom background is selected, its `prompt` field is passed through this existing mechanism
- No changes needed to the generation edge function

### 5. State Changes

- `SettingType` expanded: `'studio' | 'outdoor' | 'custom'`
- `BackgroundSelector` props unchanged (custom backgrounds feed through `onBackgroundSelect` with `custom-{id}` IDs)
- `ProductShootStep2` resolves custom background prompts from the database when building the generation request

### Files Modified/Created

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/types.ts` | Add `'custom'` to `SettingType` |
| `src/components/creative-studio/product-shoot/BackgroundSelector.tsx` | Add Custom tab, fetch/display custom backgrounds |
| `src/components/creative-studio/product-shoot/CreateCustomBackgroundModal.tsx` | **New** -- modal for creating custom backgrounds |
| `src/hooks/useCustomBackgrounds.ts` | **New** -- hook for CRUD operations on custom backgrounds |
| `supabase/functions/analyze-custom-background/index.ts` | **New** -- AI analysis edge function |
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Resolve custom background prompt when building generation payload |
| DB migration | Create `custom_backgrounds` table with RLS |




# Analyze Uploaded Color/Material Sample Swatch

## Problem
When a user uploads a color/material sample swatch in the Component Override Popover, nothing happens -- it just stores the image. The user expects the swatch to be analyzed by AI to automatically detect the material type, color name, and hex code, then pre-fill those values in the override form so they can review and adjust.

## Solution
Create a new edge function `analyze-color-sample` that uses Gemini Vision to analyze the uploaded swatch image and return a detected material, color name, and hex code. After upload, the popover calls this function and auto-fills the material/color fields with the results. The user can then review and change before applying.

## Changes

### 1. New Edge Function: `supabase/functions/analyze-color-sample/index.ts`

A lightweight Gemini Vision call that receives:
- `imageUrl`: the uploaded swatch URL
- `componentType`: which component this is for (upper, sole, etc.)

Returns structured output via tool calling:
- `material`: best match from the known material list for that component
- `color`: descriptive color name (matched to our palette when possible)
- `colorHex`: hex code

Uses `google/gemini-2.5-flash` for speed since this is a simple visual classification task.

### 2. Update `ComponentOverridePopover.tsx`

After a successful upload (line ~157 where `setSampleImageUrl` is called):
- Add an `isAnalyzing` state
- Call `supabase.functions.invoke('analyze-color-sample', { body: { imageUrl, componentType } })`
- On success, auto-set `selectedMaterial`, `selectedColor`, and `selectedHex` from the response
- Show a small "Analyzing..." spinner on the thumbnail while processing
- If analysis fails, silently fall back to the current behavior (upload only, no auto-fill)

The UI flow becomes:
1. User clicks "Upload swatch photo"
2. Image uploads to storage (existing behavior)
3. Thumbnail appears with a spinner overlay saying "Analyzing..."
4. AI returns material + color -- fields auto-populate
5. User reviews, adjusts if needed, clicks Apply

### 3. UI indicator on the sample thumbnail

While analyzing, show a small `Loader2` spinner overlay on the 16x16 thumbnail with "Analyzing..." text. Once complete, the spinner disappears and the material/color fields reflect the detected values.

## Technical Details

### Edge Function Prompt Strategy
The function will provide the component's available material list as context so the AI picks from known options. The color palette is also provided so it returns a matching preset name + hex when possible, or a custom descriptive name + hex otherwise.

### Tool Calling Schema
```text
{
  name: "identify_material_color",
  parameters: {
    material: { type: "string", enum: [...materials for component] },
    color: { type: "string" },
    colorHex: { type: "string", pattern: "^#[0-9A-F]{6}$" },
    confidence: { type: "number" }
  }
}
```

## Files Summary

| File | Change |
|------|--------|
| `supabase/functions/analyze-color-sample/index.ts` | New edge function -- Gemini Vision swatch analysis |
| `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` | Call analysis after upload, auto-fill material/color fields, show analyzing state |

No database migrations needed.


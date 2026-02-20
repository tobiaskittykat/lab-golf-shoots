

# Add Branding Style to Footbed Logo & Text

## Problem
The buckle engravings section has a dedicated "Style" field (inscribed, embossed, molded), but the footbed logo and footbed text fields have no way to specify how the branding is applied -- stamped, embossed, printed, debossed, etc. This matters for prompt accuracy since the AI generator needs to know the rendering method.

## Solution
Add a "Branding Method" dropdown/input to both the Footbed Logo and Footbed Text fields so users can specify the application technique.

### Updated Footbed Branding Layout

```text
Footbed Logo
[Birkenstock footprint logo___________________]

Logo Method
[stamped in dark ink_________________________]

Footbed Text
[BIRKENSTOCK                                  ]
[MADE IN GERMANY                              ]

Text Method
[embossed / heat-stamped_____________________]
```

## What Changes

### Data Model Update
Add two new optional fields to the branding object in the JSONB `components` column (no DB migration needed -- it's flexible JSON):
- `footbedLogoMethod`: string (e.g., "stamped", "printed", "embossed", "debossed")
- `footbedTextMethod`: string (e.g., "heat-stamped", "embossed", "printed")

### File: `src/components/creative-studio/product-shoot/EditableAnalysisPanel.tsx`
- Add `footbedLogoMethod` and `footbedTextMethod` to the `BrandingData` interface
- Add a `FieldRow` for "Logo Method" below the Footbed Logo field with placeholder "e.g., stamped in dark ink, printed, embossed"
- Add a `FieldRow` for "Text Method" below the Footbed Text field with placeholder "e.g., heat-stamped, embossed, debossed"
- Wire both to `updateBranding()` like the existing fields

### File: `src/components/creative-studio/product-shoot/AIAnalysisPanel.tsx` (read-only panel)
- Display the method next to the logo/text values when present (e.g., "Footprint logo -- stamped in dark ink")

### File: `supabase/functions/analyze-shoe-components/index.ts`
- Add `footbedLogoMethod` and `footbedTextMethod` to the JSON schema so Gemini Vision also extracts the application method during auto-analysis

### File: `supabase/functions/generate-image/index.ts`
- Include the method in prompt injection: instead of just "stamped text", use the specific method from branding data (e.g., "heat-stamped text" or "embossed text")

### Files Summary

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/EditableAnalysisPanel.tsx` | Add footbedLogoMethod and footbedTextMethod fields to BrandingData interface and UI |
| `src/components/creative-studio/product-shoot/AIAnalysisPanel.tsx` | Display method in read-only view |
| `supabase/functions/analyze-shoe-components/index.ts` | Add method fields to Vision schema |
| `supabase/functions/generate-image/index.ts` | Use method in prompt text |

No database migration needed -- components column is JSONB and accepts any structure.




# Show Full AI Analysis Details in Edit Product Modal

## Problem

The Edit Product modal currently shows a tiny "AI Analysis Details" box with only 5 fields from the `description` JSONB (colors, materials, product type, style keywords, hardware finish). But the `components` JSONB has much richer data that you can't see anywhere:

- Per-component breakdown: material, color, color hex swatch, confidence percentage, notes
- Branding analysis: buckle engravings (exact text, style, location), footbed logo description, footbed text
- Construction type (clog, two-strap, thong, etc.)
- Analysis version and timestamp

## What Changes

### Expand the "AI Analysis Details" section in EditSKUModal

Replace the current minimal 5-field display with a comprehensive, collapsible analysis panel that shows everything the AI detected:

**Section 1: Component Breakdown**
A table/grid showing each detected component (Upper, Footbed, Sole, Buckles, Lining, Heelstrap) with:
- Color swatch (using the hex value)
- Material name
- Color name
- Confidence score (as a subtle percentage badge)
- Notes (if present, shown in smaller italic text below)

**Section 2: Construction & Classification**
- Strap construction type (e.g., "clog", "two-strap", "thong")
- Product type (from description)
- Style keywords (from description)

**Section 3: Branding Details** (only shown when branding data exists)
- Buckle engravings: each engraving shown as a row with text, style, and location
- Footbed logo description
- Footbed text (size markings, brand text)
- Other branding details

**Section 4: Analysis Metadata**
- Analysis version (e.g., "v1.3")
- Analyzed at (formatted date/time)

The entire section uses a collapsible accordion pattern -- collapsed by default to keep the modal clean, but expandable to reveal all details. The header shows a summary like "AI Analysis v1.3 -- 5 components detected" so you know at a glance what's there.

## Technical Details

### File: `src/components/creative-studio/product-shoot/EditSKUModal.tsx`

Replace the current inline "AI Analysis Details" block (lines 289-322) with a new expanded component that:

1. Reads both `skuData.components` (the rich component analysis) AND `skuData.description` (the product metadata)
2. Renders a collapsible section using the existing Collapsible component from the UI library
3. Shows color swatches using inline `backgroundColor` style (same pattern as `ShoeComponentsPanel`)
4. Displays confidence as subtle badge (e.g., "95%" in a muted pill)
5. Shows branding details in a structured list format
6. Handles missing data gracefully -- each sub-section only renders if data exists

The component data structure from the database:
```text
components: {
  upper:    { material, color, colorHex, confidence, notes? }
  footbed:  { material, color, colorHex, confidence, notes? }
  sole:     { material, color, colorHex, confidence, notes? }
  buckles?: { material, color, colorHex, confidence, notes? }
  lining?:  { material, color, colorHex, confidence, notes? }
  heelstrap?: { material, color, colorHex, confidence, notes? }
  branding?: {
    buckleEngravings?: [{ text, style, location }]
    footbedLogo?: string
    footbedText?: string
    otherBranding?: string
  }
  strapConstruction?: string
  analysisVersion?: string
  analyzedAt?: string
}
```

### File changed

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/EditSKUModal.tsx` | Replace minimal AI Analysis box with full collapsible component breakdown showing all detected materials, colors, confidence scores, branding details, and construction metadata |


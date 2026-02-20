

# Editable AI Analysis in Edit Product Modal

## Overview
Transform the currently read-only AI Analysis panel in the Edit Product modal into a fully editable interface. Users will be able to correct any AI-detected values -- component materials, colors, branding text (buckle engravings, footbed text), construction type, and classification metadata. Changes are saved back to the `product_skus.components` and `product_skus.description` JSONB columns.

## What Changes

### 1. Replace read-only `AIAnalysisPanel` with new `EditableAnalysisPanel`

A new component that renders the same data but with inline editing:

**Component Breakdown (upper, footbed, sole, buckles, lining, heelstrap):**
- Material: text input (editable)
- Color: text input (editable)  
- Color Hex: small color swatch + text input (editable)
- Confidence: read-only badge (no need to edit)
- Notes: text input (editable)

**Branding Details:**
- Buckle Engravings: each engraving row has editable `text`, `style`, and `location` fields. Add/remove engraving rows.
- Footbed Logo: text input
- Footbed Text: textarea (multi-line, e.g. "BIRKENSTOCK\nMADE IN GERMANY")
- Other Branding: text input

**Construction and Classification:**
- Strap Construction: text input
- Product Type: text input
- Hardware Finish: text input
- Colors: comma-separated text input
- Materials: comma-separated text input
- Style Keywords: comma-separated text input

### 2. State management in `EditSKUModal`

- Add `editedComponents` and `editedDescription` state objects initialized from `skuData`
- Track changes against original to enable the Save button
- On save, write the edited JSONB back to `product_skus.components` and `product_skus.description`

### 3. UX Details

- Each field shows a subtle pencil icon or edit affordance on hover
- Fields use compact inline inputs (not form fields with labels stacked above) to keep the panel dense
- A "Reset to AI values" button restores the original analyzed data if the user wants to undo manual edits
- The panel remains collapsible (starts collapsed) as it does today
- Sections that have user edits show a small "Edited" badge on the section header

## Files Modified

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/EditableAnalysisPanel.tsx` | **New** -- editable version of AIAnalysisPanel |
| `src/components/creative-studio/product-shoot/EditSKUModal.tsx` | Replace `AIAnalysisPanel` with `EditableAnalysisPanel`, add state for edited components/description, save edited JSONB on submit |

No database or edge function changes needed -- this edits existing JSONB columns (`components`, `description`) on the `product_skus` table.


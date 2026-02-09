

# Product Selector Improvements

Three changes to the product selection experience:

## 1. Group Products by Model Type in the Product Picker Modal

Currently the "Browse All Products" modal shows the top 5 recently used, then groups products by the `category` field (which is just "product" for everything). This will change to:

- **Last Used**: Show only the top **3** recently used products (down from 5)
- **Model Groups**: Below "Last Used", group products by their **model name** (e.g., Arizona, Boston, Gizeh, Mayari, Tokyo). Each recognized Birkenstock model gets its own section header.
- **Other**: Products that don't match a known signature model go under "Other"
- **Duplicates allowed**: A product can appear in both "Last Used" AND its model group section

The model name will be extracted using the existing `parseSkuDisplayInfo()` utility, which already parses the second word of "Birkenstock Arizona..." as the model name.

Known signature models: Arizona, Boston, Gizeh, Mayari, Tokyo, Madrid, Milano, Kyoto, Ramses, Yao, and any other model that appears more than once.

### File: `src/components/creative-studio/product-shoot/ProductPickerModal.tsx`

- Change `recentlyUsed` from `slice(0, 5)` to `slice(0, 3)`
- Replace the category-based grouping (`groupedSkus`) with model-name-based grouping
- Extract model name from each SKU using `parseSkuDisplayInfo(sku.name, sku.description).modelName`
- Define a list of known signature models for grouping; anything else goes under "Other"
- Remove the category filter chips (no longer relevant since we group by model, not by "category" field)
- In the main list, do NOT filter out "Last Used" items from their model groups (allow duplicates)

## 2. Direct Selection on Click (No Two-Step Flow)

Currently, clicking a product in the ProductPickerModal opens a customization panel within the modal (select -> customize -> confirm). This is redundant because the `ShoeComponentsPanel` is already shown inline in ProductShootStep2 when a product is selected.

### File: `src/components/creative-studio/product-shoot/ProductPickerModal.tsx`

- Remove the `selectedSku` state and the entire "CUSTOMIZATION VIEW" section (the detail panel with ShoeComponentsPanel, confirm button, back button)
- When clicking a product row, immediately call `onSelectSku(sku)` and close the modal (`onOpenChange(false)`)
- Simplify `onSelectSku` callback signature: no longer needs to pass `components`, `overrides`, or `attachReferenceImages` (those are managed by the inline panel in Step2)
- Remove imports for `ShoeComponentsPanel`, `useShoeComponents`, `useComponentOverrides`, and related types

### File: `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`

- Update the `onSelectSku` callback passed to `ProductPickerModal` to match the simplified signature (just receives the SKU)

## 3. Show Full Detailed Product Description in Edit Modal

Currently the EditSKUModal only shows/edits `description.summary`. The user wants to also see the full structured metadata: colors, materials, product type, style keywords, hardware finish.

### File: `src/components/creative-studio/product-shoot/EditSKUModal.tsx`

- Below the Product Description textarea, add a read-only "Detailed Analysis" section that displays the structured fields from the `description` JSONB:
  - **Colors**: comma-separated list (e.g., "pearl white, brown, black")
  - **Materials**: comma-separated list (e.g., "birko-flor, cork, EVA")
  - **Product Type**: e.g., "sandal"
  - **Style Keywords**: comma-separated (e.g., "thong, adjustable, buckle")
  - **Hardware Finish**: e.g., "bronze"
- These fields are displayed as labeled key-value pairs in a compact, read-only format (not editable individually -- they come from AI analysis and would require re-analysis to change). The summary textarea remains the editable field.
- Style: subtle muted background panel with small text, labeled "AI Analysis Details"

## Technical Details

### Files changed

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/ProductPickerModal.tsx` | Group by model name instead of category; reduce "recently used" to 3; remove customization step; direct-select on click |
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Update `onSelectSku` callback for ProductPickerModal to match simplified signature |
| `src/components/creative-studio/product-shoot/EditSKUModal.tsx` | Add read-only "AI Analysis Details" section showing colors, materials, product_type, style_keywords, hardware_finish |


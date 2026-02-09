

# Enhanced Product Thumbnail Viewer

## What You'll Get

The current product selection grid shows a composite thumbnail per product with a hover popover for angle previews. This plan replaces that with a richer, interactive product viewer for the **selected** product:

1. **Default 3/4 pair view as the big thumbnail** -- when a product is selected, the main large image defaults to the `3/4` angle (the pair shot). If no `3/4` angle exists, falls back to the first available angle or the composite image.

2. **Clickable small angle thumbnails** -- a row of small angle thumbnails appears above the big image. Clicking one swaps the big thumbnail to that angle for the current session only (no database writes).

3. **Fullscreen view on big thumbnail click** -- clicking the large thumbnail opens a Dialog showing the full-resolution image.

4. **Edit button on the angle strip** -- a small pencil/edit icon in the top-right corner of the angle thumbnail row opens the existing EditSKUModal for the selected product.

## UI Layout (Selected Product)

```text
+------------------------------------------+
| [3/4] [Side] [Top] [Sole]    [Edit icon] |  <-- small angle strip + edit button
+------------------------------------------+
|                                          |
|          (Large main thumbnail)          |  <-- clickable for fullscreen
|          Shows selected angle            |
|                                          |
+------------------------------------------+
|  Arizona                                 |
|  Taupe EVA                               |
+------------------------------------------+
```

Below that, the 3-product selection grid stays as-is. The angle viewer only appears for the currently selected product.

## Technical Details

### New Component: `ProductAngleViewer.tsx`

Create `src/components/creative-studio/product-shoot/ProductAngleViewer.tsx`:

- **Props**: `skuId`, `skuName`, `compositeImageUrl`, `onEditClick`
- **State**: `activeAngleId` (session-only, defaults to the `3/4` angle)
- **Data**: Fetches angles from `scraped_products` where `sku_id = skuId` (reuses existing query key `sku-angles-preview`)
- **Default selection logic**: On load, finds the angle where `angle === '3/4'`. If not found, uses the first angle. If no angles exist, falls back to `compositeImageUrl`.
- **Small thumbnails**: Horizontal row of angle thumbnails (similar size to existing `ProductAnglePreview`), each clickable to set `activeAngleId`. The active one gets an accent border.
- **Edit button**: A small `Pencil` icon button positioned at the top-right of the thumbnail strip.
- **Big thumbnail**: Shows the `thumbnail_url` of the active angle. Clicking it opens a fullscreen Dialog.
- **Fullscreen Dialog**: A simple `Dialog` with a large image (`object-contain`, max height 80vh), similar to the pattern already used in `ReferenceThumbnail.tsx`.

### Changes to `ProductShootStep2.tsx`

- Import the new `ProductAngleViewer` component
- When a product is selected (`state.selectedProductId` exists), render `ProductAngleViewer` above the 3-product grid, passing:
  - `skuId={state.selectedProductId}`
  - `skuName={selectedSku?.name || ''}`
  - `compositeImageUrl={selectedSku?.composite_image_url}`
  - `onEditClick` that sets `editingSkuId` and opens `showEditSKUModal`
- The existing HoverCard angle preview on the grid thumbnails remains unchanged (it's useful for non-selected products)

### Changes to `index.ts` (barrel export)

- Add `ProductAngleViewer` to the barrel exports

### Files Changed

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/ProductAngleViewer.tsx` | New component: interactive angle viewer with big thumbnail, angle strip, fullscreen, and edit button |
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Render `ProductAngleViewer` above the product grid when a product is selected |
| `src/components/creative-studio/product-shoot/index.ts` | Add barrel export for `ProductAngleViewer` |

### Key Decisions

- **Session-only state**: The active angle is stored in React state (`useState`), not persisted. Navigating away or selecting a different product resets it to the 3/4 default.
- **3/4 default**: Uses `angle === '3/4'` from the database. This matches the existing angle convention seen in `scraped_products`.
- **Reuses existing patterns**: Fullscreen dialog follows the same pattern as `ReferenceThumbnail.tsx`. Data fetching reuses the same query structure as `ProductAnglePreview`.
- **No changes to data model**: Everything works with the existing `scraped_products` table and `angle` column.




# Enhance the Hover Popover with Interactive Angle Viewer

## What Changes

The product grid stays exactly as-is. The hover popover that appears when you hover over a product thumbnail gets upgraded with 4 new features:

1. **Default 3/4 featured image** at the top of the popover
2. **Clickable angle thumbnails** that swap the featured image (session only)
3. **Fullscreen dialog** when clicking the featured image
4. **Edit button** (pencil icon) in the top-right corner to open the SKU editor

## Popover Layout (Before vs After)

```text
BEFORE:                          AFTER:
+---------------------------+    +-------------------------------+
|  Arizona                  |    |  Arizona              [Edit]  |
|  Taupe EVA                |    |  Taupe EVA                    |
+---------------------------+    +-------------------------------+
| [3/4] [Side] [Sole] [Top]|    |                               |
+---------------------------+    |    (Featured angle image)     |
|  4 angles                 |    |    ~140px tall, clickable     |
+---------------------------+    |    for fullscreen             |
                                 |                               |
                                 +-------------------------------+
                                 | [3/4] [Side] [Sole] [Top]     |
                                 +-------------------------------+
                                 |  4 angles                     |
                                 +-------------------------------+
```

## Technical Details

### 1. Enhance `ProductAnglePreview.tsx`

This is the main change. The component gets upgraded from a static grid to an interactive viewer:

- Add `useState` for `activeAngleId` -- defaults to the angle where `angle === '3/4'`, falls back to first angle
- Add `useState` for `isFullscreen` -- controls fullscreen dialog
- Fetch `full_url` in addition to `thumbnail_url` from `scraped_products` (needed for fullscreen)
- Add optional `onEditClick` prop for the edit button
- Render a **featured image** (~140px height) at the top showing the active angle's thumbnail, clickable to open fullscreen
- Make the small angle thumbnails **clickable** to swap the featured image
- Add a **pencil icon button** next to the product name (top-right)
- Add a **fullscreen Dialog** following the same pattern as `ReferenceThumbnail.tsx`

### 2. Clean up `ProductShootStep2.tsx`

- Remove the `ProductAngleViewer` import (line 20)
- Remove the `ProductAngleViewer` block above the product grid (lines 386-397)
- Pass `onEditClick` prop to `ProductAnglePreview` inside the `HoverCardContent` so the edit button triggers the `EditSKUModal`

### 3. Clean up `index.ts`

- Remove the `ProductAngleViewer` barrel export (line 14)

### Files Changed

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/ProductAnglePreview.tsx` | Add featured image (default 3/4), clickable angle swapping, fullscreen dialog, edit button |
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Remove `ProductAngleViewer` usage; pass `onEditClick` to `ProductAnglePreview` |
| `src/components/creative-studio/product-shoot/index.ts` | Remove `ProductAngleViewer` export |

### Key Decisions

- **Session-only state**: The active angle lives in `useState` inside the popover. Each time the hover closes and reopens, it resets to the 3/4 default.
- **3/4 default**: Matches `angle === '3/4'` from the database -- the pair shot.
- **Fullscreen pattern**: Reuses the exact same Dialog approach from `ReferenceThumbnail.tsx` (max-w-2xl, object-contain, max-h-[70vh]).
- **No new components**: Everything lives inside the enhanced `ProductAnglePreview`. The `ProductAngleViewer.tsx` file can be left as-is (dead code) or deleted -- it's no longer imported anywhere.
- **Grid untouched**: The 3-product selection grid, HoverCard trigger, selection indicators -- all stay exactly the same.


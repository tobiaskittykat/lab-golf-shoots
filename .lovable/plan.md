

# Fix: Auto Tile on Same Row When Expanded

## Problem

When the background grid is expanded ("Show More"), the Auto tile renders in its own separate `<div className="grid ...">`, forcing it onto a new row even if there's space in the last row of presets.

## Fix

**File:** `src/components/creative-studio/product-shoot/BackgroundSelector.tsx`

Simplify `renderGrid()` to use a single grid that always contains all visible presets plus the Auto tile at the end. Remove the separate expanded grid divs.

Current structure (lines 188-226):
```tsx
// Collapsed: one grid with presets + auto
// Expanded: one grid with presets, then a SEPARATE grid just for auto
```

New structure:
```tsx
<div className="grid grid-cols-4 gap-3">
  {visiblePresets.map(renderBackgroundCard)}
  {renderAutoTile()}
</div>
```

One grid, always. The Auto tile naturally flows as the last item in the grid, filling into whatever column is available.

Also removes the empty intermediate grid div (lines 195-199) that renders nothing.

| File | Change |
|------|--------|
| `BackgroundSelector.tsx` | Collapse `renderGrid()` into a single grid containing presets + Auto tile together |


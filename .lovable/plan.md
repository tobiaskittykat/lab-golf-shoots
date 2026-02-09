
# Fix: Click Image to Maximize, Checkmark for Selection

## Problem

Currently, clicking anywhere on the image card toggles selection (checkmark). The user wants clicking the image to **open the detail/maximize modal**, while the selection checkmark in the corner remains a separate interactive element for toggling selection.

## Fix

**File:** `src/components/creative-studio/GeneratedImageCard.tsx`

1. **Change `handleClick`** (lines 116-129): Reverse the priority -- clicking the card body calls `onSelect` (opens detail modal) instead of `onToggleSelect`.

2. **Add a dedicated selection checkbox** in the bottom-right corner of the image area. This small clickable checkmark button calls `onToggleSelect` with `e.stopPropagation()` so it doesn't also trigger the modal.

3. **Remove the Eye (View Details) button** from the hover overlay since clicking the card itself now opens the modal -- the Eye button becomes redundant.

### Updated click logic:
```
Card body click --> onSelect (maximize/detail modal)
Bottom-right checkmark click --> onToggleSelect (selection)
Hover overlay buttons --> Regenerate, Download, Delete (unchanged)
```

### Selection indicator:
- Bottom-right corner: small circular checkbox, always visible when `onToggleSelect` is provided
- When selected: accent-colored with checkmark
- When not selected: semi-transparent circle that appears on hover

| File | Change |
|------|--------|
| `GeneratedImageCard.tsx` | Reverse click priority (card click = modal), add bottom-right selection checkbox, remove Eye button from overlay |

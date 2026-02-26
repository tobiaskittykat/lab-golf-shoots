

# Fix Pair Shot Prompt

## Problem
The current pair shot narrative uses vague language ("complementary angles", "dynamic yet balanced", "multiple perspectives simultaneously") with no camera position, no shoe orientation, and no spatial relationship defined. This causes inconsistent compositions and extra shoes.

## Solution
Replace both `prompt` and `narrative` for `pair-shot` in `shotTypeConfigs.ts` with your spatially precise description, lightly refined for camera elevation accuracy.

## Change

**File:** `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` (lines 462-463)

**Current:**
```
prompt: 'both shoes arranged at complementary angles showing depth, classic e-commerce pair composition, shoes slightly overlapping or staggered'
narrative: 'both shoes arranged at complementary angles, slightly staggered or overlapping to create depth and visual rhythm. The classic e-commerce pair composition — one shoe slightly forward and rotated, the other angled behind — producing a dynamic yet balanced arrangement that showcases the product from multiple perspectives simultaneously.'
```

**New:**
```
prompt: 'staggered parallel pair composition, both shoes facing right, foreground shoe shifted left, low three-quarter side view highlighting sole profile and silhouette depth'
narrative: 'a low three-quarter side view that highlights the profile and thickness of the sole. Both shoes are parallel, toes pointing toward the right and heels toward the left. The shoes are staggered — the foreground shoe is shifted slightly to the left, while the background shoe sits slightly further right and higher in the frame. The toe of the background shoe is clearly visible behind the mid-section of the foreground shoe, and the foreground shoe heel partially overlaps the background shoe heel area, creating layered depth where both silhouettes are fully readable.'
```

## Why This Is Better
- **Camera position defined**: "low three-quarter side view" instead of no camera direction
- **Both shoes oriented identically**: "both facing right, toes right, heels left" -- no ambiguity
- **Stagger relationship explicit**: foreground left, background right+higher, with specific overlap points described
- **Removed all filler**: cut "dynamic yet balanced", "visual rhythm", "multiple perspectives simultaneously"
- **Consistent style**: matches the spatial precision approach used for the sole view fix

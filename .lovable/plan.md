

# Fix: Bake Hex Into Color Field at Ingress

## Root Cause
The deployed runtime is still running old code (no `[BUILD]` or `[COLOR-DEBUG]` logs appear). But even when it does deploy, the current approach is fragile -- it relies on `getColorDescription()` being called at ~15 different places. If any one is missed, hex is lost.

## The Simple Fix
At request ingress, merge the hex directly INTO the `.color` string. Then delete `getColorDescription()` entirely -- it's no longer needed.

**Before:** `{ color: "Dark Slate Gray", colorHex: "#005477" }` -- requires every code path to call a special formatter

**After:** `{ color: "Dark Slate Gray (#005477)" }` -- every code path that reads `.color` automatically has it

## Changes (single file)

### `supabase/functions/generate-image/index.ts`

1. **Replace `normalizeAllOverrides` + `getColorDescription`** with a single simple function that bakes hex into color at ingress:
   - For each override component: if `colorHex` exists, set `color = "ColorName (#HEX)"`
   - If color is empty/Custom, derive name from hex first
   - Then clear `colorHex` field (it's now embedded in `color`)
   - Do the same for `originalComponents` so contrast lines also carry hex

2. **Remove all `getColorDescription()` calls** (~15 call sites) and just use `.color` directly, since it already contains the hex inline.

3. **Bump build fingerprint** to `hex-inline-v1-2026-03-02` to verify deployment.

4. **Keep metadata persistence** (`componentOverrides`/`originalComponents` in settings) from the previous change.

## Why This Works
- Zero chance of hex being dropped -- it's part of the color string itself
- The `PRODUCT COMPONENTS` section will naturally output `UPPER: Natural Leather (grained) in Dark Slate Gray (#005477)`
- The `PRODUCT IDENTITY` section will naturally include it too
- Remix brief contrast lines will include it
- Toe-post sync lines will include it
- No special formatter to forget to call

## Technical Details

The ingress normalizer (called once, right after `req.json()`):

```text
function bakeHexIntoColors(overrides) {
  for each component in overrides:
    if component.colorHex exists:
      name = component.color || deriveNameFromHex(component.colorHex)
      component.color = "Name (#HEX)"
      delete component.colorHex
}
```

Then every existing line like:
```text
componentLines.push(`${type.toUpperCase()}: ${comp.material} in ${color}`);
```
...just works, because `color` already is `"Dark Slate Gray (#005477)"`.

## Verification
After deploy, check logs for:
1. `[BUILD] hex-inline-v1-2026-03-02` -- confirms new runtime
2. `PRODUCT COMPONENTS` section shows `UPPER: ... in Dark Slate Gray (#005477)`
3. Final prompt preserves the hex token

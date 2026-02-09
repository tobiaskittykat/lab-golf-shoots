

# Fix: Heelstrap Leaking into Arizona Prompts + Footbed Missing from Overrides

## What's Actually Happening

I traced through the edge function logs and found the exact problem. Here's a real prompt from your Arizona EVA generation:

```
=== PRODUCT COMPONENTS (from analysis) ===
UPPER: EVA in Taupe
FOOTBED: EVA in Taupe
SOLE: EVA in Taupe
BUCKLES: Matte Plastic in Translucent Brown

=== PRODUCT COMPONENT OVERRIDES ===
UPPER: EVA in Wine Red (was: EVA in Taupe)
SOLE: EVA in Wine Red (was: EVA in Taupe)
BUCKLES: Matte Plastic (Coordinated) in Wine Red
HEELSTRAP: EVA in Wine Red     <-- PHANTOM! Arizona has no heelstrap
```

The database correctly has `heelstrap: null` for the Arizona. But when you used quick customization (e.g., "wine red"), the AI returned a heelstrap override anyway. Three things failed:

1. **The quick customization AI** (`interpret-shoe-customization`) hallucinated a heelstrap override even though `currentComponents.heelstrap` was absent from the input
2. **The client** (`useQuickCustomization.ts`) blindly applied it without checking if the shoe actually has that component
3. **The prompt builder** (`generate-image/index.ts`, line 609) has an explicit `else if (override && !orig)` branch that includes overrides even when the original component doesn't exist -- it was designed for "additions" but becomes a loophole for phantom components

## About the Footbed

The footbed IS in your prompt -- it's listed in the `PRODUCT COMPONENTS` section (`FOOTBED: EVA in Taupe`). It's just not in the OVERRIDES section because the AI correctly kept it unchanged (Rule 7: footbed stays EVA/cork unless explicitly requested). So the prompt agent does see it. This is working correctly.

## About Sequential Generation

Sequential generation is NOT the cause. Each sequential call uses the same `buildRequestBody` closure, which captures `originalComponents` and `componentOverrides` identically for every image. The heelstrap leak happens earlier, during the quick customization step, before any generation begins.

## The Fix (3 layers of defense)

### Layer 1: AI Instructions (prevent hallucination)

**File:** `supabase/functions/interpret-shoe-customization/index.ts`

Add a new critical rule to the system prompt:

> "ONLY return components that are present and non-null in CURRENT SHOE COMPONENTS above. If a component (e.g., heelstrap) is missing from the current state, the shoe does NOT have that part -- do NOT include it in your response, even for 'all' requests."

Update examples like "all black leather" to add "(if shoe has heelstrap)" qualifiers.

### Layer 2: Client-side guard (catch any hallucination that slips through)

**File:** `src/hooks/useQuickCustomization.ts`

After the AI returns overrides (around line 102, after the retry loop), add a filter:

```typescript
// Filter out overrides for components the shoe doesn't have
for (const key of Object.keys(validOverrides)) {
  if (!currentComponents[key as ComponentType]) {
    console.warn(`[QuickCustomization] Filtered phantom component: ${key}`);
    delete validOverrides[key];
  }
}
```

### Layer 3: Prompt builder guard (last line of defense)

**File:** `supabase/functions/generate-image/index.ts`

Change line 609 from:
```typescript
} else if (override && !orig) {
  changedComponents.push(`${type.toUpperCase()}: ...`);
}
```
To:
```typescript
} else if (override && !orig) {
  // Skip phantom overrides -- if the original shoe doesn't have this
  // component, don't inject it into the prompt
  console.warn(`Skipping phantom override for ${type} (no original component)`);
}
```

### Layer 4: Analysis hint fix

**File:** `supabase/functions/analyze-shoe-components/index.ts`

Line 46 currently says: *"Sandals (Arizona, Florida) also have heelstraps."*

Change to: *"Some sandals like the Florida and Milano have heelstraps. Slide sandals like the Arizona and Madrid do NOT have heelstraps -- they are open-back. Analyze the images to determine if a back strap is present."*

This doesn't affect the current Arizona (already correctly analyzed as `heelstrap: null`), but prevents future re-analyses from making the same mistake.

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/interpret-shoe-customization/index.ts` | Add critical rule: only return components present in currentComponents; update examples |
| `src/hooks/useQuickCustomization.ts` | Add client-side guard to filter overrides for non-existent components |
| `supabase/functions/generate-image/index.ts` | Change `override && !orig` branch to skip phantom overrides instead of including them |
| `supabase/functions/analyze-shoe-components/index.ts` | Fix incorrect hint that Arizona has heelstraps |

## Summary

- **Heelstrap in prompt**: Caused by the quick customization AI hallucinating a heelstrap override for a shoe that doesn't have one, with no guard at any level to catch it. Fixed at 3 layers.
- **Footbed not in overrides**: This is correct behavior -- the footbed wasn't changed, so it's only listed in the base components section (which the prompt agent does see).
- **Sequential generation**: Not related. The issue occurs during the customization step, before generation begins.

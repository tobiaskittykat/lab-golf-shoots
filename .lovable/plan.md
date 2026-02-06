

# Pass Full Product Components and Summary to Prompt Agent

## What's Changing

Two gaps are being fixed so the AI prompt agent always knows about your product's materials (shearling lining, cork footbed, metal buckles, heel strap, etc.) and description -- not just when you've made customizations.

## Changes

### 1. Always include product components in the creative brief

Currently, the analyzed shoe components (upper, footbed, sole, buckles, heelstrap, lining with their materials and colors) are only sent to the prompt agent when you've made customizations. When everything is left "as-is," the agent gets zero component info.

**Fix:** Add a new `=== PRODUCT COMPONENTS ===` section in the edge function that always appears when original components exist, regardless of overrides. This tells the agent things like "LINING: Shearling in Cream" or "HEELSTRAP: Leather in Dark Brown."

**File:** `supabase/functions/generate-image/index.ts`
- Insert a new block before the existing override section (before line 501)
- When `originalComponents` exists, emit each component's material and color
- The existing override section continues to work on top of this for customized components

### 2. Pass the product description summary to the prompt agent

The database stores a natural language summary (e.g., "A classic Birkenstock Boston clog, updated with a cozy shearling lining for warmth") but it is never forwarded to generation.

**Fix (3 files):**

| File | Change |
|------|--------|
| `src/lib/skuDisplayUtils.ts` | Add `summary?: string` field to `SKUDisplayInfo` and populate it from the description |
| `src/hooks/useImageGeneration.ts` | Already fetches `description` -- no query changes needed. Just ensure the summary flows through `productIdentity` |
| `supabase/functions/generate-image/index.ts` | Add `Description: ...` line inside the existing PRODUCT IDENTITY section when summary is present |

### 3. Send `originalComponents` unconditionally

Currently in `useImageGeneration.ts` line 470, `originalComponents` is already sent when present (not gated by overrides). The gate is actually in the edge function (line 502) which only reads them inside the override block. The fix in step 1 above addresses this by adding a separate block that reads `originalComponents` independently.

## Technical Details

### `skuDisplayUtils.ts` -- Add summary to SKUDisplayInfo

```typescript
export interface SKUDisplayInfo {
  brandName: string;
  modelName: string;
  material: string;
  color: string;
  productType: string;
  fullName: string;
  summary?: string;  // NEW
}
```

In `parseSkuDisplayInfo`, after the description parsing block:
```typescript
if (description?.summary) {
  result.summary = description.summary;
}
```

### `generate-image/index.ts` -- New PRODUCT COMPONENTS section (before line 501)

```typescript
// === PRODUCT COMPONENTS (always include when available) ===
if (request.originalComponents) {
  const orig = request.originalComponents;
  const componentTypes = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'];
  const componentLines: string[] = [];

  for (const type of componentTypes) {
    const comp = orig[type];
    if (comp && comp.material) {
      componentLines.push(
        `${type.toUpperCase()}: ${comp.material} in ${comp.color || 'N/A'}`
      );
    }
  }

  if (componentLines.length > 0) {
    sections.push("=== PRODUCT COMPONENTS (from analysis) ===");
    sections.push("Accurately describe these materials and features in your prompt:");
    componentLines.forEach(line => sections.push(line));
    sections.push("");
  }
}
```

### `generate-image/index.ts` -- Add summary to PRODUCT IDENTITY section (after line 420)

```typescript
if (pi.summary) sections.push(`Description: ${pi.summary}`);
```

## No Changes Needed

- The `analyze-shoe-components` function is left as-is (heel strap rule is correct -- Bostons don't have them, Tokyos do)
- The `useImageGeneration.ts` hook already sends `originalComponents` unconditionally (line 470) -- no change needed there
- The existing override/contrast section stays unchanged and continues to layer on top




# Smart Branding: Shot-Type-Aware Prompt Injection

## Problem

The branding details section (footbed wordmarks like "42 BIRKEN 270 Soft Footbed Made in Germany", footbed logos, etc.) is injected into every prompt regardless of shot type. This:
- Wastes prompt tokens on invisible elements (footbed is hidden in on-foot/on-model shots)
- Confuses the AI generator, which tries to render text it can't place
- AI image generators struggle to reliably render long stamped text anyway

## Solution

Make the branding injection in `generate-image/index.ts` conditional on the shot type. The analysis continues to capture full branding data -- we only filter what enters the prompt.

### Branding rules by shot type:

| Shot Type | Buckle Engravings | Footbed Text/Logo |
|-----------|------------------|-------------------|
| On-Foot | Yes (visible) | No (hidden by foot) |
| Full Body / Lifestyle | Yes (visible) | No (hidden by foot) |
| Product Focus | Yes | Simplified + dynamic (see below) |

### Dynamic footbed descriptor (Product Focus only)

Instead of injecting the full verbose text, use the analyzed footbed material dynamically:

```
"Footbed: branded {footbed.material} footbed with maker's stamp and logo (as shown in reference images)"
```

Examples:
- "branded Cork-Latex footbed with maker's stamp and logo (as shown in reference images)"
- "branded EVA footbed with maker's stamp and logo (as shown in reference images)"
- "branded Soft Footbed footbed with maker's stamp and logo (as shown in reference images)"

The material value comes from the existing analyzed shoe components data (`components.footbed.material`), so no hardcoding.

### What changes

**File: `supabase/functions/generate-image/index.ts`**

1. Read the current shot type from `request.productShootConfig?.visualShotType`
2. Always include buckle engravings (short text, visible on all shots)
3. For footbed branding:
   - `onFoot` or `lifestyle`: Skip entirely
   - `productFocus`: Build a simplified descriptor using the actual footbed material from analyzed components
4. Soften the Prompt Agent instructions: remove emphasis on footbed text fidelity, keep buckle engraving accuracy, add instruction to defer footbed branding to reference images

### What stays the same

- The `analyze-shoe-components` function continues to capture full branding metadata (valuable for Edit SKU modal and future use)
- Buckle engraving injection remains unchanged
- The `defaultPrompts.ts` branding fidelity rules for buckles remain

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Conditionally inject branding by shot type; use dynamic footbed material for product focus descriptor; skip footbed for on-foot/lifestyle; soften prompt agent footbed instructions |


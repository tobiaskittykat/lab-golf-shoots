

# Add Product Identity to Remix Prompt

## Problem
In Remix mode, when no component overrides are applied, the prompt just says "replace the footwear with the EXACT product shown in the reference images" without naming the shoe. Adding the product name and color gives the AI an extra signal alongside the reference images.

## Solution
Add one line to the remix prompt that names the product (e.g., "The replacement product is: Birkenstock Boston in Taupe Suede").

## Changes

### File: `supabase/functions/generate-image/index.ts` (~line 1166)

After the existing line about matching reference images precisely, add a block that checks if `productIdentity` or `productNames` exist and inserts a short identity line:

```text
// After line 1167 ("The replacement shoes must match...")
if (body.productIdentity) {
  const pi = body.productIdentity;
  const parts = [pi.brandName, pi.modelName].filter(Boolean).join(' ');
  const attrs = [pi.color, pi.material].filter(Boolean).join(' ');
  if (parts) {
    remixParts.push(`The replacement product is: ${parts}${attrs ? ` in ${attrs}` : ''}.`);
  }
} else if (body.productNames?.length) {
  remixParts.push(`The replacement product is: ${body.productNames[0]}.`);
}
```

This produces output like:
- "The replacement product is: Birkenstock Boston in Taupe Suede."
- "The replacement product is: Birkenstock Arizona in Black Leather."

Only one file changes; no frontend or database modifications needed.

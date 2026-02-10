

# Fix: Shot-Type String Mismatch in Branding Filter

## Root Cause

The branding filter we just added is checking for camelCase values (`'onFoot'`, `'productFocus'`, `'lifestyle'`) but the UI sends kebab-case values (`'on-foot'`, `'product-focus'`, `'lifestyle'`).

This means the condition never matches for on-foot or product-focus shots, falling through to the `else` branch which injects the full verbose footbed branding -- exactly what we see in your prompt.

## Fix

**File: `supabase/functions/generate-image/index.ts` (~line 550)**

Update the string comparisons to use the correct kebab-case values that the UI actually sends:

- `'onFoot'` --> `'on-foot'`
- `'productFocus'` --> `'product-focus'`
- `'lifestyle'` stays the same (already matches)

This is a one-line-level fix in the conditional block.

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Fix shot type string values from camelCase to kebab-case (`'on-foot'`, `'product-focus'`) in the branding filter conditional |


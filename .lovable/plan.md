

# Fix Quick Customization Returning "No Changes Needed"

## Problem

The AI (Gemini 2.5 Flash) returns all nulls for every shoe component, even when the user clearly requests changes like "white version without shearling." The client-side code then filters out all nulls, finds zero changes, and shows "No changes needed."

## Root Cause

The tool definition in the edge function uses `type: ["object", "null"]` for each component:

```json
"upper": {
  "type": ["object", "null"],   // <-- Gemini treats null as the "safe default"
  ...
}
```

Gemini Flash interprets this union type poorly and defaults to `null` for all components rather than only including the ones that need changing.

## Solution

Change the tool schema so each component is simply `type: "object"` (not nullable). Components the AI does not want to change will simply be **omitted** from the response rather than set to `null`. The existing server-side and client-side filtering already handles this correctly.

## File to Change

| File | Change |
|------|--------|
| `supabase/functions/interpret-shoe-customization/index.ts` | Replace `type: ["object", "null"]` with `type: "object"` for all 6 component properties in the tool definition, and update the tool description to say "Only include components that should change -- omit components that stay the same" |

## Detailed Change

In the `TOOL_DEFINITION` object (lines 72-138), for each of the 6 components (upper, footbed, sole, buckles, heelstrap, lining):

**Before:**
```javascript
upper: {
  type: ["object", "null"],
  properties: { ... },
  required: ["material", "color", "colorHex"],
},
```

**After:**
```javascript
upper: {
  type: "object",
  properties: { ... },
  required: ["material", "color", "colorHex"],
},
```

Also update the function description from:
> "Return only the components that should be CHANGED. Use null for components that should stay the same as the original."

To:
> "Return ONLY the components that need to change. Do NOT include components that stay the same -- simply omit them from the response."

This aligns the schema with how Gemini naturally handles tool calls (include or omit properties) rather than forcing it to reason about null vs object union types.

## Why This Fixes It

- Gemini won't have a `null` option to default to
- Components the AI wants unchanged are simply absent from the JSON response
- The existing filter logic (`if (value !== null)`) already handles missing keys correctly
- The system prompt's rule #8 ("NEVER return all nulls") will now work as intended since null isn't an option

## Risk: None

The server-side filtering (`value !== null`) and client-side filtering (`value && typeof value === 'object'`) both correctly handle missing keys. No other code changes needed.

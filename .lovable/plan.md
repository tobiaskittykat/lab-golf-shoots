

# Fix: Ensure hex codes survive into final prompts for custom-picked colors

## Problem traced

There are two generations visible in the logs showing two different failure modes:

1. **Older generation** (the `UPP_F8D5C7` prompt): The UI stored the raw hex code as the `color` field (e.g., `color: "#F8D5C7"`). The creative brief sent `UPPER: ... in #F8D5C7`. The prompt agent LLM then mangled `#F8D5C7` into `UPP_F8D5C7` -- LLMs don't reliably preserve hex codes in prose.

2. **Newer generation** (the `Medium Turquoise` prompt): The `hexToColorName` fix is working -- colors resolve to names. But the hex code is **dropped** from the creative brief entirely (`UPPER: ... in Medium Turquoise` instead of `Medium Turquoise (#45C9FB)`).

## Root cause

The `getColorDescription` function in the **deployed** edge function is not outputting the hex alongside the resolved name. Looking at the creative brief logged for the newer run:

```
UPPER: Natural Leather (grained) in Medium Turquoise    <-- no hex
FOOTBED: Cork-latex in Medium Sea Green                  <-- no hex
```

This means either:
- The edge function deployment is stale (running old code before the `isKnownPreset` fix)
- OR the `isKnownPreset` check is incorrectly matching these names

"Medium Turquoise" and "Medium Sea Green" are **not** in the `KNOWN_PRESET_NAMES` set (which only contains Birkenstock brand presets like Taupe, Tobacco, etc.), so the fix should work. This points to a **stale deployment**.

## Fix

### 1. Force redeploy the `generate-image` edge function
The code in the repo already has the correct `getColorDescription` logic with `isKnownPreset`. A fresh deploy should fix it.

### 2. Add prompt agent instruction to preserve hex codes
Even with the fix, the prompt agent LLM may strip hex codes from its output (as seen with `UPP_F8D5C7`). Add an explicit instruction to the prompt agent system prompt:

In `supabase/functions/generate-image/index.ts`, in the `craftPromptWithAgent` function's system prompt, add a rule like:

```
When component colors include a hex code in parentheses like "Medium Turquoise (#45C9FB)",
you MUST preserve both the descriptive name AND the hex code exactly as provided.
Do NOT remove, rename, or reformat hex codes.
```

### 3. Add debug logging for color resolution
Add a `console.log` in the component loop (around line 705) to trace what `getColorDescription` returns for each override, making future issues immediately visible in logs.

## Files to modify
- `supabase/functions/generate-image/index.ts` -- add prompt agent instruction + debug logging (the `getColorDescription` fix is already in the code, just needs redeployment)

## Expected result
- Creative brief: `UPPER: Natural Leather (grained) in Medium Turquoise (#45C9FB)`
- Final prompt: `...crafted from Medium Turquoise (#45C9FB) Natural Leather (grained)...`


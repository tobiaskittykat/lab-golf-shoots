

# Fix: Replace "Embossed" with Material-Neutral Buckle Branding Term

## Problem

The prompts currently use "embossed" to describe buckle text. This is inaccurate for plastic buckles (which have molded/imprinted text) and can confuse the AI into rendering raised lettering or metallic-looking engravings on matte plastic hardware.

## Terminology

- **Metal buckles**: text is "engraved" (incised into the surface)
- **Plastic buckles**: text is "molded" or "imprinted" (formed into the plastic)
- **Material-neutral**: "inscribed" works universally -- it means "marked with text" without implying a specific technique

The plan uses **"inscribed"** as the universal term in prompt-facing text, since it's neutral and accurate for both metal and plastic.

## Changes

### 1. `src/lib/birkenstockMaterials.ts` (~lines 256-261)

Replace the buckle override preservation warning:
- "BUCKLE SHAPE AND EMBOSSING" --> "BUCKLE SHAPE AND INSCRIPTIONS"
- "any EMBOSSED TEXT" --> "any INSCRIBED TEXT"

### 2. `supabase/functions/generate-image/index.ts` (~lines 676-678)

Same replacement in the server-side buckle shape preservation block:
- "BUCKLE SHAPE AND EMBOSSING" --> "BUCKLE SHAPE AND INSCRIPTIONS"
- "EMBOSSED TEXT" --> "INSCRIBED TEXT"

### 3. `supabase/functions/analyze-shoe-components/index.ts` (~lines 65-68)

Update the analysis system prompt to use consistent terminology:
- Change "embossed" references for buckles to "engraved" (for metal) or keep as "inscribed" generically
- The engraving style field in tool output already uses flexible descriptions like "embossed serif capitals" -- this stays as-is since it's AI-detected per image, but the instruction text should stop suggesting "embossed" as the default

### 4. `supabase/functions/generate-image/index.ts` (~line 723-730)

In the Prompt Agent system instructions, the branding fidelity section references "engravings" which is fine for metal. No change needed there -- those are already correct for the metal case, and the per-buckle style field from analysis will specify the actual technique.

| File | Change |
|------|--------|
| `src/lib/birkenstockMaterials.ts` | Replace "EMBOSSING" / "EMBOSSED TEXT" with "INSCRIPTIONS" / "INSCRIBED TEXT" in buckle override warning |
| `supabase/functions/generate-image/index.ts` | Same replacement in server-side buckle shape block |
| `supabase/functions/analyze-shoe-components/index.ts` | Update instruction text to avoid suggesting "embossed" as default for buckle text |


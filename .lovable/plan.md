

# Fix Mayari Toe Post Misclassification and Add Buckle Shape Fidelity

## Problem 1: Mayari incorrectly treated as a thong sandal

The Mayari has **crossover straps** -- there is no toe post strap or pin between the toes. However, the system hardcodes "Mayari" alongside Gizeh and Ramses as a "thong-style sandal" in multiple places:

- `analyze-shoe-components/index.ts` line 38, 75: references Mayari as thong-style
- `generate-image/index.ts` line 616: injects "TOE POST STRAP" and "TOE POST PIN/RIVET" for Mayari
- `birkenstockMaterials.ts` line 252-261: same toe post injection for Mayari
- `generate-image/index.ts` line 682: prompt agent rule about toe post accuracy mentions Mayari

This causes the prompt to describe a toe post strap and pin that don't exist on the shoe, leading to inaccurate generations.

**Root cause**: The system has no knowledge of each model's actual strap construction. It relies on a hardcoded list of model names, and Mayari was incorrectly included.

## Problem 2: Buckle shape not preserved during overrides

When a user changes buckle material/color (e.g., from Antique Copper metal to Silver metal), nothing in the prompt tells the AI to keep the original buckle **shape** and **embossing** from the reference images. The override section only says the new material/color. The AI may then generate a generic buckle shape instead of the specific Birkenstock buckle style visible in references.

## Solution

### 1. Add `strapConstruction` to component analysis schema

Add a new field to the analysis tool that captures the shoe's strap/construction type. This replaces the hardcoded model-name list with actual analyzed data.

In `supabase/functions/analyze-shoe-components/index.ts`:

- Add a `strapConstruction` field to `TOOL_DEFINITION`:
```text
strapConstruction: {
  type: "string",
  enum: ["thong", "crossover", "single-strap", "two-strap", "clog", "slip-on", "other"],
  description: "The strap construction type of the shoe. 
    'thong' = has a toe post strap between big and second toe (e.g., Gizeh, Ramses)
    'crossover' = straps cross over the foot without a toe post (e.g., Mayari, Yao)
    'single-strap' = one wide strap (e.g., Madrid)
    'two-strap' = two parallel straps (e.g., Arizona, Milano)
    'clog' = enclosed upper (e.g., Boston, Kyoto)
    'slip-on' = no straps or buckles
    'other' = anything else"
}
```

- Update `SYSTEM_PROMPT` to remove Mayari from thong-style references and instruct the AI to determine the actual construction from the images.

### 2. Use analyzed `strapConstruction` instead of hardcoded names

In `supabase/functions/generate-image/index.ts`:

- Replace the hardcoded toe post injection (which always fires for overrides) with a conditional check: only inject `TOE POST STRAP` and `TOE POST PIN/RIVET` lines when `originalComponents.strapConstruction === 'thong'`.
- Remove "Mayari" from the thong sandal list in the prompt agent instructions (line 682).

In `src/lib/birkenstockMaterials.ts`:

- Same change: only inject toe post override lines when the component data indicates `strapConstruction === 'thong'`.

### 3. Add buckle shape and embossing preservation to override instructions

In `supabase/functions/generate-image/index.ts`, in the component overrides section (around line 602-627):

- When buckle overrides are present, add explicit instructions to preserve shape and embossing:
```text
⚠️ BUCKLE SHAPE AND EMBOSSING: Change ONLY the material and color of the buckles. 
The buckle SHAPE, SIZE, and any EMBOSSED TEXT must remain EXACTLY as shown in the 
reference images. The engraving text and style are specified in the BRANDING DETAILS section.
```

- Also add this to the prompt agent system prompt (both in `generate-image/index.ts` and `defaultPrompts.ts`) as a general rule about hardware fidelity.

### 4. Add editable product description to EditSKUModal

Add a "Product Description" textarea so users can correct auto-generated summaries (like fixing "bronze buckles" to "antique copper" or correcting strap type descriptions).

In `src/components/creative-studio/product-shoot/EditSKUModal.tsx`:

- Add a `description` state initialized from `skuData.description?.summary`
- Add a `Textarea` labeled "Product Description" below SKU Code, with helper text: "Auto-generated summary used in image prompts. Edit to correct inaccuracies."
- On save, merge the edited summary into the existing `description` JSONB (preserving colors, materials, product_type, etc.)
- Include in `hasChanges` check

## Files changed

| File | Change |
|------|--------|
| `supabase/functions/analyze-shoe-components/index.ts` | Add `strapConstruction` enum field; remove Mayari from thong references; instruct AI to identify actual construction |
| `supabase/functions/generate-image/index.ts` | Conditionally inject toe post data only for `strapConstruction === 'thong'`; add buckle shape/embossing preservation rule; remove Mayari from thong list in prompt |
| `src/lib/birkenstockMaterials.ts` | Guard toe post override injection behind `strapConstruction === 'thong'` check |
| `src/lib/defaultPrompts.ts` | Add buckle shape/embossing preservation rule to prompt agent instructions |
| `src/components/creative-studio/product-shoot/EditSKUModal.tsx` | Add editable "Product Description" textarea |

## After deployment

The Mayari (and other existing SKUs) will need to be **re-analyzed** to populate the new `strapConstruction` field. Until re-analyzed, the toe post injection will be skipped by default (safe fallback -- no `strapConstruction` field means no toe post lines injected).

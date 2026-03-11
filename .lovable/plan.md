

## Two-Step Remix Pipeline: Color Swap + Marking Application

### Overview

The remix generation becomes a sequential two-step pipeline that always runs both steps. The user sees a single "Generate" flow, but internally:

- **Step 1**: Replace the putter in the source image with the DF3i in the selected color. The prompt explicitly instructs the AI to remove all alignment marks, producing a clean head.
- **Step 2**: Take the Step 1 output and edit it to add the selected alignment mark using the mark reference image. If no mark is selected, Step 2 adds the default mark or keeps clean.

Both steps produce `generated_images` records visible in the gallery with full prompt metadata.

### Database Changes

**Add a column to `generated_images`** to link interim → final:

```sql
ALTER TABLE generated_images ADD COLUMN parent_image_id uuid REFERENCES generated_images(id);
ALTER TABLE generated_images ADD COLUMN generation_step text; -- 'color-swap', 'mark-apply', or null for non-remix
```

This lets us:
- Query the interim image from the final image
- Display both in gallery with a visual parent-child relationship
- Store separate prompts per step

### Edge Function Changes (`generate-image/index.ts`)

Add a new field `pipelineStep` to the request body. The edge function itself stays mostly unchanged — it processes one image request at a time. The two-step orchestration happens **client-side** in the hook (or we create a new orchestrator edge function).

**Option chosen**: Orchestrate from the client hook, calling `generate-image` twice sequentially. This keeps the edge function simple and reusable.

The edge function needs one small addition:
- Accept and persist `parent_image_id` and `generation_step` in the DB record.

### Hook Changes (`useImageGeneration.ts`)

The remix branch (lines 433-496) gets rewritten:

```text
For each source image:
  1. Build Step 1 prompt (color swap, no marks)
     - Uses buildDF3iRemixPrompt with selectedColor but selectedMark = null
     - Adds explicit instruction: "Remove ALL alignment marks from the putter head. The top surface must be completely clean and unmarked."
     - Attach all 6 DF3i reference images + source image
  2. Call generate-image → get pendingId for Step 1
  3. Poll until Step 1 completes → get interim image URL
  4. Build Step 2 prompt (mark application only)
     - New prompt builder function: buildDF3iMarkPrompt
     - Describes only the mark to apply, references the mark image
     - Instructs to keep everything else identical
     - Source image = Step 1 result URL
  5. Call generate-image with parent_image_id = Step 1 record ID, generation_step = 'mark-apply'
  6. Poll until Step 2 completes → final image
```

### New Prompt Builders (`labGolfVariants.ts`)

**Modify `buildDF3iRemixPrompt`**: When `selectedMark` is null, add an explicit "ALIGNMENT MARKS — REMOVE" section telling the AI to produce a completely clean, unmarked putter head.

**Add `buildDF3iMarkPrompt`**: A new function focused solely on applying a mark:

```text
TASK: Add an alignment mark to the putter head in this image.
MARK SPECIFICATION: [description from mark config]
- Use the attached reference image as the exact template
- Position centered on the flat top surface along the aiming axis
- Contrast color against head color
PRESERVATION: Everything else in the image MUST remain pixel-identical.
- Background, lighting, camera angle, putter color/geometry — all unchanged.
- Only add the mark; do not modify any other aspect.
```

### Metadata Storage

Each `generated_images` record stores:
- `prompt`: The full prompt used for that specific step
- `settings.references`: The reference URLs attached
- `settings.generation_step`: 'color-swap' or 'mark-apply'
- `settings.source_image_url`: The input image for that step
- `parent_image_id`: Links Step 2 → Step 1

### UI Impact

- **Gallery**: Both interim and final images appear. The interim image can show a small badge like "Step 1 / Color" and the final shows "Step 2 / Final".
- **RemixStep2.tsx**: No changes needed — the summary already shows color + mark selections. The two-step logic is invisible to the user.
- **Polling**: The existing `pollForPendingImages` is called twice — once for Step 1, then for Step 2 after Step 1 completes.

### Files to Change

| File | Changes |
|---|---|
| `supabase/migrations/` | Add `parent_image_id` and `generation_step` columns |
| `supabase/functions/generate-image/index.ts` | Accept & persist `parent_image_id`, `generation_step` |
| `src/lib/labGolfVariants.ts` | Modify `buildDF3iRemixPrompt` for mark removal; add `buildDF3iMarkPrompt` |
| `src/hooks/useImageGeneration.ts` | Rewrite remix branch to sequential two-step pipeline with polling between steps |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |

### Execution Flow Diagram

```text
User clicks Generate
        │
        ▼
┌─────────────────────┐
│ Step 1: Color Swap   │
│ prompt: color + no   │
│ marks + product ID   │
│ refs: 6 DF3i angles  │
│ source: user upload  │
│ step: 'color-swap'   │
└─────────┬───────────┘
          │ poll until completed
          ▼
┌─────────────────────┐
│ Step 2: Mark Apply   │
│ prompt: mark only    │
│ refs: mark image     │
│ source: Step 1 URL   │
│ parent: Step 1 ID    │
│ step: 'mark-apply'   │
└─────────┬───────────┘
          │ poll until completed
          ▼
    Final image ready
```



Objective
Make component colors truly single-field across the full pipeline so the payload, backend logic, saved metadata, and prompt assembly all use one canonical field (e.g. `upper.color = "Medium Sea Green (#1DAF64)"`) and never rely on `colorHex`.

What I confirmed
- Backend file already contains bake logic (`bakeHexIntoColors`) and build fingerprint constants.
- Frontend still models and sends two fields everywhere (`color` + `colorHex`) via:
  - `src/lib/birkenstockMaterials.ts` types
  - `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`
  - `src/hooks/useQuickCustomization.ts`
  - `src/hooks/useImageGeneration.ts` request body pass-through
- Your screenshot-style complaint (`upper.color` + `upper.colorHex`) is consistent with current frontend payload shape.
- Recent generated rows do not show the expected runtime fingerprint metadata, so rollout verification must be made explicit during implementation.

Implementation plan (recode from scratch, minimal complexity)
1) Canonical data contract (single field)
- Define override contract as:
  - `material: string`
  - `color: string` (may include bracketed hex token)
- Remove `colorHex` from frontend override types and UI state for overrides.
- Keep optional backend backward compatibility parser for legacy calls that still send `colorHex` (temporary safety only).

2) Frontend refactor to one field
- Update override/state types in `birkenstockMaterials.ts` and related product-shoot types.
- In `ComponentOverridePopover`, keep internal picker hex state for UX, but on apply serialize into:
  - `color = "<resolvedName> (#HEX)"` for custom/picker colors
  - `color = "<presetName>"` for preset-only selections.
- Ensure `ShoeComponentsPanel` display uses only `.color` (and derives swatch hex by parsing bracket token where present).
- Update quick customization merge logic to stop propagating `colorHex`.
- Ensure `useImageGeneration` sends only the single `color` field in `componentOverrides`.

3) Backend ingestion hardening (single field first)
- In `generate-image/index.ts`, replace color handling with:
  - parser for bracketed hex in `.color`
  - normalizer to canonical formatting (`Name (#HEX)`).
- Keep a temporary fallback: if legacy `colorHex` exists, fold it into `.color` immediately and ignore thereafter.
- Remove downstream dependencies on separate hex fields.

4) Prompt assembly cleanup (no contradictions)
- Build all component lines from canonical effective state only.
- Ensure product identity color/material do not conflict with overridden upper values.
- Enforce that final prompt contains canonical override tokens when present.

5) Persistence + observability
- Persist canonical overrides in settings (single-field colors).
- Persist runtime fingerprint on completed rows.
- Add deterministic logs:
  - `[BUILD] ...`
  - `[COLOR-CANONICAL] ...`
  - `[PROMPT-COMPONENTS] ...`

Verification criteria
- Network payload for generate request shows no `upper.colorHex`; only `upper.color` with bracketed hex when applicable.
- Stored `generated_images.settings.componentOverrides.upper.color` is `"... (#HEX)"` and no `colorHex`.
- Prompt includes exact same token from overrides (no stripping).
- No contradictory phrases like baseline SKU color + overridden color in same sentence.
- Logs show current build fingerprint and canonical color trace for the same run.

Technical rollout note
- Do this as a single coordinated change (types + UI serializer + backend parser) to avoid mixed-schema regressions while users have existing in-memory state.

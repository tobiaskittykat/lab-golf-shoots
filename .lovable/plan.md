
Objective
Make component colors truly single-field across the full pipeline so the payload, backend logic, saved metadata, and prompt assembly all use one canonical field (e.g. `upper.color = "Medium Sea Green (#1DAF64)"`) and never rely on `colorHex`.

## STATUS: ✅ IMPLEMENTED (2026-03-02)

### What was done

**Frontend (single-field serialization):**
- `ComponentOverride` type in `birkenstockMaterials.ts` — removed `colorHex` field
- `ComponentOverridePopover` — on Apply, serializes color as `"Name (#HEX)"` for picker colors, plain name for presets. On open, parses hex from existing canonical color string.
- `ShoeComponentsPanel` — derives swatch hex via `parseHexFromColor()` instead of `.colorHex`
- `useQuickCustomization` — AI override responses baked into canonical format before applying
- `useShoeComponents` — removed `colorHex` from sync logic (buckles, heelstrap auto-sync)
- `SetupProductStep2` — removed `colorHex` from merged component creation
- Added `parseHexFromColor()` and `stripHexFromColor()` utility exports

**Backend (already had bake logic):**
- `generate-image/index.ts` — `bakeHexIntoColors()` serves as legacy fallback, folding any stray `colorHex` into `.color` at ingress
- Build fingerprint: `hex-inline-v1-2026-03-02`

### Verification criteria
- Network payload: `upper.color = "Medium Sea Green (#1DAF64)"`, no `upper.colorHex`
- DB settings: `componentOverrides.upper.color` is canonical, no `colorHex`
- Prompt: `UPPER: Natural Leather (grained) in Medium Sea Green (#1DAF64)`
- Backend logs: `[BUILD] hex-inline-v1-2026-03-02` + `[COLOR-BAKED]` traces


What I found (confirmed with live request + backend logs):
1) The client is passing `colorHex` correctly.
- Latest `generate-image` request body includes:
  - `componentOverrides.upper.color = "Dark Slate Gray"`
  - `componentOverrides.upper.colorHex = "#005477"`

2) The backend function receives overrides but the prompt brief is built without hex.
- Logged `=== PRODUCT COMPONENTS ===` shows:
  - `UPPER: Natural Leather (grained) in Dark Slate Gray`
  - (missing `(#005477)`)

3) Runtime mismatch is still present.
- No `[COLOR-DEBUG]` entries appear in backend logs (even though repository code has that log line).
- This strongly indicates the active deployed runtime is not executing the expected code path/version.

4) Current image row settings do not persist override context.
- The latest `generated_images.settings` has no `componentOverrides` / `originalComponents`.
- This makes regenerate/debug flows lose forensic context and makes this bug harder to trace.

Implementation plan to fix it reliably:

1. Add a hard “always include hex when available” formatter in backend prompt assembly
- File: `supabase/functions/generate-image/index.ts`
- Update color formatting logic so:
  - if `colorHex` exists, output `ColorName (#HEX)` always.
  - do not suppress hex for presets.
- Keep name quality:
  - if color is `Custom` or empty → resolve a readable name from hex.
  - if color already contains `(#[0-9A-F]{6})`, normalize to one canonical `Name (#HEX)` token.

Why: Your requirement is explicit — save/show color with hex in brackets so it survives to final prompt every time.

2. Normalize component overrides once at request ingress
- Build a small normalization step after parsing request body:
  - uppercase hex (`#ff073a` → `#FF073A`)
  - trim names
  - if name missing and hex exists, derive name
  - if name contains bracketed hex, split and keep canonical fields
- Use this normalized object everywhere:
  - product components section
  - override contrast lines
  - remix brief lines
  - toe-post sync lines

Why: prevents one path from using raw data while another path uses formatted data.

3. Add explicit runtime fingerprint + color trace logs
- Add a build/version constant at top (e.g. `GEN_IMAGE_BUILD = "hex-v3-2026-03-02T..."`).
- Log it at function start and in prompt construction.
- Add per-component trace logs in all relevant builders:
  - input `{color,colorHex}`
  - resolved output `Name (#HEX)`

Why: immediately proves whether the live runtime is the updated one and where hex might be dropped.

4. Persist override/original payload in generated image settings
- In the completed row update, store:
  - `settings.componentOverrides`
  - `settings.originalComponents`
  - `settings.references.componentOverrides`
  - `settings.references.originalComponents`
  - optional `settings.runtimeBuild` with the build fingerprint

Why: regenerate and audit paths can reconstruct exact color intent (including hex) later.

5. Force a real backend function rollout
- Make a substantive code-path change (not only a top comment) in `generate-image/index.ts`.
- This ensures the runtime actually picks up the new behavior.
- Verify rollout by checking logs for the new runtime fingerprint string.

Verification checklist (must pass):
1) Trigger generation with a custom color override (example upper `#005477`).
2) Confirm backend logs show runtime fingerprint + color trace entries.
3) Confirm `=== PRODUCT COMPONENTS ===` includes:
- `UPPER: ... in Dark Slate Gray (#005477)`
4) Confirm final crafted prompt still contains `Dark Slate Gray (#005477)` (not stripped or renamed).
5) Confirm saved row `settings` includes `componentOverrides` with `colorHex`.

Expected result:
- Yes, once we enforce canonical `Name (#HEX)` at backend assembly and persist normalized overrides, the hex will be carried through and used in the final prompt consistently.

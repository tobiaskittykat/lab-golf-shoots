

# Move "Auto" Tile to Last Position in Background Grid

## Change from Previous Plan

The Auto tile will be the **last tile** in each tab's grid instead of the first. This keeps the curated presets front-and-center while offering the AI option at the end.

## Visual Result

**Studio tab (collapsed):**
`[White Cyclorama] [Black Void] [Warm Gradient] [Auto (AI)]`

**Outdoor tab (collapsed):**
`[Sandy Beach] [Urban Street] [Park Grass] [Auto (AI)]`

When expanded, the Auto tile remains at the very end after all presets.

The Auto tile will have a Wand2 icon with a subtle gradient background to distinguish it from the photo-based tiles. Same selection pattern (accent border + checkmark).

## Technical Changes

### File 1: `src/components/creative-studio/product-shoot/BackgroundSelector.tsx`

1. **Remove** the standalone Auto button above the tabs
2. **Append an Auto tile** as the last item in the background grid for both tabs
   - Uses ID `studio-auto` or `outdoor-auto`
   - When clicked: sets `settingType` to `studio`/`outdoor` and `backgroundId` to the auto ID
3. **Adjust visible count logic**: The Auto tile is always shown (appended after the sliced presets). In collapsed view: 3 presets + Auto tile = 4 tiles. In expanded view: all presets + Auto tile.
4. **Update tab change logic**: When switching tabs, default to `studio-auto` or `outdoor-auto` if no specific background is selected

### File 2: `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`

Update `buildBackgroundSection` to handle `studio-auto` and `outdoor-auto` background IDs, translating them to appropriate prompt instructions.

### File 3: `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`

Update badge logic to check if `backgroundId` ends with `-auto` instead of `settingType === 'auto'`.

### File 4: `src/components/creative-studio/product-shoot/types.ts`

Remove `'auto'` from the `SettingType` union -- becomes just `'studio' | 'outdoor'`.

### File 5: `supabase/functions/generate-image/index.ts`

Handle new `studio-auto` and `outdoor-auto` background IDs in the generation logic.

## Files Changed

| File | Change |
|------|--------|
| `BackgroundSelector.tsx` | Remove standalone Auto button; append Auto tile as last item in each tab grid; adjust visible count so Auto is always shown |
| `shotTypeConfigs.ts` | Handle `studio-auto` / `outdoor-auto` in prompt building |
| `ProductShootStep2.tsx` | Update badge logic for `-auto` suffix |
| `types.ts` | Remove `'auto'` from `SettingType` union |
| `generate-image/index.ts` | Handle new auto background IDs |


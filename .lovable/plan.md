

# Fix Hex Color Input and Add Native Color Picker

## Problem
1. The hex input field only accepts values starting with `#` (e.g., `#FF10F0`). Typing `FF10F0` without the hash is silently ignored.
2. There is no native color picker -- only preset swatches and a text input. Users expect a clickable color wheel/picker.

## Changes

### File: `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`

**1. Fix `handleCustomHexChange` (line 98-105)**

Update the validation to normalize the input:
- Strip any leading `#` from the raw input before storing
- Accept both `FF10F0` and `#FF10F0` by auto-prepending `#` for the internal hex value
- Show the value in the input without forcing the user to type `#`

New logic:
```
const handleCustomHexChange = (raw: string) => {
  // Strip leading # so users can type with or without it
  const stripped = raw.replace(/^#/, '');
  setCustomHex(stripped);
  if (/^[0-9A-Fa-f]{6}$/.test(stripped)) {
    const fullHex = '#' + stripped.toUpperCase();
    const preset = findColorPreset(fullHex);
    setSelectedColor(preset?.name || 'Custom');
    setSelectedHex(fullHex);
  }
};
```

**2. Update the hex input field (line 288-295)**

- Change placeholder from `#FFFFFF` to `FFFFFF`
- Show a `#` prefix label inside the input (before the pipette icon area)
- Update maxLength from 7 to 6 (since we strip the `#`)

**3. Add a native color picker button (next to the hex input)**

Add a hidden `<input type="color">` with a visible button trigger (small color-wheel icon or the existing swatch preview). Clicking it opens the browser's native color picker. On change, feed the selected value back through `handleCustomHexChange`.

This gives users three ways to pick a color: preset swatches, hex code, or native picker.

## Summary of UI changes
- Hex field accepts `FF10F0` or `#FF10F0` (both work)
- A small clickable color picker button appears next to the hex input
- The existing preview swatch doubles as the picker trigger

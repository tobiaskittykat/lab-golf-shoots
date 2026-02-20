

# Fix maxLength to Accept "#" Prefix in Hex Input

## Problem
The hex input has `maxLength={6}`, which prevents users from pasting or typing `#FF10F0` (7 characters). The browser blocks the input before `onChange` can strip the `#`.

## Fix

### File: `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`

Change `maxLength` from `6` to `7` on the hex input field (~line 293). The `handleCustomHexChange` function already strips the `#` and validates the remaining 6 hex characters, so this single change is all that's needed.


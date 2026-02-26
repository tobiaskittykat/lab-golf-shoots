
# Fix: Apply Button Disabled + Can't Re-Upload Sample

## Problems Found

### 1. Apply button stays disabled after swatch upload
**Line 621**: `disabled={!isModified && !override}` does not account for `sampleImageUrl`. When analysis fails (material/color stay unchanged), `isModified` is false and `override` is undefined, so the button is permanently disabled even though a valid swatch is attached.

### 2. Can't upload a replacement swatch
**Line 549**: When `sampleImageUrl` is set, the upload button is replaced with a preview + remove button. There's no way to upload a new sample directly -- users must first remove the current one, then upload again. This is a friction point especially when the first analysis was wrong.

### 3. Saved swatches hidden when a sample is active
**Line 445**: `samples.length > 0 && !sampleImageUrl` hides the saved swatches grid whenever a sample image is present, preventing users from switching to a different saved swatch.

## Changes

### File: `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`

**Fix 1 -- Apply button (line 621)**
Change disabled condition from:
```
disabled={!isModified && !override}
```
to:
```
disabled={!isModified && !override && !sampleImageUrl}
```

**Fix 2 -- Add "Replace" upload button when a sample is active (line 549-576)**
Add a small "Replace" button next to the sample preview that triggers the file input, so users can upload a new swatch without first removing the current one.

**Fix 3 -- Show saved swatches even when a sample is active (line 445)**
Remove the `!sampleImageUrl` condition so saved swatches remain visible and selectable even when a sample is already loaded. This lets users switch between saved swatches freely.

## Technical Details

- Fix 1: One-line change to the `disabled` prop
- Fix 2: Add a small upload button (Upload icon) inside the sample preview area that reuses the existing `fileInputRef`
- Fix 3: Remove `!sampleImageUrl` from the conditional on line 445

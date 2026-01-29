

# Add 4K Resolution Support (4096px)

## Summary

Based on your research, Gemini 3 Pro **natively supports up to 4K (4096×4096)** resolution. Our current UI caps at 2048px. This is a simple one-line change to enable true 4K output.

---

## What's Changing

### File: `src/components/creative-studio/types.ts`

**Current (lines 392-396):**
```typescript
export const resolutions = [
  { value: '512', label: '512px' },
  { value: '1024', label: '1024px' },
  { value: '2048', label: '2048px' },
];
```

**Updated:**
```typescript
export const resolutions = [
  { value: '512', label: '512px' },
  { value: '1024', label: '1024px' },
  { value: '2048', label: '2048px (2K)' },
  { value: '4096', label: '4096px (4K)' },
];
```

---

## Why This Works

1. The `resolutions` array is already used by both:
   - **Lifestyle flow** (`StepTwoCustomize.tsx`)
   - **Product Shoot flow** (`ProductShootStep2.tsx`)

2. The selected resolution value is passed to the `generate-image` edge function via `settings.resolution`

3. The edge function already passes this value to Gemini 3 Pro - no backend changes needed

---

## Notes

- 4K generation may take longer and consume more API credits
- Some interfaces may default to lower resolutions, but Gemini 3 Pro supports up to 4096×4096 natively
- Labels updated to show "2K" and "4K" for clarity


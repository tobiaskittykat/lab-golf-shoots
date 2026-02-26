
# Fix: Ad Gallery Not Showing Auto-Saved Uploads

## Problem
When you upload source images with "Auto-save uploads" enabled, the images are saved to the database successfully (confirmed: POST returns 201). However, when you open "Browse Ad Gallery", it shows empty because:

1. The `AdGalleryModal` creates its own instance of `useAdCreatives`, which fetched data **before** the upload happened
2. The modal never refetches when it opens -- it only fetches once on mount
3. Since Dialog keeps its content mounted, subsequent opens don't trigger a remount/refetch

## Solution

### 1. Add refetch-on-open to AdGalleryModal

**File**: `src/components/creative-studio/product-shoot/AdGalleryModal.tsx`

- Import `useEffect` from React
- Add a `useEffect` that calls `refetch()` whenever `open` changes to `true`
- The `refetch` function is already returned by `useAdCreatives` but not currently consumed

```typescript
const { creatives, isLoading, deleteCreative, refetch } = useAdCreatives();

useEffect(() => {
  if (open) refetch();
}, [open, refetch]);
```

This is a 2-line fix. When the user clicks "Browse Ad Gallery", the modal will always fetch the latest data from the database, including any images that were just auto-saved.

## Scope
- `src/components/creative-studio/product-shoot/AdGalleryModal.tsx` -- add `useEffect` to refetch on open

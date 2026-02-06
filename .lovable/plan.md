

# Fix: Only Show Actually-Attached References in Metadata

## Problem Summary

The database metadata (`settings.references`) always stores `productReferenceUrls` and `moodboardUrl` from the request body, even when the user toggled off "Attach Reference Images". This causes the Image Detail Modal to display references that were never actually sent to the AI.

---

## Root Cause

Lines 1187-1193 in `generate-image/index.ts` unconditionally save all reference URLs:

```typescript
references: {
  moodboardId: body.moodboardId || null,
  moodboardUrl: body.moodboardUrl || null,                    // ❌ Always saved
  productReferenceUrls: body.productReferenceUrls || [],      // ❌ Always saved
  ...
},
```

But the actual image attachment logic (lines 993-1026) respects `attachReferenceImages`:

```typescript
const shouldAttachProductRefs = body.attachReferenceImages !== false;

if (shouldAttachProductRefs && productUrls.length > 0) {
  // Attach images...
} else if (!shouldAttachProductRefs) {
  // Skip attachments, add text note...
}
```

---

## Fix Overview

Conditionally save reference URLs in metadata based on whether they were actually attached:

```text
BEFORE: Always save productReferenceUrls/moodboardUrl in metadata
AFTER:  Only save them if attachReferenceImages !== false
```

---

## Technical Changes

### File: `supabase/functions/generate-image/index.ts`

**Location:** Lines 1175-1198 (database insert)

**Change:** Conditionally populate the `references` object based on `shouldAttachProductRefs`:

```typescript
// Determine if references were actually attached
const attachedProductRefs = body.attachReferenceImages !== false;

settings: {
  aiModel: selectedModel,
  artisticStyle: body.artisticStyle,
  // ... other fields stay the same ...
  
  // Only store references that were ACTUALLY attached to the generation
  references: {
    moodboardId: body.moodboardId || null,
    // Only include moodboard URL if it exists (moodboard is always attached when present)
    moodboardUrl: moodboardUrl || null,
    moodboardDescription: body.moodboardDescription || null,
    // Only include product refs if they were actually attached
    productReferenceUrls: attachedProductRefs ? (body.productReferenceUrls || []) : [],
    shotTypePrompt: body.shotTypePrompt || null,
    sourceImageUrl: body.sourceImageUrl || null,
    // NEW: Track whether references were attached for clarity
    referencesAttached: attachedProductRefs,
  },
  // ... rest stays the same ...
},
```

---

## Data Flow After Fix

```text
User toggles OFF reference images
        │
        ▼
attachReferenceImages = false (in request body)
        │
        ▼
shouldAttachProductRefs = false (line 993)
        │
        ├── Skip attaching images to AI payload ✓ (already works)
        │
        └── Save empty productReferenceUrls in metadata ✓ (NEW)
              │
              ▼
        Image Detail Modal shows NO product references
```

---

## Expected Result

| Scenario | Product Refs in Metadata | Displayed in Modal |
|----------|--------------------------|---------------------|
| Toggle ON + refs exist | `["url1", "url2", ...]` | Yes - shows thumbnails |
| Toggle OFF + refs exist | `[]` (empty array) | No - section hidden |
| Toggle ON + no refs | `[]` | No - section hidden |

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Conditionally populate `references.productReferenceUrls` based on `attachReferenceImages` flag |



# SKU Display Enhancement & Button Cleanup

## Overview

Clean up redundant buttons and improve SKU naming display to show structured product attributes (brand, model, material, color) consistently across the Product picker and Gallery.

---

## Current State Analysis

**Existing SKU Data Structure** (from `product_skus.description` JSONB):
```json
{
  "colors": ["taupe", "brown"],
  "materials": ["suede", "cork", "rubber"],
  "product_type": "clog",
  "style_keywords": ["casual", "comfort", "slip-on"]
}
```

**Current SKU Names** are already well-structured (e.g., "Birkenstock Boston Taupe Suede Clog") but display is inconsistent.

---

## Changes

### 1. Remove Duplicate Buttons

**File: `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`**

Remove lines 389-409 (the "Quick actions" section with Smart Upload and Create SKU buttons) since these already exist inside the ProductPickerModal.

```
REMOVE:
{/* Quick actions */}
<div className="flex gap-2">
  <Button variant="default" ... onClick={() => setShowSmartUploadModal(true)}>
    Smart Upload
  </Button>
  <Button variant="outline" ... onClick={() => setShowCreateSKUModal(true)}>
    Create SKU
  </Button>
</div>
```

### 2. Create SKU Display Helper

**New utility function** to parse and format SKU display info:

```typescript
// Helper to extract display attributes from SKU
interface SKUDisplayInfo {
  brandName: string;      // "Birkenstock"
  modelName: string;      // "Boston"
  material: string;       // "Suede"
  color: string;          // "Taupe"
  productType: string;    // "Clog"
}

function parseSkuDisplayInfo(name: string, description?: object): SKUDisplayInfo {
  // Try to parse from name format "Brand Model Color Material Type"
  // Fallback to description JSONB if available
}
```

### 3. Improve Thumbnail Overlay Display

**File: `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`**

Update the name overlay on product thumbnails (around line 368-372) to show structured info:

**Current:**
```tsx
<span className="text-xs text-white font-medium truncate block">
  {sku.name}
</span>
```

**Proposed:**
```tsx
<div className="text-xs text-white">
  <span className="font-medium block truncate">{displayInfo.modelName}</span>
  <span className="opacity-80 text-[10px] truncate block">
    {displayInfo.color} {displayInfo.material}
  </span>
</div>
```

This displays:
- Line 1: **Boston** (model name - bold)
- Line 2: Taupe Suede (color + material - smaller, subtle)

### 4. Improve ProductPickerModal Row Display

**File: `src/components/creative-studio/product-shoot/ProductPickerModal.tsx`**

Update ProductRow component (lines 186-196) to show structured attributes:

**Current:**
```tsx
<div className="flex items-center gap-2">
  <span className="font-medium truncate">{sku.name}</span>
</div>
<div className="text-xs text-muted-foreground">
  {sku.sku_code && <span>{sku.sku_code}</span>}
  <span>{sku.angles.length} angles</span>
</div>
```

**Proposed:**
```tsx
<div className="flex items-center gap-2">
  <span className="font-medium truncate">{displayInfo.modelName}</span>
  {isSelected && <Check className="w-4 h-4 text-accent" />}
</div>
<div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
  <span className="text-foreground/70">{displayInfo.brandName}</span>
  <span>•</span>
  <span>{displayInfo.color} {displayInfo.material}</span>
  {sku.angles.length > 1 && (
    <>
      <span>•</span>
      <span>{sku.angles.length} angles</span>
    </>
  )}
</div>
```

This displays:
- Line 1: **Boston** + checkmark
- Line 2: Birkenstock • Taupe Suede • 3 angles

### 5. Update Gallery Image Cards

**File: `src/components/creative-studio/GeneratedImageCard.tsx`**

Currently (line 228-229):
```tsx
{image.conceptTitle || 'Generated Image'}
```

For Product Shoot images, `conceptTitle` already contains the product name. This should be sufficient but ensure it's using the improved naming when generated.

---

## SKU Name Parsing Logic

The parsing function will handle existing well-formatted names:

| Input Name | Brand | Model | Color | Material | Type |
|------------|-------|-------|-------|----------|------|
| Birkenstock Boston Taupe Suede Clog | Birkenstock | Boston | Taupe | Suede | Clog |
| Birkenstock Arizona EVA Sandals Taupe | Birkenstock | Arizona | Taupe | EVA | Sandals |

**Algorithm:**
1. First word = Brand (if known brand like "Birkenstock")
2. Second word = Model name
3. Last word = Product type (clog, sandal, boot, etc.)
4. Remaining words = Color + Material (from description JSONB if available)

**Fallback:** If parsing fails, just show full name as-is.

---

## Visual Comparison

### Before (Thumbnails)
```
┌─────────────────────┐
│                     │
│      [image]        │
│                     │
│ Birkenstock Bosto...│
└─────────────────────┘
```

### After (Thumbnails)
```
┌─────────────────────┐
│                     │
│      [image]        │
│                     │
│ Boston              │
│ Taupe Suede         │
└─────────────────────┘
```

### Before (Modal Row)
```
[thumb] Birkenstock Boston Taupe Suede Clog  >
        BIRK-BOSTON-TAUPE • 3 angles
```

### After (Modal Row)
```
[thumb] Boston                               >
        Birkenstock • Taupe Suede • 3 angles
```

---

## File Summary

| File | Changes |
|------|---------|
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Remove duplicate buttons, improve thumbnail display |
| `src/components/creative-studio/product-shoot/ProductPickerModal.tsx` | Add description field to query, improve row display |
| `src/lib/skuDisplayUtils.ts` | NEW: Create SKU name parsing utility |

---

## Result

1. **Cleaner UI** - No duplicate Smart Upload / Create SKU buttons
2. **Consistent naming** - Model name prominent, attributes secondary
3. **Scannable** - Easy to distinguish products at a glance
4. **Scalable** - Works for 1000+ SKUs with consistent formatting

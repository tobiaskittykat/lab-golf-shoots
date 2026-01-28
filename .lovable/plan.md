
# Multi-Angle Product SKU + Visual Shot Types

## Overview

Two enhancements for Product Shot workflow to ensure product integrity:

1. **Multi-Angle SKU Grouping**: Group multiple images of the same product (e.g., front, side, back, top views of a Birkenstock Boston clog) under one SKU. When attaching to generation, composite all angles into ONE reference image for the AI.

2. **Visual Shot Type Selector**: Replace emoji-based shot type cards with actual example images showing what each shot type looks like.

---

## Part 1: Multi-Angle SKU Grouping

### Current State
- Products in `scraped_products` table are individual images
- Each uploaded product gets its own row with a single `thumbnail_url`
- No concept of "same product, different angle"

### New Data Model

**Option A: New `product_skus` table** (Recommended)
```sql
CREATE TABLE product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID,
  sku_code TEXT,                    -- e.g., "BIRK-BOSTON-BROWN"
  name TEXT NOT NULL,               -- e.g., "Boston Brown Oiled Leather"
  category TEXT DEFAULT 'product',
  description JSONB,                -- AI-analyzed product details
  composite_image_url TEXT,         -- The stitched multi-angle reference
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Link existing product images to SKUs
ALTER TABLE scraped_products 
ADD COLUMN sku_id UUID REFERENCES product_skus(id),
ADD COLUMN angle TEXT;              -- 'front', 'side', 'back', 'top', '3/4', etc.
```

### Composite Image Generation

When a user groups multiple angles under one SKU:
1. Fetch all images linked to that SKU
2. Create a 2x2 or 1xN grid composite image
3. Store in `product-images` bucket as `{sku_id}/composite.jpg`
4. Pass THIS single composite to the AI for maximum product fidelity

```text
+----------------+----------------+
|   Front View   |   Side View    |
+----------------+----------------+
|   Back View    |   Top View     |
+----------------+----------------+
```

### UI Changes

**New Component: `ProductSKUPicker.tsx`**
- Shows products grouped by SKU
- Each SKU card shows a mini-grid of all angles
- Expandable to see individual angle thumbnails
- "Create New SKU" button to start grouping
- "Add Angle" button within each SKU to upload more views

**New Component: `CreateSKUModal.tsx`**
- Step 1: Name the SKU (or let AI suggest from first image)
- Step 2: Upload multiple angles (drag & drop zone)
- Step 3: AI analyzes and creates composite
- Step 4: Save and preview the composite reference

### Product Selection in ProductShootStep2

Replace current single-image picker with SKU-based picker:
```typescript
selectedProduct?: {
  id: string;           // SKU ID
  name: string;
  compositeUrl: string; // The stitched multi-angle image
  angles: string[];     // Preview of individual angle URLs
}
```

---

## Part 2: Visual Shot Type Selector

### Current State
- Shot types use emoji icons and text descriptions
- No visual examples of what each shot type looks like

### New Shot Type Definition

```typescript
export const productShotTypes = [
  { 
    id: 'product-focus',
    name: 'Product Focus', 
    exampleImage: '/shot-references/product-focus.jpg',  // Already exists!
    description: 'Close-up, no model',
    promptHint: 'product only, detailed close-up, no model'
  },
  { 
    id: 'on-foot-focus',
    name: 'On Foot - Shoe Focus', 
    exampleImage: null,  // Placeholder needed
    description: 'Model wearing shoes, camera on product',
    promptHint: 'shoes on model feet, product as focal point, cropped view'
  },
  { 
    id: 'full-body-on-model',
    name: 'Full Body on Model', 
    exampleImage: '/shot-references/product-on-model.jpg',  // Already exists!
    description: 'Full outfit with product',
    promptHint: 'full body fashion shot, lifestyle, product visible'
  },
];
```

### Existing Example Images

These images already exist in the project:
- `src/assets/shot-references/product-focus.jpg` - Product with background
- `src/assets/shot-references/product-on-model.jpg` - Full body with model
- `src/assets/shot-references/product-in-hand.jpg` - Hand holding product
- `src/assets/shot-references/product-composition.jpg` - Styled flat lay

### New Shot Types (Placeholders Needed)

For the three priority shot types:
1. **Product Focus** - Use existing `product-focus.jpg`
2. **On Foot - Shoe Focus** - Need placeholder (cropped feet with shoes)
3. **Full Body on Model** - Use existing `product-on-model.jpg`

### UI Changes

**Updated `ProductShootStep2.tsx` Shot Type Section**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  {productShotTypes.map((shot) => (
    <button
      key={shot.id}
      onClick={() => onStateChange({ productShotType: shot.id })}
      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
        state.productShotType === shot.id
          ? 'border-accent ring-2 ring-accent/30'
          : 'border-border hover:border-accent/40'
      }`}
    >
      {/* Example Image */}
      <div className="aspect-[4/5] bg-muted">
        {shot.exampleImage ? (
          <img 
            src={shot.exampleImage} 
            alt={shot.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📷</span>
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
        )}
      </div>
      
      {/* Label Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="font-medium text-white text-sm">{shot.name}</div>
        <div className="text-xs text-white/70">{shot.description}</div>
      </div>
      
      {/* Selected Checkmark */}
      {state.productShotType === shot.id && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </button>
  ))}
</div>
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/creative-studio/product-shoot/ProductSKUPicker.tsx` | SKU-grouped product selector |
| `src/components/creative-studio/product-shoot/CreateSKUModal.tsx` | Modal to create new SKU with multiple angles |
| `src/components/creative-studio/product-shoot/ShotTypeVisualSelector.tsx` | Image-based shot type picker |
| `supabase/functions/composite-product-images/index.ts` | Edge function to stitch angles into one image |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/creative-studio/product-shoot/types.ts` | Add SKU types, update shot types with image paths |
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Use visual shot selector, integrate SKU picker |
| `supabase/config.toml` | Add new edge function |

## Database Migration

```sql
-- New SKU grouping table
CREATE TABLE product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID,
  sku_code TEXT,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'product',
  description JSONB,
  composite_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can CRUD own SKUs" ON product_skus
  FOR ALL USING (auth.uid() = user_id);

-- Link products to SKUs
ALTER TABLE scraped_products 
ADD COLUMN sku_id UUID REFERENCES product_skus(id) ON DELETE SET NULL,
ADD COLUMN angle TEXT;
```

---

## User Flow

```text
Product Shot Step 2:

1. PRODUCT SECTION
   ├── Shows SKU-grouped products
   ├── Each SKU card = grid of angles
   ├── "Select" picks the composite image
   └── "Add SKU" opens modal to group new angles

2. SHOT TYPE SECTION (Visual Cards)
   ├── Product Focus - [example image]
   ├── On Foot - Shoe Focus - [example image or placeholder]
   └── Full Body on Model - [example image]

3. BACKGROUND & MODEL
   └── (existing sections, no changes)

4. GENERATE
   └── Uses composite image for product reference
   └── Shot type from visual selection
```

---

## Edge Function: `composite-product-images`

Creates a stitched grid from multiple product angles:

```typescript
// POST /functions/v1/composite-product-images
// Body: { 
//   skuId: string,
//   imageUrls: string[],    // 2-4 angle URLs
//   layout: '2x2' | '1x4'   // Grid layout
// }
// Returns: { compositeUrl: string }

// Uses Canvas API (or sharp) to:
// 1. Fetch all angle images
// 2. Resize to uniform dimensions
// 3. Stitch into grid
// 4. Upload to storage
// 5. Return public URL
```

---

## Implementation Priority

**Phase 1: Visual Shot Types (Quick Win)**
1. Update `productShotTypes` with `exampleImage` paths
2. Create `ShotTypeVisualSelector.tsx` component
3. Wire into `ProductShootStep2`
4. Use existing example images

**Phase 2: Multi-Angle SKU**
1. Database migration for `product_skus`
2. Create `ProductSKUPicker.tsx` and `CreateSKUModal.tsx`
3. Create `composite-product-images` edge function
4. Update ProductShootStep2 to use SKU-based selection

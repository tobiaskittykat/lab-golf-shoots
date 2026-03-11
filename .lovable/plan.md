

## Plan: L.A.B. Golf DF3i SKU Variant Remix Workflow

### What we're building

A product remix flow where you upload existing golf product photos, then the AI swaps the club in each photo with your DF3i putter in a specific **color** and **alignment mark** combination. You pick the variant from visual dropdowns with thumbnails before generating.

### Data setup

**1. Upload product reference images to storage and create SKU records**

- Copy all 9 uploaded images into `src/assets/lab-golf/` as reference assets:
  - `df3i_0.png` through `df3i_5.png` (6 angle shots of the DF3i in different views)
  - `Alignment_mark_a.png`, `Alignment_mark_b.png`, `Alignment_mark_c.png` (3 alignment mark variants)

- Create a new **product_skus** database record for the DF3i putter via migration or runtime insert, with `components` JSONB storing the variant options metadata.

**2. New database table: `product_variants`**

A lightweight table to store the color + alignment mark combinations as selectable options:

```sql
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id uuid REFERENCES public.product_skus(id) ON DELETE CASCADE NOT NULL,
  variant_type text NOT NULL,        -- 'color' or 'alignment_mark'
  variant_name text NOT NULL,        -- e.g. 'Black', 'Slate Blue', 'Mark A'
  variant_value text,                -- hex color or mark identifier
  thumbnail_url text,                -- small preview image URL
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
-- RLS: users can read variants for their own SKUs
CREATE POLICY "Users can read own SKU variants"
  ON public.product_variants FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.product_skus
    WHERE product_skus.id = product_variants.sku_id
    AND product_skus.user_id = auth.uid()
  ));
```

Seed it with the 7 colors (from the screenshot: Black, Burgundy/Maroon, Brown/Cognac, Slate Blue, Red/Brick, Pink, Forest Green, Purple) and 3 alignment marks.

### UI Changes

**3. New component: `PutterVariantSelector.tsx`**

Located at `src/components/creative-studio/product-shoot/PutterVariantSelector.tsx`:

- Two visual selector rows inside a collapsible section:
  - **Putter Color**: Row of circular color swatches (matching the labgolf.com configurator style) with hex backgrounds. Clicking selects. Shows checkmark on selected.
  - **Alignment Mark**: Row of 3 small square thumbnails (the 3 uploaded mark images). Clicking selects. Shows border highlight on selected.
- Props: `selectedColor`, `selectedAlignmentMark`, `onColorChange`, `onAlignmentMarkChange`, `variants` (fetched from DB).
- The component fetches from `product_variants` table filtered by the current SKU.

**4. Integrate into `RemixStep2.tsx`**

- After the "Swap Product" section, add a new collapsible section **"SKU Variant"** that renders `PutterVariantSelector` when the selected SKU has variants.
- Store the selected color and alignment mark in `ProductShootState` (add `selectedVariantColor?: string` and `selectedVariantMark?: string` fields to the state type).

**5. Update prompt building in `useImageGeneration.ts`**

In the remix branch (line ~432-461), when variant selections exist:
- Enhance the remix prompt from generic "swap footwear" to a specific instruction like: *"Replace the golf putter/club in this image with the L.A.B. Golf DF3i putter in [Slate Blue] color with [alignment mark style B — a white crosshair/plus-sign marking on the blade]. Keep exact composition, lighting, and background."*
- Attach the matching alignment mark thumbnail as an additional reference image so the AI can see the exact mark style.
- Attach the closest-angle DF3i reference photo as the primary product reference.

**6. Update `generate-image` edge function**

- Pass the variant metadata (color name, alignment mark reference image) through to the prompt builder so it becomes part of the AI instructions.
- No structural changes needed — just richer prompt text and additional reference image attachments that are already supported.

### Summary of files to create/edit

| File | Action |
|------|--------|
| `src/assets/lab-golf/*.png` | Copy 9 uploaded images |
| `product_variants` table | New DB migration |
| Seed data for DF3i variants | Part of migration |
| `src/components/creative-studio/product-shoot/PutterVariantSelector.tsx` | New component |
| `src/components/creative-studio/product-shoot/types.ts` | Add variant fields to state |
| `src/components/creative-studio/product-shoot/RemixStep2.tsx` | Add variant section |
| `src/hooks/useImageGeneration.ts` | Enhance remix prompt with variant info |
| `src/hooks/useProductVariants.ts` | New hook to fetch variants |


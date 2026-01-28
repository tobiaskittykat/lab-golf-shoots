
# Fix Product Reference Images Not Attaching in Product Shoot Flow

## Problem Identified

When using the Product Shoot workflow, selected product images are not being sent to the image generation endpoint. The edge function logs confirm this:

```
"productReferenceUrls": [],
```

This happens because the Product Shoot flow stores the selected product URL in a different state path than what the generation logic reads from.

## Root Cause

**Two different state paths exist:**

1. **Lifestyle flow** uses `state.productReferences` (array of IDs like `"scraped-abc123"`)
2. **Product Shoot flow** uses `state.productShoot.selectedProductId` and `state.productShoot.recoloredProductUrl`

The `generateImages` function in `useImageGeneration.ts` only reads from the lifestyle flow's `state.productReferences`, ignoring the Product Shoot state entirely.

## Solution

Update the `generateImages` function to merge product references from both sources:
1. The existing `state.productReferences` array (for lifestyle flow)
2. The `state.productShoot` object (for product shoot flow)

Additionally, for Product Shoot, we should also pass the shot type and background configuration.

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useImageGeneration.ts` | Add logic to extract product URL from `state.productShoot` when `state.useCase === 'product'` |

## Implementation Details

### In `useImageGeneration.ts` (generateImages function)

After the existing product reference resolution (around line 169), add logic to check the Product Shoot state:

```typescript
// Existing code resolves from state.productReferences...

// NEW: Also check Product Shoot state for product reference
if (state.productShoot?.recoloredProductUrl) {
  // Add the product shoot URL if not already present
  const shootUrl = state.productShoot.recoloredProductUrl;
  if (!productReferenceUrls.includes(shootUrl)) {
    productReferenceUrls.unshift(shootUrl); // Add at beginning for priority
  }
}

// If we have a selectedProductId (SKU), fetch all angles for that SKU
if (state.productShoot?.selectedProductId && state.useCase === 'product') {
  // Fetch SKU composite or all angles
  const { data: sku } = await supabase
    .from('product_skus')
    .select('composite_image_url, name')
    .eq('id', state.productShoot.selectedProductId)
    .maybeSingle();
  
  if (sku?.composite_image_url && !productReferenceUrls.includes(sku.composite_image_url)) {
    productReferenceUrls.unshift(sku.composite_image_url);
  }
  if (sku?.name) {
    productNames.unshift(sku.name);
  }
  
  // Also fetch individual angles for additional references
  const { data: angles } = await supabase
    .from('scraped_products')
    .select('thumbnail_url, full_url, name')
    .eq('sku_id', state.productShoot.selectedProductId)
    .limit(4);
  
  if (angles) {
    for (const angle of angles) {
      const url = angle.full_url || angle.thumbnail_url;
      if (url && !productReferenceUrls.includes(url)) {
        productReferenceUrls.push(url);
      }
    }
  }
}
```

### Also Pass Product Shoot Configuration

When `state.useCase === 'product'`, include the product shoot configuration in the API request:

```typescript
// In the request body
productShootConfig: state.useCase === 'product' ? {
  shotType: state.productShoot?.productShotType,
  settingType: state.productShoot?.settingType,
  backgroundId: state.productShoot?.backgroundId,
  customBackgroundPrompt: state.productShoot?.customBackgroundPrompt,
  modelConfig: state.productShoot?.modelConfig,
} : undefined,
```

## Expected Outcome

After this fix:
1. When a user selects a product SKU in the Product Shoot flow, the image URL(s) will be included in `productReferenceUrls`
2. The edge function will receive the product images for AI reference
3. Generated images will maintain product fidelity by using the reference images

## Testing

1. Go to Creative Studio and select "Product" use case
2. Choose "New Shoot" and proceed to Step 2
3. Select a product SKU from the picker
4. Configure shot type, background, etc.
5. Click Generate
6. Check edge function logs to confirm `productReferenceUrls` is populated
7. Verify generated image includes the product accurately

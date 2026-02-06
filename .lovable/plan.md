
# Fix Tokyo SKU Name (Previous Rename Failed)

## Problem

The previous database migration used a truncated UUID (`d07360eb`) instead of the full one (`d07360eb-dff7-457c-b828-3c7dc4a70007`), so the rename never applied. The SKU and all 5 angle records still show "Boston" everywhere.

## Fix

Run database updates to rename "Boston" to "Tokyo" across all affected records:

### 1. Update `product_skus` table

For SKU `d07360eb-dff7-457c-b828-3c7dc4a70007`:
- **name**: "Birkenstock Boston Shearling..." -> "Birkenstock Tokyo Shearling..."
- **sku_code**: "BIRK-BOSTON-SHEAR-TOB" -> "BIRK-TOKYO-SHEAR-TOB"
- **description.summary**: Replace "Boston" with "Tokyo"
- **components**: Set to NULL to trigger fresh re-analysis

### 2. Update `scraped_products` table

All 5 angle records with `sku_id = d07360eb-dff7-457c-b828-3c7dc4a70007`:
- **name**: "Birkenstock Boston Shearling..." -> "Birkenstock Tokyo Shearling..."

### Files Changed

No code files change -- this is purely a database data fix using SQL updates.

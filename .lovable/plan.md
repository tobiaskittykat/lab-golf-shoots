

# Rename "Boston" to "Tokyo" and Re-analyze Components

## What's Changing

The shearling-lined clog currently labeled as a "Boston" is actually a **Tokyo** (same silhouette but with a heel strap). We'll rename it, fix the analysis rules, and re-analyze so the heel strap gets properly detected.

## Steps

### 1. Rename the SKU in the database

Update the product_skus record (`d07360eb`) with corrected metadata:

| Field | Current | New |
|-------|---------|-----|
| name | Birkenstock Boston Shearling Lined Clog in Tobacco Suede | Birkenstock Tokyo Shearling Lined Clog in Tobacco Suede |
| sku_code | BIRK-BOSTON-SHEAR-TOB | BIRK-TOKYO-SHEAR-TOB |
| description.summary | "A classic Birkenstock Boston clog..." | "A classic Birkenstock Tokyo clog..." |

This will be done via a SQL migration that updates the name, sku_code, and the summary inside the description JSONB field.

### 2. Update the heelstrap analysis rule

**File:** `supabase/functions/analyze-shoe-components/index.ts`

The current rule on line 41 says:
> "Clogs (Boston, Kyoto) do NOT have heelstraps."

Update to explicitly mention that the Tokyo **does** have a heel strap:
> "Clogs like the Boston and Kyoto do NOT have heelstraps. However, the Tokyo (a Boston-style clog with a back strap) DOES have a heelstrap. Analyze the images to determine if one is present."

This keeps the Boston/Kyoto rule intact while teaching the AI about the Tokyo model.

### 3. Re-analyze the SKU's components

After deploying the updated analysis function, clear the existing `components` data for this SKU so it gets re-analyzed fresh. The next time you select the product in the studio, the "Analyze Components" flow will run and should now correctly detect:
- Upper: Suede in Tobacco Brown
- Footbed: Cork-latex
- Sole: EVA in Dark Brown
- Buckles: Metal in Antique Brass
- **Heelstrap: Suede in Tobacco Brown** (newly detected)
- Lining: Shearling in Cream

### Files Changed

| File / Target | Change |
|---------------|--------|
| Database migration | Rename SKU name, code, and description summary from "Boston" to "Tokyo" |
| `supabase/functions/analyze-shoe-components/index.ts` | Update heelstrap rule to recognize Tokyo as having a heelstrap |

### After Implementation

Once the changes are deployed, select the Tokyo in the product picker and click **"Re-analyze Components"** -- the heel strap should now appear in the component list, and future generations will include it in the prompt.


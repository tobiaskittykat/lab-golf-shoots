
# Default to Product Shoot with Product Focus

Three small default/behavior changes across the Creative Studio.

## 1. Default Creative Studio type to "Product Shot"

The Creative Studio currently defaults to the "Lifestyle" type chip. This changes the initial state so "Product Shot" is selected by default when the studio opens.

### File: `src/components/creative-studio/types.ts`

- Change `useCase: 'lifestyle'` to `useCase: 'product'` (line 283)
- Change `selectedTypeCard: 'lifestyle'` to `selectedTypeCard: 'product'` (line 285)

## 2. Make "Remix Existing" a "Coming Soon" option

The Remix card in the Product Shoot Step 1 selector will become non-clickable with a "Coming Soon" badge, similar to how the Localization and UGC type chips work in the header.

### File: `src/components/creative-studio/product-shoot/ProductShootSubtypeSelector.tsx`

- Disable the Remix button (no `onClick`, add `cursor-not-allowed` and `opacity-50`)
- Add a small "Coming Soon" badge in the corner or below the title
- Since "New Shoot" is the only option, auto-select behavior stays as-is (shootMode defaults to `'new'`)

## 3. Default shot type to "Product Focus"

The Product Shoot step 2 currently defaults to `productShotType: 'lifestyle'` (Full Body on Model). This changes it to `'product-focus'`.

### File: `src/components/creative-studio/product-shoot/types.ts`

- Change `productShotType: 'lifestyle'` to `productShotType: 'product-focus'` in `initialProductShootState` (line 174)

## Files changed

| File | Change |
|------|--------|
| `src/components/creative-studio/types.ts` | Set `useCase` and `selectedTypeCard` defaults to `'product'` |
| `src/components/creative-studio/product-shoot/ProductShootSubtypeSelector.tsx` | Disable Remix button, add "Coming Soon" badge |
| `src/components/creative-studio/product-shoot/types.ts` | Set `productShotType` default to `'product-focus'` |

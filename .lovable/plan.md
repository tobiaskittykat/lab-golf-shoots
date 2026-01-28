
# Fix: Integrate Product Shot Workflow into Creative Studio

## Problem Identified

The Product Shot components were created but **never integrated** into the main wizard flow. Currently:

- Clicking "Product Shot" only changes `state.useCase` to `'product'`
- The wizard still renders `<StepTwoCustomize />` for all use cases
- `ProductShootStep2`, `ProductShootSubtypeSelector`, and other product-specific components are unused
- The product-focused experience (background selection, model configuration, integrity checks) is completely missing

## Solution: Conditional Routing Based on Use Case

### Changes to `CreativeStudioWizard.tsx`

**1. Import Product Shot Components**
```typescript
import { 
  ProductShootStep2, 
  ProductShootSubtypeSelector,
  initialProductShootState,
} from "./product-shoot";
```

**2. Add Product Shoot State Handler**
```typescript
const handleProductShootUpdate = useCallback((updates: Partial<ProductShootState>) => {
  setState(prev => ({
    ...prev,
    productShoot: { ...prev.productShoot, ...updates }
  }));
}, []);
```

**3. Conditional Step 2 Rendering (lines 753-770)**

Replace the current unconditional `<StepTwoCustomize />` with:
```typescript
{state.step === 2 && (
  <div ref={step2CardRef} className="glass-card p-6">
    <CreativeStudioHeader ... />
    
    <div style={{ paddingBottom: footerHeight + 24 }}>
      {/* PRODUCT SHOT FLOW */}
      {state.useCase === 'product' ? (
        <>
          {/* Show subtype selector if not yet chosen */}
          {!state.productShoot.shootMode ? (
            <ProductShootSubtypeSelector
              onSelectMode={(mode) => handleProductShootUpdate({ shootMode: mode })}
            />
          ) : (
            <ProductShootStep2
              state={state.productShoot}
              onStateChange={handleProductShootUpdate}
              selectedProduct={/* get from state.productReferences */}
              onProductSelect={() => setShowProductRefModal(true)}
            />
          )}
        </>
      ) : (
        /* LIFESTYLE FLOW (existing) */
        <StepTwoCustomize ... />
      )}
    </div>
  </div>
)}
```

### Changes to `ProductShootSubtypeSelector.tsx`

Update to accept `onSelectMode` callback:
```typescript
interface ProductShootSubtypeSelectorProps {
  onSelectMode: (mode: 'new' | 'remix') => void;
  currentMode?: 'new' | 'remix';
}
```

### Changes to `ProductShootStep2.tsx`

**1. Fix Product Selection Integration**

Connect to the existing product reference picker used by lifestyle flow:
- Receive `selectedProduct` prop from parent (derived from `state.productReferences[0]`)
- Receive `onProductSelect` callback to open the modal

**2. Add Concept Section (Optional for Product)**

Product shots can optionally use concepts or skip directly to configuration:
- Show a simplified concept section OR
- Allow direct configuration without concept generation

### Changes to Step 1 Prompt Section

When `useCase === 'product'`, the example briefs should focus on product photography:
- This was already implemented in `StepOnePrompt.tsx`

### Footer Button Logic

Update the generate button in the floating footer to:
- Use `productShoot.productShotType` for shot type when in product mode
- Pass product-specific configuration to the edge function

### Edge Function Updates

Update `generate-image/index.ts` to accept and use `productShootConfig`:
```typescript
if (productShootConfig) {
  // Use product-specific prompting:
  // - Include background prompt from presets
  // - Add model configuration
  // - Add shot type hints
  // - Handle recolor instructions
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Import product-shoot components, add conditional routing for `useCase === 'product'`, add `handleProductShootUpdate` |
| `src/components/creative-studio/product-shoot/ProductShootSubtypeSelector.tsx` | Update props interface to accept `onSelectMode` callback |
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Connect to parent's product selection, integrate with existing product picker modal |
| `src/hooks/useImageGeneration.ts` | Pass `productShootConfig` to edge function when in product mode |
| `supabase/functions/generate-image/index.ts` | Handle `productShootConfig` in prompt crafting |

---

## User Experience After Fix

```text
1. User clicks "Product Shot" chip
   → useCase = 'product'

2. User enters brief and clicks "Create Concepts"
   → Concepts generated (same as lifestyle)

3. Step 2 opens → NOW DIFFERENT:
   → Shows ProductShootSubtypeSelector
     "New Shoot" or "Remix Existing"

4. User selects "New Shoot"
   → Shows ProductShootStep2 with:
     • Product selection (with Recolor button)
     • Shot type picker (Flat Lay, On Foot, etc.)
     • Background selector (Studio/Outdoor tabs)
     • Model configurator (Gender, Ethnicity, Clothing)

5. User clicks "Generate"
   → Product-specific prompting used
   → Background preset included
   → Model configuration applied

6. Post-generation:
   → Images shown with integrity badges
   → Flagged images have "Regenerate" button
```

---

## Summary

The infrastructure was built but never wired up. This plan connects the existing Product Shot components to the main wizard by adding a conditional check on `state.useCase` and routing to the appropriate UI.


# Product Shoot Selection Bar - Match Lifestyle Flow

## Overview

Align the Product Shoot bottom bar with the Lifestyle flow's design and functionality. Create clickable indicator chips that scroll to sections, use the same visual styling, and match the generate button format.

---

## Key Differences Found

| Aspect | Lifestyle Flow | Current Product Shoot |
|--------|---------------|----------------------|
| **Chips** | Clickable `IndicatorChip` with checkmarks | Static styled badges |
| **Scroll behavior** | Yes, via `scrollToSection()` | No |
| **Section IDs** | `section-concepts`, etc. | None on sections |
| **Generate text** | `Generate (4 images)` | `Generate Product Shot` |
| **Styling** | `px-2 py-1 rounded-md text-sm` | `px-3 py-1.5 rounded-lg bg-secondary/80 border` |

---

## Changes Required

### 1. Create `ProductShootIndicators.tsx`

New component matching the `SelectionIndicators.tsx` pattern exactly:

**Chips to display:**
- **Product** - checkmark when selected, shows "Product"
- **Shot Type** - always has checkmark, shows "On Foot" / "Full Body" / "Product Focus"
- **Background** - checkmark when not auto, shows "Studio" / "Outdoor" or "Background (auto)"
- **Output** - always shown, displays "4x 1:1" format

**Key elements:**
- Reuse same `IndicatorChip` styling (`px-2 py-1 rounded-md text-sm`)
- Same separator: `<span className="text-muted-foreground/30">·</span>`
- Same `scrollToSection()` function
- Same accent color logic for selected vs auto

### 2. Add Section IDs to `ProductShootStep2.tsx`

Add `id` attributes to match the scroll targets:

```tsx
// Product section
<div id="section-ps-product" className="rounded-2xl border...">

// Shot Type section  
<div id="section-ps-shot-type" className="rounded-2xl border...">

// Background section
<div id="section-ps-background" className="rounded-2xl border...">

// Output section
<div id="section-ps-output" className="rounded-2xl border...">
```

### 3. Update `CreativeStudioWizard.tsx`

Replace lines 940-966 (static badges) with the new `ProductShootIndicators` component:

```tsx
{state.useCase === 'product' && (
  <ProductShootIndicators 
    state={state.productShoot}
    imageCount={state.imageCount}
    aspectRatio={state.aspectRatio}
  />
)}
```

Update generate button text (line 994) to match lifestyle format:
```tsx
// From:
`Generate Product Shot`

// To:
`Generate (${state.imageCount} images)`
```

---

## Visual Parity

### IndicatorChip Styling (exact match)
```tsx
<button
  className={cn(
    "flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-sm",
    "hover:text-foreground hover:bg-secondary/50",
    selected 
      ? (isAuto ? "text-muted-foreground" : "text-accent")
      : "text-muted-foreground"
  )}
>
  {selected && <Check className="w-3 h-3" />}
  {label}
</button>
```

### Chip Labels

| Chip | Label When Selected | Label When Empty/Auto |
|------|---------------------|----------------------|
| Product | `✓ Product` | `Product` (no check) |
| Shot Type | `✓ On Foot` / `✓ Full Body` / `✓ Product Focus` | - (always selected) |
| Background | `✓ Studio` / `✓ Outdoor` | `Background (auto)` with muted color |
| Output | `✓ 4x 1:1` | - (always shown) |

---

## File Changes

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/ProductShootIndicators.tsx` | **NEW** - Clickable indicator chips matching `SelectionIndicators.tsx` |
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Add `id` attributes to section containers |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Replace static badges with `ProductShootIndicators`, update generate button text |

---

## Technical Implementation

### ProductShootIndicators.tsx

```typescript
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductShootState } from "./types";

interface ProductShootIndicatorsProps {
  state: ProductShootState;
  imageCount: number;
  aspectRatio: string;
}

const IndicatorChip = ({ label, selected, isAuto, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-sm",
      "hover:text-foreground hover:bg-secondary/50",
      selected 
        ? (isAuto ? "text-muted-foreground" : "text-accent")
        : "text-muted-foreground"
    )}
  >
    {selected && <Check className="w-3 h-3" />}
    {label}
  </button>
);

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
};

export const ProductShootIndicators = ({ state, imageCount, aspectRatio }: ProductShootIndicatorsProps) => {
  const hasProduct = !!state.recoloredProductUrl;
  
  const shotTypeLabels: Record<string, string> = {
    'product-focus': 'Product Focus',
    'on-foot': 'On Foot',
    'lifestyle': 'Full Body',
  };
  const shotLabel = shotTypeLabels[state.productShotType] || 'Shot Type';
  
  const getBackgroundLabel = () => {
    if (state.settingType === 'auto') return 'Background (auto)';
    if (state.settingType === 'studio') return 'Studio';
    if (state.settingType === 'outdoor') return 'Outdoor';
    return 'Background';
  };
  
  const outputLabel = `${imageCount}x ${aspectRatio}`;
  
  return (
    <div className="flex items-center gap-0.5">
      <IndicatorChip
        label="Product"
        selected={hasProduct}
        onClick={() => scrollToSection('section-ps-product')}
      />
      
      <span className="text-muted-foreground/30">·</span>
      
      <IndicatorChip
        label={shotLabel}
        selected={true}
        onClick={() => scrollToSection('section-ps-shot-type')}
      />
      
      <span className="text-muted-foreground/30">·</span>
      
      <IndicatorChip
        label={getBackgroundLabel()}
        selected={state.settingType !== 'auto'}
        isAuto={state.settingType === 'auto'}
        onClick={() => scrollToSection('section-ps-background')}
      />
      
      <span className="text-muted-foreground/30">·</span>
      
      <IndicatorChip
        label={outputLabel}
        selected={true}
        onClick={() => scrollToSection('section-ps-output')}
      />
    </div>
  );
};
```

This creates exact visual and functional parity with the Lifestyle flow while adapting for Product Shoot-specific sections (Product, Shot Type, Background, Output instead of Concept, Moodboard, Products, Shot Type).

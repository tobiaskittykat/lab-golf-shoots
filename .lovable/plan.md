

# Shot Options UX Enhancements

## Summary

Improve the Shot Options section visibility and usability with 4 enhancements:
1. Reset to "auto" when navigating back to Step 1
2. Add a Reset button within Shot Options
3. Auto-expand when customized (stay open instead of collapsed)
4. Show "Customized" chip/indicator even when collapsed

---

## Current State Analysis

### Already Working
The `handleBack()` function in `CreativeStudioWizard.tsx` already resets `productShoot` to `initialProductShootState` when navigating back to Step 1. All initial configs have 'auto' values.

### Files to Modify
- `OnFootConfigurator.tsx`
- `LifestyleConfigurator.tsx`
- `ProductFocusConfigurator.tsx`
- `ProductShootStep2.tsx` (for passing isCustomized prop)
- `shotTypeConfigs.ts` (for helper functions)

---

## Implementation Details

### Part 1: Add Helper Functions for Detecting Customization

**File:** `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`

Add three helper functions to check if each config type has been customized:

```typescript
// Check if OnFoot config has any non-auto values
export function isOnFootConfigCustomized(config: OnFootShotConfig): boolean {
  return (
    config.gender !== 'auto' ||
    config.ethnicity !== 'auto' ||
    config.poseVariation !== 'auto' ||
    config.legStyling !== 'auto' ||
    config.trouserColor !== 'auto'
  );
}

// Check if Lifestyle config has any non-auto values
export function isLifestyleConfigCustomized(config: LifestyleShotConfig): boolean {
  return (
    config.gender !== 'auto' ||
    config.ethnicity !== 'auto' ||
    config.pose !== 'auto' ||
    config.trouserStyle !== 'auto' ||
    config.topStyle !== 'auto' ||
    config.outfitColor !== 'auto'
  );
}

// Check if ProductFocus config has any non-auto values
export function isProductFocusConfigCustomized(config: ProductFocusShotConfig): boolean {
  return (
    config.cameraAngle !== 'auto' ||
    config.lighting !== 'auto'
  );
}
```

---

### Part 2: Update Configurator Components

All three configurators need the same pattern of changes. Here's the pattern using `OnFootConfigurator.tsx` as example:

#### Add Props

```typescript
interface OnFootConfiguratorProps {
  config: OnFootShotConfig;
  onConfigChange: (updates: Partial<OnFootShotConfig>) => void;
  onReset: () => void;  // NEW: callback to reset config
}
```

#### Change Open State Logic

```typescript
// Determine if customized
const isCustomized = isOnFootConfigCustomized(config);

// Auto-open when customized, otherwise closed by default
const [isOpen, setIsOpen] = useState(isCustomized);

// Keep in sync if user makes changes
useEffect(() => {
  if (isCustomized && !isOpen) {
    setIsOpen(true);
  }
}, [isCustomized]);
```

#### Add Customized Badge & Reset Button in Header

```typescript
<CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
    <SlidersHorizontal className="w-4 h-4 text-accent" />
    Shot Options
    {/* Customized indicator badge */}
    {isCustomized && (
      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-accent/20 text-accent rounded">
        Customized
      </span>
    )}
  </div>
  <div className="flex items-center gap-2">
    {/* Reset button - stops propagation to not toggle collapse */}
    {isCustomized && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        className="p-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
        title="Reset to defaults"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    )}
    {isOpen ? (
      <ChevronDown className="w-4 h-4 text-muted-foreground" />
    ) : (
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    )}
  </div>
</CollapsibleTrigger>
```

---

### Part 3: Wire Up Reset Callbacks in ProductShootStep2

**File:** `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`

Pass reset callbacks to each configurator:

```typescript
{state.productShotType === 'on-foot' && (
  <OnFootConfigurator
    config={state.onFootConfig || initialOnFootConfig}
    onConfigChange={(updates) => onStateChange({
      onFootConfig: { ...(state.onFootConfig || initialOnFootConfig), ...updates }
    })}
    onReset={() => onStateChange({ onFootConfig: initialOnFootConfig })}
  />
)}

{state.productShotType === 'lifestyle' && (
  <LifestyleConfigurator
    config={state.lifestyleConfig || initialLifestyleConfig}
    onConfigChange={(updates) => onStateChange({
      lifestyleConfig: { ...(state.lifestyleConfig || initialLifestyleConfig), ...updates }
    })}
    onReset={() => onStateChange({ lifestyleConfig: initialLifestyleConfig })}
  />
)}

{state.productShotType === 'product-focus' && (
  <ProductFocusConfigurator
    config={state.productFocusConfig || initialProductFocusConfig}
    onConfigChange={(updates) => onStateChange({
      productFocusConfig: { ...(state.productFocusConfig || initialProductFocusConfig), ...updates }
    })}
    onReset={() => onStateChange({ productFocusConfig: initialProductFocusConfig })}
  />
)}
```

---

## Visual Result

### Before

```text
┌─────────────────────────────────────────────┐
│ ⚙ Shot Options                          > │
└─────────────────────────────────────────────┘
(Collapsed, no indication if customized)
```

### After - With Customizations (Expanded by Default)

```text
┌─────────────────────────────────────────────┐
│ ⚙ Shot Options  [Customized]       ↻   v │
├─────────────────────────────────────────────┤
│ Gender            [Female ▼]                │
│ Ethnicity         [Asian ▼]                 │
│ Pose Variation    [One Foot Forward ▼]      │
│ ...                                         │
└─────────────────────────────────────────────┘
```

### After - Default State (Collapsed)

```text
┌─────────────────────────────────────────────┐
│ ⚙ Shot Options                          > │
└─────────────────────────────────────────────┘
(No badge, no reset icon - all values are auto)
```

---

## Technical Summary

| File | Changes |
|------|---------|
| `shotTypeConfigs.ts` | Add 3 helper functions: `isOnFootConfigCustomized`, `isLifestyleConfigCustomized`, `isProductFocusConfigCustomized` |
| `OnFootConfigurator.tsx` | Add `onReset` prop, add "Customized" badge, add reset button, auto-expand when customized |
| `LifestyleConfigurator.tsx` | Same pattern as OnFootConfigurator |
| `ProductFocusConfigurator.tsx` | Same pattern as OnFootConfigurator |
| `ProductShootStep2.tsx` | Pass `onReset` callbacks to configurators |
| `types.ts` | Export new helper functions |

---

## Behavior Summary

| Feature | Behavior |
|---------|----------|
| Step 1 Reset | Already works - `handleBack()` resets `productShoot` to initial state |
| Reset Button | Appears only when customized, resets config to all 'auto' values |
| Default Open State | Closed when all 'auto', opens automatically when any value is customized |
| Customized Badge | Shows "Customized" chip next to "Shot Options" when any value is non-auto |


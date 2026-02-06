

# Auto-Match Color for Color-Matched Buckles

## Problem

When selecting "Matte Plastic (Color-Matched)" for buckles, the color picker remains active and the user can choose any color. This defeats the purpose of "color-matched" — the buckle color should automatically inherit from the upper component and the picker should be disabled.

---

## Solution Overview

```text
┌────────────────────────────────────────────────────────────────┐
│ Upper: Hot Pink Suede                                          │
│        ┌──────┐                                                │
│        │ 🩷  │  Override → Hot Pink                           │
│        └──────┘                                                │
└────────────────────────────────────────────────────────────────┘
                     │
                     │ Auto-sync
                     ▼
┌────────────────────────────────────────────────────────────────┐
│ Buckles: Matte Plastic (Color-Matched)                         │
│        ┌──────┐                                                │
│        │ 🩷  │  "Matches Upper: Hot Pink" (picker disabled)   │
│        └──────┘                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Technical Changes

### File 1: `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`

**Add new props to know about upper color:**
```typescript
interface ComponentOverridePopoverProps {
  componentType: ComponentType;
  currentMaterial: string;
  currentColor: string;
  currentColorHex?: string;
  override?: { material: string; color: string; colorHex?: string };
  onApply: (override: { material: string; color: string; colorHex?: string } | null) => void;
  // NEW: For color-matched materials
  upperColor?: string;          // e.g., "Hot Pink"
  upperColorHex?: string;       // e.g., "#FF69B4"
}
```

**Add material check and conditional UI:**
```typescript
// Check if current selection is color-matched
const isColorMatched = selectedMaterial === 'Matte Plastic (Coordinated)';

// When color-matched selected, auto-sync to upper color
useEffect(() => {
  if (isColorMatched && upperColor) {
    setSelectedColor(upperColor);
    setSelectedHex(upperColorHex || '');
  }
}, [isColorMatched, upperColor, upperColorHex]);

// In the Color Selection section:
{isColorMatched ? (
  // Show locked state for color-matched materials
  <div className="p-3 rounded-lg border border-accent/30 bg-accent/5">
    <div className="flex items-center gap-2">
      <ColorSwatch hex={upperColorHex} />
      <span className="text-sm">Matches Upper: <strong>{upperColor || 'Unknown'}</strong></span>
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      Color automatically synced with upper component
    </p>
  </div>
) : (
  // Normal color picker (existing code)
  <>
    <div className="grid grid-cols-5 gap-1.5">...</div>
    {/* ... rest of color picker ... */}
  </>
)}
```

---

### File 2: `src/components/creative-studio/product-shoot/ShoeComponentsPanel.tsx`

**Pass upper color to ComponentOverridePopover:**
```typescript
// Get the effective upper color (override or original)
const getUpperColor = () => {
  const upperOverride = overrides.upper;
  if (upperOverride) {
    return { color: upperOverride.color, hex: upperOverride.colorHex };
  }
  const upperComponent = components?.upper;
  return { 
    color: upperComponent?.color || 'Unknown', 
    hex: upperComponent?.colorHex 
  };
};

// In ComponentRow for buckles, pass down:
<ComponentOverridePopover
  componentType={type}
  currentMaterial={component?.material || ''}
  currentColor={component?.color || ''}
  currentColorHex={component?.colorHex}
  override={override}
  onApply={onOverrideChange}
  upperColor={type === 'buckles' ? getUpperColor().color : undefined}
  upperColorHex={type === 'buckles' ? getUpperColor().hex : undefined}
/>
```

---

### File 3: `src/hooks/useShoeComponents.ts`

**Auto-sync buckle color when upper changes:**
```typescript
export function useComponentOverrides(initialComponents: ShoeComponents | null) {
  const [overrides, setOverrides] = useState<ComponentOverrides>({});

  // Auto-sync color-matched buckles when upper color changes
  useEffect(() => {
    if (overrides.buckles?.material === 'Matte Plastic (Coordinated)') {
      const upperColor = overrides.upper?.color || initialComponents?.upper?.color;
      const upperHex = overrides.upper?.colorHex || initialComponents?.upper?.colorHex;
      
      if (upperColor && overrides.buckles.color !== upperColor) {
        setOverrides(prev => ({
          ...prev,
          buckles: {
            ...prev.buckles!,
            color: upperColor,
            colorHex: upperHex,
          }
        }));
      }
    }
  }, [overrides.upper, overrides.buckles?.material, initialComponents?.upper]);

  // ... rest unchanged
}
```

---

## Behavior After Fix

| Scenario | Behavior |
|----------|----------|
| Select "Matte Plastic (Color-Matched)" | Color picker disabled, shows "Matches Upper: [color]" |
| Upper color changes while buckle is color-matched | Buckle color auto-syncs to new upper color |
| Switch away from color-matched material | Color picker re-enabled with current color |
| No upper color defined | Shows "Matches Upper: Unknown" with neutral swatch |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` | Add `upperColor`/`upperColorHex` props; conditionally disable color picker for color-matched materials |
| `src/components/creative-studio/product-shoot/ShoeComponentsPanel.tsx` | Compute effective upper color and pass to buckle's ComponentOverridePopover |
| `src/hooks/useShoeComponents.ts` | Auto-sync buckle color when upper changes and buckle is color-matched |


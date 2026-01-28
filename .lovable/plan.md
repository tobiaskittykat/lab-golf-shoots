

# Merge Model Options into Shot Type Configurators

## Overview

Consolidate the model configuration (gender, ethnicity) directly into each shot type's configurator, removing the separate "Model" section. This creates a more cohesive UX where all shot-specific options live together.

## Current Structure

```text
┌─────────────────────────────────┐
│ Shot Type Section               │
│  ├─ Visual Selector (3 options) │
│  └─ On-Foot Shot Options        │
│       ├─ Pose Variation         │
│       ├─ Leg Styling            │
│       └─ Trouser Color          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Model Section  ← REMOVE THIS    │
│  ├─ Use on-brand defaults       │
│  ├─ Gender                      │
│  ├─ Ethnicity                   │
│  └─ Clothing Style ← redundant  │
└─────────────────────────────────┘
```

## New Structure

```text
┌─────────────────────────────────────┐
│ Shot Type Section                   │
│  ├─ Visual Selector (3 options)     │
│  └─ On-Foot Shot Options            │
│       ├─ Gender         ← NEW       │
│       ├─ Ethnicity      ← NEW       │
│       ├─ Pose Variation             │
│       ├─ Leg Styling                │
│       └─ Trouser Color              │
│       └─ [Static rules reminder]    │
└─────────────────────────────────────┘
```

No separate Model section - each shot type configurator includes the relevant model options.

## Files to Modify

| File | Changes |
|------|---------|
| `shotTypeConfigs.ts` | Extend `OnFootShotConfig` to include `gender` and `ethnicity`. Update `buildOnFootPrompt` to incorporate model direction. |
| `OnFootConfigurator.tsx` | Add Gender and Ethnicity dropdowns at the top of the configurator |
| `ProductShootStep2.tsx` | Remove the Model section entirely (lines 252-273). Remove `model` from `openSections` state. |
| `types.ts` | Keep `ModelConfig` for backward compatibility but mark it as legacy. Update `initialProductShootState` to include model fields in `onFootConfig`. |

## Implementation Details

### 1. Extend OnFootShotConfig (shotTypeConfigs.ts)

Add gender and ethnicity fields:

```typescript
export type ModelGender = 'auto' | 'female' | 'male' | 'nonbinary';

export const genderOptions = [
  { value: 'auto' as ModelGender, label: 'Auto (AI chooses)' },
  { value: 'female' as ModelGender, label: 'Female' },
  { value: 'male' as ModelGender, label: 'Male' },
  { value: 'nonbinary' as ModelGender, label: 'Non-binary' },
];

export interface OnFootShotConfig {
  // Model appearance
  gender: ModelGender;
  ethnicity: string;
  // Pose & styling
  poseVariation: PoseVariation;
  legStyling: LegStyling;
  trouserColor: TrouserColor;
}
```

### 2. Update buildOnFootPrompt

Add a MODEL DIRECTION section when gender/ethnicity are specified:

```typescript
// After LEG STYLING section...
// === MODEL DIRECTION (DYNAMIC) ===
const modelParts: string[] = [];
if (config.gender && config.gender !== 'auto') {
  modelParts.push(`${config.gender} model`);
}
if (config.ethnicity && config.ethnicity !== 'auto') {
  modelParts.push(config.ethnicity);
}
if (modelParts.length > 0) {
  sections.push("MODEL:");
  sections.push(`- ${modelParts.join(', ')}`);
  sections.push("");
}
```

### 3. Update OnFootConfigurator.tsx

Add Gender and Ethnicity dropdowns at the top:

```typescript
import { ethnicityOptions } from './types';
import { genderOptions, ModelGender } from './shotTypeConfigs';

// In the component JSX (before Pose Variation):

{/* Model Gender */}
<div className="space-y-2">
  <label>Gender</label>
  <Select value={config.gender} onValueChange={...}>
    {genderOptions.map(...)}
  </Select>
</div>

{/* Model Ethnicity */}
<div className="space-y-2">
  <label>Ethnicity / Diversity</label>
  <Select value={config.ethnicity} onValueChange={...}>
    {ethnicityOptions.map(...)}
  </Select>
</div>

<Separator />  {/* Visual break between model and pose options */}
```

### 4. Update ProductShootStep2.tsx

Remove these sections:
- Remove `model: true` from `openSections` state
- Remove the entire Model section JSX (lines ~252-273)
- Remove the `needsModel` variable (no longer needed)
- Keep the import of `ModelConfigurator` for potential use in other shot types later, or remove if unused

### 5. Update Initial State

```typescript
export const initialOnFootConfig: OnFootShotConfig = {
  gender: 'auto',
  ethnicity: 'auto',
  poseVariation: 'auto',
  legStyling: 'auto',
  trouserColor: 'auto',
};
```

## Future Shot Types

When adding other shot types (lifestyle, product-focus), each will have its own configurator with the model options it needs:

- **Product Focus**: No model options (no model in shot)
- **Lifestyle (Full Body)**: Will have gender, ethnicity, plus full outfit/pose options
- **On-Foot**: Has gender, ethnicity, leg styling (no full clothing since legs only)

This pattern keeps model configuration contextual to each shot type rather than a generic global section.

## Section Order in OnFootConfigurator

Final order of fields:
1. **Gender** (who is the model)
2. **Ethnicity** (model diversity)
3. *Visual separator*
4. **Pose Variation** (how they stand)
5. **Leg Styling** (what they wear)
6. **Trouser Color** (color of pants)
7. **Static Rules Reminder** (always enforced elements)


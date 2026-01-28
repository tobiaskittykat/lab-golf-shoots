

# Fix Background and Shot Type Selection for Product Shoot

## Problem Identified

The Product Shoot workflow sends `productShootConfig` to the edge function, but:
1. The edge function **does not have the interface defined** for this config
2. The edge function **completely ignores** the `productShootConfig` data
3. No `shotTypePrompt` is being built from the selected shot type
4. Background presets have detailed prompts that are never used

**Evidence from logs:**
```json
"productShootConfig": {
  "shotType": "lifestyle",         // Has a promptHint - not used!
  "settingType": "auto",
  "backgroundId": "studio-white",  // Has a prompt - not used!
  "modelConfig": {...}
}
"shotTypePrompt": null  // Never populated from productShootConfig
```

## Root Cause

Two disconnects:
1. **Client-side**: `useImageGeneration.ts` sends `productShootConfig` but does NOT build `shotTypePrompt` from the shot type's `promptHint`
2. **Server-side**: Edge function reads `shotTypePrompt` and ignores `productShootConfig` entirely (no background prompt, no model config)

## Solution

### Part 1: Client-side - Build shotTypePrompt

Update `useImageGeneration.ts` to generate `shotTypePrompt` from the product shoot configuration using the `visualShotTypes` prompt hints.

### Part 2: Server-side - Read productShootConfig

Update the edge function to:
1. Add `productShootConfig` to the `GenerateImageRequest` interface
2. Build a background direction section from the selected background preset
3. Build a model direction section from the model config
4. Incorporate these into the creative brief

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useImageGeneration.ts` | Build `shotTypePrompt` from `productShoot.productShotType` using the shot type's promptHint |
| `supabase/functions/generate-image/index.ts` | Add `productShootConfig` interface, add logic to incorporate background and model config into the prompt brief |

## Implementation Details

### 1. Client-side Changes (useImageGeneration.ts)

Import the shot type data and build the shotTypePrompt:

```typescript
// Import shot type definitions
import { visualShotTypes } from '@/components/creative-studio/product-shoot/ShotTypeVisualSelector';

// In generateImages function, after resolving product references:
let shotTypePromptValue: string | null = state.shotType;

// For product shoot flow, get promptHint from the visual shot type
if (state.useCase === 'product' && state.productShoot?.productShotType) {
  const shotType = visualShotTypes.find(s => s.id === state.productShoot.productShotType);
  if (shotType) {
    shotTypePromptValue = shotType.promptHint;
  }
}

// Then use shotTypePromptValue in the request body
shotTypePrompt: shotTypePromptValue,
```

### 2. Server-side Changes (generate-image/index.ts)

#### Add ProductShootConfig interface:

```typescript
interface ProductShootConfig {
  shotType?: string;
  settingType?: 'studio' | 'outdoor' | 'auto';
  backgroundId?: string;
  customBackgroundPrompt?: string;
  modelConfig?: {
    gender?: string;
    ethnicity?: string;
    clothing?: string;
    useOnBrandDefaults?: boolean;
  };
}

interface GenerateImageRequest {
  // ... existing fields
  productShootConfig?: ProductShootConfig;
}
```

#### Add background presets lookup (inline):

```typescript
const backgroundPresets: Record<string, string> = {
  'studio-white': 'clean white studio cyclorama background, professional product photography lighting, seamless white backdrop',
  'studio-black': 'deep black studio background, dramatic rim lighting, high contrast product photography',
  'studio-concrete': 'polished concrete floor studio, industrial chic, soft window light',
  'studio-marble': 'white marble surface with grey veining, luxury product photography',
  // ... add all from presets.ts
  'outdoor-beach': 'soft sandy beach background, golden hour sunlight, ocean in distance',
  'outdoor-urban': 'urban city street background, modern architecture, stylish metropolitan setting',
  // ... add all outdoor presets
};
```

#### Add section in craftPromptWithAgent:

```typescript
// === PRODUCT SHOOT CONFIGURATION ===
if (request.productShootConfig) {
  const config = request.productShootConfig;
  
  // Background direction
  if (config.customBackgroundPrompt) {
    sections.push("=== BACKGROUND/SETTING ===");
    sections.push(config.customBackgroundPrompt);
    sections.push("");
  } else if (config.backgroundId && backgroundPresets[config.backgroundId]) {
    sections.push("=== BACKGROUND/SETTING ===");
    sections.push(backgroundPresets[config.backgroundId]);
    sections.push("");
  }
  
  // Model direction (if not product-focus)
  if (config.shotType !== 'product-focus' && config.modelConfig) {
    const modelParts: string[] = [];
    if (config.modelConfig.gender && config.modelConfig.gender !== 'auto') {
      modelParts.push(`${config.modelConfig.gender} model`);
    }
    if (config.modelConfig.ethnicity && config.modelConfig.ethnicity !== 'auto') {
      modelParts.push(config.modelConfig.ethnicity);
    }
    if (config.modelConfig.clothing && config.modelConfig.clothing !== 'auto') {
      modelParts.push(`${config.modelConfig.clothing} outfit`);
    }
    if (modelParts.length > 0) {
      sections.push("=== MODEL DIRECTION ===");
      sections.push(`Feature a ${modelParts.join(', ')}`);
      sections.push("");
    }
  }
}
```

## Expected Outcome

After this fix:
1. Shot type selection will generate the correct `shotTypePrompt` (e.g., "product only, detailed close-up, no model, studio lighting")
2. Background selection will add the background prompt to the creative brief
3. Model configuration will influence the model in the generated image
4. The edge function logs will show these sections in the creative brief

## Testing

1. Select "Product Focus" shot type - verify log shows "product only, detailed close-up, no model"
2. Select "White Cyclorama" background - verify log shows the studio background prompt
3. Select a different background like "Beach" - verify log shows outdoor beach prompt
4. Configure model with specific gender/clothing - verify model direction appears in brief


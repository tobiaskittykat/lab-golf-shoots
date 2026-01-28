
# Implement "Full Body on Model" Shot Type Configuration

## Overview

Create a complete configuration system for the "lifestyle" shot type (Full Body on Model) following the same static/dynamic pattern established for "On-Foot - Shoe Focus". This includes:

1. New types and options in `shotTypeConfigs.ts`
2. A new `LifestyleConfigurator` component
3. A `buildLifestylePrompt()` function
4. Integration into the wizard flow
5. A reference thumbnail image

## Static vs Dynamic Element Analysis

Based on your prompt, here's the breakdown:

### STATIC (Always Enforced)
| Element | Specification |
|---------|---------------|
| **Frame** | Single high-res e-commerce image, one frame only, no collage |
| **Composition** | Full-body shot framed from upper chest/shoulders to feet, head intentionally cropped |
| **Distance** | Pulled-back to show full body proportions and negative space |
| **Background** | Pure white seamless studio, visible floor/wall plane, soft cast shadows |
| **Camera** | Eye-level, neutral angle, no compression or wide-angle distortion |
| **Product Integrity** | Footwear must match reference EXACTLY (CRITICAL - locked across all generations) |
| **Lighting** | Clean, diffused studio lighting with soft shadows |
| **Quality** | Sharp focus, neutral/accurate color, timeless composition |
| **Clothing Rules** | No logos, no graphics, no bold textures, no trends, matte fabrics only |

### DYNAMIC (User-Configurable with "Auto" Fallback)
| Element | Options |
|---------|---------|
| **Gender** | Auto, Female, Male, Non-binary |
| **Ethnicity** | Auto, Caucasian, African/Black, Asian, Hispanic, Middle Eastern, South Asian, Mixed |
| **Pose** | Auto, Front-facing relaxed, Three-quarter stance, Side profile, Walking pause, Heel lift, Weight shift |
| **Trouser Style** | Auto, Tailored trousers, Slim pants, Straight-leg pants, Relaxed chinos, Minimal joggers |
| **Trouser Color** | Auto, Black, White, Off-white/Cream, Charcoal, Grey, Navy, Muted beige |
| **Top Style** | Auto, Button-up shirt, Knitwear/Sweater, Lightweight jacket, Simple tee |
| **Top Color** | Auto, Black, White, Off-white/Cream, Charcoal, Grey, Navy |

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/assets/shot-references/product-on-model.jpg` | **COPY** | Use one of the uploaded reference images as the thumbnail (already exists - may update) |
| `shotTypeConfigs.ts` | **EDIT** | Add `LifestyleShotConfig` interface, pose/clothing option arrays, `buildLifestylePrompt()` function |
| `LifestyleConfigurator.tsx` | **CREATE** | New component with dropdowns for all dynamic options |
| `types.ts` | **EDIT** | Add `lifestyleConfig` to `ProductShootState`, update initial state, re-export new types |
| `ProductShootStep2.tsx` | **EDIT** | Render `LifestyleConfigurator` when `productShotType === 'lifestyle'` |
| `ShotTypeVisualSelector.tsx` | **EDIT** | Add `hasExtraConfig: true` to lifestyle shot type |
| `index.ts` | **EDIT** | Export `LifestyleConfigurator` and new config types |
| `useImageGeneration.ts` | **EDIT** | Add lifestyle prompt builder call similar to on-foot |

## Technical Implementation

### 1. New Types in shotTypeConfigs.ts

```typescript
// ===== LIFESTYLE POSE VARIATIONS =====
export type LifestylePose = 
  | 'auto'
  | 'front-relaxed'
  | 'three-quarter'
  | 'side-profile'
  | 'walking-pause'
  | 'heel-lift'
  | 'weight-shift';

export const lifestylePoseOptions = [
  { value: 'auto', label: 'Auto (AI chooses)', prompt: null },
  { value: 'front-relaxed', label: 'Front-Facing Relaxed', prompt: 'relaxed front-facing stance, arms natural' },
  { value: 'three-quarter', label: 'Three-Quarter Stance', prompt: 'three-quarter body angle, natural pose' },
  { value: 'side-profile', label: 'Side Profile', prompt: 'full side profile view, clean silhouette' },
  { value: 'walking-pause', label: 'Walking Pause', prompt: 'subtle walking pause with one foot forward' },
  { value: 'heel-lift', label: 'Gentle Heel Lift', prompt: 'gentle heel lift with toes grounded' },
  { value: 'weight-shift', label: 'Weight Shift', prompt: 'soft weight shift through hips and knees' },
];

// ===== TROUSER STYLES (FULL BODY) =====
export type LifestyleTrouserStyle = 
  | 'auto'
  | 'tailored'
  | 'slim'
  | 'straight'
  | 'chinos'
  | 'joggers';

export const lifestyleTrouserStyleOptions = [
  { value: 'auto', label: 'Auto (AI chooses)', prompt: null },
  { value: 'tailored', label: 'Tailored Trousers', prompt: 'tailored trousers with clean lines' },
  { value: 'slim', label: 'Slim Pants', prompt: 'slim-fit pants, modern and understated' },
  { value: 'straight', label: 'Straight-Leg Pants', prompt: 'straight-leg pants, classic silhouette' },
  { value: 'chinos', label: 'Relaxed Chinos', prompt: 'relaxed chinos, casual and comfortable' },
  { value: 'joggers', label: 'Minimal Joggers', prompt: 'minimal joggers, clean athleisure look' },
];

// ===== TOP STYLES =====
export type LifestyleTopStyle = 
  | 'auto'
  | 'button-up'
  | 'knitwear'
  | 'jacket'
  | 'tee';

export const lifestyleTopStyleOptions = [
  { value: 'auto', label: 'Auto (AI chooses)', prompt: null },
  { value: 'button-up', label: 'Button-Up Shirt', prompt: 'simple button-up shirt, clean and minimal' },
  { value: 'knitwear', label: 'Knitwear / Sweater', prompt: 'soft knitwear or sweater, understated texture' },
  { value: 'jacket', label: 'Lightweight Jacket', prompt: 'lightweight jacket, relaxed layering' },
  { value: 'tee', label: 'Simple Tee', prompt: 'simple crew-neck tee, minimal and clean' },
];

// ===== OUTFIT COLORS (applies to full outfit) =====
export type LifestyleOutfitColor = 
  | 'auto'
  | 'monochrome-black'
  | 'monochrome-white'
  | 'monochrome-grey'
  | 'contrast-neutral'
  | 'navy-cream'
  | 'charcoal-white';

export const lifestyleOutfitColorOptions = [
  { value: 'auto', label: 'Auto (AI chooses)', prompt: null },
  { value: 'monochrome-black', label: 'Monochrome Black', prompt: 'all-black outfit, matte fabrics' },
  { value: 'monochrome-white', label: 'Monochrome White/Cream', prompt: 'all-white or cream outfit, clean and fresh' },
  { value: 'monochrome-grey', label: 'Monochrome Grey', prompt: 'tonal grey outfit from charcoal to light grey' },
  { value: 'contrast-neutral', label: 'Contrast Neutrals', prompt: 'contrasting neutral tones (black/white, navy/cream)' },
  { value: 'navy-cream', label: 'Navy + Cream', prompt: 'navy and cream color combination, classic palette' },
  { value: 'charcoal-white', label: 'Charcoal + White', prompt: 'charcoal and white color pairing, understated' },
];
```

### 2. LifestyleShotConfig Interface

```typescript
export interface LifestyleShotConfig {
  // Model appearance
  gender: ModelGender;
  ethnicity: string;
  // Pose
  pose: LifestylePose;
  // Clothing
  trouserStyle: LifestyleTrouserStyle;
  topStyle: LifestyleTopStyle;
  outfitColor: LifestyleOutfitColor;
}

export const initialLifestyleConfig: LifestyleShotConfig = {
  gender: 'auto',
  ethnicity: 'auto',
  pose: 'auto',
  trouserStyle: 'auto',
  topStyle: 'auto',
  outfitColor: 'auto',
};
```

### 3. buildLifestylePrompt() Function

```typescript
export function buildLifestylePrompt(config: LifestyleShotConfig): string {
  const sections: string[] = [];
  
  // === STATIC: Always included ===
  sections.push("=== FULL BODY ON MODEL SHOT ===");
  sections.push("");
  
  // Frame & Composition (STATIC)
  sections.push("FRAMING & COMPOSITION (MANDATORY):");
  sections.push("- Single, high-resolution e-commerce image (one frame only, no collage)");
  sections.push("- Full-body product-on-model shot, framed from upper chest/shoulders to feet");
  sections.push("- Head intentionally cropped out of frame");
  sections.push("- Pulled-back distance showing full body proportions and negative space");
  sections.push("- Similar to classic Birkenstock lookbook imagery");
  sections.push("");
  
  // Background (STATIC)
  sections.push("BACKGROUND (MANDATORY):");
  sections.push("- Pure white seamless studio background");
  sections.push("- Visible floor and wall plane");
  sections.push("- Soft cast shadows grounding the model");
  sections.push("- Camera angle: eye-level, neutral, no compression or wide-angle distortion");
  sections.push("");
  
  // Product Integrity (STATIC - CRITICAL)
  sections.push("PRODUCT INTEGRITY (CRITICAL - LOCKED):");
  sections.push("- The footwear must match the reference EXACTLY in shape, materials, proportions");
  sections.push("- Preserve exact buckle placement, sole thickness, hardware finish");
  sections.push("- Natural cork-latex footbed, EVA outsole visible");
  sections.push("- No shearling, no lining, no extra padding, no reinterpretation");
  sections.push("- The shoe must remain IDENTICAL across all generated images");
  sections.push("");
  
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
  
  // Pose (DYNAMIC with auto fallback)
  sections.push("POSE DIRECTION:");
  if (config.pose === 'auto') {
    sections.push("- Natural, commercially realistic pose");
    sections.push("- AI may select: front-facing relaxed, three-quarter stance, side profile, walking pause, heel lift, or weight shift");
  } else {
    const poseOpt = lifestylePoseOptions.find(p => p.value === config.pose);
    if (poseOpt?.prompt) {
      sections.push(`- ${poseOpt.prompt}`);
    }
  }
  sections.push("- Arms may hang naturally or be slightly bent");
  sections.push("- Pose must feel casual, human, and unstyled—never exaggerated or editorial");
  sections.push("");
  
  // Clothing (DYNAMIC with auto fallback)
  sections.push("CLOTHING (VARIABLE - CONTROLLED):");
  sections.push("- Minimal, classic, timeless clothing");
  
  // Trouser style
  if (config.trouserStyle !== 'auto') {
    const trouserOpt = lifestyleTrouserStyleOptions.find(t => t.value === config.trouserStyle);
    if (trouserOpt?.prompt) {
      sections.push(`- ${trouserOpt.prompt}`);
    }
  } else {
    sections.push("- Trousers: tailored, slim, straight-leg, chinos, or minimal joggers");
  }
  
  // Top style
  if (config.topStyle !== 'auto') {
    const topOpt = lifestyleTopStyleOptions.find(t => t.value === config.topStyle);
    if (topOpt?.prompt) {
      sections.push(`- ${topOpt.prompt}`);
    }
  } else {
    sections.push("- Top: button-up shirt, knitwear, lightweight jacket, or simple tee");
  }
  
  // Outfit color
  if (config.outfitColor !== 'auto') {
    const colorOpt = lifestyleOutfitColorOptions.find(c => c.value === config.outfitColor);
    if (colorOpt?.prompt) {
      sections.push(`- ${colorOpt.prompt}`);
    }
  } else {
    sections.push("- Colors: black, white, off-white, cream, charcoal, grey, navy, or muted beige only");
  }
  
  sections.push("- Fabrics are matte and clean");
  sections.push("- NO logos, NO graphics, NO bold textures, NO trends");
  sections.push("");
  
  // Lighting & Technical (STATIC)
  sections.push("LIGHTING & TECHNICAL (MANDATORY):");
  sections.push("- Clean, diffused studio lighting");
  sections.push("- Soft shadows that ground the model");
  sections.push("- Materials clearly visible: suede texture, cork grain, buckle finish");
  sections.push("- Sharp focus, neutral and accurate color");
  sections.push("");
  
  // Quality Standards (STATIC)
  sections.push("QUALITY STANDARDS:");
  sections.push("- Timeless, calm, brand-safe composition");
  sections.push("- Suitable for lookbook and product listing use");
  sections.push("- True to premium footwear e-commerce standards");
  sections.push("");
  
  return sections.join("\n");
}
```

### 4. LifestyleConfigurator Component

A new component similar to `OnFootConfigurator.tsx` with:
- Gender dropdown
- Ethnicity dropdown
- Separator
- Pose dropdown (with helper text about natural poses)
- Trouser Style dropdown
- Top Style dropdown
- Outfit Color dropdown
- Static rules reminder panel

### 5. Integration Points

**ProductShootStep2.tsx:**
```tsx
{state.productShotType === 'lifestyle' && (
  <LifestyleConfigurator
    config={state.lifestyleConfig || initialLifestyleConfig}
    onConfigChange={(updates) => onStateChange({
      lifestyleConfig: { ...(state.lifestyleConfig || initialLifestyleConfig), ...updates }
    })}
  />
)}
```

**useImageGeneration.ts:**
```typescript
if (shotType === 'lifestyle') {
  const lifestyleConfig = state.productShoot.lifestyleConfig || initialLifestyleConfig;
  shotTypePrompt = buildLifestylePrompt(lifestyleConfig);
}
```

**ShotTypeVisualSelector.tsx:**
```typescript
{
  id: 'lifestyle',
  name: 'Full Body on Model',
  description: 'Full outfit with product',
  exampleImage: productOnModelImg,
  promptHint: '...', // simplified hint, full prompt built by buildLifestylePrompt()
  hasExtraConfig: true, // NEW - indicates this shot type has a configurator
},
```

## Reference Image

Copy one of your uploaded reference images to serve as the thumbnail for the "Full Body on Model" shot type selector. The existing `product-on-model.jpg` may be updated with a better reference from your uploads.

## Section Order in LifestyleConfigurator

1. **Gender** (model selection)
2. **Ethnicity** (diversity)
3. *Visual separator*
4. **Pose** (how they stand/move)
5. **Trouser Style** (bottom wear)
6. **Top Style** (upper wear)
7. **Outfit Color** (overall palette)
8. **Static Rules Reminder** (always enforced elements)

## Expected Behavior

When a user selects "Full Body on Model":
1. The configurator panel appears below the shot type selector
2. All fields default to "Auto (AI chooses)"
3. The user can customize any/all fields
4. When generating, `buildLifestylePrompt()` constructs the full structured prompt
5. Static elements (product integrity, background, framing) are always enforced
6. Dynamic elements are injected based on user selections or AI-chosen when "auto"

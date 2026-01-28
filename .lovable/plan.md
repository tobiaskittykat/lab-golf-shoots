
# Product Shot Workflow - Complete Implementation Plan

## Overview

This plan unlocks a new **Product Shot** workflow in the Creative Studio, building on the existing Lifestyle workflow but tailored specifically for product photography with shoes (testing with Birkenstock). The workflow includes shoot type selection, product recoloring, background/setting selection, and model configuration.

---

## Key Features

### 1. Shoot Type Selector (Step 1A - New)
**"New Shoot" vs "Remix Existing"**

When user selects "Product Shot", show a sub-selector:
- **New Shoot** → Standard flow (choose product, background, model)
- **Remix Existing** → Load from gallery or upload reference image, then modify aspects

### 2. Product Selection with Recolor Option (Step 2A)
- User selects a product from their library (e.g., brown Boston clogs)
- **NEW: Recolor button** opens a modal with:
  - **Pre-generation recolor**: AI edits the product reference image to a new color (saves as new variant)
  - **Generation-time recolor**: Instruction added to prompt ("make the shoes cobalt blue")
  - Color picker with preset swatches + custom color input

### 3. Setting & Background Selection (Step 2B)
- **Environment type toggle**: Studio | Outdoor
- **Studio backgrounds** (8-12 options):
  - White cyclorama, Black void, Gradient (pink/orange), Concrete floor, Marble pedestal, Textured fabric, Warm wood, etc.
- **Outdoor backgrounds** (8-12 options):
  - Beach sand, Park grass, Urban sidewalk, Café terrace, Desert dunes, Forest path, Rooftop, Poolside, etc.
- **Auto option**: Let AI decide based on brand and product

### 4. Model Configuration (Step 2C)
- **Gender**: Female | Male | Non-binary | Auto
- **Diversity/Ethnicity**: Multiple options with "Auto/Brand default" that pulls from Brand Brain
- **Clothing style**: Casual, Smart casual, Formal, Athletic, Bohemian, Auto
- **"On-brand defaults" toggle**: Uses Brand Brain's `modelStyling` guidelines

### 5. Shot Type Selection
Specific shot types for product photography:
- **Flat lay** - Product on surface, overhead angle
- **On foot** - Model wearing the shoes
- **In hand** - Model holding the shoes  
- **Lifestyle** - Full body with shoes as hero product
- **Product focus** - Close-up, no model
- **Paired with outfit** - Full look styling

### 6. Post-Generation: Product Integrity Check (NEW)
After generation, AI analyzes each image:
- **Integrity score** (0-100) checking: correct product shape, color accuracy, no distortions
- **Flag problematic images** with a warning badge
- **"Regenerate with focus on product fidelity"** button for flagged images

---

## Technical Architecture

### State Management Updates

```typescript
// types.ts additions
export interface ProductShootState {
  shootMode: 'new' | 'remix';
  
  // Remix mode
  remixSourceImage?: string;
  remixChanges: {
    changeModel?: boolean;
    changeBackground?: boolean;
    changeColor?: boolean;
    changeAngle?: boolean;
  };
  
  // Product with recolor
  selectedProductId?: string;
  productRecolorOption: 'none' | 'pre-generation' | 'during-generation';
  productTargetColor?: string;
  recoloredProductUrl?: string;
  
  // Background
  settingType: 'studio' | 'outdoor' | 'auto';
  backgroundId?: string;
  customBackgroundPrompt?: string;
  
  // Model
  modelGender: 'female' | 'male' | 'nonbinary' | 'auto';
  modelEthnicity: string;
  modelClothing: 'casual' | 'smart-casual' | 'formal' | 'athletic' | 'bohemian' | 'auto';
  useOnBrandDefaults: boolean;
  
  // Shot type (product-specific)
  productShotType: 'flat-lay' | 'on-foot' | 'in-hand' | 'lifestyle' | 'product-focus' | 'paired-outfit';
}

// Add to CreativeStudioState
export interface CreativeStudioState {
  // ... existing fields ...
  productShoot: ProductShootState;
}
```

### Background Presets Data Structure

```typescript
// types.ts additions
export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'studio' | 'outdoor';
  thumbnail: string;  // Placeholder or pre-generated
  prompt: string;     // Prompt snippet for generation
}

export const studioBackgrounds: BackgroundPreset[] = [
  { id: 'studio-white', name: 'White Cyclorama', category: 'studio', thumbnail: '/backgrounds/studio-white.jpg', prompt: 'clean white studio cyclorama background, professional product photography lighting' },
  { id: 'studio-black', name: 'Black Void', category: 'studio', thumbnail: '/backgrounds/studio-black.jpg', prompt: 'deep black studio background, dramatic rim lighting' },
  // ... 8-12 total
];

export const outdoorBackgrounds: BackgroundPreset[] = [
  { id: 'outdoor-beach', name: 'Sandy Beach', category: 'outdoor', thumbnail: '/backgrounds/outdoor-beach.jpg', prompt: 'soft sandy beach background, golden hour sunlight, natural setting' },
  { id: 'outdoor-urban', name: 'Urban Street', category: 'outdoor', thumbnail: '/backgrounds/outdoor-urban.jpg', prompt: 'urban city street background, modern architectural elements' },
  // ... 8-12 total
];
```

---

## New Components

### 1. `ProductShootSubtypeSelector.tsx`
Shows when "Product Shot" is selected:
- Two cards: "New Shoot" and "Remix Existing"
- Animations and visual differentiation

### 2. `ProductRecolorModal.tsx`
Modal for recoloring products:
- Shows current product image
- Color swatches (brand colors + common colors)
- Custom color picker
- Toggle: "Recolor now" (AI edits image) vs "Apply during generation"
- Preview of AI-recolored product before saving

### 3. `BackgroundSelector.tsx`
Grid picker for backgrounds:
- Tab bar: Studio | Outdoor
- Thumbnail grid with selection state
- "Auto" option at the top
- "Custom" option with text input for unique descriptions

### 4. `ModelConfigurator.tsx`
Panel for model settings:
- Gender dropdown
- Ethnicity multi-select or single-select
- Clothing style dropdown
- "Use brand defaults" toggle that auto-fills from Brand Brain

### 5. `ProductIntegrityBadge.tsx`
Badge component for generated images:
- Shows integrity score (green check, yellow warning, red alert)
- Tooltip with specific issues found
- "Regenerate" button

### 6. `ProductShootStep2.tsx`
New Step 2 component specifically for Product Shot workflow:
- Uses all the above components
- Different layout than Lifestyle Step 2
- More focused on product + setting + model

---

## Edge Function Updates

### 1. `generate-image/index.ts` Updates

Add new request fields:
```typescript
interface GenerateImageRequest {
  // ... existing fields ...
  
  // Product Shot specific
  productShootConfig?: {
    settingType: 'studio' | 'outdoor' | 'auto';
    backgroundPrompt?: string;
    modelConfig?: {
      gender: string;
      ethnicity: string;
      clothing: string;
    };
    productShotType: string;
    productRecolorInstruction?: string;  // "make the shoes cobalt blue"
  };
}
```

Update prompt crafting to incorporate product shoot specifics.

### 2. NEW: `recolor-product/index.ts`

New edge function to recolor product images:
```typescript
// POST /functions/v1/recolor-product
// Body: { imageUrl: string, targetColor: string }
// Returns: { success: true, recoloredImageUrl: string }

// Uses Gemini image editing to change product color
// Stores result in product-images bucket
// Returns public URL
```

### 3. NEW: `analyze-product-integrity/index.ts`

New edge function to check product integrity in generated images:
```typescript
// POST /functions/v1/analyze-product-integrity
// Body: { generatedImageUrl: string, productReferenceUrl: string }
// Returns: { 
//   score: number, 
//   issues: string[], 
//   passesCheck: boolean 
// }

// Uses Gemini vision to compare generated image to product reference
// Checks for: shape accuracy, color match, proportions, distortions
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/creative-studio/product-shoot/ProductShootSubtypeSelector.tsx` | New vs Remix selector |
| `src/components/creative-studio/product-shoot/ProductRecolorModal.tsx` | Product recolor interface |
| `src/components/creative-studio/product-shoot/BackgroundSelector.tsx` | Studio/outdoor background picker |
| `src/components/creative-studio/product-shoot/ModelConfigurator.tsx` | Model settings panel |
| `src/components/creative-studio/product-shoot/ProductIntegrityBadge.tsx` | Integrity score badge |
| `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` | Main Step 2 for product workflow |
| `src/components/creative-studio/product-shoot/types.ts` | Types for product shoot |
| `src/components/creative-studio/product-shoot/presets.ts` | Background presets data |
| `supabase/functions/recolor-product/index.ts` | Product recolor edge function |
| `supabase/functions/analyze-product-integrity/index.ts` | Integrity check edge function |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/creative-studio/types.ts` | Add `ProductShootState` and related types |
| `src/components/creative-studio/CreativeStudioWizard.tsx` | Route to product-specific flow when `useCase === 'product'` |
| `src/components/creative-studio/CreativeStudioHeader.tsx` | Enable "Product Shot" chip (remove `comingSoon: true`) |
| `src/components/creative-studio/StepOnePrompt.tsx` | Add product-specific example briefs |
| `src/hooks/useImageGeneration.ts` | Pass `productShootConfig` to edge function |
| `supabase/functions/generate-image/index.ts` | Handle product shoot prompting |
| `supabase/config.toml` | Add new edge functions |

---

## User Flow

```text
1. User selects "Product Shot" chip
   └─> Shows ProductShootSubtypeSelector

2A. "New Shoot" selected:
    ├─> Enter brief (or select example)
    ├─> Create Concepts (same as lifestyle)
    └─> ProductShootStep2:
        ├─> Select product (with Recolor option)
        ├─> Choose Setting (Studio/Outdoor) + Background
        ├─> Configure Model (or skip for product-only shots)
        ├─> Select Shot Type
        └─> Generate

2B. "Remix Existing" selected:
    ├─> Choose from gallery OR upload reference
    ├─> Select what to change: Model? Background? Color? Angle?
    └─> ProductShootStep2 (pre-filled with remix settings)

3. Post-Generation:
   ├─> Images displayed with integrity badges
   ├─> Flagged images have warning + "Regenerate" button
   └─> User can refine and regenerate
```

---

## Implementation Order

1. **Phase 1: Core Infrastructure**
   - Add types and state management
   - Enable Product Shot chip
   - Create skeleton components

2. **Phase 2: New Shoot Flow**
   - BackgroundSelector with presets
   - ModelConfigurator
   - ProductShootStep2 layout
   - Edge function updates for prompting

3. **Phase 3: Product Recolor**
   - ProductRecolorModal UI
   - recolor-product edge function
   - Integration with product selection

4. **Phase 4: Remix Flow**
   - ProductShootSubtypeSelector
   - Gallery selection for remix
   - Upload reference flow
   - Remix-specific prompting

5. **Phase 5: Integrity Check**
   - analyze-product-integrity edge function
   - ProductIntegrityBadge component
   - Post-generation analysis integration

---

## Additional Ideas for Future

1. **Shoe-specific shot types**: Sole view, side profile, 3/4 angle, toe-box detail
2. **Material swapping**: Change leather to suede, add sheen, etc.
3. **Accessory pairing**: Suggest socks, laces, styling accessories
4. **Size visualization**: Show product at different scales
5. **360° views**: Generate multiple angles for a product carousel
6. **Background generation**: AI-generate custom backgrounds on-demand instead of presets

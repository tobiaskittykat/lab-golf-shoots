

# Product Focus Shot Type Configuration

## Overview

Developing a complete prompt builder for the "Product Focus" shot type - product-only photography without models, matching your Birkenstock Boston Shearling product gallery angles.

## Product Gallery Reference

Your current Birkenstock Boston product has these 5 angles:
- **Top** - Bird's eye view showing footbed
- **Detail** - Close-up on buckle/hardware/shearling
- **Sole** - Underside showing tread pattern
- **Side** - Profile view showing silhouette
- **3/4** - Three-quarter angle showing depth

## Configuration Options

### 1. Camera Angle (5 variations)

| Angle | Description | Prompt Direction |
|-------|-------------|------------------|
| Auto | AI chooses best angle | Natural variation |
| Side Profile | Classic lateral view | "pure side profile view, product centered, showing full silhouette" |
| Three-Quarter | Angled hero shot | "three-quarter view at 45-degree angle, showing depth and dimension" |
| Top Down | Bird's eye view | "overhead top-down view, footbed and upper visible" |
| Detail Close-up | Macro on hardware | "extreme close-up on buckle, hardware, and material textures" |
| Sole View | Underside | "sole facing camera, showing tread pattern and construction" |

### 2. Lighting Type

| Lighting | Description | Prompt Direction |
|----------|-------------|------------------|
| Auto | AI chooses based on background | Adapts to studio/outdoor |
| Studio | Controlled softbox lighting | "professional studio lighting, softbox diffusion, controlled shadows" |
| Natural | Daylight / window light | "soft natural daylight, gentle ambient shadows, organic feel" |

### 3. Background Integration

- Uses existing BackgroundSelector (studio/outdoor presets)
- **Default**: White studio cyclorama
- When "Studio" lighting selected, prioritizes studio backgrounds
- When "Natural" lighting selected, enables outdoor settings

## Technical Implementation

### New Files to Create

1. **ProductFocusConfigurator.tsx** - UI component for configuration options

### Files to Modify

1. **shotTypeConfigs.ts**
   - Add `ProductFocusShotConfig` interface
   - Add `ProductFocusAngle` and `ProductFocusLighting` types
   - Add option arrays for dropdowns
   - Add `buildProductFocusPrompt()` function
   - Add `initialProductFocusConfig`
   - Update `shotTypeHasConfig()` to include 'product-focus'

2. **types.ts**
   - Add `productFocusConfig` to `ProductShootState`
   - Re-export new types
   - Update `initialProductShootState`

3. **ProductShootStep2.tsx**
   - Import and render `ProductFocusConfigurator` when shot type is 'product-focus'

4. **ShotTypeVisualSelector.tsx**
   - Update `hasExtraConfig: true` for product-focus

5. **useImageGeneration.ts**
   - Add case for 'product-focus' to call `buildProductFocusPrompt()`

## Prompt Architecture

The prompt follows the same static/dynamic pattern as On Foot and Lifestyle:

```text
=== PRODUCT FOCUS SHOT ===

FRAMING & COMPOSITION (MANDATORY):
- Single, high-resolution e-commerce product image (one frame only, no collage)
- Product only - NO hands, NO models, NO body parts
- Product centered in frame with balanced negative space
- [DYNAMIC: Camera angle direction]

PRODUCT INTEGRITY (CRITICAL):
- This is Birkenstock footwear - match the reference EXACTLY
- Preserve exact Birkenstock silhouette, buckle placement, sole thickness, hardware finish
- Maintain signature Birkenstock details: cork-latex footbed, contoured sole, adjustable strap
- Capture visible texture: suede nap, leather grain, cork texture, sole grooves
- NO reinterpretation, NO modifications, NO creative liberties

CAMERA ANGLE:
[DYNAMIC: Based on selected angle option]

LIGHTING:
[DYNAMIC: Studio or Natural based on selection]
- Accurately reveal material textures and finishes
- Soft shadows that ground the product
- Neutral color balance

QUALITY STANDARDS:
- Premium footwear e-commerce photography
- Ultra-sharp focus on product details
- Clean, professional composition
```

## UI Preview

The configurator will appear when "Product Focus" is selected:

```
┌─────────────────────────────────────────┐
│  Product Focus Options                   │
├─────────────────────────────────────────┤
│  Camera Angle                           │
│  ┌─────────────────────────────────┐    │
│  │ Auto (AI chooses)           ▼   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Lighting                               │
│  ┌─────────────────────────────────┐    │
│  │ Auto (match background)     ▼   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Always Enforced                     ││
│  │ • Product only, no model            ││
│  │ • Birkenstock integrity preserved   ││
│  │ • Ultra-sharp focus on product      ││
│  │ • Professional e-commerce quality   ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## Background + Lighting Logic

- If background is "Auto" and lighting is "Auto": AI decides everything
- If background is "Studio" preset and lighting is "Auto": Uses studio lighting
- If background is "Outdoor" preset and lighting is "Auto": Uses natural lighting
- User can override lighting regardless of background selection


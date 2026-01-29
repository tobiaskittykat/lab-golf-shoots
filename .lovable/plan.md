

# Enhanced Prompting with AI-Selected Random Options & Gemini 3.0

## Overview

Transform the current short, generic prompts into rich, evocative e-commerce prompts that match your creative designer's examples. When users leave options on "Auto", the system will **randomly select a specific option** and include that in the prompt with full descriptive language—rather than telling the AI to "pick from this list."

---

## Core Problem

**Current behavior** (when `auto` is selected):
```
POSE DIRECTION:
- Natural, grounded stance with subtle variation
- AI may select: feet parallel, one foot forward, heel relaxed...
```

**Desired behavior** (matching your designer's prompts):
```
STYLING & POSE — COMMERCIAL
The model stands in a natural, relaxed stance:
– Feet flat or one foot slightly forward
– Casual, grounded posture
– No exaggerated movement or editorial posing

Pants are ankle-length or cropped to clearly show the shoe and lining.
No logos, no graphics, no visual distractions.
```

The fix: When `auto` is selected, **pre-select a random concrete option** and inject that specific choice into the prompt with evocative language—so the output is always specific, not vague.

---

## Changes Summary

| Area | Change |
|------|--------|
| **Random Option Selection** | New `selectRandomOption()` utility to pick random value when `auto` |
| **On-Foot Prompt Builder** | Rewrite to match your designer's format exactly |
| **Lifestyle Prompt Builder** | Rewrite to match your designer's format exactly |
| **Model Selection** | Already using `google/gemini-3-pro-image-preview` (Gemini 3.0) |

---

## Implementation Details

### 1. Random Option Selector Utility

Add to `shotTypeConfigs.ts`:

```typescript
function selectRandomFromOptions<T extends { value: string; prompt?: string | null }>(
  options: T[], 
  currentValue: string
): T {
  if (currentValue !== 'auto') {
    return options.find(o => o.value === currentValue) || options[0];
  }
  // Filter out 'auto' and pick random
  const concreteOptions = options.filter(o => o.value !== 'auto' && o.prompt);
  return concreteOptions[Math.floor(Math.random() * concreteOptions.length)];
}
```

### 2. Rewrite `buildOnFootPrompt()` to Match Your Designer's Format

**New structure** (based on your example):

```text
A single, high-resolution e-commerce image (one frame only, no collage).

A close-up on-model product shot of a [GENDER] model wearing Birkenstock footwear, 
photographed against [BACKGROUND - based on selection].

Framing is tight and product-focused, showing the feet, shoes, ankles, and lower legs, 
cropped roughly from mid-calf down. The shoes fill most of the frame, consistent with 
official Birkenstock e-commerce photography.

Camera angle is eye-level to slightly low, neutral and undistorted. 
No top-down angle, no wide-angle distortion.

FOOTWEAR — LOCKED (MUST NOT CHANGE)
[Static locked product section - always identical]

MATERIAL BEHAVIOR — LOCKED
[Static locked material section - always identical]

STYLING & POSE — COMMERCIAL
The model stands in [RANDOMLY SELECTED POSE]:
– [Specific pose description]
– Casual, grounded posture
– No exaggerated movement or editorial posing

[RANDOMLY SELECTED LEG STYLING] in [RANDOMLY SELECTED TROUSER COLOR].
No logos, no graphics, no visual distractions.

Lighting is [LIGHTING based on background selection].
Shadows are soft and realistic, grounding the shoe to the floor.
Focus is sharp, color is neutral and accurate.

The final image must be indistinguishable from an official Birkenstock e-commerce product photograph.
```

### 3. Rewrite `buildLifestylePrompt()` to Match Your Designer's Format

**New structure** (based on your example):

```text
A single, high-resolution e-commerce image (one frame only, no collage).

A full-body product-on-model shot, framed from upper chest or shoulders down to the feet, 
with the head cropped out of frame.

The [GENDER] model is photographed at a pulled-back distance, allowing full body proportions 
and clear negative space around the figure, on [BACKGROUND based on selection].

Camera angle is eye-level and neutral, with no wide-angle distortion, matching classic 
Birkenstock lookbook and e-commerce photography.

FOOTWEAR — LOCKED (MUST NOT CHANGE)
[Static locked product section - always identical]

MATERIAL BEHAVIOR — LOCKED
[Static locked material section - always identical]

CLOTHING — VARIABLE (CONTROLLED)
The model wears [RANDOMLY SELECTED OUTFIT STYLE]:
- [RANDOMLY SELECTED TROUSER STYLE]
- [RANDOMLY SELECTED TOP STYLE] 
- Colors: [RANDOMLY SELECTED COLOR SCHEME]

Fabrics are matte and clean.
No logos, no graphics, no bold textures, no trends.

POSE — VARIABLE (LOOKBOOK-REALISTIC)
[RANDOMLY SELECTED POSE]:
- [Specific pose description]
- Pose must feel casual, human, and unstyled—never editorial or exaggerated

Lighting is [LIGHTING based on background selection].
Focus is sharp, color is neutral and accurate, materials are clearly visible.

The final image must look indistinguishable from an official Birkenstock e-commerce 
or lookbook photograph.
```

---

## What Stays the Same

1. **Model for image generation**: Already `google/gemini-3-pro-image-preview` (Gemini 3.0)
2. **Model for prompt crafting**: `google/gemini-2.5-flash` (appropriate for text)
3. **Background selection logic**: Works correctly
4. **Lighting based on background**: Works correctly

---

## File Changes

### `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`

1. **Add** `selectRandomFromOptions()` utility function
2. **Rewrite** `buildOnFootPrompt()` to:
   - Pre-select random concrete options when `auto` is set
   - Output evocative, narrative-style prompts matching your designer's format
   - Include full "LOCKED" sections for product and material integrity
3. **Rewrite** `buildLifestylePrompt()` to:
   - Pre-select random concrete options when `auto` is set
   - Output evocative, narrative-style prompts matching your designer's format
   - Include full "LOCKED" sections for product and material integrity

---

## Example Output Comparison

### Current (Short):
```
=== ON-FOOT SHOE FOCUS SHOT ===

FRAMING & COMPOSITION (MANDATORY):
- Single, high-resolution e-commerce image
- Leg-down product shot framed from mid-calf to floor
...

POSE DIRECTION:
- Natural, grounded stance with subtle variation
- AI may select: feet parallel, one foot forward...

LEG STYLING:
- Cropped trousers or pants ending just above ankle
- Neutral, matte fabric that complements the product
```
*~532 characters*

### New (Rich, matching your designer):
```
A single, high-resolution e-commerce image (one frame only, no collage).

A close-up on-model product shot of a female model wearing Birkenstock footwear, 
photographed against a pure white seamless studio background with a visible floor 
plane and soft, natural contact shadows.

Framing is tight and product-focused, showing the feet, shoes, ankles, and lower 
legs, cropped roughly from mid-calf down. The shoes fill most of the frame, 
consistent with official Birkenstock e-commerce photography.

Camera angle is eye-level to slightly low, neutral and undistorted. 
No top-down angle, no wide-angle distortion.

FOOTWEAR — LOCKED (MUST NOT CHANGE)
The model is wearing a Birkenstock Boston clog with the following fixed construction:
– Closed-toe Boston silhouette with rounded toe box
– Soft suede upper with visible nap and matte texture
– Single adjustable instep strap with metal buckle
– Natural cork-latex contoured footbed
– EVA outsole with accurate thickness and tread

The shoe's geometry, construction, proportions, and hardware placement must remain 
identical in every generation. Do not redesign, stylize, or reinterpret the product.

MATERIAL BEHAVIOR — LOCKED
– Suede remains matte, soft, and fibrous (no gloss, no synthetic smoothness)
– Buckle remains metal, brushed or satin finish
– Cork remains natural warm brown tone
– EVA outsole remains matte with subtle rubber texture

STYLING & POSE — COMMERCIAL
The model stands in a natural, relaxed stance with one foot subtly placed forward:
– Casual, grounded posture
– No exaggerated movement or editorial posing

Wide-leg trousers cropped just above the ankle in charcoal grey, showing bare ankle.
Matte fabric, no logos, no graphics.

Lighting is clean, diffused studio lighting that accurately represents suede texture.
Shadows are soft and realistic, grounding the shoe to the floor.
Focus is sharp, color is neutral and accurate.

The final image must be indistinguishable from an official Birkenstock e-commerce 
product photograph.
```
*~1,800 characters*

---

## Gemini 3.0 Confirmation

The system already uses:
- **Image generation**: `google/gemini-3-pro-image-preview` (Gemini 3.0)
- **Prompt crafting**: `google/gemini-2.5-flash` (fast text model)

No model changes needed.


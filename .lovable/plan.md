

# Refine Detail Close-up Angle Prompt

## Problem
The current detail-closeup prompt (lines 454-455) contains product-specific references ("buckle hardware", "strap texture") that violate the model-agnostic principle. These material/component details are already injected dynamically by the prompt builder. The prompt also lacks the precise spatial and compositional instructions that the Gemini analysis provides.

## Changes

**File**: `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` (lines 454-455)

### Prompt (line 454)

**Current**:
> "extreme close-up cropped tight on buckle hardware, strap texture, and material details, macro-style product detail shot"

**New**:
> "close-up macro shot of single shoe midsection, tight crop excluding heel and toe tip, shoe oriented diagonally with front toward bottom-right, neutral eye-level perspective, shallow depth of field highlighting surface texture and construction details"

### Narrative (line 455)

**Current**:
> "cropped tight in a macro-style detail shot, filling the frame with buckle hardware, strap texture, and material grain. The camera is close enough to reveal stitching paths, metal finishes, and the subtle surface variation of the materials. This is about tactile intimacy -- making the viewer feel the product's craftsmanship."

**New**:
> "a close-up macro shot of a single shoe, focusing on the midsection. The shoe is oriented on a slight diagonal, with the front angled toward the bottom-right and the rear extending toward the top-left. The framing is a tight crop that intentionally excludes the heel and the very tip of the toe, emphasizing the junction where the upper meets the sole. A shallow depth of field is used -- the nearest surface details (material grain, construction, any hardware) are in sharp focus, while elements further back soften naturally. The camera is at a neutral eye-level perspective, close enough to reveal the tactile texture and structural details of the exterior."

## Key Improvements
- **Model-agnostic**: Removed "buckle hardware", "strap texture" -- product components are injected dynamically
- **Precise framing**: "tight crop excluding heel and toe tip" -- defines what's in and out of frame
- **Diagonal orientation**: "front toward bottom-right" -- consistent with the Gemini reference analysis
- **Shallow DoF specified**: Creates the macro feel with focus falloff, matching the reference
- **Focus area defined**: "junction where upper meets sole" + "material grain, construction" -- generic enough for any shoe

## Also: Skip footbed branding for detail-closeup

Since this angle crops to the midsection and the footbed interior is not the focus, we should also skip footbed branding injection for `detail-closeup` in the edge function, same as we did for `side-profile`.

**File**: `supabase/functions/generate-image/index.ts` (~line 665)

Update the condition from:
```
(visualShotType === 'product-focus' && productFocusAngle === 'side-profile')
```
To:
```
(visualShotType === 'product-focus' && (productFocusAngle === 'side-profile' || productFocusAngle === 'detail-closeup'))
```

## Scope
- `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` -- lines 454-455 updated
- `supabase/functions/generate-image/index.ts` -- one condition expanded


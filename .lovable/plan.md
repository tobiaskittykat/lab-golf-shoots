

# Add "Scene Placement" Mode to Custom Backgrounds

## Overview
Add a new background mode called **Scene** alongside the existing Studio, Outdoor, and Custom tabs. When a user selects "Scene", they upload a reference scene image and their product is placed directly **into that specific scene** -- the scene image is attached to the image generation model as a visual reference (not just described via prompt).

## How It Differs from Current "Custom"
- **Custom** (existing): User uploads reference images, AI analyzes them, generates a text prompt describing the background. The prompt is sent to the generator -- the actual reference images are NOT attached.
- **Scene** (new): User uploads a scene image. Both the prompt AND the actual scene image are attached to the image generator, so the AI composites the product directly into that visual environment.

## Changes

### 1. Types -- Add `scene` to SettingType and state
**File: `src/components/creative-studio/product-shoot/types.ts`**
- Add `'scene'` to `SettingType` union: `'studio' | 'outdoor' | 'custom' | 'scene'`
- Add `sceneImageUrl?: string` to `ProductShootState` -- the uploaded scene image URL to attach to the generator

### 2. ProductShootConfig -- Pass scene image URL to edge function
**File: `src/hooks/useImageGeneration.ts`**
- Pass `sceneImageUrl` from `state.productShoot.sceneImageUrl` into `productShootConfig`

### 3. Edge function interface -- Accept scene image
**File: `supabase/functions/generate-image/index.ts`**
- Add `sceneImageUrl?: string` to `productShootConfig` interface
- In the background section builder: when `sceneImageUrl` is present, add a `=== SCENE PLACEMENT ===` prompt section instructing the AI to place the product naturally into the provided scene
- In the image attachment section (around line 1527): when `sceneImageUrl` is set, attach it as a visual input with a directive like: *"SCENE REFERENCE: Place the product naturally into this exact scene. Match the lighting, perspective, and scale of the environment. Do NOT alter the scene itself -- only add the product."*

### 4. Background Selector UI -- Add "Scene" tab
**File: `src/components/creative-studio/product-shoot/BackgroundSelector.tsx`**
- Add a 4th tab: `Scene`
- Tab content: upload zone for a single scene image (reuse the upload pattern from CreateCustomBackgroundModal)
- Show thumbnail preview of the uploaded scene with a remove button
- Optionally allow a text prompt override for additional direction (e.g., "place shoes on the table in the foreground")
- When a scene image is selected, call `onBackgroundSelect('scene-uploaded')` and propagate the uploaded URL via a new `onSceneImageChange` callback

### 5. BackgroundSelector props
- Add `sceneImageUrl?: string` and `onSceneImageChange?: (url: string | undefined) => void` props
- Wire these through from `ProductShootStep2`

### 6. ProductShootStep2 -- Wire scene state
**File: `src/components/creative-studio/product-shoot/ProductShootStep2.tsx`**
- Pass `sceneImageUrl` and `onSceneImageChange` to `BackgroundSelector`
- Update state when scene image changes

## Technical Details

### Scene image attachment in generate-image (key logic)
```typescript
// After moodboard attachment, before product refs
if (body.productShootConfig?.sceneImageUrl) {
  const sceneUrl = body.productShootConfig.sceneImageUrl;
  if (sceneUrl.startsWith('http')) {
    messageContent.push({
      type: "image_url",
      image_url: { url: sceneUrl }
    });
    messageContent.push({
      type: "text",
      text: "SCENE PLACEMENT REFERENCE: Place the product naturally into this exact scene/environment. Match the lighting direction, color temperature, perspective, and scale of objects in this scene. Do NOT alter the scene itself. The product should look like it was physically photographed in this location."
    });
    console.log("[BG] Attached scene placement image");
  }
}
```

### Background prompt for scene mode
```typescript
if (config.sceneImageUrl) {
  sections.push("=== BACKGROUND/SETTING ===");
  sections.push("Use the attached scene reference image as the EXACT background environment. Place the product naturally within this scene, matching perspective, lighting, and scale.");
  if (config.customBackgroundPrompt) {
    sections.push(`Additional direction: ${config.customBackgroundPrompt}`);
  }
  sections.push("");
}
```

### Upload flow in BackgroundSelector
- Upload to `brand-assets` bucket under `{userId}/scene/` path
- Single image only (not 3 like custom backgrounds)
- No AI analysis needed -- the image speaks for itself

## Files Modified
1. `src/components/creative-studio/product-shoot/types.ts` -- Add `scene` to SettingType, add `sceneImageUrl` to state
2. `src/components/creative-studio/product-shoot/BackgroundSelector.tsx` -- Add Scene tab with upload UI
3. `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` -- Wire scene props
4. `src/hooks/useImageGeneration.ts` -- Pass sceneImageUrl to edge function
5. `supabase/functions/generate-image/index.ts` -- Accept and use scene image in prompt + attachment


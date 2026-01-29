

# Fix Resolution Parameter - Actually Send to Gemini API

## Summary

The resolution selector in the UI stores the value but the edge function never passes it to the Gemini API. We need to add the `image_config` parameter to the API call.

---

## Root Cause

In `supabase/functions/generate-image/index.ts` (lines 873-890), the API call only includes:
```typescript
body: JSON.stringify({
  model: selectedModel,
  messages: [...],
  modalities: ["image", "text"],
  // MISSING: image_config with image_size and aspect_ratio
}),
```

The `body.resolution` and `body.aspectRatio` values are received from the frontend but discarded.

---

## The Fix

### File: `supabase/functions/generate-image/index.ts`

#### Step 1: Map resolution values to API format (add before line 873)

```typescript
// Map resolution to Gemini image_size format
const imageSizeMap: Record<string, string> = {
  '512': '1K',    // 512px → 1K (closest match)
  '1024': '1K',   // 1024px → 1K
  '2048': '2K',   // 2048px → 2K
  '4096': '4K',   // 4096px → 4K (true 4K!)
};

const imageSize = imageSizeMap[body.resolution || '1024'] || '1K';
const aspectRatio = body.aspectRatio || '1:1';

console.log(`Image config: size=${imageSize}, aspectRatio=${aspectRatio}`);
```

#### Step 2: Add `image_config` to the API call (modify lines 880-889)

```typescript
body: JSON.stringify({
  model: selectedModel,
  messages: [
    { 
      role: "user", 
      content: messageContent
    }
  ],
  modalities: ["image", "text"],
  image_config: {
    image_size: imageSize,
    aspect_ratio: aspectRatio,
  },
}),
```

---

## Expected Outcome

After this fix:
- Selecting **4096px (4K)** will send `image_size: "4K"` to Gemini
- Selecting **2048px (2K)** will send `image_size: "2K"` to Gemini
- Aspect ratio will also be enforced via `aspect_ratio` parameter
- Logs will show `Image config: size=4K, aspectRatio=1:1` for verification

---

## Technical Notes

- The Lovable AI Gateway (OpenRouter-compatible) supports `image_config` for Gemini models
- Supported sizes: `"1K"` (default), `"2K"`, `"4K"`
- 4K generation may take longer and consume more credits
- Aspect ratio mapping uses native Gemini formats (1:1, 16:9, 9:16, etc.)




## Problem

The Image Detail Modal only displays `image.refinedPrompt` (the AI's text response, often empty for image generation). The actual structured prompt stored in the `prompt` DB column is **never shown** in the metadata panel. That's why you can't see it.

## Fix

**One file change: `src/components/creative-studio/ImageDetailModal.tsx`**

Replace the prompt display section (lines 488-519) to:
1. Always show the `prompt` field (the actual generation prompt) under a "Generation Prompt" heading
2. Show `refinedPrompt` separately below it if it exists, under "AI Response"
3. Both sections get copy buttons

This is a ~30 line UI change in one file. No backend changes needed — the prompt is already stored correctly in the database.


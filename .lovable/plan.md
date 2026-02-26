
# Fix Image Generation Timeout

## Problem
Gemini Pro image generation takes 60-100 seconds per image. When generating 4 images sequentially, total time is 240-400 seconds. The current polling timeout is 150 seconds (2.5 minutes), causing most batches to time out with "Generation timed out after 150s".

## Solution
Increase the polling timeout from 150 seconds to 480 seconds (8 minutes). This comfortably covers 4 sequential images at even the slowest generation times (~100s each).

## Changes

**File: `src/lib/imagePolling.ts`** (line 29)
- Change default `maxWaitMs` from `150000` to `480000`
- Update comment from "2.5 minutes" to "8 minutes"

**File: `src/hooks/useImageGeneration.ts`** (lines 608 and 783)
- Change both explicit `maxWaitMs: 150000` calls to `maxWaitMs: 480000`

## Technical Details
- Based on edge function logs: Image 1 took ~109s, Image 2 took ~67s after that
- 4 images worst case: 4 x 100s = 400s, so 480s gives ~80s buffer
- No other code paths or behavior changes needed -- just the timeout value
- The polling interval (4s) stays the same so completed images still appear progressively

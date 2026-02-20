

# Fix Memory Limit Failures in Image Generation

## Problem
The `generate-image` edge function crashes with "Memory limit exceeded" when generating 4 images in parallel. Each image holds large base64 data (~5-10MB for 4K) plus multiple product reference images in memory simultaneously. When the function crashes, the error handler never runs, leaving rows stuck in `pending` status until client-side polling times out (150s).

## Root Cause
Line 1370: `await Promise.all(pendingIds.map((id, i) => generateOne(id, i)))` -- all 4 images are generated concurrently, meaning 4 large base64 image responses are held in memory at the same time.

## Solution: Sequential Generation + Stuck Row Cleanup

### 1. Sequential generation in edge function

Replace `Promise.all` (line 1370) with a simple sequential loop:

```text
// Before (crashes with 4 parallel images):
await Promise.all(pendingIds.map((id, i) => generateOne(id, i)));

// After (one at a time, each base64 is GC'd before the next):
for (let i = 0; i < pendingIds.length; i++) {
  await generateOne(pendingIds[i], i);
}
```

This ensures only one large base64 image is in memory at a time. Each image's data is garbage-collected after upload before the next one starts. No reduction in reference images attached -- the prompt agent and product refs stay exactly the same.

### 2. Stuck row cleanup

Add a cleanup step at the start of `runBackgroundGeneration` that marks any `pending` rows older than 3 minutes as `failed`. This prevents stale rows from accumulating when crashes do happen:

```text
// Clean up old stuck pending rows for this user
await bgSupabase
  .from('generated_images')
  .update({ status: 'failed', error_message: 'Generation timed out (server)' })
  .eq('user_id', userId)
  .eq('status', 'pending')
  .lt('created_at', new Date(Date.now() - 3 * 60 * 1000).toISOString());
```

### 3. Client-side polling: reduce timeout

Reduce polling timeout from 150s to 120s (since sequential generation of 4 images at ~30-60s each could take up to ~4 minutes, but with cleanup in place, stuck rows get resolved faster). Actually, keep at 150s since sequential 4x could take ~2-4 min. The cleanup handles the edge case.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Replace `Promise.all` with sequential loop; add stuck-row cleanup at start of background generation |

## What Does NOT Change
- Number of product reference images attached (stays at up to 6)
- Prompt agent logic
- Image quality or resolution
- Client-side polling logic (stays at 150s timeout, 4s interval)

## Tradeoff
Sequential generation means total batch time increases from ~60s (parallel) to ~120-240s (sequential). But this is acceptable because:
- Images appear progressively as each one completes (the client polls every 4s)
- The alternative (parallel) crashes and produces zero images
- Users already see individual images appear via the `onRowReady` callback pattern


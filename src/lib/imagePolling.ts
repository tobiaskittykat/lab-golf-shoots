import { supabase } from '@/integrations/supabase/client';

export interface PollResult {
  id: string;
  image_url: string;
  status: string;
  prompt: string;
  refined_prompt?: string;
  concept_title?: string;
  error_message?: string;
  settings?: any;
  product_reference_url?: string;
  moodboard_id?: string;
  [key: string]: any;
}

/**
 * Poll the database for images that have moved past 'pending' status.
 * Returns completed/failed rows from generated_images.
 */
export async function pollForPendingImages(
  pendingIds: string[],
  options?: {
    maxWaitMs?: number;
    intervalMs?: number;
    onRowReady?: (row: PollResult) => void;
  }
): Promise<PollResult[]> {
  const maxWaitMs = options?.maxWaitMs ?? 480000; // 8 minutes
  const intervalMs = options?.intervalMs ?? 4000; // 4 seconds
  const onRowReady = options?.onRowReady;

  const startTime = Date.now();
  const completed: PollResult[] = [];
  const remaining = new Set(pendingIds);
  const notified = new Set<string>();

  console.log(`[Poll] Starting poll for ${pendingIds.length} images (timeout: ${maxWaitMs / 1000}s)`);

  while (remaining.size > 0 && Date.now() - startTime < maxWaitMs) {
    const { data: rows } = await (supabase
      .from('generated_images' as any)
      .select('*')
      .in('id', Array.from(remaining))
      .neq('status', 'pending') as any);

    if (rows && rows.length > 0) {
      for (const row of rows) {
        remaining.delete(row.id);
        completed.push(row as PollResult);

        if (onRowReady && !notified.has(row.id)) {
          notified.add(row.id);
          onRowReady(row as PollResult);
        }
      }
      console.log(`[Poll] ${completed.length}/${pendingIds.length} ready, ${remaining.size} remaining`);
    }

    if (remaining.size > 0) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  // Mark timed-out images
  for (const id of remaining) {
    completed.push({
      id,
      image_url: '',
      status: 'failed',
      prompt: '',
      error_message: `Generation timed out after ${Math.round(maxWaitMs / 1000)}s`,
    } as PollResult);
  }

  console.log(`[Poll] Complete: ${completed.filter(r => r.status === 'completed').length} succeeded, ${completed.filter(r => r.status === 'failed').length} failed`);

  return completed;
}

/**
 * Invoke generate-image edge function and poll for results.
 * Handles both async (pendingIds) and legacy sync (images) response formats.
 */
export async function invokeAndPollGeneration(
  body: Record<string, any>,
  options?: {
    maxWaitMs?: number;
    intervalMs?: number;
    onRowReady?: (row: PollResult) => void;
  }
): Promise<{ rows: PollResult[]; error?: string }> {
  const { data, error } = await supabase.functions.invoke('generate-image', { body });

  if (error) {
    console.error('[invokeAndPoll] Edge function error:', error);
    return { rows: [], error: error.message || 'Failed to start generation' };
  }

  // Async pattern: pendingIds
  if (data?.pendingIds && Array.isArray(data.pendingIds)) {
    console.log(`[invokeAndPoll] Async: polling for ${data.pendingIds.length} images`);
    const rows = await pollForPendingImages(data.pendingIds, options);
    return { rows };
  }

  // Legacy sync pattern fallback
  if (data?.images) {
    console.log('[invokeAndPoll] Legacy sync response');
    return {
      rows: data.images.map((img: any) => ({
        id: img.id || `legacy-${Date.now()}-${img.index}`,
        image_url: img.imageUrl || '',
        status: img.status || 'failed',
        prompt: body.prompt || '',
        refined_prompt: img.refinedPrompt,
        concept_title: body.conceptTitle,
      })),
    };
  }

  return { rows: [], error: 'Unexpected response format' };
}

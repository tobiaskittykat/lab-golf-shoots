import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IntegrityDetails {
  colorMatch: { score: number; notes: string };
  silhouetteMatch: { score: number; notes: string };
  featureMatch: { score: number; notes: string };
  materialMatch: { score: number; notes: string };
}

export interface IntegrityResult {
  score: number;
  issues: string[];
  passesCheck: boolean;
  analyzedAt: string;
  details: IntegrityDetails;
}

/**
 * Hook to fetch and poll for integrity analysis results for a set of images.
 * Polls every 5 seconds until all images have been analyzed.
 */
export function useIntegrityResults(imageIds: string[]) {
  const [results, setResults] = useState<Record<string, IntegrityResult>>({});
  const [isPolling, setIsPolling] = useState(false);

  const fetchResults = useCallback(async () => {
    if (imageIds.length === 0) return;

    const { data, error } = await supabase
      .from('generated_images')
      .select('id, integrity_analysis')
      .in('id', imageIds);

    if (error) {
      console.error('[useIntegrityResults] Error fetching results:', error);
      return;
    }

    const resultsMap: Record<string, IntegrityResult> = {};
    let allAnalyzed = true;

    data?.forEach((img) => {
      if (img.integrity_analysis) {
        resultsMap[img.id] = img.integrity_analysis as unknown as IntegrityResult;
      } else {
        allAnalyzed = false;
      }
    });

    setResults(resultsMap);

    // Stop polling if all images are analyzed
    if (allAnalyzed && imageIds.length > 0) {
      setIsPolling(false);
    }

    return allAnalyzed;
  }, [imageIds]);

  useEffect(() => {
    if (imageIds.length === 0) {
      setResults({});
      setIsPolling(false);
      return;
    }

    // Initial fetch
    fetchResults().then((allAnalyzed) => {
      // Start polling if not all analyzed
      if (!allAnalyzed) {
        setIsPolling(true);
      }
    });

    // Set up polling interval
    let interval: NodeJS.Timeout | null = null;

    if (imageIds.length > 0) {
      interval = setInterval(async () => {
        const allAnalyzed = await fetchResults();
        if (allAnalyzed) {
          if (interval) clearInterval(interval);
          setIsPolling(false);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [imageIds.join(','), fetchResults]);

  return { results, isPolling };
}

/**
 * Trigger integrity analysis for a single image.
 * This is a fire-and-forget function - results will appear via polling.
 */
export async function triggerIntegrityAnalysis(
  imageId: string,
  generatedImageUrl: string,
  productReferenceUrls: string[],
  productName?: string
): Promise<void> {
  if (!imageId || !generatedImageUrl || productReferenceUrls.length === 0) {
    console.log('[triggerIntegrityAnalysis] Skipping - missing required data');
    return;
  }

  try {
    console.log(`[triggerIntegrityAnalysis] Triggering analysis for image ${imageId}`);

    const { error } = await supabase.functions.invoke('analyze-product-integrity', {
      body: {
        imageId,
        generatedImageUrl,
        productReferenceUrls,
        productName,
      },
    });

    if (error) {
      console.error('[triggerIntegrityAnalysis] Error:', error);
    }
  } catch (err) {
    console.error('[triggerIntegrityAnalysis] Exception:', err);
  }
}

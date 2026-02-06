import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShoeComponents, ComponentOverrides } from '@/lib/birkenstockMaterials';

interface UseShoeComponentsOptions {
  skuId: string | undefined;
  pollInterval?: number; // ms, default 3000
}

interface UseShoeComponentsReturn {
  components: ShoeComponents | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  triggerAnalysis: () => Promise<void>;
}

export function useShoeComponents({
  skuId,
  pollInterval = 3000,
}: UseShoeComponentsOptions): UseShoeComponentsReturn {
  const [components, setComponents] = useState<ShoeComponents | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = useCallback(async () => {
    if (!skuId) {
      setComponents(null);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('product_skus')
        .select('components')
        .eq('id', skuId)
        .single();

      if (fetchError) throw fetchError;

      if (data?.components) {
        setComponents(data.components as unknown as ShoeComponents);
        setIsAnalyzing(false);
      } else {
        setComponents(null);
      }
    } catch (err) {
      console.error('Error fetching shoe components:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch components');
    }
  }, [skuId]);

  // Initial fetch
  useEffect(() => {
    if (skuId) {
      setIsLoading(true);
      setError(null);
      fetchComponents().finally(() => setIsLoading(false));
    } else {
      setComponents(null);
      setIsLoading(false);
    }
  }, [skuId, fetchComponents]);

  // Poll for updates if analyzing
  useEffect(() => {
    if (!skuId || !isAnalyzing) return;

    const interval = setInterval(() => {
      fetchComponents();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [skuId, isAnalyzing, pollInterval, fetchComponents]);

  const triggerAnalysis = useCallback(async () => {
    if (!skuId) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const { error: invokeError } = await supabase.functions.invoke('analyze-shoe-components', {
        body: { skuId },
      });

      if (invokeError) {
        throw invokeError;
      }

      // Fetch updated components after a short delay
      setTimeout(fetchComponents, 1000);
    } catch (err) {
      console.error('Error triggering component analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze components');
      setIsAnalyzing(false);
    }
  }, [skuId, fetchComponents]);

  return {
    components,
    isLoading,
    isAnalyzing,
    error,
    refetch: fetchComponents,
    triggerAnalysis,
  };
}

// Hook for managing component overrides state
export function useComponentOverrides(initialComponents: ShoeComponents | null) {
  const [overrides, setOverrides] = useState<ComponentOverrides>({});

  // Reset overrides when initial components change
  useEffect(() => {
    setOverrides({});
  }, [initialComponents?.analyzedAt]);

  const setComponentOverride = useCallback(
    (
      componentType: keyof ComponentOverrides,
      override: { material: string; color: string; colorHex?: string } | null
    ) => {
      setOverrides((prev) => {
        if (override === null) {
          const next = { ...prev };
          delete next[componentType];
          return next;
        }
        return { ...prev, [componentType]: override };
      });
    },
    []
  );

  const resetOverrides = useCallback(() => {
    setOverrides({});
  }, []);

  const hasOverrides = Object.keys(overrides).length > 0;

  return {
    overrides,
    setComponentOverride,
    resetOverrides,
    hasOverrides,
  };
}

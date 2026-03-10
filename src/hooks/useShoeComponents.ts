import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShoeComponents, ComponentOverrides } from '@/lib/birkenstockMaterials';

interface UseShoeComponentsOptions {
  skuId: string | undefined;
  pollInterval?: number;
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
      const { data, error: fetchError } = await (supabase
        .from('product_skus' as any)
        .select('components')
        .eq('id', skuId)
        .single() as any);

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

export function useComponentOverrides(initialComponents: ShoeComponents | null) {
  const [overrides, setOverrides] = useState<ComponentOverrides>({});

  useEffect(() => {
    setOverrides({});
  }, [initialComponents?.analyzedAt]);

  useEffect(() => {
    if (overrides.buckles?.material === 'Matte Plastic (Coordinated)' || overrides.buckles?.material === 'Metal (Coordinated)' || overrides.buckles?.material === 'Translucent (Coordinated)') {
      const upperColor = overrides.upper?.color || initialComponents?.upper?.color;

      if (upperColor && overrides.buckles.color !== upperColor) {
        setOverrides(prev => ({
          ...prev,
          buckles: {
            ...prev.buckles!,
            color: upperColor,
          }
        }));
      }
    }
  }, [overrides.upper, overrides.buckles?.material, initialComponents?.upper]);

  useEffect(() => {
    if (!initialComponents?.heelstrap) return;

    const upperOverride = overrides.upper;
    const heelstrapOverride = overrides.heelstrap;

    if (upperOverride) {
      if (
        heelstrapOverride?.material !== upperOverride.material ||
        heelstrapOverride?.color !== upperOverride.color
      ) {
        setOverrides(prev => ({
          ...prev,
          heelstrap: {
            material: upperOverride.material,
            color: upperOverride.color,
          },
        }));
      }
    } else if (heelstrapOverride) {
      setOverrides(prev => {
        const next = { ...prev };
        delete next.heelstrap;
        return next;
      });
    }
  }, [overrides.upper, initialComponents?.heelstrap]);

  const setComponentOverride = useCallback(
    (
      componentType: keyof ComponentOverrides,
      override: { material: string; color: string } | null
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

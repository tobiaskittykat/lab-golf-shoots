import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';

export interface ColorSample {
  id: string;
  image_url: string;
  material: string | null;
  color: string | null;
  color_hex: string | null;
  component_type: string | null;
  name: string | null;
  created_at: string;
}

export function useColorSamples() {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const [samples, setSamples] = useState<ColorSample[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSamples = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('color_samples' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setSamples(data as unknown as ColorSample[]);
      }
    } catch (err) {
      console.error('Failed to fetch color samples:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentBrand?.id]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  const saveSample = useCallback(async (sample: {
    image_url: string;
    material?: string;
    color?: string;
    color_hex?: string;
    component_type?: string;
  }) => {
    if (!user?.id) return null;

    const name = [sample.material, sample.color].filter(Boolean).join(' – ') || 'Untitled';

    const { data, error } = await supabase
      .from('color_samples' as any)
      .insert({
        user_id: user.id,
        brand_id: currentBrand?.id || null,
        image_url: sample.image_url,
        material: sample.material || null,
        color: sample.color || null,
        color_hex: sample.color_hex || null,
        component_type: sample.component_type || null,
        name,
      })
      .select()
      .single();

    if (!error && data) {
      const newSample = data as unknown as ColorSample;
      setSamples(prev => [newSample, ...prev]);
      return newSample;
    }
    return null;
  }, [user?.id, currentBrand?.id]);

  const updateSample = useCallback(async (id: string, updates: {
    material?: string;
    color?: string;
    color_hex?: string;
  }) => {
    const existing = samples.find(s => s.id === id);
    const merged = {
      material: updates.material ?? existing?.material,
      color: updates.color ?? existing?.color,
      color_hex: updates.color_hex ?? existing?.color_hex,
    };
    const name = [merged.material, merged.color].filter(Boolean).join(' – ') || 'Untitled';

    const { error } = await supabase
      .from('color_samples' as any)
      .update({ ...merged, name })
      .eq('id', id);

    if (!error) {
      setSamples(prev => prev.map(s => s.id === id
        ? { ...s, ...merged, name }
        : s
      ));
    }
    return !error;
  }, [samples]);

  const deleteSample = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('color_samples' as any)
      .delete()
      .eq('id', id);

    if (!error) {
      setSamples(prev => prev.filter(s => s.id !== id));
    }
  }, []);

  return { samples, isLoading, saveSample, updateSample, deleteSample, refetch: fetchSamples };
}

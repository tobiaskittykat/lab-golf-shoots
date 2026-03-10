import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBrands } from '@/hooks/useBrands';

export interface AdCreative {
  id: string;
  image_url: string;
  name: string | null;
  tags: string[];
  created_at: string;
}

export function useAdCreatives() {
  const { user } = useAuth();
  const { currentBrand } = useBrands();
  const [creatives, setCreatives] = useState<AdCreative[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCreatives = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('ad_creatives' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (currentBrand?.id) {
        query = query.or(`brand_id.eq.${currentBrand.id},brand_id.is.null`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setCreatives(data as unknown as AdCreative[]);
      }
    } catch (err) {
      console.error('Failed to fetch ad creatives:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentBrand?.id]);

  useEffect(() => {
    fetchCreatives();
  }, [fetchCreatives]);

  const saveCreative = useCallback(async (imageUrl: string, name?: string) => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from('ad_creatives' as any)
      .insert({
        user_id: user.id,
        brand_id: currentBrand?.id || null,
        image_url: imageUrl,
        name: name || `Ad ${new Date().toLocaleDateString()}`,
        tags: [],
      })
      .select()
      .single();

    if (!error && data) {
      const newCreative = data as unknown as AdCreative;
      setCreatives(prev => [newCreative, ...prev]);
      return newCreative;
    }
    return null;
  }, [user?.id, currentBrand?.id]);

  const deleteCreative = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('ad_creatives' as any)
      .delete()
      .eq('id', id);

    if (!error) {
      setCreatives(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  return { creatives, isLoading, saveCreative, deleteCreative, refetch: fetchCreatives };
}

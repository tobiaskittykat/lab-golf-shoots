// ProductSKUPicker - stub
import { supabase } from '@/integrations/supabase/client';

export async function updateSkuLastUsed(skuId: string): Promise<void> {
  try {
    await (supabase
      .from('product_skus' as any)
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', skuId) as any);
  } catch (err) {
    console.error('Error updating SKU last_used_at:', err);
  }
}

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShoeComponents, ComponentOverrides, ComponentType } from '@/lib/birkenstockMaterials';
import { toast } from 'sonner';

interface UseQuickCustomizationOptions {
  currentComponents: ShoeComponents | null;
  existingOverrides: ComponentOverrides;
  onApplyOverrides: (type: ComponentType, override: { material: string; color: string; colorHex?: string } | null) => void;
}

export function useQuickCustomization({
  currentComponents,
  existingOverrides,
  onApplyOverrides,
}: UseQuickCustomizationOptions) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyWithAI = useCallback(async () => {
    if (!input.trim() || !currentComponents) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Build current state (merged original + existing overrides)
      const currentState: Record<string, any> = {};
      const componentTypes: ComponentType[] = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'];
      
      for (const type of componentTypes) {
        const original = currentComponents[type];
        const override = existingOverrides[type];
        
        if (original || override) {
          currentState[type] = {
            material: override?.material || original?.material || 'Unknown',
            color: override?.color || original?.color || 'Unknown',
            colorHex: override?.colorHex || original?.colorHex,
          };
        }
      }

      const { data, error: fnError } = await supabase.functions.invoke('interpret-shoe-customization', {
        body: {
          userRequest: input.trim(),
          currentComponents: currentState,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to interpret customization');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const overrides = data?.overrides;
      if (!overrides || typeof overrides !== 'object') {
        throw new Error('No customization changes detected');
      }

      // Count changes
      const changedComponents = Object.keys(overrides);
      if (changedComponents.length === 0) {
        toast.info('No changes needed - the shoe already matches your description');
        return;
      }

      // Apply each override
      for (const [type, override] of Object.entries(overrides)) {
        if (override && typeof override === 'object') {
          onApplyOverrides(type as ComponentType, override as { material: string; color: string; colorHex?: string });
        }
      }

      toast.success(`Applied ${changedComponents.length} component change${changedComponents.length > 1 ? 's' : ''}`);
      setInput(''); // Clear input on success
    } catch (err) {
      console.error('Quick customization error:', err);
      const message = err instanceof Error ? err.message : 'Failed to apply customization';
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [input, currentComponents, existingOverrides, onApplyOverrides]);

  const clearInput = useCallback(() => {
    setInput('');
    setError(null);
  }, []);

  return {
    input,
    setInput,
    isProcessing,
    error,
    applyWithAI,
    clearInput,
  };
}

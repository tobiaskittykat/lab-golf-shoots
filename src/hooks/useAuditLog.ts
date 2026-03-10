import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLogParams {
  action: string;
  resourceType: string;
  resourceId?: string | null;
  resourceName?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Non-blocking audit logging hook.
 * Fires and forgets - never blocks UI or slows down operations.
 */
export function useAuditLog() {
  const log = useCallback((params: AuditLogParams) => {
    // Fire and forget - don't await, don't block
    supabase.functions.invoke('audit-log', {
      body: params,
    }).catch((err) => {
      // Silently fail - audit logging should never break functionality
      console.warn('Audit log failed (non-blocking):', err);
    });
  }, []);

  return { log };
}

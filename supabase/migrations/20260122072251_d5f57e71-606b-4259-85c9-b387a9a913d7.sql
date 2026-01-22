-- Create audit_logs table for comprehensive activity tracking
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Who
  user_id uuid NOT NULL,
  user_email text,
  
  -- Client info
  ip_address text,
  user_agent text,
  
  -- What happened
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  resource_name text,
  
  -- Additional context
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes for fast forensic queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX idx_audit_logs_ip_address ON public.audit_logs(ip_address);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

-- Allow inserts from authenticated users and service role
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);
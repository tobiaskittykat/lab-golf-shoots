-- Add new columns to saved_concepts table for enhanced concept structure
ALTER TABLE public.saved_concepts
  ADD COLUMN IF NOT EXISTS objective TEXT,
  ADD COLUMN IF NOT EXISTS target_persona TEXT,
  ADD COLUMN IF NOT EXISTS key_message TEXT,
  ADD COLUMN IF NOT EXISTS output_format TEXT,
  ADD COLUMN IF NOT EXISTS call_to_action TEXT,
  ADD COLUMN IF NOT EXISTS aspect_ratio TEXT;
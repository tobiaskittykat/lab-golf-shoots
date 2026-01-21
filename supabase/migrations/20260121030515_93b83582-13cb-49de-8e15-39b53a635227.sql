-- Add metadata_locked column to prevent overwriting manually corrected names
ALTER TABLE public.custom_moodboards 
ADD COLUMN IF NOT EXISTS metadata_locked boolean NOT NULL DEFAULT false;
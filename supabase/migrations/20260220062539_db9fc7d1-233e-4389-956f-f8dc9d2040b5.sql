
-- Create custom_backgrounds table
CREATE TABLE public.custom_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  thumbnail_url TEXT,
  reference_urls TEXT[],
  ai_analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_backgrounds ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own custom backgrounds"
ON public.custom_backgrounds FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom backgrounds"
ON public.custom_backgrounds FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom backgrounds"
ON public.custom_backgrounds FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom backgrounds"
ON public.custom_backgrounds FOR DELETE
USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_custom_backgrounds_updated_at
BEFORE UPDATE ON public.custom_backgrounds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

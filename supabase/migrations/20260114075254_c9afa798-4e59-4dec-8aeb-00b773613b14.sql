-- Create saved_concepts table for storing user-created concepts
CREATE TABLE public.saved_concepts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  -- Preset settings that define the concept
  artistic_style TEXT,
  lighting_style TEXT,
  camera_angle TEXT,
  moodboard_id TEXT,
  extra_keywords TEXT[] DEFAULT '{}',
  use_case TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_concepts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own saved concepts"
ON public.saved_concepts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved concepts"
ON public.saved_concepts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved concepts"
ON public.saved_concepts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved concepts"
ON public.saved_concepts
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_saved_concepts_updated_at
BEFORE UPDATE ON public.saved_concepts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
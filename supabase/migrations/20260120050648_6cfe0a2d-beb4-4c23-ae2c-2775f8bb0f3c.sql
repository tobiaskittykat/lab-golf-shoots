-- Create moodboards storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('moodboards', 'moodboards', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for moodboards bucket
CREATE POLICY "Moodboards are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'moodboards');

CREATE POLICY "Authenticated users can upload moodboards"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'moodboards' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own moodboards"
ON storage.objects FOR UPDATE
USING (bucket_id = 'moodboards' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own moodboards"
ON storage.objects FOR DELETE
USING (bucket_id = 'moodboards' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create a table to track custom moodboards metadata
CREATE TABLE public.custom_moodboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on custom_moodboards
ALTER TABLE public.custom_moodboards ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_moodboards
CREATE POLICY "Users can view their own moodboards"
ON public.custom_moodboards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own moodboards"
ON public.custom_moodboards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moodboards"
ON public.custom_moodboards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moodboards"
ON public.custom_moodboards FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_custom_moodboards_updated_at
BEFORE UPDATE ON public.custom_moodboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
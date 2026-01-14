-- Create generated_images table
CREATE TABLE public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  
  -- Prompt data
  prompt TEXT NOT NULL,
  refined_prompt TEXT,
  negative_prompt TEXT,
  
  -- Image URLs
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Reference tracking (store URLs for regeneration)
  product_reference_url TEXT,
  context_reference_url TEXT,
  moodboard_id TEXT,
  
  -- Generation settings (stored for regeneration)
  settings JSONB DEFAULT '{}',
  
  -- Concept info
  concept_id TEXT,
  concept_title TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'nsfw')),
  error_message TEXT,
  
  -- Organization
  folder TEXT DEFAULT 'Uncategorized',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Users can view their own generated images
CREATE POLICY "Users can view their own generated images"
ON public.generated_images
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own generated images
CREATE POLICY "Users can insert their own generated images"
ON public.generated_images
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own generated images
CREATE POLICY "Users can update their own generated images"
ON public.generated_images
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own generated images
CREATE POLICY "Users can delete their own generated images"
ON public.generated_images
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_generated_images_user_id ON public.generated_images(user_id);
CREATE INDEX idx_generated_images_brand_id ON public.generated_images(brand_id);
CREATE INDEX idx_generated_images_created_at ON public.generated_images(created_at DESC);

-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-images', 'generated-images', true);

-- Storage policies
CREATE POLICY "Anyone can view generated images"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-images');

CREATE POLICY "Authenticated users can upload generated images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own generated images in storage"
ON storage.objects FOR UPDATE
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own generated images in storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Create brand_images table for storing brand reference images
CREATE TABLE public.brand_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'general',
  visual_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.brand_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own brand images" 
ON public.brand_images 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand images" 
ON public.brand_images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand images" 
ON public.brand_images 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand images" 
ON public.brand_images 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_brand_images_updated_at
BEFORE UPDATE ON public.brand_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for brand assets
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', true);

-- Create storage policies for brand-assets bucket
CREATE POLICY "Brand assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'brand-assets');

CREATE POLICY "Users can upload their own brand assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own brand assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own brand assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
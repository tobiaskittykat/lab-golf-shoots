
CREATE TABLE public.scene_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scene_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scene images" ON public.scene_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scene images" ON public.scene_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scene images" ON public.scene_images FOR DELETE USING (auth.uid() = user_id);

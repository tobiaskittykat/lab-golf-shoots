
-- Feature 1: Color Samples Repository
CREATE TABLE public.color_samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  material TEXT,
  color TEXT,
  color_hex TEXT,
  component_type TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.color_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own samples" ON public.color_samples FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own samples" ON public.color_samples FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own samples" ON public.color_samples FOR DELETE USING (auth.uid() = user_id);

-- Feature 2: Ad Creatives Gallery
CREATE TABLE public.ad_creatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  name TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ad creatives" ON public.ad_creatives FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ad creatives" ON public.ad_creatives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ad creatives" ON public.ad_creatives FOR DELETE USING (auth.uid() = user_id);

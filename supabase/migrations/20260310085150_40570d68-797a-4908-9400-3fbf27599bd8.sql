
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Brand',
  website TEXT,
  industry TEXT,
  markets TEXT[] DEFAULT '{}',
  personality TEXT,
  social_connections JSONB DEFAULT '{}',
  assets JSONB DEFAULT '{}',
  brand_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brands" ON public.brands FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brands" ON public.brands FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brands" ON public.brands FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own brands" ON public.brands FOR DELETE TO authenticated USING (auth.uid() = user_id);

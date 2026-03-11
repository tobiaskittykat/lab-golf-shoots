
-- Create saved_concepts table
CREATE TABLE IF NOT EXISTS public.saved_concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tags text[] DEFAULT '{}',
  core_idea text,
  consumer_insight text,
  product_focus jsonb,
  visual_world jsonb,
  taglines text[],
  content_pillars jsonb,
  target_audience jsonb,
  tonality jsonb,
  artistic_style text,
  lighting_style text,
  camera_angle text,
  moodboard_id text,
  product_reference_ids text[] DEFAULT '{}',
  extra_keywords text[] DEFAULT '{}',
  use_case text,
  aspect_ratio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved concepts" ON public.saved_concepts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved concepts" ON public.saved_concepts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved concepts" ON public.saved_concepts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved concepts" ON public.saved_concepts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add missing columns to generated_images
ALTER TABLE public.generated_images ADD COLUMN IF NOT EXISTS context_reference_url text;

-- Add missing columns to scraped_products
ALTER TABLE public.scraped_products ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.scraped_products ADD COLUMN IF NOT EXISTS collection text;
ALTER TABLE public.scraped_products ADD COLUMN IF NOT EXISTS description jsonb;

-- Add unique constraint for upsert on scraped_products (if external_id is set)
CREATE UNIQUE INDEX IF NOT EXISTS scraped_products_user_external_id_idx ON public.scraped_products (user_id, external_id) WHERE external_id IS NOT NULL;

-- Add file_path to custom_moodboards
ALTER TABLE public.custom_moodboards ADD COLUMN IF NOT EXISTS file_path text;

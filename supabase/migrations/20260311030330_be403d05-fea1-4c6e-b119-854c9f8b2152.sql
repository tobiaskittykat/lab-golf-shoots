
-- Generated Images table
CREATE TABLE public.generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  prompt text,
  refined_prompt text,
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  concept_id text,
  concept_title text,
  moodboard_id text,
  product_reference_url text,
  settings jsonb DEFAULT '{}'::jsonb,
  integrity_analysis jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generated images" ON public.generated_images FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generated images" ON public.generated_images FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generated images" ON public.generated_images FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own generated images" ON public.generated_images FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Product SKUs table
CREATE TABLE public.product_skus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT 'Untitled Product',
  sku_code text,
  composite_image_url text,
  category text,
  description jsonb,
  components jsonb,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_skus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own product skus" ON public.product_skus FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own product skus" ON public.product_skus FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own product skus" ON public.product_skus FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own product skus" ON public.product_skus FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Scraped Products (product angles/images linked to SKUs)
CREATE TABLE public.scraped_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  sku_id uuid REFERENCES public.product_skus(id) ON DELETE CASCADE,
  name text,
  thumbnail_url text,
  full_url text,
  storage_path text,
  angle text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scraped_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scraped products" ON public.scraped_products FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scraped products" ON public.scraped_products FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scraped products" ON public.scraped_products FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scraped products" ON public.scraped_products FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Brand Images table
CREATE TABLE public.brand_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  category text NOT NULL DEFAULT 'general',
  visual_analysis jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand images" ON public.brand_images FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand images" ON public.brand_images FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand images" ON public.brand_images FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand images" ON public.brand_images FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Custom Moodboards table
CREATE TABLE public.custom_moodboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT 'Untitled Moodboard',
  description text,
  thumbnail_url text,
  visual_analysis jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_moodboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom moodboards" ON public.custom_moodboards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own custom moodboards" ON public.custom_moodboards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own custom moodboards" ON public.custom_moodboards FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own custom moodboards" ON public.custom_moodboards FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Custom Backgrounds table
CREATE TABLE public.custom_backgrounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL NOT NULL,
  name text NOT NULL,
  prompt text NOT NULL,
  thumbnail_url text,
  reference_urls text[],
  ai_analysis jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_backgrounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom backgrounds" ON public.custom_backgrounds FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own custom backgrounds" ON public.custom_backgrounds FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own custom backgrounds" ON public.custom_backgrounds FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own custom backgrounds" ON public.custom_backgrounds FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Scene Images table
CREATE TABLE public.scene_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL NOT NULL,
  name text NOT NULL DEFAULT 'Uploaded Scene',
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  region text NOT NULL DEFAULT 'all',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scene_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scene images" ON public.scene_images FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scene images" ON public.scene_images FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scene images" ON public.scene_images FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scene images" ON public.scene_images FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Ad Creatives table
CREATE TABLE public.ad_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  name text,
  tags text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ad creatives" ON public.ad_creatives FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ad creatives" ON public.ad_creatives FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ad creatives" ON public.ad_creatives FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Color Samples table
CREATE TABLE public.color_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  material text,
  color text,
  color_hex text,
  component_type text,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.color_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own color samples" ON public.color_samples FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own color samples" ON public.color_samples FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own color samples" ON public.color_samples FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own color samples" ON public.color_samples FOR DELETE TO authenticated USING (auth.uid() = user_id);

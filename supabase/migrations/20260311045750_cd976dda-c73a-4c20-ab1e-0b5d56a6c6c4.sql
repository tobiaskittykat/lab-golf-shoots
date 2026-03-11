
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id uuid REFERENCES public.product_skus(id) ON DELETE CASCADE NOT NULL,
  variant_type text NOT NULL,
  variant_name text NOT NULL,
  variant_value text,
  thumbnail_url text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own SKU variants"
  ON public.product_variants FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.product_skus
    WHERE product_skus.id = product_variants.sku_id
    AND product_skus.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own SKU variants"
  ON public.product_variants FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.product_skus
    WHERE product_skus.id = product_variants.sku_id
    AND product_skus.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own SKU variants"
  ON public.product_variants FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.product_skus
    WHERE product_skus.id = product_variants.sku_id
    AND product_skus.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.product_skus
    WHERE product_skus.id = product_variants.sku_id
    AND product_skus.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own SKU variants"
  ON public.product_variants FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.product_skus
    WHERE product_skus.id = product_variants.sku_id
    AND product_skus.user_id = auth.uid()
  ));

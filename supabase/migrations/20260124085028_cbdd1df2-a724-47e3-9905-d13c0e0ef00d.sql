-- Add brand_id column to scraped_products for multi-brand support
ALTER TABLE public.scraped_products 
ADD COLUMN brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE;

-- Create index for efficient brand-based queries
CREATE INDEX idx_scraped_products_brand_id ON public.scraped_products(brand_id);
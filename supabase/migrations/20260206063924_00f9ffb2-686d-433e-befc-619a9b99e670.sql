-- Add components column to product_skus for storing analyzed shoe components
ALTER TABLE public.product_skus
ADD COLUMN IF NOT EXISTS components JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.product_skus.components IS 'Analyzed shoe component data including upper, footbed, sole, buckles, heelstrap, and lining with materials, colors, and confidence scores';
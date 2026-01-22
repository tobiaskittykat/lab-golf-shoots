-- Add description column to scraped_products for AI-generated visual analysis
ALTER TABLE scraped_products 
ADD COLUMN IF NOT EXISTS description jsonb DEFAULT NULL;
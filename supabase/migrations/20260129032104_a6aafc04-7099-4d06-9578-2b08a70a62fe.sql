-- Add last_used_at column to track recently used products
ALTER TABLE product_skus ADD COLUMN last_used_at TIMESTAMPTZ;

-- Create index for efficient ordering by last used
CREATE INDEX idx_product_skus_last_used ON product_skus(user_id, last_used_at DESC NULLS LAST);
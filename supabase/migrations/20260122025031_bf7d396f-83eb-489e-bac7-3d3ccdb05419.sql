-- Add missing UPDATE policy for scraped_products
CREATE POLICY "Users can update own scraped products"
ON scraped_products FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
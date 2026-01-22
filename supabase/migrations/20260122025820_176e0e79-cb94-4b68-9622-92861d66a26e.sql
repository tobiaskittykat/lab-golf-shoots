-- One-time cleanup: Fix product categories

-- Fix 'crossbody' category to 'phone-case' (Bandolier's crossbody phone cases)
UPDATE scraped_products
SET category = 'phone-case'
WHERE category = 'crossbody';

-- Fix 'custom-upload' using AI-detected product_type from description JSONB
UPDATE scraped_products
SET category = CASE
  WHEN LOWER(description->>'product_type') LIKE '%phone%' THEN 'phone-case'
  WHEN LOWER(description->>'product_type') LIKE '%crossbody%' THEN 'phone-case'
  WHEN LOWER(description->>'product_type') LIKE '%case%' THEN 'phone-case'
  WHEN LOWER(description->>'product_type') LIKE '%strap%' THEN 'strap'
  WHEN LOWER(description->>'product_type') LIKE '%lanyard%' THEN 'strap'
  WHEN LOWER(description->>'product_type') LIKE '%chain%' THEN 'strap'
  WHEN LOWER(description->>'product_type') LIKE '%bag%' THEN 'bag'
  WHEN LOWER(description->>'product_type') LIKE '%tote%' THEN 'bag'
  WHEN LOWER(description->>'product_type') LIKE '%clutch%' THEN 'bag'
  WHEN LOWER(description->>'product_type') LIKE '%pouch%' THEN 'pouch'
  WHEN LOWER(description->>'product_type') LIKE '%wallet%' THEN 'pouch'
  WHEN LOWER(description->>'product_type') LIKE '%card%' THEN 'pouch'
  WHEN LOWER(description->>'product_type') LIKE '%charm%' THEN 'accessory'
  WHEN LOWER(description->>'product_type') LIKE '%airpod%' THEN 'accessory'
  WHEN LOWER(description->>'product_type') LIKE '%keychain%' THEN 'accessory'
  ELSE 'other'
END
WHERE category = 'custom-upload' 
  AND description->>'product_type' IS NOT NULL;
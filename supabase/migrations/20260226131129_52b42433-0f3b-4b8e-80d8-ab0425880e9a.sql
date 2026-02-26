UPDATE public.scene_images SET region = 'usa' WHERE name ILIKE '%deck%' OR name ILIKE '%fence%';
UPDATE public.scene_images SET region = 'europe' WHERE name ILIKE '%boules%' OR name ILIKE '%bench%' OR name ILIKE '%court%';
UPDATE public.scene_images SET region = 'apac' WHERE name ILIKE '%train%' OR name ILIKE '%station%' OR name ILIKE '%city%' OR name ILIKE '%urban%';
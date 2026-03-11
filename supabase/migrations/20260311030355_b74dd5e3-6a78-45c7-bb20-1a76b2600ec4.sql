
-- Create brand-assets storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brand-assets', 'brand-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

-- Storage RLS policies
CREATE POLICY "Users can upload brand assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brand-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view brand assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'brand-assets');
CREATE POLICY "Users can update own brand assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'brand-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own brand assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brand-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public can view brand assets" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'brand-assets');

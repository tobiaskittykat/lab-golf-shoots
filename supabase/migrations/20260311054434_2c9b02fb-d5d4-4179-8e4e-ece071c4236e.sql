-- Create the generated-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Users can upload remix sources"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'generated-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read
CREATE POLICY "Public read generated images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'generated-images');

-- Allow users to delete own files
CREATE POLICY "Users can delete own generated images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'generated-images' AND (storage.foldername(name))[1] = auth.uid()::text);
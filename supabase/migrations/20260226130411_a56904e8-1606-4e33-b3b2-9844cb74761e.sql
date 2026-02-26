ALTER TABLE public.scene_images ADD COLUMN region text NOT NULL DEFAULT 'all';

CREATE POLICY "Users can update own scene images" ON public.scene_images FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
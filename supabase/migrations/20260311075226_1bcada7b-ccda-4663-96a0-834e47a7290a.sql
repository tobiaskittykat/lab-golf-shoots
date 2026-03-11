
ALTER TABLE public.generated_images ADD COLUMN parent_image_id uuid REFERENCES public.generated_images(id);
ALTER TABLE public.generated_images ADD COLUMN generation_step text;

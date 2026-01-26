-- Add preference tracking columns to generated_images
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS liked BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS shot_type TEXT;

-- Create index for efficient preference queries
CREATE INDEX IF NOT EXISTS idx_generated_images_liked ON generated_images(user_id, liked) WHERE liked IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_generated_images_preferences ON generated_images(user_id, concept_id, moodboard_id, shot_type) WHERE liked = true;
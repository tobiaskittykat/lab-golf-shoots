-- Add comprehensive campaign concept columns to saved_concepts table

-- 1. Product Focus (JSONB for structured data)
ALTER TABLE public.saved_concepts
ADD COLUMN IF NOT EXISTS product_focus JSONB DEFAULT NULL;

-- 2. Core Idea / Single-minded idea (TEXT)
ALTER TABLE public.saved_concepts
ADD COLUMN IF NOT EXISTS core_idea TEXT DEFAULT NULL;

-- 3. Visual World (JSONB for structured data)
ALTER TABLE public.saved_concepts
ADD COLUMN IF NOT EXISTS visual_world JSONB DEFAULT NULL;

-- 4. Taglines (Array of texts)
ALTER TABLE public.saved_concepts
ADD COLUMN IF NOT EXISTS taglines TEXT[] DEFAULT NULL;

-- 5. Content Pillars (JSONB array)
ALTER TABLE public.saved_concepts
ADD COLUMN IF NOT EXISTS content_pillars JSONB DEFAULT NULL;

-- 6. Target Audience (JSONB for persona + situation - replaces simple target_persona)
ALTER TABLE public.saved_concepts
ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT NULL;

-- 7. Consumer Insight (TEXT)
ALTER TABLE public.saved_concepts
ADD COLUMN IF NOT EXISTS consumer_insight TEXT DEFAULT NULL;

-- 8. Tonality (JSONB for adjectives + never rules)
ALTER TABLE public.saved_concepts
ADD COLUMN IF NOT EXISTS tonality JSONB DEFAULT NULL;
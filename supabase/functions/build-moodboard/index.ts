import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageResult {
  url: string;
  thumbnailUrl: string;
  source: string;
  title: string;
  description?: string;
  score?: number;
}

interface BuildRequest {
  mood: string;
  style?: 'editorial' | 'commercial' | 'mixed';
  warmth?: number; // -1 to 1, cold to warm
  density?: number; // -1 to 1, minimal to maximal
  targetCount?: number;
}

// Expand mood into search terms using AI
async function expandMoodToSearchTerms(mood: string, style: string): Promise<string[]> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    // Fallback: just split the mood into words
    return mood.split(/[,\s]+/).filter(w => w.length > 2);
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at visual moodboard curation for FASHION and LIFESTYLE brands. Generate 10-12 SHORT search terms (1-3 words MAX) for finding ${style === 'editorial' ? 'artistic, editorial' : style === 'commercial' ? 'polished, professional' : 'diverse, creative'} imagery.

CRITICAL RULES:
1. Terms must be SHORT (1-3 words) and SEARCHABLE
2. Focus on AESTHETIC/VISUAL terms, not literal objects
3. For colors like "terracotta", use: "terracotta tones", "warm earth palette", "rust color aesthetic"
4. AVOID terms that could match museum/artifact/historical imagery

Include a balanced mix:
- 3-4 contemporary settings: "beach villa", "rooftop terrace", "boutique hotel"
- 2-3 textures/materials: "linen fabric", "natural stone", "woven rattan"
- 2-3 moods/atmospheres: "golden hour", "sun-drenched", "relaxed luxury"
- 2 color aesthetics: "warm earth tones", "ocean blue palette"

GOOD examples: "golden hour beach", "olive grove", "white linen", "warm sunset"
BAD examples: "Mediterranean" (too vague), "terracotta" (matches pottery artifacts)

Return ONLY a JSON array of strings, no explanation.`
          },
          {
            role: 'user',
            content: mood,
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('AI expansion failed:', response.status);
      return mood.split(/[,\s]+/).filter(w => w.length > 2);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON array from response
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      const terms = JSON.parse(match[0]);
      console.log('Expanded search terms:', terms);
      return terms;
    }
    
    return mood.split(/[,\s]+/).filter(w => w.length > 2);
  } catch (err) {
    console.error('Error expanding mood:', err);
    return mood.split(/[,\s]+/).filter(w => w.length > 2);
  }
}

// Rank images for artistic quality using AI
async function rankForArtisticQuality(
  images: ImageResult[], 
  mood: string,
  style: string
): Promise<ImageResult[]> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey || images.length === 0) {
    return images;
  }

  try {
    // Always rank images for quality, even small sets

    // Use AI to score images based on titles/descriptions (can't analyze actual images here)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a visual curator for FASHION/LIFESTYLE moodboards. Score images 0-100 based on how well they match: "${mood}"

SCORING GUIDE:
- 80-100: Perfect match - modern lifestyle photography, correct mood/aesthetic
- 60-79: Good match - relevant subject, some mood alignment  
- 40-59: Partial match - somewhat relevant but not ideal
- 20-39: Poor match - tangentially related, wrong vibe
- 0-19: REJECT - completely irrelevant

CRITICAL - Score 0-19 for:
- Ancient artifacts, museum pieces, historical items (pottery, sculptures, etc.)
- Random stock photos unrelated to the mood
- Text-heavy graphics, logos, or diagrams
- Low-quality, blurry, or amateur images
- Wikipedia/encyclopedia-style educational images

${style === 'editorial' ? 'Prefer experimental, artistic, non-commercial imagery' : 'Prefer polished, professional imagery'}
The mood is LIFESTYLE/FASHION oriented - prefer CONTEMPORARY photography over historical/archival content.

Return ONLY a JSON array of scores in the same order as input, e.g. [85, 72, 90, ...]`
          },
          {
            role: 'user',
            content: JSON.stringify(images.slice(0, 30).map((img, i) => ({
              index: i,
              title: img.title,
              description: img.description,
              source: img.source,
            }))),
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI ranking failed:', response.status);
      return images;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      const scores = JSON.parse(match[0]);
      
      // Apply scores to images
      const scored = images.slice(0, 30).map((img, i) => ({
        ...img,
        score: typeof scores[i] === 'number' ? scores[i] : 50,
      }));
      
      // Sort by score descending
      scored.sort((a, b) => (b.score || 0) - (a.score || 0));
      
      // Filter out low-quality images (score < 40) - eliminates irrelevant results like museum artifacts
      const filtered = scored.filter(img => (img.score || 0) >= 40);
      console.log(`Filtered ${scored.length - filtered.length} low-quality images (score < 40)`);
      
      // Return filtered images, or fall back to top 6 if too many filtered
      const result = filtered.length >= 6 ? filtered : scored.slice(0, 6);
      return [...result, ...images.slice(30)];
    }
    
    return images;
  } catch (err) {
    console.error('Error ranking images:', err);
    return images;
  }
}

// Query a source via edge function
async function querySource(
  supabaseUrl: string,
  functionName: string,
  query: string,
  limit: number
): Promise<ImageResult[]> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    });

    if (!response.ok) {
      console.error(`${functionName} failed:`, response.status);
      return [];
    }

    const data = await response.json();
    return data.images || [];
  } catch (err) {
    console.error(`Error querying ${functionName}:`, err);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood, style = 'mixed', warmth = 0, density = 0, targetCount = 9 }: BuildRequest = await req.json();

    if (!mood) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mood description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Building moodboard for mood:', mood, 'style:', style);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';

    // Step 1: Expand mood into search terms
    const aiSearchTerms = await expandMoodToSearchTerms(mood, style);
    
    // Step 1b: Extract simple fallback terms from mood directly
    const fallbackTerms = mood
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && w.length <= 15)
      .slice(0, 5);
    
    // Combine AI terms with fallback terms, deduplicated
    const searchTerms = [...new Set([...aiSearchTerms, ...fallbackTerms])];
    console.log('Search terms:', searchTerms);

    // Step 2: Query all sources in parallel with ALL terms for maximum coverage
    const allImages: ImageResult[] = [];
    const sourceQueries = [];
    
    // Are.na - query up to 5 terms for variety
    for (const term of searchTerms.slice(0, 5)) {
      sourceQueries.push(querySource(supabaseUrl, 'search-arena', term, 15));
    }
    
    // Openverse - query up to 5 terms (great for museum/vintage)
    for (const term of searchTerms.slice(0, 5)) {
      sourceQueries.push(querySource(supabaseUrl, 'search-openverse', term, 15));
    }
    
    // Unsplash - professional photography (if configured)
    for (const term of searchTerms.slice(0, 3)) {
      sourceQueries.push(querySource(supabaseUrl, 'search-unsplash', term, 15));
    }

    const results = await Promise.all(sourceQueries);
    
    for (const sourceResults of results) {
      allImages.push(...sourceResults);
    }

    console.log(`Collected ${allImages.length} total images from all sources`);

    // Step 3: Deduplicate by URL
    const uniqueImages = Array.from(
      new Map(allImages.map(img => [img.url, img])).values()
    );

    console.log(`${uniqueImages.length} unique images after dedup`);

    // Step 4: Rank for artistic quality
    const rankedImages = await rankForArtisticQuality(uniqueImages, mood, style);

    // Step 5: Select top images ensuring source diversity
    const selected: ImageResult[] = [];
    const sourceCount: Record<string, number> = {};
    const maxPerSource = Math.ceil(targetCount / 2); // Allow up to half from one source

    for (const img of rankedImages) {
      if (selected.length >= targetCount) break;
      
      const count = sourceCount[img.source] || 0;
      if (count < maxPerSource) {
        selected.push(img);
        sourceCount[img.source] = count + 1;
      }
    }

    // If we don't have enough, add more without source limits
    if (selected.length < targetCount) {
      for (const img of rankedImages) {
        if (selected.length >= targetCount) break;
        if (!selected.includes(img)) {
          selected.push(img);
        }
      }
    }

    console.log(`Selected ${selected.length} images for moodboard`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        images: selected,
        searchTerms,
        totalFound: uniqueImages.length,
        sources: Object.keys(sourceCount),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error building moodboard:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

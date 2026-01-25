import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisualAnalysis {
  dominant_colors?: string[];
  color_mood?: string;
  key_elements?: string[];
  composition_style?: string;
  lighting_quality?: string;
  textures?: string[];
  emotional_tone?: string;
  suggested_props?: string[];
  best_for?: string[];
}

interface MoodboardInput {
  id: string;
  name: string;
  description?: string;
  visualAnalysis?: VisualAnalysis;
}

interface ProductDescription {
  summary?: string;
  product_type?: string;
  use_cases?: string[];
  colors?: string[];
  materials?: string[];
  style_keywords?: string[];
  hardware_finish?: string;
  best_for?: string[];
}

interface ProductInput {
  id: string;
  name: string;
  category?: string;
  description?: ProductDescription;
}

interface ConceptInput {
  title: string;
  coreIdea?: string;
  visualWorld?: {
    atmosphere?: string;
    palette?: string[];
    materials?: string[];
    composition?: string;
    mustHave?: string[];
  };
  productFocus?: {
    productCategory?: string;
    visualGuidance?: string;
  };
  targetAudience?: {
    persona?: string;
    situation?: string;
  };
  tonality?: {
    adjectives?: string[];
    neverRules?: string[];
  };
  consumerInsight?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { concept, moodboards, products } = await req.json() as {
      concept: ConceptInput;
      moodboards: MoodboardInput[];
      products: ProductInput[];
    };

    console.log('Smart matching for concept:', concept.title);
    console.log('Available moodboards:', moodboards.length);
    console.log('Available products:', products.length);

    if (!concept) {
      return new Response(
        JSON.stringify({ error: 'No concept provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the matching prompt
    const conceptDescription = [
      `Campaign: "${concept.title}"`,
      concept.coreIdea ? `Core Idea: ${concept.coreIdea}` : '',
      concept.visualWorld?.atmosphere ? `Visual Atmosphere: ${concept.visualWorld.atmosphere}` : '',
      concept.visualWorld?.palette?.length ? `Color Palette: ${concept.visualWorld.palette.join(', ')}` : '',
      concept.visualWorld?.materials?.length ? `Materials: ${concept.visualWorld.materials.join(', ')}` : '',
      concept.productFocus?.productCategory ? `Product Category: ${concept.productFocus.productCategory}` : '',
      concept.targetAudience?.persona ? `Target Persona: ${concept.targetAudience.persona}` : '',
      concept.targetAudience?.situation ? `Situation: ${concept.targetAudience.situation}` : '',
      concept.tonality?.adjectives?.length ? `Tonality: ${concept.tonality.adjectives.join(', ')}` : '',
      concept.consumerInsight ? `Consumer Insight: ${concept.consumerInsight}` : '',
    ].filter(Boolean).join('\n');

    const moodboardsList = moodboards.map((m, i) => {
      const parts = [
        `${i + 1}. ID: "${m.id}" | Name: "${m.name}"`,
      ];
      if (m.description) parts.push(`Description: ${m.description}`);
      
      // Include rich visual analysis for better matching
      if (m.visualAnalysis) {
        const va = m.visualAnalysis;
        if (va.emotional_tone) parts.push(`Mood: ${va.emotional_tone}`);
        if (va.dominant_colors?.length) parts.push(`Colors: ${va.dominant_colors.slice(0, 5).join(', ')}`);
        if (va.key_elements?.length) parts.push(`Elements: ${va.key_elements.slice(0, 5).join(', ')}`);
        if (va.best_for?.length) parts.push(`Best for: ${va.best_for.slice(0, 3).join(', ')}`);
      }
      return parts.join(' | ');
    }).join('\n');

    const productsList = products.map((p, i) => {
      const parts = [`${i + 1}. ID: "${p.id}" | Name: "${p.name}"`];
      if (p.category) parts.push(`Category: ${p.category}`);
      
      // Include rich description data for intelligent matching
      if (p.description) {
        const d = p.description;
        if (d.summary) parts.push(`What it is: ${d.summary}`);
        if (d.product_type) parts.push(`Type: ${d.product_type}`);
        if (d.colors?.length) parts.push(`Colors: ${d.colors.join(', ')}`);
        if (d.materials?.length) parts.push(`Materials: ${d.materials.join(', ')}`);
        if (d.style_keywords?.length) parts.push(`Style: ${d.style_keywords.join(', ')}`);
        if (d.hardware_finish) parts.push(`Hardware: ${d.hardware_finish}`);
        if (d.use_cases?.length) parts.push(`Use cases: ${d.use_cases.join(', ')}`);
        if (d.best_for?.length) parts.push(`Best for: ${d.best_for.join(', ')}`);
      }
      return parts.join(' | ');
    }).join('\n');

    const prompt = `You are a creative director matching campaign concepts to visual assets.

Given this campaign concept:
${conceptDescription}

Rank the BEST options from these libraries:

MOODBOARDS (select top 3 most relevant - pay close attention to the mood, colors, and key elements):
${moodboardsList || '(none available)'}

PRODUCTS (select top 5 most relevant):
${productsList || '(none available)'}

Instructions:
1. For moodboards: Rank the top 3 whose visual analysis (mood, colors, key elements, best_for) best matches the visual world, atmosphere, and tonality of the concept. The #1 should be the absolute best match.
2. For products: Rank the top 5 based on:
   - Visual match: product colors, materials, hardware finish aligning with concept's visual world palette and materials
   - Use case fit: product's best_for and use_cases matching concept's target audience and situation
   - Style coherence: product's style_keywords matching concept's tonality adjectives
   - Product type: matching the concept's product focus category
   The #1 should be the absolute best match across all these dimensions.
3. Be intelligent about semantic matching - understand that "cognac leather with gold hardware" matches "warm, luxurious, elegant" concepts.
4. Return empty arrays if no good matches exist.

Return ONLY valid JSON (no markdown):
{
  "rankedMoodboards": ["id1", "id2", "id3"],
  "rankedProducts": ["id1", "id2", "id3", "id4", "id5"],
  "matchReason": "1-sentence summary of why these were chosen"
}`;

    // Retry logic for AI calls
    let content = '';
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Smart-match AI attempt ${attempts}/${maxAttempts}`);
      
      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { 
                role: 'system', 
                content: 'You are a creative director AI that matches campaign concepts to visual assets. Always respond with valid JSON only, no markdown formatting.' 
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`AI API error (attempt ${attempts}):`, errorText);
          if (attempts >= maxAttempts) {
            throw new Error(`AI API error: ${response.status}`);
          }
          continue;
        }

        const aiResponse = await response.json();
        content = aiResponse.choices?.[0]?.message?.content?.trim() || '';
        
        console.log(`AI response (attempt ${attempts}):`, content.substring(0, 200));

        // Validate response has minimum expected structure
        if (content && content.length > 20 && content.includes('"rankedMoodboards"')) {
          break; // Valid response, exit retry loop
        }
        
        console.log(`Attempt ${attempts}: Empty or invalid AI response, retrying...`);
      } catch (fetchError) {
        console.error(`Fetch error (attempt ${attempts}):`, fetchError);
        if (attempts >= maxAttempts) throw fetchError;
      }
    }

    // Parse the JSON response
    let matchResult;
    
    // Check if we have a valid response to parse
    if (!content || content.length < 20 || !content.includes('{')) {
      console.log('AI returned insufficient response after retries, using fallback');
      // Return graceful fallback with first available items
      matchResult = {
        rankedMoodboards: moodboards.slice(0, 3).map(m => m.id),
        rankedProducts: products.slice(0, 5).map(p => p.id),
        matchReason: 'Using your most recent uploads (AI matching unavailable)'
      };
    } else {
      try {
        // Clean up potential markdown formatting
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        matchResult = JSON.parse(cleanContent);
        
        // Validate parsed result has expected arrays
        if (!matchResult.rankedMoodboards || !matchResult.rankedProducts) {
          console.log('Parsed result missing expected arrays, using fallback');
          matchResult = {
            rankedMoodboards: moodboards.slice(0, 3).map(m => m.id),
            rankedProducts: products.slice(0, 5).map(p => p.id),
            matchReason: 'Using your most recent uploads'
          };
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Return fallback with first available items
        matchResult = {
          rankedMoodboards: moodboards.slice(0, 3).map(m => m.id),
          rankedProducts: products.slice(0, 5).map(p => p.id),
          matchReason: 'Using your most recent uploads'
        };
      }
    }

    // Validate the IDs actually exist and filter to valid ones
    const validMoodboards = (matchResult.rankedMoodboards || [])
      .filter((id: string) => moodboards.some(m => m.id === id))
      .slice(0, 3);
    
    const validProducts = (matchResult.rankedProducts || [])
      .filter((id: string) => products.some(p => p.id === id))
      .slice(0, 5);

    console.log('Match result:', { 
      rankedMoodboards: validMoodboards, 
      rankedProducts: validProducts,
      matchReason: matchResult.matchReason 
    });

    return new Response(
      JSON.stringify({
        rankedMoodboards: validMoodboards,
        rankedProducts: validProducts,
        matchReason: matchResult.matchReason,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Smart match error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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

interface ProductInput {
  id: string;
  name: string;
  category?: string;
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

    const productsList = products.map((p, i) => 
      `${i + 1}. ID: "${p.id}" | Name: "${p.name}"${p.category ? ` | Category: ${p.category}` : ''}`
    ).join('\n');

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
2. For products: Rank the top 5 whose name/category best matches the product focus category. The #1 should be the absolute best match.
3. Be intelligent about semantic matching - match colors, moods, and visual elements not just names.
4. Return empty arrays if no good matches exist.

Return ONLY valid JSON (no markdown):
{
  "rankedMoodboards": ["id1", "id2", "id3"],
  "rankedProducts": ["id1", "id2", "id3", "id4", "id5"],
  "matchReason": "1-sentence summary of why these were chosen"
}`;

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
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content?.trim() || '';
    
    console.log('AI response:', content);

    // Parse the JSON response
    let matchResult;
    try {
      // Clean up potential markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      matchResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return empty result if parsing fails
      matchResult = {
        rankedMoodboards: [],
        rankedProducts: [],
        matchReason: 'Could not determine best matches'
      };
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

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MoodboardInput {
  id: string;
  name: string;
  description?: string;
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

    const moodboardsList = moodboards.map((m, i) => 
      `${i + 1}. ID: "${m.id}" | Name: "${m.name}"${m.description ? ` | Description: ${m.description}` : ''}`
    ).join('\n');

    const productsList = products.map((p, i) => 
      `${i + 1}. ID: "${p.id}" | Name: "${p.name}"${p.category ? ` | Category: ${p.category}` : ''}`
    ).join('\n');

    const prompt = `You are a creative director matching campaign concepts to visual assets.

Given this campaign concept:
${conceptDescription}

Match the BEST moodboard and product from these options:

MOODBOARDS:
${moodboardsList || '(none available)'}

PRODUCTS:
${productsList || '(none available)'}

Instructions:
1. For moodboard: Find the one whose name/description best matches the visual world, atmosphere, and tonality of the concept.
2. For product: Find the one whose name/category best matches the product focus category.
3. Be intelligent about semantic matching - "urban night" matches "Tokyo Nights", "luxury bag" matches "crossbody", etc.
4. If no good match exists for either, return null for that field.

Return ONLY valid JSON (no markdown):
{
  "moodboardId": "the exact id string or null",
  "moodboardReason": "1-sentence reason",
  "productId": "the exact id string or null", 
  "productReason": "1-sentence reason"
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
        moodboardId: null,
        moodboardReason: 'Could not determine best match',
        productId: null,
        productReason: 'Could not determine best match'
      };
    }

    // Validate the IDs actually exist
    const validMoodboardId = moodboards.some(m => m.id === matchResult.moodboardId) 
      ? matchResult.moodboardId 
      : null;
    const validProductId = products.some(p => p.id === matchResult.productId)
      ? matchResult.productId
      : null;

    console.log('Match result:', { 
      moodboardId: validMoodboardId, 
      productId: validProductId,
      moodboardReason: matchResult.moodboardReason,
      productReason: matchResult.productReason 
    });

    return new Response(
      JSON.stringify({
        moodboardId: validMoodboardId,
        moodboardReason: matchResult.moodboardReason,
        productId: validProductId,
        productReason: matchResult.productReason,
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

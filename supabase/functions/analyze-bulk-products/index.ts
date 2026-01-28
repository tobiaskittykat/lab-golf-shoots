import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ImageInput {
  id: string;
  url: string;
}

interface ProductAnalysis {
  summary: string;
  product_type: string;
  colors: string[];
  materials: string[];
  style_keywords: string[];
  hardware_finish?: string;
  detected_angle: string;
}

interface ProductGroup {
  suggestedName: string;
  suggestedSku: string;
  confidence: number;
  images: Array<{
    id: string;
    url: string;
    detectedAngle: string;
    angleConfidence: number;
  }>;
  productAnalysis: ProductAnalysis;
}

async function analyzeAndGroupProducts(images: ImageInput[], apiKey: string): Promise<{
  groups: ProductGroup[];
  ungrouped: Array<{ id: string; url: string; reason: string }>;
}> {
  console.log(`Analyzing ${images.length} images for grouping...`);

  // Prepare image content for multimodal analysis
  const imageContents = images.map((img, idx) => ([
    {
      type: 'image_url',
      image_url: { url: img.url }
    },
    {
      type: 'text',
      text: `Image ID: ${img.id} (Image ${idx + 1})`
    }
  ])).flat();

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `You are a product analyst specializing in fashion, footwear, and accessories.
Analyze multiple product images and group them by which images show the SAME product from different angles.

For each product you identify:
1. Suggest a descriptive name (e.g., "Boston Brown Oiled Leather Clog")
2. Suggest a SKU code (e.g., "BIRK-BOSTON-BRN")
3. Detect the camera angle for each image

Angle detection guide:
- "front": product facing camera directly
- "side": product rotated ~90°, profile view
- "back": rear view visible
- "3/4": angled view between front and side
- "top": overhead/bird's eye view
- "sole": bottom of shoe visible
- "detail": close-up of specific feature

Group images that show the EXACT same product (same color, same model, same size).
If uncertain, keep images ungrouped.`
        },
        {
          role: 'user',
          content: [
            ...imageContents,
            {
              type: 'text',
              text: `Analyze these ${images.length} product images. Group images that show the SAME product from different angles. Call the group_products function with your analysis.`
            }
          ]
        }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'group_products',
            description: 'Group product images by product identity and analyze each',
            parameters: {
              type: 'object',
              properties: {
                groups: {
                  type: 'array',
                  description: 'Groups of images showing the same product',
                  items: {
                    type: 'object',
                    properties: {
                      suggestedName: {
                        type: 'string',
                        description: 'Descriptive product name'
                      },
                      suggestedSku: {
                        type: 'string',
                        description: 'Suggested SKU code (uppercase, dashes)'
                      },
                      confidence: {
                        type: 'number',
                        description: 'Confidence in grouping (0-100)'
                      },
                      imageIds: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'IDs of images in this group'
                      },
                      imageAngles: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            angle: { type: 'string' },
                            angleConfidence: { type: 'number' }
                          }
                        },
                        description: 'Detected angle for each image'
                      },
                      productAnalysis: {
                        type: 'object',
                        properties: {
                          summary: { type: 'string' },
                          product_type: { type: 'string' },
                          colors: { type: 'array', items: { type: 'string' } },
                          materials: { type: 'array', items: { type: 'string' } },
                          style_keywords: { type: 'array', items: { type: 'string' } },
                          hardware_finish: { type: 'string' }
                        }
                      }
                    },
                    required: ['suggestedName', 'suggestedSku', 'confidence', 'imageIds', 'imageAngles', 'productAnalysis']
                  }
                },
                ungrouped: {
                  type: 'array',
                  description: 'Images that could not be confidently grouped',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      reason: { type: 'string' }
                    }
                  }
                }
              },
              required: ['groups', 'ungrouped']
            }
          }
        }
      ],
      tool_choice: { type: 'function', function: { name: 'group_products' } },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI API error:', errorText);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall?.function?.arguments) {
    console.error('No tool call in response');
    throw new Error('AI did not return grouping results');
  }

  const result = JSON.parse(toolCall.function.arguments);
  console.log(`AI found ${result.groups?.length || 0} product groups, ${result.ungrouped?.length || 0} ungrouped`);

  // Map image IDs back to URLs
  const imageMap = new Map(images.map(img => [img.id, img.url]));

  const groups: ProductGroup[] = (result.groups || []).map((group: any) => ({
    suggestedName: group.suggestedName,
    suggestedSku: group.suggestedSku,
    confidence: group.confidence,
    images: (group.imageAngles || []).map((ia: any) => ({
      id: ia.id,
      url: imageMap.get(ia.id) || '',
      detectedAngle: ia.angle,
      angleConfidence: ia.angleConfidence || 80,
    })),
    productAnalysis: {
      summary: group.productAnalysis?.summary || '',
      product_type: group.productAnalysis?.product_type || '',
      colors: group.productAnalysis?.colors || [],
      materials: group.productAnalysis?.materials || [],
      style_keywords: group.productAnalysis?.style_keywords || [],
      hardware_finish: group.productAnalysis?.hardware_finish,
      detected_angle: 'multiple',
    },
  }));

  const ungrouped = (result.ungrouped || []).map((u: any) => ({
    id: u.id,
    url: imageMap.get(u.id) || '',
    reason: u.reason || 'Could not determine product identity',
  }));

  return { groups, ungrouped };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'images array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (images.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Maximum 20 images per batch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing bulk analysis for ${images.length} images`);
    const result = await analyzeAndGroupProducts(images, apiKey);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

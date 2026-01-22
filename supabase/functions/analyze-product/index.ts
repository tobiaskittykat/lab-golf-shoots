import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductDescription {
  summary: string;
  product_type: string;
  use_cases: string[];
  colors: string[];
  materials: string[];
  style_keywords: string[];
  hardware_finish?: string;
  best_for: string[];
}

async function analyzeProductImage(imageUrl: string, apiKey: string): Promise<ProductDescription | null> {
  try {
    console.log('Analyzing product image:', imageUrl);

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
            content: `You are a product analyst specializing in fashion accessories and leather goods. 
Analyze product images to extract detailed visual and functional information.
Be specific about colors (e.g., "cognac brown" not just "brown"), materials (e.g., "pebbled leather" not just "leather"), and style.
Focus on what makes this product unique and when/how it would be used.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              },
              {
                type: 'text',
                text: `Analyze this product image and extract detailed information. Call the extract_product_analysis function with your findings.`
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_product_analysis',
              description: 'Extract structured product analysis from the image',
              parameters: {
                type: 'object',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'One-sentence description of what this product IS and its primary function (e.g., "Elegant crossbody phone case with detachable gold chain strap for hands-free carrying")'
                  },
                  product_type: {
                    type: 'string',
                    description: 'Specific product type (e.g., "crossbody phone case", "leather strap", "card wallet", "pouch")'
                  },
                  use_cases: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'How/when someone would use this product (e.g., "hands-free phone carrying", "evening events", "travel", "everyday use")'
                  },
                  colors: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Specific colors visible (e.g., "cognac brown", "black", "gold", "rose gold", "cream")'
                  },
                  materials: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Materials visible with descriptors (e.g., "pebbled leather", "smooth leather", "gold chain", "metal hardware", "woven fabric")'
                  },
                  style_keywords: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Style descriptors (e.g., "elegant", "casual", "edgy", "minimalist", "bohemian", "classic", "modern")'
                  },
                  hardware_finish: {
                    type: 'string',
                    description: 'Metal hardware finish if visible (e.g., "gold", "silver", "chrome", "rose gold", "gunmetal", "antique brass")'
                  },
                  best_for: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Best scenarios/audiences for this product (e.g., "professional settings", "date night", "everyday luxury", "casual outings", "travel")'
                  }
                },
                required: ['summary', 'product_type', 'colors', 'materials', 'style_keywords', 'best_for']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_product_analysis' } },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return null;
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error('No tool call in response');
      return null;
    }

    const analysis = JSON.parse(toolCall.function.arguments) as ProductDescription;
    console.log('Product analysis complete:', analysis.summary);
    return analysis;

  } catch (error) {
    console.error('Error analyzing product:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { imageUrl, batch, productIds } = await req.json();

    // Single product analysis
    if (imageUrl && !batch) {
      const description = await analyzeProductImage(imageUrl, apiKey);
      
      return new Response(
        JSON.stringify({ success: true, description }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch analysis mode - analyze multiple products by ID
    if (batch && productIds?.length) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Fetch products that need analysis
      const { data: products, error } = await supabase
        .from('scraped_products')
        .select('id, thumbnail_url')
        .in('id', productIds)
        .is('description', null);

      if (error) {
        throw error;
      }

      console.log(`Batch analyzing ${products?.length || 0} products`);

      const results: { id: string; success: boolean }[] = [];

      for (const product of products || []) {
        const description = await analyzeProductImage(product.thumbnail_url, apiKey);
        
        if (description) {
          const { error: updateError } = await supabase
            .from('scraped_products')
            .update({ description })
            .eq('id', product.id);

          results.push({ id: product.id, success: !updateError });
          if (updateError) {
            console.error(`Failed to update product ${product.id}:`, updateError);
          }
        } else {
          results.push({ id: product.id, success: false });
        }
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`Batch complete: ${successCount}/${results.length} analyzed`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          analyzed: successCount,
          total: results.length,
          results 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'imageUrl or batch mode required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analyze product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert footwear analyst specializing in Birkenstock and similar sandals/clogs. 
Analyze the provided product images to identify EACH COMPONENT of the shoe.

For EACH component, extract:
1. Material type (be specific: "oiled leather" not just "leather")
2. Color (use descriptive names: "tobacco brown" not just "brown")
3. An approximate hex color code for UI display
4. Your confidence in the identification (0-100)

COMPONENTS TO IDENTIFY:

**UPPER** (Required)
The main body of the shoe that covers/surrounds the foot.
Common materials: Suede, Oiled Leather, Smooth Leather, Nubuck, Birko-Flor, Birkibuc, Wool Felt, EVA, Patent Leather, Shearling

**FOOTBED** (Required)
The interior surface the foot rests on.
Look for: Cork-latex (visible cork texture), Soft Footbed (blue label visible), EVA (smooth/molded), Leather-wrapped (Exquisite line)
Color is usually natural cork brown or cream if shearling-lined

**SOLE** (Required)
The bottom outsole of the shoe.
Common types: EVA (lightweight, textured), Rubber (heavier, grip pattern), PU (Super Birki style)
Colors: Usually black, brown, white, or tan

**BUCKLES** (Optional - only if present)
Adjustment hardware on straps.
Types: Metal (brass/gold, silver, copper, antique brass) or Matte Plastic (EVA models)
Note: Some styles like the Boston clog have 1 buckle, Arizona has 2

**HEELSTRAP** (Optional - only if present)
Back strap that wraps behind the heel.
Note: Clogs (Boston, Kyoto) do NOT have heelstraps. Sandals (Arizona, Florida) DO have heelstraps.
Material usually matches the upper.

**LINING** (Optional - only if visible/present)
Interior lining material.
Types: Shearling (fluffy, cream or black), Wool Felt, Suede (thin), Microfiber
Note: Many styles have no lining - just exposed cork footbed

IMPORTANT:
- Analyze ALL provided images to get the most accurate assessment
- If a component is not visible or doesn't exist for this shoe type, return null for that component
- Be very specific about colors - "tobacco brown oiled leather" is better than "brown"
- For buckles, note the finish/color of the metal
- Provide hex codes that best represent the actual color you see`;

const TOOL_DEFINITION = {
  name: "extract_shoe_components",
  description: "Extract detailed shoe component information from product images",
  parameters: {
    type: "object",
    properties: {
      upper: {
        type: "object",
        properties: {
          material: { type: "string", description: "Specific material type (e.g., 'Oiled Leather', 'Suede')" },
          color: { type: "string", description: "Descriptive color name (e.g., 'Tobacco Brown')" },
          colorHex: { type: "string", description: "Approximate hex color code (e.g., '#6F4E37')" },
          confidence: { type: "number", description: "0-100 confidence score" },
          notes: { type: "string", description: "Any relevant observations" }
        },
        required: ["material", "color", "confidence"]
      },
      footbed: {
        type: "object",
        properties: {
          material: { type: "string" },
          color: { type: "string" },
          colorHex: { type: "string" },
          confidence: { type: "number" },
          notes: { type: "string" }
        },
        required: ["material", "color", "confidence"]
      },
      sole: {
        type: "object",
        properties: {
          material: { type: "string" },
          color: { type: "string" },
          colorHex: { type: "string" },
          confidence: { type: "number" },
          notes: { type: "string" }
        },
        required: ["material", "color", "confidence"]
      },
      buckles: {
        type: ["object", "null"],
        properties: {
          material: { type: "string" },
          color: { type: "string" },
          colorHex: { type: "string" },
          confidence: { type: "number" },
          notes: { type: "string" }
        }
      },
      heelstrap: {
        type: ["object", "null"],
        properties: {
          material: { type: "string" },
          color: { type: "string" },
          colorHex: { type: "string" },
          confidence: { type: "number" },
          notes: { type: "string" }
        }
      },
      lining: {
        type: ["object", "null"],
        properties: {
          material: { type: "string" },
          color: { type: "string" },
          colorHex: { type: "string" },
          confidence: { type: "number" },
          notes: { type: "string" }
        }
      }
    },
    required: ["upper", "footbed", "sole"]
  }
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { skuId } = await req.json();
    
    if (!skuId) {
      return new Response(
        JSON.stringify({ error: "skuId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[analyze-shoe-components] Starting analysis for SKU: ${skuId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch SKU and its product images
    const { data: sku, error: skuError } = await supabase
      .from("product_skus")
      .select("id, name, components")
      .eq("id", skuId)
      .single();

    if (skuError || !sku) {
      console.error("[analyze-shoe-components] SKU not found:", skuError);
      return new Response(
        JSON.stringify({ error: "SKU not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch product images for this SKU
    const { data: products, error: prodError } = await supabase
      .from("scraped_products")
      .select("thumbnail_url, angle")
      .eq("sku_id", skuId)
      .limit(10);

    if (prodError || !products || products.length === 0) {
      console.error("[analyze-shoe-components] No product images found:", prodError);
      return new Response(
        JSON.stringify({ error: "No product images found for SKU" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageUrls = products.map(p => p.thumbnail_url).filter(Boolean);
    console.log(`[analyze-shoe-components] Found ${imageUrls.length} images to analyze`);

    // Build multimodal content for Gemini
    const content: any[] = [
      { type: "text", text: `Analyze these product images of "${sku.name}" and extract the shoe components.` }
    ];

    // Add all images
    for (const url of imageUrls) {
      content.push({
        type: "image_url",
        image_url: { url }
      });
    }

    content.push({
      type: "text",
      text: "Based on all the images above, identify each component of this shoe using the extract_shoe_components tool."
    });

    // Call Gemini via Lovable AI Gateway
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content }
        ],
        tools: [{ type: "function", function: TOOL_DEFINITION }],
        tool_choice: { type: "function", function: { name: "extract_shoe_components" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[analyze-shoe-components] AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log("[analyze-shoe-components] AI response received");

    // Extract tool call result
    let components = null;
    const toolCalls = aiResult.choices?.[0]?.message?.tool_calls;
    
    if (toolCalls && toolCalls.length > 0) {
      try {
        components = JSON.parse(toolCalls[0].function.arguments);
        console.log("[analyze-shoe-components] Parsed components:", JSON.stringify(components, null, 2));
      } catch (parseError) {
        console.error("[analyze-shoe-components] Failed to parse tool call:", parseError);
      }
    }

    if (!components) {
      console.error("[analyze-shoe-components] No valid component data extracted");
      return new Response(
        JSON.stringify({ error: "Failed to extract component data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add metadata
    const componentsWithMeta = {
      ...components,
      analyzedAt: new Date().toISOString(),
      analysisVersion: "1.0",
    };

    // Save to database
    const { error: updateError } = await supabase
      .from("product_skus")
      .update({ components: componentsWithMeta })
      .eq("id", skuId);

    if (updateError) {
      console.error("[analyze-shoe-components] Failed to save components:", updateError);
      throw updateError;
    }

    console.log(`[analyze-shoe-components] Successfully analyzed and saved components for SKU: ${skuId}`);

    return new Response(
      JSON.stringify({ success: true, components: componentsWithMeta }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[analyze-shoe-components] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

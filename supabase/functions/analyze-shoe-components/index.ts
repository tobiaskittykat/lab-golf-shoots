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
Note for thong-style sandals (Gizeh, Ramses): The small pin/rivet 
at the top of the toe post is part of the buckle hardware system. It should 
match the buckle finish (e.g., both brass, both silver). Report the buckle 
material/color to cover both the strap buckle AND the toe post pin.
Note: Crossover-strap sandals like the Mayari do NOT have a toe post or pin.

**HEELSTRAP** (Optional - only if present)
Back strap that wraps behind the heel.
Note: Clogs like the Boston and Kyoto do NOT have heelstraps. However, the Tokyo (a Boston-style clog with a back strap) DOES have a heelstrap. Some sandals like the Florida and Milano have heelstraps. Slide sandals like the Arizona and Madrid do NOT have heelstraps — they are open-back. Analyze the images to determine if a back strap is actually present.
Material usually matches the upper.

**LINING** (Required for most models)
The thin surface layer on TOP of the footbed that the foot directly touches.
IMPORTANT: Nearly ALL standard Birkenstock models have a suede lining on the footbed.
This is a thin microfiber/suede layer on top of the cork-latex base — it is NOT the cork itself.
Types: Suede (most common — thin, soft nap texture on footbed surface), 
       Shearling (fluffy, cream or black — winter models), 
       Wool Felt, Microfiber
Color: Usually natural tan/sand for suede, cream for shearling, black for dark shearling
Only return null for fully molded EVA shoes (e.g. Arizona EVA) where the entire shoe 
is one-piece plastic with no separate lining layer.

**BRANDING** (Required)
Carefully inspect ALL visible branding, logos, text, and engravings across the shoe.
⚠️ PRECISION IS CRITICAL: Read the EXACT text on each element. "BIRKEN" is NOT the same as "BIRKENSTOCK". "BIRK" is NOT the same as "BIRKEN". Report EXACTLY what you see — character by character.

For Birkenstock models, pay close attention to:
- **Footbed text**: Usually "BIRKENSTOCK" + "MADE IN GERMANY" embossed on the footbed. Report exact words.
- **Footbed logo**: The Birkenstock footprint logo — describe its appearance (stamped, embossed, color).
- **Buckle engravings**: Each buckle bar may have DIFFERENT text. Many models do NOT say "BIRKENSTOCK" on buckles. Instead they often have abbreviated text like "BIRKEN" on the larger buckle and "BIRK" on the smaller buckle bar. Inspect each buckle individually and report the EXACT text on each.
- If text is not clearly legible, report what you can see and note uncertainty.

IMPORTANT:
- Analyze ALL provided images to get the most accurate assessment
- If a component is not visible or doesn't exist for this shoe type, return null for that component
- Be very specific about colors - "tobacco brown oiled leather" is better than "brown"
- For buckles, note the finish/color of the metal
- Provide hex codes that best represent the actual color you see
- For thong-style sandals (Gizeh, Ramses): the toe post STRAP typically matches the SOLE color, 
  while the toe post PIN/RIVET matches the BUCKLE hardware finish.
- Crossover-strap sandals (Mayari, Yao) do NOT have a toe post or pin — do not describe one.

STRAP CONSTRUCTION: Identify the construction type from the images:
- 'thong' = has a toe post strap between big and second toe (e.g., Gizeh, Ramses)
- 'crossover' = straps cross over the foot without a toe post (e.g., Mayari, Yao)
- 'single-strap' = one wide strap (e.g., Madrid)
- 'two-strap' = two parallel straps (e.g., Arizona, Milano)
- 'clog' = enclosed upper (e.g., Boston, Kyoto)
- 'slip-on' = no straps or buckles
- 'other' = anything else`;

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
      },
      strapConstruction: {
        type: "string",
        enum: ["thong", "crossover", "single-strap", "two-strap", "clog", "slip-on", "other"],
        description: "The strap construction type of the shoe. 'thong' = has a toe post strap between big and second toe (e.g., Gizeh, Ramses). 'crossover' = straps cross over the foot without a toe post (e.g., Mayari, Yao). 'single-strap' = one wide strap (e.g., Madrid). 'two-strap' = two parallel straps (e.g., Arizona, Milano). 'clog' = enclosed upper (e.g., Boston, Kyoto). 'slip-on' = no straps or buckles. 'other' = anything else."
      },
      branding: {
        type: "object",
        description: "All visible branding, logos, text, and engravings on the shoe",
        properties: {
          footbedText: { 
            type: "string", 
            description: "Exact text embossed/printed on the footbed (e.g., 'BIRKENSTOCK' + 'MADE IN GERMANY')" 
          },
          footbedLogo: { 
            type: "string", 
            description: "Description of the footbed logo (e.g., 'Footprint logo stamped in dark ink')" 
          },
          buckleEngravings: {
            type: "array",
            description: "Array of engravings found on each buckle bar. Different buckles often have DIFFERENT text.",
            items: {
              type: "object",
              properties: {
                location: { type: "string", description: "Which buckle (e.g., 'larger strap buckle bar', 'smaller buckle bar', 'single buckle')" },
                text: { type: "string", description: "EXACT text engraved (e.g., 'BIRKEN', 'BIRK', 'BIRKENSTOCK')" },
                style: { type: "string", description: "Engraving style (e.g., 'embossed serif capitals', 'debossed sans-serif')" }
              },
              required: ["location", "text", "style"]
            }
          },
          otherBranding: {
            type: "string",
            description: "Any other branding marks not covered above (e.g., insole printing, tag text)"
          }
        },
        required: ["footbedText", "buckleEngravings"]
      }
    },
    required: ["upper", "footbed", "sole", "branding", "strapConstruction"]
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
      { type: "text", text: `Analyze these product images of "${sku.name}" and extract the shoe components. Pay VERY close attention to branding: read the EXACT text on each buckle bar, the footbed wordmark, and any other visible branding marks. "BIRKEN" is NOT "BIRKENSTOCK" — report exactly what you see.` }
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
      text: "Based on all the images above, identify each component of this shoe AND all branding/engravings using the extract_shoe_components tool. Remember: inspect each buckle bar individually for its specific engraved text."
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
      analysisVersion: "1.3",
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

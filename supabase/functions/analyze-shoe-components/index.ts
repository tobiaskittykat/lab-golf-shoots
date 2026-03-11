import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { skuId } = await req.json();

    if (!skuId) throw new Error("skuId is required");

    // Get SKU and its product images
    const { data: sku } = await supabase.from("product_skus").select("*").eq("id", skuId).single();
    if (!sku) throw new Error("SKU not found");

    const { data: products } = await supabase.from("scraped_products")
      .select("thumbnail_url, full_url")
      .eq("sku_id", skuId)
      .limit(5);

    const imageUrls: string[] = [];
    if (sku.composite_image_url) imageUrls.push(sku.composite_image_url);
    if (products) {
      for (const p of products) {
        const url = (p as any).full_url || (p as any).thumbnail_url;
        if (url && !imageUrls.includes(url)) imageUrls.push(url);
      }
    }

    if (imageUrls.length === 0) throw new Error("No images found for analysis");

    const content: any[] = [
      { type: "text", text: `Analyze this footwear product and identify its components. For each component, determine the material and color.

Components to identify:
- upper: The main body/straps of the shoe
- footbed: The inner sole/bed
- sole: The outer bottom sole
- buckles: Any buckle hardware (null if none)
- heelstrap: Back heel strap (null if none)
- lining: Inner lining material (null if not visible)

For each component, provide material name, color name, and hex color code.` },
      ...imageUrls.slice(0, 4).map((url: string) => ({ type: "image_url", image_url: { url } })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content }],
        tools: [{
          type: "function",
          function: {
            name: "return_components",
            description: "Return shoe component analysis",
            parameters: {
              type: "object",
              properties: {
                upper: { type: "object", properties: { material: { type: "string" }, color: { type: "string" }, colorHex: { type: "string" }, confidence: { type: "number" } }, required: ["material", "color", "confidence"] },
                footbed: { type: "object", properties: { material: { type: "string" }, color: { type: "string" }, colorHex: { type: "string" }, confidence: { type: "number" } }, required: ["material", "color", "confidence"] },
                sole: { type: "object", properties: { material: { type: "string" }, color: { type: "string" }, colorHex: { type: "string" }, confidence: { type: "number" } }, required: ["material", "color", "confidence"] },
                buckles: { type: "object", properties: { material: { type: "string" }, color: { type: "string" }, colorHex: { type: "string" }, confidence: { type: "number" } }, nullable: true },
                heelstrap: { type: "object", properties: { material: { type: "string" }, color: { type: "string" }, colorHex: { type: "string" }, confidence: { type: "number" } }, nullable: true },
                lining: { type: "object", properties: { material: { type: "string" }, color: { type: "string" }, colorHex: { type: "string" }, confidence: { type: "number" } }, nullable: true },
              },
              required: ["upper", "footbed", "sole"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_components" } },
      }),
    });

    if (!response.ok) throw new Error("Component analysis failed");

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const components = JSON.parse(toolCall.function.arguments);
      components.analyzedAt = new Date().toISOString();
      components.analysisVersion = "1.0";

      await supabase.from("product_skus").update({ components }).eq("id", skuId);

      return new Response(JSON.stringify({ success: true, components }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No analysis result");
  } catch (e) {
    console.error("analyze-shoe-components error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

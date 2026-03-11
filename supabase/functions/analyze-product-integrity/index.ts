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
    const { imageId, generatedImageUrl, productReferenceUrls, productName } = await req.json();

    if (!imageId || !generatedImageUrl || !productReferenceUrls?.length) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content: any[] = [
      { type: "text", text: `Compare the generated product image against the reference product images. Score the fidelity of the generated image on these dimensions (0-100 each):

1. Color Match: How accurately do the colors of the product match?
2. Silhouette Match: How well does the overall shape/silhouette match?
3. Feature Match: Are details like buckles, straps, stitching preserved?
4. Material Match: Does the material texture/appearance match?

Also list any specific issues found.
${productName ? `Product: ${productName}` : ''}` },
      { type: "image_url", image_url: { url: generatedImageUrl } },
      ...productReferenceUrls.slice(0, 3).map((url: string) => ({
        type: "image_url", image_url: { url },
      })),
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
            name: "return_integrity",
            description: "Return product integrity analysis results",
            parameters: {
              type: "object",
              properties: {
                score: { type: "number", description: "Overall score 0-100" },
                passesCheck: { type: "boolean" },
                issues: { type: "array", items: { type: "string" } },
                details: {
                  type: "object",
                  properties: {
                    colorMatch: { type: "object", properties: { score: { type: "number" }, notes: { type: "string" } } },
                    silhouetteMatch: { type: "object", properties: { score: { type: "number" }, notes: { type: "string" } } },
                    featureMatch: { type: "object", properties: { score: { type: "number" }, notes: { type: "string" } } },
                    materialMatch: { type: "object", properties: { score: { type: "number" }, notes: { type: "string" } } },
                  },
                },
              },
              required: ["score", "passesCheck", "issues", "details"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_integrity" } },
      }),
    });

    if (!response.ok) {
      console.error("Integrity analysis AI error:", response.status);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      result.analyzedAt = new Date().toISOString();

      await supabase.from("generated_images").update({
        integrity_analysis: result,
      }).eq("id", imageId);

      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "No analysis result" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-product-integrity error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

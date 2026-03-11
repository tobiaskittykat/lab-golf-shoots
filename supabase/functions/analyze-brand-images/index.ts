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
    const { brandId, imageId, regenerateBrain } = await req.json();

    if (!brandId) throw new Error("brandId is required");

    // Get brand info
    const { data: brand } = await supabase.from("brands").select("*").eq("id", brandId).single();
    if (!brand) throw new Error("Brand not found");

    // Get brand images
    const { data: images } = await supabase.from("brand_images").select("*").eq("brand_id", brandId).order("created_at", { ascending: false });

    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ message: "No images to analyze" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If single image analysis (not regenerate brain)
    if (imageId && !regenerateBrain) {
      const image = images.find((i: any) => i.id === imageId);
      if (!image) throw new Error("Image not found");

      const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Analyze this brand image. Return a JSON with: dominant_colors (hex array), color_mood, key_elements, composition_style, lighting_quality, textures, emotional_tone, suggested_props, best_for (array of use cases)." },
              { type: "image_url", image_url: { url: image.image_url } },
            ],
          }],
          tools: [{
            type: "function",
            function: {
              name: "return_analysis",
              description: "Return image analysis",
              parameters: {
                type: "object",
                properties: {
                  dominant_colors: { type: "array", items: { type: "string" } },
                  color_mood: { type: "string" },
                  key_elements: { type: "array", items: { type: "string" } },
                  composition_style: { type: "string" },
                  lighting_quality: { type: "string" },
                  textures: { type: "array", items: { type: "string" } },
                  emotional_tone: { type: "string" },
                },
                required: ["dominant_colors", "color_mood"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "return_analysis" } },
        }),
      });

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        const toolCall = analysisData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          const analysis = JSON.parse(toolCall.function.arguments);
          await supabase.from("brand_images").update({ visual_analysis: analysis }).eq("id", imageId);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Regenerate Brand Brain - analyze all images together
    const imageUrls = images.slice(0, 10).map((i: any) => i.image_url).filter(Boolean);

    if (imageUrls.length === 0) {
      return new Response(JSON.stringify({ message: "No image URLs found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brainContent: any[] = [
      { type: "text", text: `Analyze these ${imageUrls.length} brand images for "${brand.name}" to create a comprehensive Brand Brain visual identity profile. Return structured data about the brand's visual DNA including color palette, photography style, lighting, composition, and model styling preferences.` },
      ...imageUrls.map((url: string) => ({ type: "image_url", image_url: { url } })),
    ];

    const brainResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: brainContent }],
        tools: [{
          type: "function",
          function: {
            name: "return_brand_brain",
            description: "Return the Brand Brain analysis",
            parameters: {
              type: "object",
              properties: {
                visualDNA: {
                  type: "object",
                  properties: {
                    colorPalette: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        foundation: { type: "array", items: { type: "string" } },
                        accents: { type: "array", items: { type: "string" } },
                      },
                    },
                    colorMood: { type: "string" },
                    photographyStyle: { type: "string" },
                    texturePreferences: { type: "array", items: { type: "string" } },
                    lightingStyle: { type: "string" },
                    compositionStyle: { type: "string" },
                    avoidElements: { type: "array", items: { type: "string" } },
                  },
                },
                brandVoice: {
                  type: "object",
                  properties: {
                    personality: { type: "string" },
                    toneDescriptors: { type: "array", items: { type: "string" } },
                    messagingStyle: { type: "string" },
                  },
                },
                creativeDirectionSummary: { type: "string" },
              },
              required: ["visualDNA", "brandVoice", "creativeDirectionSummary"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_brand_brain" } },
      }),
    });

    if (!brainResponse.ok) {
      const errText = await brainResponse.text();
      console.error("Brain analysis error:", brainResponse.status, errText);
      throw new Error("Failed to analyze brand images");
    }

    const brainData = await brainResponse.json();
    const brainToolCall = brainData.choices?.[0]?.message?.tool_calls?.[0];
    let brandBrain = null;

    if (brainToolCall?.function?.arguments) {
      brandBrain = JSON.parse(brainToolCall.function.arguments);
      brandBrain.generatedAt = new Date().toISOString();

      // Save to brand context
      const existingContext = brand.brand_context || {};
      await supabase.from("brands").update({
        brand_context: { ...existingContext, brandBrain },
      }).eq("id", brandId);
    }

    return new Response(JSON.stringify({ brandBrain, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-brand-images error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

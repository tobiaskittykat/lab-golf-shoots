import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Classify this scene image. Return category, name, and region." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        }],
        tools: [{
          type: "function",
          function: {
            name: "classify",
            description: "Classify the scene",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string", enum: ["indoor", "outdoor-urban", "outdoor-nature", "cafe-restaurant", "retail-store", "home", "workspace", "beach-pool", "other"] },
                name: { type: "string", description: "Short descriptive name" },
                region: { type: "string", enum: ["usa", "europe", "apac", "mea", "all"] },
              },
              required: ["category", "name", "region"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify" } },
      }),
    });

    if (!response.ok) throw new Error("Classification failed");

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ category: "other", name: "Uploaded Scene", region: "all" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-scene error:", e);
    return new Response(JSON.stringify({ category: "other", name: "Uploaded Scene", region: "all" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

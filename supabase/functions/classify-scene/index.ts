import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = [
  "indoor",
  "outdoor-urban",
  "outdoor-nature",
  "cafe-restaurant",
  "retail-store",
  "home",
  "workspace",
  "beach-pool",
  "other",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
                {
                  type: "text",
                  text: `Classify this scene image. Return a JSON object with three fields:
1. "category": exactly one of: ${CATEGORIES.join(", ")}
2. "name": a short descriptive name for the scene (3-5 words, e.g. "Sunlit Kitchen Counter", "Urban Brick Alley")
3. "region": the likely geographic region based on visual cues (architecture, signage, vegetation, cultural context). One of: usa, europe, apac, mea, all. Use "all" if region is ambiguous.

Return ONLY the JSON object, no markdown.`,
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "classify_scene",
                description: "Classify a scene image into a category and give it a name",
                parameters: {
                  type: "object",
                  properties: {
                    category: {
                      type: "string",
                      enum: CATEGORIES,
                    },
                    name: {
                      type: "string",
                      description: "Short descriptive name, 3-5 words",
                    },
                  },
                    region: {
                      type: "string",
                      enum: ["usa", "europe", "apac", "mea", "all"],
                      description: "Geographic region based on visual cues",
                    },
                  },
                  required: ["category", "name", "region"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "classify_scene" } },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      // Fallback
      return new Response(
        JSON.stringify({ category: "other", name: "Uploaded Scene", region: "all" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      const category = CATEGORIES.includes(parsed.category) ? parsed.category : "other";
      const name = parsed.name || "Uploaded Scene";
      const region = ["usa", "europe", "apac", "mea", "all"].includes(parsed.region) ? parsed.region : "all";
      return new Response(JSON.stringify({ category, name, region }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback if no tool call
    return new Response(
      JSON.stringify({ category: "other", name: "Uploaded Scene", region: "all" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("classify-scene error:", e);
    return new Response(
      JSON.stringify({ category: "other", name: "Uploaded Scene", region: "all" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

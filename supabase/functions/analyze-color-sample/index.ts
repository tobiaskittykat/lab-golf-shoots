import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Material lists per component (mirrors birkenstockMaterials.ts)
const COMPONENT_MATERIALS: Record<string, string[]> = {
  upper: [
    "Oiled Leather", "Smooth Leather", "Nubuck", "Suede", "Patent Leather", "Shearling",
    "Birko-Flor", "Birko-Flor Nubuck", "Birko-Flor Patent", "Birkibuc", "EVA",
    "Wool Felt", "Canvas", "Fabric", "Mesh", "Recycled PET",
  ],
  footbed: ["Cork-Latex", "Soft Footbed", "EVA", "Exquisite"],
  sole: ["EVA", "Rubber", "Polyurethane", "Cork"],
  buckles: [
    "Metal (Brass)", "Metal (Silver)", "Metal (Copper)", "Metal (Rose Gold)",
    "Antique Brass", "Metal (Custom)", "Metal (Coordinated)",
    "Matte Plastic", "Matte Plastic (Coordinated)",
    "Translucent", "Translucent (Coordinated)", "Metallic Big Buckle",
  ],
  heelstrap: ["Suede", "Oiled Leather", "Smooth Leather", "Nubuck", "Birko-Flor", "Birko-Flor Nubuck"],
  lining: ["Shearling (Cream)", "Shearling (Black)", "Suede", "Wool Felt", "Microfiber", "EVA"],
};

const COLOR_PRESET_NAMES = [
  "Taupe", "Tobacco", "Mocha", "Stone", "Black", "Habana", "Cognac", "Sand",
  "White", "Navy", "Antique White", "Chocolate", "Cork Brown", "Cream",
  "Anthracite", "Desert Soil", "Iron", "Mink", "Port", "Thyme",
  "Apricot", "Coral", "Peach", "Rose Gold", "Blush",
  "Baby Blue", "Sky Blue", "Light Blue", "Powder Blue", "Royal Blue", "Dusty Blue",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate user
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl, componentType } = await req.json();
    if (!imageUrl || !componentType) {
      return new Response(JSON.stringify({ error: "imageUrl and componentType required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const materials = COMPONENT_MATERIALS[componentType] || COMPONENT_MATERIALS.upper;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a material and color identification expert for footwear components. Analyze the uploaded swatch image and identify the material type and color. Pick from the provided material list when possible. For colors, try to match a known preset name, or provide a descriptive name with hex code.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this color/material swatch for a shoe ${componentType} component.\n\nAvailable materials for ${componentType}: ${materials.join(", ")}\n\nKnown color preset names: ${COLOR_PRESET_NAMES.join(", ")}\n\nIdentify the material and color from this swatch image. Pick the closest matching material from the list. For color, use a preset name if it's a close match, otherwise provide a descriptive name. Always provide an accurate hex code.`,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "identify_material_color",
              description: "Identify the material type and color from the swatch image",
              parameters: {
                type: "object",
                properties: {
                  material: {
                    type: "string",
                    description: `Best matching material from: ${materials.join(", ")}`,
                  },
                  color: {
                    type: "string",
                    description: "Color name - use a known preset name if close, otherwise descriptive",
                  },
                  colorHex: {
                    type: "string",
                    description: "Hex color code like #8B4513",
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence 0-1",
                  },
                },
                required: ["material", "color", "colorHex", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "identify_material_color" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "No analysis result" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);
    // Normalize hex
    if (result.colorHex && !result.colorHex.startsWith("#")) {
      result.colorHex = "#" + result.colorHex;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-color-sample error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

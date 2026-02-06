import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Available materials by component (subset for AI context)
const COMPONENT_MATERIALS = {
  upper: [
    "Oiled Leather", "Smooth Leather", "Nubuck", "Suede", "Patent Leather", "Shearling",
    "Birko-Flor", "Birko-Flor Nubuck", "Birko-Flor Patent", "Birkibuc", "EVA",
    "Wool Felt", "Canvas", "Fabric", "Mesh", "Recycled PET"
  ],
  footbed: ["Cork-Latex", "Soft Footbed", "EVA", "Exquisite"],
  sole: ["EVA", "Rubber", "Polyurethane", "Cork"],
  buckles: [
    "Metal (Brass)", "Metal (Silver)", "Metal (Copper)", "Metal (Rose Gold)", "Antique Brass",
    "Matte Plastic", "Matte Plastic (Coordinated)", "Translucent", "Translucent Rose Gold"
  ],
  heelstrap: ["Suede", "Oiled Leather", "Smooth Leather", "Nubuck", "Birko-Flor", "Birko-Flor Nubuck"],
  lining: ["Shearling (Cream)", "Shearling (Black)", "Suede", "Wool Felt", "Microfiber", "EVA"],
};

// Color palette with hex values
const COLOR_PALETTE = [
  { name: "Taupe", hex: "#B8A99A" },
  { name: "Tobacco", hex: "#6F4E37" },
  { name: "Mocha", hex: "#967969" },
  { name: "Stone", hex: "#928E85" },
  { name: "Black", hex: "#1C1C1C" },
  { name: "Habana", hex: "#5C4033" },
  { name: "Cognac", hex: "#834C24" },
  { name: "Sand", hex: "#C2B280" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Antique White", hex: "#FAEBD7" },
  { name: "Chocolate", hex: "#3D2314" },
  { name: "Cork Brown", hex: "#8B7355" },
  { name: "Cream", hex: "#FFFDD0" },
  { name: "Anthracite", hex: "#383838" },
  { name: "Desert Soil", hex: "#A67B5B" },
  { name: "Iron", hex: "#48494B" },
  { name: "Mink", hex: "#81715E" },
  { name: "Port", hex: "#6C3461" },
  { name: "Thyme", hex: "#6B8E4E" },
  { name: "Apricot", hex: "#E6A57E" },
  { name: "Coral", hex: "#FF7F50" },
  { name: "Peach", hex: "#FFDAB9" },
  { name: "Rose Gold", hex: "#B76E79" },
  { name: "Blush", hex: "#DE98AB" },
  { name: "Hot Pink", hex: "#FF69B4" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#228B22" },
  { name: "Yellow", hex: "#FFD700" },
  { name: "Purple", hex: "#800080" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Gold", hex: "#FFD700" },
];

// Tool definition for structured output
const TOOL_DEFINITION = {
  type: "function",
  function: {
    name: "apply_customizations",
    description: "Apply shoe component customizations based on user request. Return only the components that should be CHANGED. Use null for components that should stay the same as the original.",
    parameters: {
      type: "object",
      properties: {
        upper: {
          type: ["object", "null"],
          properties: {
            material: { type: "string", description: "Material name from available options" },
            color: { type: "string", description: "Color name" },
            colorHex: { type: "string", description: "Hex color code (e.g., #FF69B4)" },
          },
          required: ["material", "color", "colorHex"],
        },
        footbed: {
          type: ["object", "null"],
          properties: {
            material: { type: "string" },
            color: { type: "string" },
            colorHex: { type: "string" },
          },
          required: ["material", "color", "colorHex"],
        },
        sole: {
          type: ["object", "null"],
          properties: {
            material: { type: "string" },
            color: { type: "string" },
            colorHex: { type: "string" },
          },
          required: ["material", "color", "colorHex"],
        },
        buckles: {
          type: ["object", "null"],
          properties: {
            material: { type: "string" },
            color: { type: "string" },
            colorHex: { type: "string" },
          },
          required: ["material", "color", "colorHex"],
        },
        heelstrap: {
          type: ["object", "null"],
          properties: {
            material: { type: "string" },
            color: { type: "string" },
            colorHex: { type: "string" },
          },
          required: ["material", "color", "colorHex"],
        },
        lining: {
          type: ["object", "null"],
          properties: {
            material: { type: "string" },
            color: { type: "string" },
            colorHex: { type: "string" },
          },
          required: ["material", "color", "colorHex"],
        },
      },
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userRequest, currentComponents } = await req.json();

    if (!userRequest || typeof userRequest !== "string") {
      return new Response(
        JSON.stringify({ error: "userRequest is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with context
    const systemPrompt = `You are a shoe customization assistant for Birkenstock-style footwear. 
Your job is to interpret user requests and map them to specific component changes.

CURRENT SHOE COMPONENTS (what the shoe currently looks like):
${JSON.stringify(currentComponents, null, 2)}

AVAILABLE MATERIALS BY COMPONENT:
${JSON.stringify(COMPONENT_MATERIALS, null, 2)}

AVAILABLE COLORS (use these names and hex codes):
${COLOR_PALETTE.map(c => `${c.name}: ${c.hex}`).join("\n")}

RULES:
1. Only return components that should CHANGE. Use null for components that stay the same.
2. When user says "all" or "entire shoe", apply to: upper, sole, heelstrap. NOT footbed (usually cork).
3. When user specifies a color without material, keep the original material and just change the color.
4. When user says "as is" for a component, return null for that component.
5. For metal buckles, use appropriate metallic colors (Gold, Silver, Rose Gold, Copper).
6. For EVA material, use solid colors. For leather, any color works.
7. Map fuzzy color names to the closest available color (e.g., "bright orange" → "Orange" #FFA500).
8. If a material isn't valid for a component, pick the closest valid alternative.
9. Footbed colors are typically "Natural Cork", "Black", or match the shoe color scheme.
10. For vegan/synthetic requests, use Birko-Flor or EVA materials.

EXAMPLES:
- "all black leather" → upper: Smooth Leather/Black, sole: EVA/Black, heelstrap: Smooth Leather/Black
- "white sole" → sole: (keep material)/White
- "hot pink upper with silver buckles" → upper: (keep material)/Hot Pink, buckles: Metal (Silver)/Silver
- "vegan taupe" → upper: Birko-Flor/Taupe, heelstrap: Birko-Flor/Taupe`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Customize the shoe based on this request: "${userRequest}"` },
        ],
        tools: [TOOL_DEFINITION],
        tool_choice: { type: "function", function: { name: "apply_customizations" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "apply_customizations") {
      throw new Error("Unexpected AI response format");
    }

    const overrides = JSON.parse(toolCall.function.arguments);
    console.log("Parsed overrides:", JSON.stringify(overrides, null, 2));

    // Filter out null values
    const filteredOverrides: Record<string, any> = {};
    for (const [key, value] of Object.entries(overrides)) {
      if (value !== null) {
        filteredOverrides[key] = value;
      }
    }

    return new Response(
      JSON.stringify({ overrides: filteredOverrides }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in interpret-shoe-customization:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

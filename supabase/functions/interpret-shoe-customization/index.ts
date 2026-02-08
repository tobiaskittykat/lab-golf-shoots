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
  // Blues
  { name: "Baby Blue", hex: "#89CFF0" },
  { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Light Blue", hex: "#ADD8E6" },
  { name: "Powder Blue", hex: "#B0E0E6" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Dusty Blue", hex: "#8CA9BC" },
];

// Tool definition for structured output
const TOOL_DEFINITION = {
  type: "function",
  function: {
    name: "apply_customizations",
    description: "Apply shoe component customizations based on user request. Return ONLY the components that need to change. Do NOT include components that stay the same -- simply omit them from the response.",
    parameters: {
      type: "object",
      properties: {
        upper: {
          type: "object",
          properties: {
            material: { type: "string", description: "Material name from available options" },
            color: { type: "string", description: "Color name" },
            colorHex: { type: "string", description: "Hex color code (e.g., #FF69B4)" },
          },
          required: ["material", "color", "colorHex"],
        },
        footbed: {
          type: "object",
          properties: {
            material: { type: "string" },
            color: { type: "string" },
            colorHex: { type: "string" },
          },
          required: ["material", "color", "colorHex"],
        },
        sole: {
          type: "object",
          properties: {
            material: { type: "string" },
            color: { type: "string" },
            colorHex: { type: "string" },
          },
          required: ["material", "color", "colorHex"],
        },
        buckles: {
          type: "object",
          properties: {
            material: { type: "string" },
            color: { type: "string" },
            colorHex: { type: "string" },
          },
          required: ["material", "color", "colorHex"],
        },
        heelstrap: {
          type: "object",
          properties: {
            material: { type: "string" },
            color: { type: "string" },
            colorHex: { type: "string" },
          },
          required: ["material", "color", "colorHex"],
        },
        lining: {
          type: "object",
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

MATERIAL VALIDITY BY COMPONENT (which materials are valid where):
- EVA: valid for upper, sole, footbed, heelstrap, lining (molded EVA sandals)
- Leather/Suede/Nubuck/Oiled Leather: valid for upper, heelstrap (NOT sole/footbed)
- Birko-Flor: valid for upper, heelstrap (NOT sole/footbed)
- Cork-Latex: valid for footbed only
- Rubber/Polyurethane: valid for sole only

REFERENCE COLORS (common names and hex codes):
${COLOR_PALETTE.map(c => `${c.name}: ${c.hex}`).join("\n")}

CRITICAL RULES:
1. Only return components that should CHANGE. Omit unchanged components entirely from the response.
2. When user says "[color] version" or "make it [color]" or "all [color]" - ALWAYS change the UPPER component at minimum.
3. You CAN and SHOULD create custom colors not in the reference list! Just provide a descriptive name and accurate hex code.
   - Example: "baby blue" → { color: "Baby Blue", colorHex: "#89CFF0" }
   - Example: "bright orange" → { color: "Bright Orange", colorHex: "#FF6B00" }
4. When user specifies only a color (no material), keep the original material and just change the color.
5. "All [color]" or "entire shoe in [color]" → apply color to: upper, sole, heelstrap, and BUCKLES become "Matte Plastic (Coordinated)" with matching color.
6. For metal buckles changing to match shoe color, use "Matte Plastic (Coordinated)" material.
7. Footbed stays cork UNLESS:
   - User explicitly mentions footbed (e.g., "EVA footbed")
   - User says "all [material]" where that material is valid for footbed (EVA, Soft Footbed)
8. NEVER return all nulls if the user clearly wants a color/material change. At minimum, change the UPPER.
9. For vegan/synthetic requests, use Birko-Flor or EVA materials.
10. For metal buckles, use metallic colors (Gold, Silver, Rose Gold, Copper).
11. IGNORE shoe model names in the request - these are just product names, not instructions:
    "boston", "bston", "arizona", "madrid", "gizeh", "mayari", "milano", "kyoto", "zurich", etc.
    Focus ONLY on material/color/customization instructions.
12. "all [material] in [color]" applies to ALL components where that material is valid:
    - "all EVA in [color]" → upper: EVA/color, sole: EVA/color, footbed: EVA/color, heelstrap: EVA/color, buckles: Matte Plastic (Coordinated)/color
    - "all leather in [color]" → upper: Leather/color, heelstrap: Leather/color (sole stays EVA/rubber, footbed stays cork, buckles coordinate)
    - ALWAYS include buckles as "Matte Plastic (Coordinated)" with matching color for "all" requests
13. ALWAYS generate accurate hex codes for ANY color name, even if not in the reference list!
    - Look up or estimate the correct hex code for the color mentioned
    - NEVER leave colorHex empty or null when changing a color
14. When user specifies BOTH material AND color, apply BOTH together - don't just change one.
15. EVA is a valid material for: upper (molded sandals), sole, footbed, heelstrap, lining. For "all EVA" requests, apply to ALL these components.
16. For thong-style sandals (Gizeh, Ramses, Mayari): The toe post strap color 
    follows the SOLE color, and the toe post pin/rivet follows the BUCKLE hardware. 
    When changing sole color, the toe post strap automatically matches. 
    When changing buckle finish, the toe post pin automatically matches.
    No separate component needed.

EXAMPLES:
- "baby blue version" → upper: { material: (keep original), color: "Baby Blue", colorHex: "#89CFF0" }
- "all black leather" → upper: Smooth Leather/Black/#1C1C1C, heelstrap: Smooth Leather/Black/#1C1C1C, buckles: Matte Plastic (Coordinated)/Black/#1C1C1C
- "white sole" → sole: { material: (keep original), color: "White", colorHex: "#FFFFFF" }
- "hot pink upper with silver buckles" → upper: (keep material)/Hot Pink/#FF69B4, buckles: Metal (Silver)/Silver/#C0C0C0
- "vegan taupe" → upper: Birko-Flor/Taupe/#B8A99A, heelstrap: Birko-Flor/Taupe/#B8A99A
- "make it coral" → upper: { material: (keep original), color: "Coral", colorHex: "#FF7F50" }
- "all eva in dusty blue" → upper: EVA/Dusty Blue/#8CA9BC, sole: EVA/Dusty Blue/#8CA9BC, footbed: EVA/Dusty Blue/#8CA9BC, heelstrap: EVA/Dusty Blue/#8CA9BC, buckles: Matte Plastic (Coordinated)/Dusty Blue/#8CA9BC
- "all eva version in baby blue" → upper: EVA/Baby Blue/#89CFF0, sole: EVA/Baby Blue/#89CFF0, footbed: EVA/Baby Blue/#89CFF0, heelstrap: EVA/Baby Blue/#89CFF0, buckles: Matte Plastic (Coordinated)/Baby Blue/#89CFF0
- "all leather in cognac" → upper: Smooth Leather/Cognac/#834C24, heelstrap: Smooth Leather/Cognac/#834C24, buckles: Matte Plastic (Coordinated)/Cognac/#834C24
- "arizona in olive leather" → upper: Oiled Leather/Olive/#808000, heelstrap: Oiled Leather/Olive/#808000
- "make it lavender" → upper: { material: (keep original), color: "Lavender", colorHex: "#E6E6FA" }
- "all sage green" → upper: (keep)/Sage Green/#9DC183, sole: (keep)/Sage Green/#9DC183, heelstrap: (keep)/Sage Green/#9DC183, buckles: Matte Plastic (Coordinated)/Sage Green/#9DC183`;

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

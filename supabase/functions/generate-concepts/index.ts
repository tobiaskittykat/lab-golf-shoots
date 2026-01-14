/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConceptRequest {
  prompt: string;
  brandName?: string;
  brandPersonality?: string;
  brandIndustry?: string;
  useCase?: string;
  targetPersona?: string;
}

interface Concept {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const body: ConceptRequest = await req.json();
    const { prompt, brandName, brandPersonality, brandIndustry, useCase, targetPersona } = body;

    if (!prompt || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating concepts for prompt:", prompt);

    // Build the system prompt for concept generation
    const systemPrompt = `You are a world-class creative director specializing in visual marketing and product photography.
Your task is to generate 3 distinct, creative visual concepts based on the brief provided.

${brandName ? `Brand: ${brandName}` : ""}
${brandPersonality ? `Brand Personality: ${brandPersonality}` : ""}
${brandIndustry ? `Industry: ${brandIndustry}` : ""}
${useCase ? `Use Case: ${useCase}` : ""}
${targetPersona ? `Target Audience: ${targetPersona}` : ""}

Each concept should be unique and commercially viable for the specified use case.
Return EXACTLY 3 concepts in the following JSON format:
{
  "concepts": [
    {
      "id": "concept-1",
      "title": "Short compelling title (3-5 words)",
      "description": "Vivid visual description of the concept (2-3 sentences describing the scene, mood, and key elements)",
      "tags": ["Tag1", "Tag2", "Tag3"]
    }
  ]
}

Be creative, varied, and think like a high-end advertising agency. Each concept should evoke a different mood and visual approach.`;

    const userPrompt = `Generate 3 creative visual concepts for: ${prompt}`;

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response:", content);

    // Parse the JSON from the response
    let concepts: Concept[];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*"concepts"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        concepts = parsed.concepts;
      } else {
        throw new Error("Could not find JSON in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      // Fallback to mock concepts if parsing fails
      concepts = [
        {
          id: "concept-1",
          title: "Modern Elegance",
          description: `A sophisticated take on ${prompt}. Clean lines, premium materials, and subtle lighting create an aspirational mood that speaks to discerning customers.`,
          tags: ["Premium", "Clean", "Sophisticated"]
        },
        {
          id: "concept-2",
          title: "Natural Authenticity",
          description: `An organic approach to ${prompt}. Warm natural light, authentic textures, and candid moments that build trust and connection with the audience.`,
          tags: ["Authentic", "Natural", "Warm"]
        },
        {
          id: "concept-3",
          title: "Bold Impact",
          description: `A striking visual for ${prompt}. High contrast, dynamic composition, and confident colors that demand attention in crowded feeds.`,
          tags: ["Bold", "Dynamic", "Eye-catching"]
        }
      ];
    }

    // Ensure we have exactly 3 concepts with proper IDs
    concepts = concepts.slice(0, 3).map((c, i) => ({
      ...c,
      id: `concept-${i + 1}`
    }));

    console.log("Returning concepts:", concepts.length);

    return new Response(
      JSON.stringify({ concepts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating concepts:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate concepts";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

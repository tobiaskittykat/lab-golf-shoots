import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, brandName, brandPersonality, brandIndustry, useCase, targetPersona, customSystemPrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = customSystemPrompt || `You are a world-class creative director. Generate 3 distinct campaign concepts.

Each concept must be a JSON object with these fields:
- id: unique string
- title: catchy campaign title (3-5 words)
- productFocus: { productCategory, visualGuidance }
- coreIdea: one-sentence core concept
- visualWorld: { atmosphere, materials[], palette[], composition, mustHave[] }
- taglines: string[] (3 options)
- contentPillars: { name, description }[] (3 pillars)
- targetAudience: { persona, situation }
- consumerInsight: one sentence
- tonality: { adjectives[], neverRules[] }
- description: 2-3 sentence visual description
- tags: string[] (3-5 tags)

${brandName ? `Brand: ${brandName}` : ''}
${brandPersonality ? `Personality: ${brandPersonality}` : ''}
${brandIndustry ? `Industry: ${brandIndustry}` : ''}
${useCase ? `Use case: ${useCase}` : ''}
${targetPersona ? `Target: ${targetPersona}` : ''}

Return ONLY a JSON object: { "concepts": [...] }`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_concepts",
            description: "Return the generated campaign concepts",
            parameters: {
              type: "object",
              properties: {
                concepts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      tags: { type: "array", items: { type: "string" } },
                      coreIdea: { type: "string" },
                      consumerInsight: { type: "string" },
                      productFocus: {
                        type: "object",
                        properties: {
                          productCategory: { type: "string" },
                          visualGuidance: { type: "string" },
                        },
                      },
                      visualWorld: {
                        type: "object",
                        properties: {
                          atmosphere: { type: "string" },
                          materials: { type: "array", items: { type: "string" } },
                          palette: { type: "array", items: { type: "string" } },
                          composition: { type: "string" },
                          mustHave: { type: "array", items: { type: "string" } },
                        },
                      },
                      taglines: { type: "array", items: { type: "string" } },
                      contentPillars: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            description: { type: "string" },
                          },
                        },
                      },
                      targetAudience: {
                        type: "object",
                        properties: {
                          persona: { type: "string" },
                          situation: { type: "string" },
                        },
                      },
                      tonality: {
                        type: "object",
                        properties: {
                          adjectives: { type: "array", items: { type: "string" } },
                          neverRules: { type: "array", items: { type: "string" } },
                        },
                      },
                    },
                    required: ["id", "title", "description", "tags"],
                  },
                },
              },
              required: ["concepts"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_concepts" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to generate concepts", concepts: [] }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let concepts = [];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      concepts = parsed.concepts || [];
    }

    // Ensure each concept has an id
    concepts = concepts.map((c: any, i: number) => ({
      ...c,
      id: c.id || `concept-${Date.now()}-${i}`,
    }));

    return new Response(JSON.stringify({ concepts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-concepts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", concepts: [] }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

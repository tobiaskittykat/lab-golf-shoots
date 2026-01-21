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
  customSystemPrompt?: string; // Optional custom system prompt override
}

interface ProductFocus {
  productCategory: string;
}

interface VisualWorld {
  atmosphere: string;
  materials: string[];
  palette: string[];
  composition: string;
  mustHave: string[];
}

interface ContentPillar {
  name: string;
  description: string;
}

interface TargetAudience {
  persona: string;
  situation: string;
}

interface Tonality {
  adjectives: string[];
  neverRules: string[];
}

interface Concept {
  id: string;
  title: string;
  description: string;
  tags: string[];
  coreIdea: string;
  consumerInsight: string;
  productFocus: ProductFocus;
  visualWorld: VisualWorld;
  taglines: string[];
  contentPillars: ContentPillar[];
  targetAudience: TargetAudience;
  tonality: Tonality;
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
    const { prompt, brandName, brandPersonality, brandIndustry, useCase, targetPersona, customSystemPrompt } = body;

    if (!prompt || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating 9-point campaign concepts for prompt:", prompt);
    console.log("Using custom system prompt:", !!customSystemPrompt);

    // Default system prompt (used when no custom prompt provided)
    const defaultSystemPrompt = `You are a world-class creative director at a top advertising agency. Generate 3 distinct campaign concepts using a professional 9-point creative brief structure.

${brandName ? `Brand: ${brandName}` : ""}
${brandPersonality ? `Brand Personality: ${brandPersonality}` : ""}
${brandIndustry ? `Industry: ${brandIndustry}` : ""}
${useCase ? `Use Case: ${useCase}` : ""}
${targetPersona ? `Target Audience Hint: ${targetPersona}` : ""}

Each concept must include ALL 9 elements:

1. **Name** (title): Catchy campaign title (3-5 words)
2. **Product Focus** (productFocus): What product category is the campaign for?
   - productCategory: Product type only (e.g., "Premium leather phone cases", "Athletic running shoes", "Wireless earbuds")
   - Do NOT include shot types, angles, or photography directions—that comes later in execution
3. **Single-minded Idea** (coreIdea): One sentence that captures the core concept
4. **Visual World** (visualWorld): Art direction rules
   - atmosphere: Mood, lighting, environment description
   - materials: Key textures and materials
   - palette: Color scheme (3-5 colors)
   - composition: Framing rules
   - mustHave: Non-negotiable visual elements
5. **Taglines** (taglines): 3 tagline options
6. **Content Pillars** (contentPillars): 3 repeatable story themes
   - Each with name and description
7. **Target Audience** (targetAudience):
   - persona: Who they are (demographic + psychographic)
   - situation: When/where they engage
8. **Consumer Insight** (consumerInsight): One sentence tension or truth
9. **Tonality** (tonality):
   - adjectives: 3 words that define the tone
   - neverRules: 2 things to never do/say

Also include:
- description: A 2-3 sentence visual description (can be derived from visual world)
- tags: 3-5 relevant tags for categorization

Return EXACTLY 3 concepts in this JSON format:
{
  "concepts": [
    {
      "id": "concept-1",
      "title": "Campaign Name",
      "description": "Visual description of the concept",
      "tags": ["tag1", "tag2", "tag3"],
      "coreIdea": "Single sentence core concept",
      "consumerInsight": "The tension or truth driving this concept",
      "productFocus": {
        "productCategory": "Product type only, no shot directions"
      },
      "visualWorld": {
        "atmosphere": "Mood and environment description",
        "materials": ["material1", "material2"],
        "palette": ["color1", "color2", "color3"],
        "composition": "Framing rules",
        "mustHave": ["essential visual element"]
      },
      "taglines": ["Tagline 1", "Tagline 2", "Tagline 3"],
      "contentPillars": [
        {"name": "Pillar 1", "description": "Description"},
        {"name": "Pillar 2", "description": "Description"},
        {"name": "Pillar 3", "description": "Description"}
      ],
      "targetAudience": {
        "persona": "Who they are",
        "situation": "When they engage"
      },
      "tonality": {
        "adjectives": ["adj1", "adj2", "adj3"],
        "neverRules": ["never1", "never2"]
      }
    }
  ]
}

Make each concept unique and commercially viable. Think like a high-end creative agency.`;

    // Use custom prompt if provided, otherwise use default
    // If custom prompt is provided, inject brand context into it
    let systemPrompt: string;
    if (customSystemPrompt) {
      // Prepend brand context to custom prompt
      const brandContext = [
        brandName ? `Brand: ${brandName}` : "",
        brandPersonality ? `Brand Personality: ${brandPersonality}` : "",
        brandIndustry ? `Industry: ${brandIndustry}` : "",
        useCase ? `Use Case: ${useCase}` : "",
        targetPersona ? `Target Audience Hint: ${targetPersona}` : "",
      ].filter(Boolean).join("\n");
      
      systemPrompt = brandContext ? `${brandContext}\n\n${customSystemPrompt}` : customSystemPrompt;
    } else {
      systemPrompt = defaultSystemPrompt;
    }

    const userPrompt = `Generate 3 complete campaign concepts for: ${prompt}`;

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
        max_tokens: 4000,
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

    console.log("AI response received, parsing...");

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
      // Fallback to example concepts if parsing fails
      concepts = [
        {
          id: "concept-1",
          title: "Modern Elegance",
          description: `A sophisticated take on ${prompt}. Clean lines, premium materials, and subtle lighting create an aspirational mood.`,
          tags: ["Premium", "Clean", "Sophisticated"],
          coreIdea: "Elevate the everyday with refined simplicity.",
          consumerInsight: "People want luxury that doesn't feel try-hard.",
          productFocus: {
            productCategory: "Premium fashion accessories"
          },
          visualWorld: {
            atmosphere: "Bright, airy spaces with clean architectural lines",
            materials: ["marble", "brass", "linen"],
            palette: ["cream", "charcoal", "gold", "white"],
            composition: "Centered subject, negative space emphasis",
            mustHave: ["shadow play", "texture close-ups"]
          },
          taglines: ["Simply Elevated", "Refined. Redefined.", "The Art of Less"],
          contentPillars: [
            { name: "Material Moments", description: "Close-up texture studies" },
            { name: "Daily Rituals", description: "Product in routine contexts" },
            { name: "Design Details", description: "The craftsmanship story" }
          ],
          targetAudience: {
            persona: "Design-conscious professionals 30-45",
            situation: "Upgrading their personal aesthetic"
          },
          tonality: {
            adjectives: ["refined", "confident", "understated"],
            neverRules: ["loud", "trendy"]
          }
        },
        {
          id: "concept-2",
          title: "Natural Authenticity",
          description: `An organic approach to ${prompt}. Warm natural light, authentic textures, and candid moments that build trust.`,
          tags: ["Authentic", "Natural", "Warm"],
          coreIdea: "Real moments, real connection, real value.",
          consumerInsight: "Consumers are tired of perfection—they crave authenticity.",
          productFocus: {
            productCategory: "Lifestyle everyday goods"
          },
          visualWorld: {
            atmosphere: "Golden hour, candid captures, imperfect beauty",
            materials: ["wood", "cotton", "leather", "ceramics"],
            palette: ["terracotta", "sage", "cream", "natural brown"],
            composition: "Off-center, documentary style",
            mustHave: ["human hands/touch", "natural light flares"]
          },
          taglines: ["Made for Real Life", "Honestly Yours", "Where Stories Begin"],
          contentPillars: [
            { name: "Behind the Scenes", description: "Making-of content" },
            { name: "Customer Stories", description: "UGC and testimonials" },
            { name: "Honest Moments", description: "Unposed product shots" }
          ],
          targetAudience: {
            persona: "Values-driven millennials 28-40",
            situation: "Seeking meaning in purchases"
          },
          tonality: {
            adjectives: ["genuine", "warm", "approachable"],
            neverRules: ["salesy", "clinical"]
          }
        },
        {
          id: "concept-3",
          title: "Bold Impact",
          description: `A striking visual for ${prompt}. High contrast, dynamic composition, and confident colors that demand attention.`,
          tags: ["Bold", "Dynamic", "Eye-catching"],
          coreIdea: "Stand out or sit down.",
          consumerInsight: "In a scroll-past world, subtlety is invisible.",
          productFocus: {
            productCategory: "Bold statement products"
          },
          visualWorld: {
            atmosphere: "High contrast, dramatic shadows, bold geometry",
            materials: ["glass", "metal", "neon", "concrete"],
            palette: ["electric blue", "hot pink", "black", "white"],
            composition: "Dynamic angles, rule-breaking crops",
            mustHave: ["color blocking", "strong shadows"]
          },
          taglines: ["Make Your Move", "Be Unmissable", "This Is Your Moment"],
          contentPillars: [
            { name: "Statement Shots", description: "Hero product imagery" },
            { name: "In Action", description: "Dynamic use cases" },
            { name: "The Drop", description: "Launch and limited content" }
          ],
          targetAudience: {
            persona: "Confident Gen-Z and young millennials 18-32",
            situation: "Building their personal brand"
          },
          tonality: {
            adjectives: ["confident", "energetic", "unapologetic"],
            neverRules: ["boring", "safe"]
          }
        }
      ];
    }

    // Ensure we have exactly 3 concepts with proper IDs
    concepts = concepts.slice(0, 3).map((c, i) => ({
      ...c,
      id: `concept-${i + 1}`
    }));

    console.log("Returning", concepts.length, "concepts");

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

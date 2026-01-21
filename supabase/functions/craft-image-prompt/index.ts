/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BrandContext {
  mission?: string;
  values?: string[];
  tone_of_voice?: string;
  visual_style?: {
    photography_style?: string;
    color_palette?: string[];
    avoid?: string[];
  };
  target_audience?: string;
}

interface VisualAnalysis {
  dominant_colors?: string[];
  color_mood?: string;
  key_elements?: string[];
  composition_style?: string;
  lighting_quality?: string;
  textures?: string[];
  emotional_tone?: string;
  suggested_props?: string[];
  best_for?: string[];
}

interface CraftPromptRequest {
  // Concept info
  conceptTitle?: string;
  conceptDescription?: string;
  coreIdea?: string;
  tonality?: {
    voice?: string;
    emotion?: string;
    visualStyle?: string;
  };
  
  // Moodboard info
  moodboardName?: string;
  moodboardDescription?: string;
  moodboardAnalysis?: VisualAnalysis;
  
  // Product info
  productNames?: string[];
  
  // Shot type
  shotTypePrompts?: string[];
  
  // Technical settings
  artisticStyle?: string;
  lightingStyle?: string;
  cameraAngle?: string;
  
  // Extra
  extraKeywords?: string[];
  textOnImage?: string;
  negativePrompt?: string;
  
  // Brand context
  brandContext?: BrandContext;
  brandName?: string;
  brandPersonality?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const body: CraftPromptRequest = await req.json();
    
    console.log("Crafting prompt with inputs:", JSON.stringify(body, null, 2));

    // Build the creative brief for the prompt agent
    const creativeBrief = buildCreativeBrief(body);
    
    // Call the AI to craft the prompt
    const craftedPrompt = await craftPromptWithAI(creativeBrief, LOVABLE_API_KEY);
    
    console.log("Crafted prompt:", craftedPrompt);

    return new Response(
      JSON.stringify({ success: true, prompt: craftedPrompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in craft-image-prompt:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to craft prompt";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildCreativeBrief(request: CraftPromptRequest): string {
  const sections: string[] = [];
  
  // Brand Context Section
  if (request.brandContext || request.brandName || request.brandPersonality) {
    sections.push("=== BRAND CONTEXT ===");
    if (request.brandName) {
      sections.push(`Brand: ${request.brandName}`);
    }
    if (request.brandPersonality) {
      sections.push(`Personality: ${request.brandPersonality}`);
    }
    if (request.brandContext?.mission) {
      sections.push(`Mission: ${request.brandContext.mission}`);
    }
    if (request.brandContext?.values && request.brandContext.values.length > 0) {
      sections.push(`Values: ${request.brandContext.values.join(", ")}`);
    }
    if (request.brandContext?.tone_of_voice) {
      sections.push(`Tone of Voice: ${request.brandContext.tone_of_voice}`);
    }
    if (request.brandContext?.visual_style?.photography_style) {
      sections.push(`Photography Style: ${request.brandContext.visual_style.photography_style}`);
    }
    if (request.brandContext?.visual_style?.color_palette && request.brandContext.visual_style.color_palette.length > 0) {
      sections.push(`Brand Colors: ${request.brandContext.visual_style.color_palette.join(", ")}`);
    }
    if (request.brandContext?.visual_style?.avoid && request.brandContext.visual_style.avoid.length > 0) {
      sections.push(`AVOID: ${request.brandContext.visual_style.avoid.join(", ")}`);
    }
    if (request.brandContext?.target_audience) {
      sections.push(`Target Audience: ${request.brandContext.target_audience}`);
    }
    sections.push("");
  }
  
  // Campaign Concept Section
  if (request.conceptTitle || request.conceptDescription || request.coreIdea) {
    sections.push("=== CAMPAIGN CONCEPT ===");
    if (request.conceptTitle) {
      sections.push(`Title: ${request.conceptTitle}`);
    }
    if (request.coreIdea) {
      sections.push(`Core Idea: ${request.coreIdea}`);
    }
    if (request.conceptDescription) {
      sections.push(`Description: ${request.conceptDescription}`);
    }
    if (request.tonality) {
      if (request.tonality.voice) sections.push(`Voice: ${request.tonality.voice}`);
      if (request.tonality.emotion) sections.push(`Emotion: ${request.tonality.emotion}`);
      if (request.tonality.visualStyle) sections.push(`Visual Style: ${request.tonality.visualStyle}`);
    }
    sections.push("");
  }
  
  // Moodboard Inspiration Section
  if (request.moodboardName || request.moodboardDescription || request.moodboardAnalysis) {
    sections.push("=== MOODBOARD INSPIRATION ===");
    if (request.moodboardName) {
      sections.push(`Moodboard: ${request.moodboardName}`);
    }
    if (request.moodboardDescription) {
      sections.push(`Description: ${request.moodboardDescription}`);
    }
    if (request.moodboardAnalysis) {
      const analysis = request.moodboardAnalysis;
      if (analysis.dominant_colors && analysis.dominant_colors.length > 0) {
        sections.push(`Colors: ${analysis.dominant_colors.join(", ")}`);
      }
      if (analysis.color_mood) {
        sections.push(`Color Mood: ${analysis.color_mood}`);
      }
      if (analysis.key_elements && analysis.key_elements.length > 0) {
        sections.push(`Key Visual Elements: ${analysis.key_elements.join(", ")}`);
      }
      if (analysis.lighting_quality) {
        sections.push(`Lighting Reference: ${analysis.lighting_quality}`);
      }
      if (analysis.textures && analysis.textures.length > 0) {
        sections.push(`Textures: ${analysis.textures.join(", ")}`);
      }
      if (analysis.emotional_tone) {
        sections.push(`Emotional Tone: ${analysis.emotional_tone}`);
      }
      if (analysis.suggested_props && analysis.suggested_props.length > 0) {
        sections.push(`Suggested Props: ${analysis.suggested_props.join(", ")}`);
      }
      if (analysis.composition_style) {
        sections.push(`Composition: ${analysis.composition_style}`);
      }
    }
    sections.push("");
  }
  
  // Product Section
  if (request.productNames && request.productNames.length > 0) {
    sections.push("=== PRODUCT ===");
    sections.push(`Feature: ${request.productNames.join(", ")}`);
    sections.push("");
  }
  
  // Shot Type Section
  if (request.shotTypePrompts && request.shotTypePrompts.length > 0) {
    sections.push("=== SHOT DIRECTION ===");
    sections.push(request.shotTypePrompts.join(". "));
    sections.push("");
  }
  
  // Technical Settings Section
  if (request.artisticStyle || request.lightingStyle || request.cameraAngle) {
    sections.push("=== TECHNICAL SETTINGS ===");
    if (request.artisticStyle && request.artisticStyle !== 'auto') {
      sections.push(`Style: ${request.artisticStyle}`);
    }
    if (request.lightingStyle && request.lightingStyle !== 'auto') {
      sections.push(`Lighting: ${request.lightingStyle}`);
    }
    if (request.cameraAngle && request.cameraAngle !== 'auto') {
      sections.push(`Camera: ${request.cameraAngle}`);
    }
    sections.push("");
  }
  
  // Extra Keywords Section
  if (request.extraKeywords && request.extraKeywords.length > 0) {
    sections.push("=== ADDITIONAL KEYWORDS ===");
    sections.push(request.extraKeywords.join(", "));
    sections.push("");
  }
  
  // Text Overlay Section
  if (request.textOnImage) {
    sections.push("=== TEXT OVERLAY ===");
    sections.push(`Include text: "${request.textOnImage}"`);
    sections.push("");
  }
  
  // Negative Prompt Section
  if (request.negativePrompt) {
    sections.push("=== MUST AVOID ===");
    sections.push(request.negativePrompt);
    sections.push("");
  }
  
  return sections.join("\n");
}

async function craftPromptWithAI(creativeBrief: string, apiKey: string): Promise<string> {
  const systemPrompt = `You are an expert creative director at a luxury fashion brand, skilled at crafting evocative image generation prompts.

Your job is to take a creative brief and transform it into a single, cohesive image generation prompt that will produce stunning, on-brand visuals.

GUIDELINES:
1. Lead with the most important visual element (usually the product + how it's shown)
2. Weave in 2-3 specific elements from the moodboard analysis if provided
3. Set the mood, lighting, and atmosphere naturally as part of the scene description
4. Be specific and evocative - use sensory language
5. Keep it focused - one clear scene, not multiple concepts
6. Include quality indicators naturally (e.g., "editorial photography", "luxury lifestyle", "high-end fashion")
7. If brand guidelines say to avoid something, make sure to NOT include those elements
8. The prompt should feel like a creative direction, not a list of keywords

COLOR HARMONIZATION:
When both brand colors and moodboard colors are provided:
- Use brand colors for the PRODUCT itself (packaging, materials, finishes)
- Use moodboard colors for the ENVIRONMENT and ATMOSPHERE (background, props, lighting tones)
- Find complementary intersections - if both share similar tones, emphasize those
- When in conflict, brand identity takes priority for product elements
- Create cohesion by describing how brand colors interact with environmental tones

QUALITY STANDARDS:
- High-quality, professional imagery
- Sharp focus on key elements
- Appropriate lighting for the mood
- Clean, intentional composition

OUTPUT: Return ONLY the crafted prompt text. No explanations, no bullet points, just the prompt.`;

  const userPrompt = `Craft a single, evocative image generation prompt from this creative brief:

${creativeBrief}

Remember: One cohesive prompt that captures the essence of this creative direction.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI prompt crafting failed:", response.status, errorText);
    throw new Error(`AI prompt crafting failed: ${response.status}`);
  }

  const aiResponse = await response.json();
  const craftedPrompt = aiResponse.choices?.[0]?.message?.content?.trim();
  
  if (!craftedPrompt) {
    throw new Error("No prompt generated by AI");
  }
  
  return craftedPrompt;
}

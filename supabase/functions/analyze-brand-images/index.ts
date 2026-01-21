/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisualDNA {
  primaryColors: string[];
  colorMood: string;
  photographyStyle: string;
  texturePreferences: string[];
  lightingStyle: string;
  compositionStyle: string;
  avoidElements: string[];
}

interface BrandVoice {
  personality: string;
  toneDescriptors: string[];
  messagingStyle: string;
}

interface BrandBrain {
  generatedAt: string;
  visualDNA: VisualDNA;
  brandVoice: BrandVoice;
  creativeDirectionSummary: string;
}

interface ImageAnalysis {
  colors: string[];
  lighting: string;
  composition: string;
  textures: string[];
  mood: string;
  style: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Get auth header for user identification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { brandId, imageId, regenerateBrain } = body;

    if (!brandId) {
      return new Response(
        JSON.stringify({ error: "brandId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user owns this brand
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', brandId)
      .eq('user_id', user.id)
      .single();

    if (brandError || !brand) {
      return new Response(
        JSON.stringify({ error: "Brand not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If analyzing a single image
    if (imageId) {
      const { data: brandImage, error: imageError } = await supabase
        .from('brand_images')
        .select('*')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single();

      if (imageError || !brandImage) {
        return new Response(
          JSON.stringify({ error: "Image not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Analyzing single brand image: ${brandImage.image_url}`);
      const analysis = await analyzeImage(brandImage.image_url, LOVABLE_API_KEY);

      // Update the image with analysis
      const { error: updateError } = await supabase
        .from('brand_images')
        .update({ visual_analysis: analysis })
        .eq('id', imageId);

      if (updateError) {
        console.error("Failed to update image with analysis:", updateError);
      }

      return new Response(
        JSON.stringify({ success: true, analysis }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Regenerate full Brand Brain
    if (regenerateBrain) {
      console.log(`Regenerating Brand Brain for brand: ${brandId}`);

      // Fetch all brand images
      const { data: brandImages, error: imagesError } = await supabase
        .from('brand_images')
        .select('*')
        .eq('brand_id', brandId)
        .eq('user_id', user.id);

      if (imagesError) {
        throw new Error(`Failed to fetch brand images: ${imagesError.message}`);
      }

      // Analyze any unanalyzed images first
      const unanalyzedImages = (brandImages || []).filter(img => !img.visual_analysis);
      console.log(`Found ${unanalyzedImages.length} unanalyzed images`);

      for (const img of unanalyzedImages) {
        try {
          const analysis = await analyzeImage(img.image_url, LOVABLE_API_KEY);
          await supabase
            .from('brand_images')
            .update({ visual_analysis: analysis })
            .eq('id', img.id);
          img.visual_analysis = analysis;
        } catch (err) {
          console.error(`Failed to analyze image ${img.id}:`, err);
        }
      }

      // Fetch existing brand context
      const existingContext = brand.brand_context || {};

      // Synthesize Brand Brain from all sources
      const brandBrain = await synthesizeBrandBrain(
        brandImages || [],
        existingContext,
        brand.name,
        LOVABLE_API_KEY
      );

      // Update brand with new Brand Brain
      const newContext = {
        ...existingContext,
        brandBrain,
      };

      const { error: updateError } = await supabase
        .from('brands')
        .update({ brand_context: newContext })
        .eq('id', brandId);

      if (updateError) {
        throw new Error(`Failed to update brand: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, brandBrain }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Specify imageId to analyze an image, or regenerateBrain to synthesize Brand Brain" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-brand-images:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze brand images";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeImage(imageUrl: string, apiKey: string): Promise<ImageAnalysis> {
  const systemPrompt = `You are an expert visual analyst specializing in brand identity and aesthetics.
Analyze the provided brand image and extract visual elements that define the brand's look and feel.
You MUST call the extract_image_analysis function with your findings.`;

  const userPrompt = `Analyze this brand image comprehensively. Extract:
- Colors (specific color names like "champagne gold", "charcoal grey")
- Lighting style and quality
- Composition approach
- Textures and materials visible
- Overall mood/vibe
- Photography/visual style`;

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
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text", text: userPrompt }
          ]
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "extract_image_analysis",
            description: "Extract structured visual analysis from a brand image",
            parameters: {
              type: "object",
              properties: {
                colors: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of 3-6 colors with specific names"
                },
                lighting: {
                  type: "string",
                  description: "Lighting style description"
                },
                composition: {
                  type: "string",
                  description: "Composition style description"
                },
                textures: {
                  type: "array",
                  items: { type: "string" },
                  description: "Textures and materials visible"
                },
                mood: {
                  type: "string",
                  description: "Overall mood/vibe"
                },
                style: {
                  type: "string",
                  description: "Photography/visual style"
                }
              },
              required: ["colors", "lighting", "composition", "textures", "mood", "style"],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "extract_image_analysis" } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI analysis failed:", response.status, errorText);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const aiResponse = await response.json();
  const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall || toolCall.function.name !== "extract_image_analysis") {
    throw new Error("Failed to extract analysis from AI response");
  }

  return JSON.parse(toolCall.function.arguments) as ImageAnalysis;
}

async function synthesizeBrandBrain(
  brandImages: any[],
  existingContext: any,
  brandName: string,
  apiKey: string
): Promise<BrandBrain> {
  // Gather all visual data
  const imageAnalyses = brandImages
    .filter(img => img.visual_analysis)
    .map(img => img.visual_analysis);

  // Prepare context for synthesis
  const contextData = {
    brandName,
    mission: existingContext.mission || "",
    values: existingContext.values || [],
    toneOfVoice: existingContext.tone_of_voice || "",
    visualStyle: existingContext.visual_style || {},
    targetAudience: existingContext.target_audience || "",
    imageAnalyses,
  };

  const systemPrompt = `You are an expert brand strategist and creative director. Your task is to synthesize 
brand information and visual analysis into a cohesive "Brand Brain" - a condensed identity profile that 
captures the brand's visual DNA, voice, and creative direction.

You MUST call the create_brand_brain function with your synthesis.`;

  const userPrompt = `Create a Brand Brain for "${brandName}" based on this data:

EXISTING BRAND CONTEXT:
- Mission: ${contextData.mission || "Not specified"}
- Values: ${contextData.values.join(", ") || "Not specified"}
- Tone of Voice: ${contextData.toneOfVoice || "Not specified"}
- Target Audience: ${contextData.targetAudience || "Not specified"}
- Photography Style: ${contextData.visualStyle?.photography_style || "Not specified"}
- Color Palette: ${contextData.visualStyle?.color_palette?.join(", ") || "Not specified"}
- Avoid: ${contextData.visualStyle?.avoid?.join(", ") || "Not specified"}

VISUAL ANALYSIS FROM ${imageAnalyses.length} BRAND IMAGES:
${JSON.stringify(imageAnalyses, null, 2)}

Synthesize this into a cohesive Brand Brain that:
1. Identifies the dominant visual patterns across all sources
2. Reconciles any conflicts between stated guidelines and actual imagery
3. Creates a clear, actionable creative direction summary
4. Defines what to avoid based on brand identity`;

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
      tools: [
        {
          type: "function",
          function: {
            name: "create_brand_brain",
            description: "Create a synthesized Brand Brain profile",
            parameters: {
              type: "object",
              properties: {
                visualDNA: {
                  type: "object",
                  properties: {
                    primaryColors: {
                      type: "array",
                      items: { type: "string" },
                      description: "4-6 primary brand colors with specific names"
                    },
                    colorMood: {
                      type: "string",
                      description: "The emotional feeling the color palette creates"
                    },
                    photographyStyle: {
                      type: "string",
                      description: "Dominant photography approach"
                    },
                    texturePreferences: {
                      type: "array",
                      items: { type: "string" },
                      description: "Preferred textures and materials"
                    },
                    lightingStyle: {
                      type: "string",
                      description: "Characteristic lighting approach"
                    },
                    compositionStyle: {
                      type: "string",
                      description: "How visual elements should be arranged"
                    },
                    avoidElements: {
                      type: "array",
                      items: { type: "string" },
                      description: "Visual elements to avoid"
                    }
                  },
                  required: ["primaryColors", "colorMood", "photographyStyle", "texturePreferences", "lightingStyle", "compositionStyle", "avoidElements"]
                },
                brandVoice: {
                  type: "object",
                  properties: {
                    personality: {
                      type: "string",
                      description: "Brand personality in one word (e.g., premium, playful, bold)"
                    },
                    toneDescriptors: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 adjectives describing brand tone"
                    },
                    messagingStyle: {
                      type: "string",
                      description: "How the brand communicates"
                    }
                  },
                  required: ["personality", "toneDescriptors", "messagingStyle"]
                },
                creativeDirectionSummary: {
                  type: "string",
                  description: "A 2-3 sentence creative direction brief that captures the brand's visual identity for AI generation"
                }
              },
              required: ["visualDNA", "brandVoice", "creativeDirectionSummary"],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "create_brand_brain" } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI synthesis failed:", response.status, errorText);
    throw new Error(`AI synthesis failed: ${response.status}`);
  }

  const aiResponse = await response.json();
  const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall || toolCall.function.name !== "create_brand_brain") {
    // Fallback to default Brand Brain
    return createDefaultBrandBrain(existingContext, brandName);
  }

  try {
    const parsed = JSON.parse(toolCall.function.arguments);
    return {
      generatedAt: new Date().toISOString(),
      visualDNA: parsed.visualDNA,
      brandVoice: parsed.brandVoice,
      creativeDirectionSummary: parsed.creativeDirectionSummary,
    };
  } catch (err) {
    console.error("Failed to parse Brand Brain:", err);
    return createDefaultBrandBrain(existingContext, brandName);
  }
}

function createDefaultBrandBrain(existingContext: any, brandName: string): BrandBrain {
  const vs = existingContext.visual_style || {};
  return {
    generatedAt: new Date().toISOString(),
    visualDNA: {
      primaryColors: vs.color_palette || ["neutral grey", "warm white"],
      colorMood: "Professional and refined",
      photographyStyle: vs.photography_style || "Clean editorial",
      texturePreferences: ["smooth", "refined materials"],
      lightingStyle: "Soft, even lighting",
      compositionStyle: "Balanced and clean",
      avoidElements: vs.avoid || ["cluttered backgrounds", "harsh shadows"],
    },
    brandVoice: {
      personality: existingContext.personality || "professional",
      toneDescriptors: existingContext.tone_of_voice ? [existingContext.tone_of_voice] : ["confident", "refined"],
      messagingStyle: "Clear and aspirational",
    },
    creativeDirectionSummary: `${brandName} is a brand with a refined aesthetic. Photography should be clean and professional, with balanced compositions and soft lighting. Focus on quality and craftsmanship in every visual.`,
  };
}

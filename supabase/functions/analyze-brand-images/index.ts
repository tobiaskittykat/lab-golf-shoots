/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ColorPalette {
  description: string;
  foundation: string[];
  accents: string[];
  seasonalPops?: string[];
}

interface ModelStyling {
  usesModels: boolean;
  demographics: string;
  expression: string;
  poseStyle: string;
  stylingAesthetic: string;
  hairAndMakeup: string;
  bodyLanguage: string;
}

interface VisualDNA {
  colorPalette: ColorPalette;
  colorMood: string;
  photographyStyle: string;
  texturePreferences: string[];
  lightingStyle: string;
  compositionStyle: string;
  avoidElements: string[];
  modelStyling?: ModelStyling;
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
  category: string;
  // Model detection fields
  hasModel: boolean;
  modelDetails?: {
    demographics: string;
    expression: string;
    pose: string;
    styling: string;
    hairMakeup: string;
  };
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

      // Update the image with analysis and inferred category
      const { error: updateError } = await supabase
        .from('brand_images')
        .update({ 
          visual_analysis: analysis,
          category: analysis.category 
        })
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

      // Batch size to prevent timeout - analyze max 10 images per call
      const BATCH_SIZE = 10;
      const PARALLEL_LIMIT = 3;

      // Fetch all brand images
      const { data: brandImages, error: imagesError } = await supabase
        .from('brand_images')
        .select('*')
        .eq('brand_id', brandId)
        .eq('user_id', user.id);

      if (imagesError) {
        throw new Error(`Failed to fetch brand images: ${imagesError.message}`);
      }

      // Analyze any unanalyzed images first, or images missing model detection data (legacy)
      const unanalyzedImages = (brandImages || []).filter(img => {
        // Re-analyze if no visual_analysis exists
        if (!img.visual_analysis) return true;
        // Also re-analyze if hasModel field is missing (legacy data before model detection)
        const analysis = img.visual_analysis as Record<string, unknown>;
        if (analysis.hasModel === undefined) return true;
        return false;
      });
      
      const totalNeedingAnalysis = unanalyzedImages.length;
      const imagesToAnalyze = unanalyzedImages.slice(0, BATCH_SIZE);
      const remainingCount = Math.max(0, totalNeedingAnalysis - BATCH_SIZE);
      
      console.log(`Found ${totalNeedingAnalysis} images needing analysis. Processing ${imagesToAnalyze.length} this batch, ${remainingCount} remaining.`);

      // Process images in parallel batches for speed
      for (let i = 0; i < imagesToAnalyze.length; i += PARALLEL_LIMIT) {
        const batch = imagesToAnalyze.slice(i, i + PARALLEL_LIMIT);
        await Promise.all(batch.map(async (img) => {
          try {
            const analysis = await analyzeImage(img.image_url, LOVABLE_API_KEY);
            await supabase
              .from('brand_images')
              .update({ visual_analysis: analysis })
              .eq('id', img.id);
            img.visual_analysis = analysis;
            console.log(`Analyzed image ${img.id}`);
          } catch (err) {
            console.error(`Failed to analyze image ${img.id}:`, err);
          }
        }));
      }

      // Fetch existing brand context and preserve manual overrides
      const existingContext = brand.brand_context || {};
      const existingBrain = (existingContext as any).brandBrain;
      
      // Capture manual overrides that should be preserved
      const manualOverrides = {
        avoidElements: existingBrain?.visualDNA?.avoidElements,
        // Add other fields users might manually edit here
      };

      // Synthesize Brand Brain from all sources
      const brandBrain = await synthesizeBrandBrain(
        brandImages || [],
        existingContext,
        brand.name,
        LOVABLE_API_KEY
      );

      // Merge back manual overrides if they existed and had content
      if (manualOverrides.avoidElements && manualOverrides.avoidElements.length > 0) {
        console.log(`Preserving ${manualOverrides.avoidElements.length} manual avoid elements`);
        brandBrain.visualDNA.avoidElements = manualOverrides.avoidElements;
      }

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
        JSON.stringify({ 
          success: true, 
          brandBrain,
          pendingAnalysis: remainingCount > 0,
          remainingImages: remainingCount,
          analyzedThisBatch: imagesToAnalyze.length
        }),
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
- Photography/visual style
- Category: Determine if this is a logo, campaign/editorial shot, product photo, lifestyle image, texture/pattern closeup, or general brand image
- Model Detection: Does the image contain a model/person? If yes, describe their demographics (age range, diversity), facial expression, pose style, clothing/styling aesthetic, and hair & makeup`;

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
                },
                category: {
                  type: "string",
                  enum: ["logo", "campaign", "product", "lifestyle", "texture", "general"],
                  description: "Image category: 'logo' for brand logos/marks/wordmarks, 'campaign' for editorial/advertising/hero shots, 'product' for product-focused shots on plain backgrounds, 'lifestyle' for products in use/context/with models, 'texture' for material/pattern/detail closeups, 'general' for other brand imagery"
                },
                hasModel: {
                  type: "boolean",
                  description: "Whether the image contains a model/person"
                },
                modelDetails: {
                  type: "object",
                  properties: {
                    demographics: {
                      type: "string",
                      description: "Age range and diversity characteristics (e.g., 'young professional, 25-35, diverse')"
                    },
                    expression: {
                      type: "string",
                      description: "Facial expression and energy (e.g., 'confident, subtle smile, candid')"
                    },
                    pose: {
                      type: "string",
                      description: "Pose style (e.g., 'natural, relaxed, lifestyle in motion')"
                    },
                    styling: {
                      type: "string",
                      description: "Wardrobe/styling aesthetic (e.g., 'minimalist, elevated casual, monochromatic')"
                    },
                    hairMakeup: {
                      type: "string",
                      description: "Hair and makeup style (e.g., 'natural glam, soft waves, dewy skin')"
                    }
                  },
                  description: "Details about the model if hasModel is true"
                }
              },
              required: ["colors", "lighting", "composition", "textures", "mood", "style", "category", "hasModel"],
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

  // Extract model data from images that have models
  const modelAnalyses = imageAnalyses
    .filter((analysis: any) => analysis.hasModel && analysis.modelDetails)
    .map((analysis: any) => analysis.modelDetails);

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

MODEL ANALYSIS (from ${modelAnalyses.length} images with models):
${modelAnalyses.length > 0 ? JSON.stringify(modelAnalyses, null, 2) : "No models detected in brand imagery - this brand may not use models, or no lifestyle/campaign imagery has been uploaded yet."}

Synthesize this into a cohesive Brand Brain that:
1. Identifies the dominant visual patterns across all sources
2. Reconciles any conflicts between stated guidelines and actual imagery
3. Creates a clear, actionable creative direction summary
4. Defines what to avoid based on brand identity
5. If models are detected, synthesize consistent model styling guidelines (demographics, expression, pose, wardrobe, hair & makeup, body language)`;

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
                    colorPalette: {
                      type: "object",
                      properties: {
                        description: {
                          type: "string",
                          description: "One sentence describing the overall palette character (e.g., 'Warm neutral foundation with luxurious metallic accents')"
                        },
                        foundation: {
                          type: "array",
                          items: { type: "string" },
                          description: "2-4 base/background colors that appear most frequently across brand imagery"
                        },
                        accents: {
                          type: "array",
                          items: { type: "string" },
                          description: "1-3 accent/highlight colors used for emphasis (e.g., gold hardware, brand color pops)"
                        },
                        seasonalPops: {
                          type: "array",
                          items: { type: "string" },
                          description: "0-3 optional variety colors that appear in seasonal or limited collections"
                        }
                      },
                      required: ["description", "foundation", "accents"]
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
                    },
                    modelStyling: {
                      type: "object",
                      properties: {
                        usesModels: {
                          type: "boolean",
                          description: "Whether the brand typically uses models in imagery"
                        },
                        demographics: {
                          type: "string",
                          description: "Target model demographics (e.g., 'diverse, young professionals, 25-35')"
                        },
                        expression: {
                          type: "string",
                          description: "Preferred facial expression and energy (e.g., 'confident, subtle smile, candid')"
                        },
                        poseStyle: {
                          type: "string",
                          description: "Preferred pose style (e.g., 'natural, relaxed, lifestyle in motion')"
                        },
                        stylingAesthetic: {
                          type: "string",
                          description: "Wardrobe/styling aesthetic (e.g., 'minimalist, elevated casual, monochromatic')"
                        },
                        hairAndMakeup: {
                          type: "string",
                          description: "Hair and makeup style (e.g., 'natural glam, soft waves, dewy skin')"
                        },
                        bodyLanguage: {
                          type: "string",
                          description: "Body language and energy (e.g., 'open, approachable, dynamic')"
                        }
                      },
                      required: ["usesModels"],
                      description: "Model styling guidelines if the brand uses models"
                    }
                  },
                  required: ["colorPalette", "colorMood", "photographyStyle", "texturePreferences", "lightingStyle", "compositionStyle", "avoidElements", "modelStyling"]
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
      colorPalette: {
        description: "Professional and refined color palette",
        foundation: vs.color_palette?.slice(0, 3) || ["neutral grey", "warm white"],
        accents: vs.color_palette?.slice(3) || [],
        seasonalPops: [],
      },
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

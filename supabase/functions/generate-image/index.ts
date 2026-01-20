/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateImageRequest {
  // Concept info
  prompt: string;
  conceptTitle?: string;
  conceptDescription?: string;
  
  // Style settings
  moodboardId?: string;
  moodboardDescription?: string;
  moodboardUrl?: string; // NEW: Actual moodboard image URL
  artisticStyle?: string;
  lightingStyle?: string;
  cameraAngle?: string;
  
  // References (URLs) - now arrays for multiple references
  productReferenceUrls?: string[];
  contextReferenceUrls?: string[];
  
  // Edit mode
  sourceImageUrl?: string;
  editMode?: boolean;
  
  // Extra prompt settings
  extraKeywords?: string[];
  negativePrompt?: string;
  textOnImage?: string;
  
  // Output settings
  imageCount?: number;
  resolution?: string;
  aspectRatio?: string;
  
  // AI settings
  aiModel?: string;
  guidanceScale?: number;
  seed?: number | null;
  
  // Organization
  brandId?: string;
  folder?: string;
}

// AI model mapping
const modelMap: Record<string, string> = {
  'auto': 'google/gemini-3-pro-image-preview',
  'nano-banana': 'google/gemini-2.5-flash-image-preview',
};

// Build the text prompt from all settings
function buildPrompt(request: GenerateImageRequest): string {
  const parts: string[] = [];
  
  // Base concept
  if (request.conceptDescription) {
    parts.push(request.conceptDescription);
  } else if (request.prompt) {
    parts.push(request.prompt);
  }
  
  // Artistic style
  if (request.artisticStyle && request.artisticStyle !== 'auto') {
    const styleDescriptions: Record<string, string> = {
      'photorealistic': 'photorealistic, highly detailed, professional photography',
      'cinematic': 'cinematic composition, dramatic lighting, film-like quality',
      'film-noir': 'film noir style, high contrast, dramatic shadows, black and white mood',
      'vintage-film': 'vintage film aesthetic, grain, warm tones, nostalgic feel',
      'cartoon': 'cartoon style, vibrant colors, stylized illustration',
      'anime': 'anime art style, clean lines, expressive, Japanese animation aesthetic',
      '3d-render': '3D rendered, volumetric lighting, CGI quality',
      'watercolor': 'watercolor painting, soft edges, flowing colors',
      'oil-painting': 'oil painting style, rich textures, classical art feel',
      'pop-art': 'pop art style, bold colors, graphic design elements',
      'cyberpunk': 'cyberpunk aesthetic, neon lights, futuristic, high-tech',
      'minimalist': 'minimalist design, clean, simple, negative space',
      'sketch': 'pencil sketch style, hand-drawn, artistic lines',
      'collage': 'collage art style, mixed media, layered elements',
    };
    parts.push(styleDescriptions[request.artisticStyle] || request.artisticStyle);
  }
  
  // Moodboard description
  if (request.moodboardDescription) {
    parts.push(`Mood: ${request.moodboardDescription}`);
  }
  
  // Lighting
  if (request.lightingStyle && request.lightingStyle !== 'auto') {
    const lightingDescriptions: Record<string, string> = {
      'natural': 'natural lighting',
      'studio': 'professional studio lighting',
      'dramatic': 'dramatic lighting with strong shadows',
      'golden-hour': 'golden hour warm lighting',
      'soft': 'soft diffused lighting',
      'neon': 'neon lighting, colorful glow',
      'backlit': 'backlit, rim lighting effect',
    };
    parts.push(lightingDescriptions[request.lightingStyle] || request.lightingStyle);
  }
  
  // Camera angle
  if (request.cameraAngle && request.cameraAngle !== 'auto') {
    const angleDescriptions: Record<string, string> = {
      'eye-level': 'eye level shot',
      'overhead': 'overhead flat lay shot',
      'close-up': 'close-up macro shot',
      'wide': 'wide angle shot',
      'low-angle': 'low angle hero shot',
      'dutch-angle': 'dutch angle tilted composition',
    };
    parts.push(angleDescriptions[request.cameraAngle] || request.cameraAngle);
  }
  
  // Extra keywords
  if (request.extraKeywords && request.extraKeywords.length > 0) {
    parts.push(request.extraKeywords.join(', '));
  }
  
  // Text on image
  if (request.textOnImage) {
    parts.push(`With text overlay: "${request.textOnImage}"`);
  }
  
  // Quality enhancers
  parts.push('high quality, professional, sharp focus');
  
  // Negative prompt handling - prepend what to avoid
  let finalPrompt = parts.join('. ');
  if (request.negativePrompt) {
    finalPrompt += `. Avoid: ${request.negativePrompt}`;
  }
  
  return finalPrompt;
}

// Convert base64 to Uint8Array for upload
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
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

    const body: GenerateImageRequest = await req.json();
    const imageCount = Math.min(body.imageCount || 1, 8);
    const selectedModel = modelMap[body.aiModel || 'auto'] || modelMap['auto'];
    
    console.log("Generating", imageCount, "images with model:", selectedModel);
    console.log("Request:", JSON.stringify(body, null, 2));

    // Build the refined prompt
    const refinedPrompt = buildPrompt(body);
    console.log("Refined prompt:", refinedPrompt);

    // Generate images in parallel for faster response
    const generateSingleImage = async (index: number): Promise<any> => {
      try {
        console.log(`Generating image ${index + 1}/${imageCount}...`);
        
        // Build multimodal content
        const messageContent: any[] = [
          { type: "text", text: refinedPrompt }
        ];
        
        // Add source image for editing (image-to-image)
        if (body.editMode && body.sourceImageUrl && body.sourceImageUrl.startsWith('http')) {
          messageContent.unshift({
            type: "image_url",
            image_url: { url: body.sourceImageUrl }
          });
          messageContent.unshift({
            type: "text",
            text: "Edit the following image according to these instructions:"
          });
        }
        
        // Add moodboard reference as style guide (IMPORTANT: must attach as image)
        if (body.moodboardUrl && body.moodboardUrl.startsWith('http')) {
          messageContent.push({
            type: "image_url",
            image_url: { url: body.moodboardUrl }
          });
          messageContent.push({
            type: "text",
            text: "Use the above image as the STYLE and AESTHETIC reference. Match its color palette, mood, lighting, and visual atmosphere."
          });
        }
        
        // Add product references as visual inputs (up to 3)
        const productUrls = body.productReferenceUrls || [];
        if (productUrls.length > 0) {
          for (let i = 0; i < Math.min(productUrls.length, 3); i++) {
            const url = productUrls[i];
            if (url && url.startsWith('http')) {
              messageContent.push({
                type: "image_url",
                image_url: { url }
              });
            }
          }
          messageContent.push({
            type: "text",
            text: `Use the above ${productUrls.length} image(s) as the PRODUCT REFERENCE(s). Feature these products prominently in the generated image.`
          });
        }
        
        // Add context references as visual inputs (multiple environments/scenes)
        const contextUrls = body.contextReferenceUrls || [];
        if (contextUrls.length > 0) {
          for (const url of contextUrls) {
            if (url && url.startsWith('http')) {
              messageContent.push({
                type: "image_url",
                image_url: { url }
              });
            }
          }
          messageContent.push({
            type: "text",
            text: `Use the above image(s) as the SCENE/ENVIRONMENT context reference(s). Place the product in a similar setting.`
          });
        }

        // Call Lovable AI Gateway for image generation
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { 
                role: "user", 
                content: messageContent
              }
            ],
            modalities: ["image", "text"],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Image generation error for image ${index + 1}:`, response.status, errorText);
          return {
            status: 'failed',
            error: `Generation failed: ${response.status}`,
            index
          };
        }

        const aiResponse = await response.json();
        console.log(`AI response for image ${index + 1}:`, JSON.stringify(aiResponse).slice(0, 500));
        
        // Extract the image from the response
        const images = aiResponse.choices?.[0]?.message?.images;
        if (!images || images.length === 0) {
          console.error(`No images in response for image ${index + 1}`);
          return {
            status: 'failed',
            error: 'No image in response',
            index
          };
        }

        const imageData = images[0];
        const imageUrl = imageData.image_url?.url;
        
        if (!imageUrl || !imageUrl.startsWith('data:image')) {
          console.error(`Invalid image URL format for image ${index + 1}`);
          return {
            status: 'failed',
            error: 'Invalid image format',
            index
          };
        }

        // Extract base64 data
        const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!base64Match) {
          console.error(`Could not parse base64 for image ${index + 1}`);
          return {
            status: 'failed',
            error: 'Could not parse image data',
            index
          };
        }

        const imageFormat = base64Match[1];
        const base64Data = base64Match[2];
        const imageBytes = base64ToUint8Array(base64Data);
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const filename = `${user.id}/${timestamp}-${randomId}.${imageFormat}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('generated-images')
          .upload(filename, imageBytes, {
            contentType: `image/${imageFormat}`,
            cacheControl: '3600',
          });

        if (uploadError) {
          console.error(`Upload error for image ${index + 1}:`, uploadError);
          return {
            status: 'failed',
            error: 'Failed to save image',
            index
          };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('generated-images')
          .getPublicUrl(filename);

        const publicUrl = urlData.publicUrl;
        console.log(`Image ${index + 1} uploaded to:`, publicUrl);

        // Save to database with references stored in settings for reliable retrieval
        const { data: dbRecord, error: dbError } = await supabase
          .from('generated_images')
          .insert({
            user_id: user.id,
            brand_id: body.brandId || null,
            prompt: body.prompt,
            refined_prompt: refinedPrompt,
            negative_prompt: body.negativePrompt || null,
            image_url: publicUrl,
            product_reference_url: (body.productReferenceUrls && body.productReferenceUrls[0]) || null,
            context_reference_url: (body.contextReferenceUrls && body.contextReferenceUrls[0]) || null,
            moodboard_id: body.moodboardId || null,
            settings: {
              aiModel: body.aiModel,
              artisticStyle: body.artisticStyle,
              lightingStyle: body.lightingStyle,
              cameraAngle: body.cameraAngle,
              resolution: body.resolution,
              aspectRatio: body.aspectRatio,
              guidanceScale: body.guidanceScale,
              seed: body.seed,
              extraKeywords: body.extraKeywords,
              textOnImage: body.textOnImage,
              // Store all references for reliable UI display
              references: {
                moodboardId: body.moodboardId || null,
                moodboardUrl: body.moodboardUrl || null,
                moodboardDescription: body.moodboardDescription || null,
                productReferenceUrls: body.productReferenceUrls || [],
                contextReferenceUrls: body.contextReferenceUrls || [],
                sourceImageUrl: body.sourceImageUrl || null,
              },
            },
            concept_id: body.conceptTitle ? `concept-${index}` : null,
            concept_title: body.conceptTitle || null,
            status: 'completed',
            folder: body.folder || 'Uncategorized',
          })
          .select()
          .single();

        if (dbError) {
          console.error(`Database error for image ${index + 1}:`, dbError);
        }

        return {
          id: dbRecord?.id || `temp-${index}`,
          imageUrl: publicUrl,
          status: 'completed',
          prompt: body.prompt,
          refinedPrompt,
          index
        };

      } catch (imageError) {
        console.error(`Error generating image ${index + 1}:`, imageError);
        return {
          status: 'failed',
          error: imageError instanceof Error ? imageError.message : 'Unknown error',
          index
        };
      }
    };

    // Generate all images in parallel
    const imagePromises = Array.from({ length: imageCount }, (_, i) => generateSingleImage(i));
    const generatedImages = await Promise.all(imagePromises);

    // Check if any images were generated
    const successfulImages = generatedImages.filter(img => img.status === 'completed');
    console.log(`Generated ${successfulImages.length}/${imageCount} images successfully`);

    return new Response(
      JSON.stringify({ 
        images: generatedImages,
        total: imageCount,
        successful: successfulImages.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-image:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate images";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

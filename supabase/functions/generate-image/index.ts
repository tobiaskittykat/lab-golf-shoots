import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Extract user from JWT if present
    let userId: string | null = null;
    if (authHeader) {
      const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "", {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await anonClient.auth.getUser();
      userId = data.user?.id || null;
    }

    const body = await req.json();
    const {
      prompt, conceptTitle, conceptDescription, coreIdea,
      shotTypePrompt, productReferenceUrls, moodboardUrl, moodboardDescription,
      brandName, brandPersonality, brandBrain, customPromptAgentSystemPrompt,
      imageCount = 1, aspectRatio = "1:1", aiModel = "auto",
      brandId, componentOverrides, originalComponents, productIdentity,
      editMode, sourceImageUrl, remixMode,
      extraKeywords, negativePrompt, textOnImage,
      artisticStyle, lightingStyle, cameraAngle,
      productShootConfig, attachReferenceImages,
      variantReferenceUrls,
    } = body;

    // Build the image generation prompt
    const promptParts: string[] = [];

    if (shotTypePrompt) {
      promptParts.push(shotTypePrompt);
    }

    if (conceptDescription || coreIdea) {
      promptParts.push(conceptDescription || coreIdea);
    }

    if (prompt && !shotTypePrompt) {
      promptParts.push(prompt);
    }

    if (brandBrain?.visualDNA) {
      const vdna = brandBrain.visualDNA;
      if (vdna.photographyStyle) promptParts.push(`Photography style: ${vdna.photographyStyle}`);
      if (vdna.lightingStyle) promptParts.push(`Lighting: ${vdna.lightingStyle}`);
    }

    if (artisticStyle && artisticStyle !== 'auto') promptParts.push(`Style: ${artisticStyle}`);
    if (lightingStyle && lightingStyle !== 'auto') promptParts.push(`Lighting: ${lightingStyle}`);
    if (cameraAngle && cameraAngle !== 'auto') promptParts.push(`Camera angle: ${cameraAngle}`);
    if (extraKeywords?.length) promptParts.push(`Keywords: ${extraKeywords.join(', ')}`);
    if (negativePrompt) promptParts.push(`Avoid: ${negativePrompt}`);
    if (textOnImage) promptParts.push(`Include text overlay: "${textOnImage}"`);

    // Component override instructions
    if (componentOverrides && originalComponents) {
      promptParts.push("\n=== PRODUCT COMPONENT OVERRIDES ===");
      for (const [type, override] of Object.entries(componentOverrides)) {
        if (override && typeof override === 'object') {
          const ov = override as { material: string; color: string };
          const orig = (originalComponents as any)[type];
          promptParts.push(`${type.toUpperCase()}: ${ov.material} in ${ov.color}`);
          if (orig) promptParts.push(`  (Original: ${orig.material} in ${orig.color})`);
        }
      }
      promptParts.push("Keep overall shoe silhouette/shape unchanged.");
    }

    const finalPrompt = promptParts.join("\n\n");

    // Create pending image records
    const pendingIds: string[] = [];
    for (let i = 0; i < imageCount; i++) {
      const record: any = {
        user_id: userId || "00000000-0000-0000-0000-000000000000",
        brand_id: brandId || null,
        prompt: finalPrompt,
        concept_title: conceptTitle || null,
        status: "pending",
        settings: {
          aiModel, artisticStyle, lightingStyle, cameraAngle, aspectRatio,
          brandId, productIdentity,
          references: {
            productReferenceUrls, moodboardUrl, shotTypePrompt,
            componentOverrides, originalComponents,
          },
        },
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("generated_images")
        .insert(record)
        .select("id")
        .single();

      if (insertErr) {
        console.error("Insert error:", insertErr);
        continue;
      }
      pendingIds.push(inserted.id);
    }

    if (pendingIds.length === 0) {
      return new Response(JSON.stringify({ error: "Failed to create image records" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Select AI model
    const modelMap: Record<string, string> = {
      auto: "google/gemini-3-pro-image-preview",
      "nano-banana": "google/gemini-3.1-flash-image-preview",
    };
    const selectedModel = modelMap[aiModel] || modelMap.auto;

    // Build shared content array
    const content: any[] = [{ type: "text", text: finalPrompt }];
    if (attachReferenceImages !== false && productReferenceUrls?.length > 0) {
      for (const refUrl of productReferenceUrls.slice(0, 8)) {
        content.push({ type: "image_url", image_url: { url: refUrl } });
      }
    }
    if (variantReferenceUrls?.length > 0) {
      for (const varUrl of variantReferenceUrls.slice(0, 4)) {
        content.push({ type: "image_url", image_url: { url: varUrl } });
      }
    }
    if (moodboardUrl) {
      content.push({ type: "image_url", image_url: { url: moodboardUrl } });
    }
    if ((editMode || remixMode) && sourceImageUrl) {
      content.push({ type: "image_url", image_url: { url: sourceImageUrl } });
    }

    const messages = [{ role: "user", content }];
    console.log(`[generate-image] Processing ${pendingIds.length} images, ${content.length} content parts, model: ${selectedModel}`);

    // Process all images in parallel for speed
    const processImage = async (pendingId: string) => {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ model: selectedModel, messages, modalities: ["image", "text"] }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`AI error for ${pendingId}:`, aiResponse.status, errText);
          await supabase.from("generated_images").update({
            status: "failed", error_message: `AI error: ${aiResponse.status}`,
          }).eq("id", pendingId);
          return;
        }

        const aiData = await aiResponse.json();
        const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        const refinedPrompt = aiData.choices?.[0]?.message?.content || null;

        if (!imageData) {
          console.error(`No image for ${pendingId}:`, JSON.stringify(aiData).slice(0, 500));
          await supabase.from("generated_images").update({
            status: "failed", error_message: "No image returned from AI",
          }).eq("id", pendingId);
          return;
        }

        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const storagePath = `generated/${pendingId}.png`;

        const { error: uploadErr } = await supabase.storage
          .from("brand-assets")
          .upload(storagePath, imageBytes, { contentType: "image/png", upsert: true });

        if (uploadErr) {
          console.error("Upload error:", uploadErr);
          await supabase.from("generated_images").update({
            status: "completed", image_url: imageData, refined_prompt: refinedPrompt,
          }).eq("id", pendingId);
          return;
        }

        const { data: urlData } = supabase.storage.from("brand-assets").getPublicUrl(storagePath);
        await supabase.from("generated_images").update({
          status: "completed", image_url: urlData.publicUrl, refined_prompt: refinedPrompt,
        }).eq("id", pendingId);
        console.log(`[generate-image] Completed ${pendingId}`);
      } catch (err) {
        console.error(`Error generating ${pendingId}:`, err);
        await supabase.from("generated_images").update({
          status: "failed", error_message: err instanceof Error ? err.message : "Unknown error",
        }).eq("id", pendingId);
      }
    };

    await Promise.allSettled(pendingIds.map(processImage));

    return new Response(JSON.stringify({ pendingIds }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

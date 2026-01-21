import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScrapedImage {
  url: string;
  category: string;
  description?: string;
}

async function mirrorImageToStorage(
  supabaseClient: any,
  imageUrl: string,
  brandId: string,
  imageId: string
): Promise<{ storagePath: string; publicUrl: string } | null> {
  try {
    console.log(`Mirroring image: ${imageUrl}`);
    
    // Download the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrandImageScraper/1.0)',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const imageBuffer = await response.arrayBuffer();
    
    // Skip very small images (likely icons)
    if (imageBuffer.byteLength < 10000) {
      console.log(`Skipping small image: ${imageBuffer.byteLength} bytes`);
      return null;
    }

    const storagePath = `${brandId}/${imageId}.${extension}`;

    // Upload to storage
    const { error: uploadError } = await supabaseClient.storage
      .from('brand-assets')
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Upload error: ${uploadError.message}`);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('brand-assets')
      .getPublicUrl(storagePath);

    return {
      storagePath,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error(`Error mirroring image: ${error}`);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandId, url } = await req.json();

    if (!brandId || !url) {
      return new Response(
        JSON.stringify({ success: false, error: "brandId and url are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify brand ownership
    const { data: brand, error: brandError } = await supabaseClient
      .from("brands")
      .select("id, name")
      .eq("id", brandId)
      .eq("user_id", userId)
      .single();

    if (brandError || !brand) {
      return new Response(
        JSON.stringify({ success: false, error: "Brand not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Scraping brand images from: ${url} for brand: ${brand.name}`);

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Define schema for image extraction
    const imageSchema = {
      type: "object",
      properties: {
        images: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: { type: "string", description: "Full absolute URL of the image" },
              category: { 
                type: "string", 
                enum: ["lifestyle", "campaign", "product", "logo", "general"],
                description: "Category of the image based on content"
              },
              description: { type: "string", description: "Brief description of image content" }
            },
            required: ["url", "category"]
          }
        }
      },
      required: ["images"]
    };

    // Call Firecrawl to scrape images
    const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["extract"],
        extract: {
          schema: imageSchema,
          prompt: `Extract up to 15 high-quality lifestyle and campaign images from this brand website.

FOCUS ON:
- Hero images showing products being worn or used in lifestyle context
- Lifestyle photography with models
- Campaign or editorial shots
- Mood and ambiance images that represent the brand aesthetic
- High-quality product photography with interesting composition

DO NOT INCLUDE:
- Small product catalog thumbnails (grid items under 400px)
- Logos, icons, or UI elements
- Navigation or footer images
- Social media icons
- Images that appear to be from third-party sites
- Duplicate or very similar images

Return the full absolute URL for each image (not relative paths).
Categorize each as: lifestyle, campaign, product, or general based on content.`
        },
        waitFor: 3000,
      }),
    });

    const firecrawlData = await firecrawlResponse.json();

    if (!firecrawlResponse.ok) {
      console.error("Firecrawl error:", firecrawlData);
      return new Response(
        JSON.stringify({ success: false, error: firecrawlData.error || "Scraping failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const extractedImages: ScrapedImage[] = firecrawlData.data?.extract?.images || 
                                             firecrawlData.extract?.images || 
                                             [];

    console.log(`Found ${extractedImages.length} images to process`);

    // Filter valid images
    const validImages = extractedImages.filter(img => {
      if (!img.url) return false;
      // Skip data URIs and relative URLs
      if (img.url.startsWith("data:")) return false;
      if (!img.url.startsWith("http")) return false;
      // Skip common icon/small image patterns
      if (img.url.includes("/icons/")) return false;
      if (img.url.includes("favicon")) return false;
      return true;
    });

    console.log(`${validImages.length} valid images after filtering`);

    let imagesAdded = 0;
    const addedImages: any[] = [];

    // Process each image
    for (const img of validImages.slice(0, 15)) {
      try {
        const imageId = crypto.randomUUID();
        
        // Mirror to storage
        const mirrored = await mirrorImageToStorage(supabaseClient, img.url, brandId, imageId);
        
        if (!mirrored) {
          console.log(`Skipping image (mirror failed): ${img.url}`);
          continue;
        }

        // Insert into brand_images
        const { data: imageRecord, error: insertError } = await supabaseClient
          .from("brand_images")
          .insert({
            id: imageId,
            brand_id: brandId,
            user_id: userId,
            image_url: mirrored.publicUrl,
            thumbnail_url: mirrored.publicUrl,
            category: img.category || "general",
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Insert error: ${insertError.message}`);
          continue;
        }

        addedImages.push(imageRecord);
        imagesAdded++;
        console.log(`Added image: ${img.category} - ${mirrored.publicUrl}`);

        // Trigger background analysis
        const lovableKey = Deno.env.get("LOVABLE_API_KEY");
        if (lovableKey) {
          // Fire and forget - don't await
          supabaseClient.functions.invoke("analyze-brand-images", {
            body: { brandId, imageId },
          }).catch((err: Error) => {
            console.log(`Background analysis queued for ${imageId}`);
          });
        }
      } catch (err) {
        console.error(`Error processing image: ${err}`);
      }
    }

    console.log(`Successfully added ${imagesAdded} images`);

    return new Response(
      JSON.stringify({
        success: true,
        imagesAdded,
        imagesFound: extractedImages.length,
        images: addedImages,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scrape-brand-images:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

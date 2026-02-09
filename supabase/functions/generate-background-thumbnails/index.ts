import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// All background presets with optimized prompts for thumbnail generation
const BACKGROUNDS = [
  // Studio backgrounds (10)
  { id: 'studio-white', prompt: 'Pure white seamless photography studio cyclorama, soft diffused lighting, clean professional backdrop, empty room, no objects' },
  { id: 'studio-black', prompt: 'Deep black photography studio void backdrop, dramatic rim lighting, high contrast, empty space, no objects' },
  { id: 'studio-gradient-warm', prompt: 'Soft warm gradient background, pink to peach to orange tones, fashion photography studio, smooth color transition, empty' },
  { id: 'studio-gradient-cool', prompt: 'Soft cool gradient background, light blue to lavender purple tones, modern studio, smooth color transition, empty' },
  { id: 'studio-concrete', prompt: 'Polished concrete floor studio, industrial minimalist, grey textured surface, soft window light, empty space' },
  { id: 'studio-marble', prompt: 'White marble surface with subtle grey veining, luxury photography setting, elegant clean backdrop, empty' },
  { id: 'studio-fabric', prompt: 'Soft natural linen fabric backdrop, cream beige texture, draped cloth, diffused lighting, empty' },
  { id: 'studio-wood', prompt: 'Warm honey oak wood surface, natural wood grain texture, rustic photography backdrop, soft lighting, empty' },
  { id: 'studio-terrazzo', prompt: 'Modern terrazzo surface with colorful stone chips, white base, contemporary design, clean, empty' },
  { id: 'studio-paper', prompt: 'Seamless cream paper photography backdrop, subtle texture, classic studio setup, soft shadows, empty' },
  
  // Outdoor backgrounds (12)
  { id: 'outdoor-beach', prompt: 'Sandy beach scene, golden sand, soft ocean waves in distance, golden hour sunlight, coastal atmosphere, no people' },
  { id: 'outdoor-urban', prompt: 'Modern urban city street, contemporary architecture, clean sidewalk, stylish metropolitan setting, no people' },
  { id: 'outdoor-park', prompt: 'Lush green park lawn, dappled sunlight through trees, fresh natural atmosphere, grass and foliage, no people' },
  { id: 'outdoor-cafe', prompt: 'Charming European cafe terrace, cobblestone street, bistro setting, warm afternoon light, no people' },
  { id: 'outdoor-desert', prompt: 'Dramatic desert sand dunes, warm golden light, minimalist vast landscape, natural curves, no people' },
  { id: 'outdoor-forest', prompt: 'Serene forest path, filtered sunlight through trees, earthy natural tones, peaceful woodland, no people' },
  { id: 'outdoor-rooftop', prompt: 'Modern rooftop terrace, city skyline in background, golden hour, urban lifestyle setting, no people' },
  { id: 'outdoor-pool', prompt: 'Luxury poolside scene, turquoise water, white deck, resort atmosphere, bright daylight, no people' },
  { id: 'outdoor-mountain', prompt: 'Mountain hiking trail scenic overlook, dramatic landscape, adventure outdoor setting, clear sky, no people' },
  { id: 'outdoor-vineyard', prompt: 'Rolling vineyard hills, grapevines rows, golden afternoon light, Tuscan countryside aesthetic, no people' },
  { id: 'outdoor-boardwalk', prompt: 'Wooden seaside boardwalk, ocean view, coastal breeze atmosphere, summer vacation vibes, no people' },
  { id: 'outdoor-market', prompt: 'Vibrant street market scene, colorful stalls, bustling atmosphere backdrop, authentic local setting, no people' },
  { id: 'outdoor-cactus-garden', prompt: 'Southwestern desert landscape with large prickly pear cactus plants, sandy beige ground, natural desert setting, no people, no products' },
  { id: 'outdoor-cracked-earth', prompt: 'Dry cracked earth surface with deep fissures, drought affected clay ground, dramatic arid texture, no people, no products' },
  { id: 'outdoor-salt-flats', prompt: 'White crystalline salt flat surface with turquoise and green mineral deposits, otherworldly geothermal landscape, no people, no products' },
  { id: 'outdoor-picnic', prompt: 'Red and white gingham checked picnic blanket spread on green grass, casual summer outdoor setting, no people, no products' },
  { id: 'outdoor-rocky-shore', prompt: 'Natural weathered limestone rock surface meeting turquoise clear water, serene coastal spa atmosphere, no people, no products' },
  { id: 'outdoor-weathered-metal', prompt: 'Oxidized rusted metal surface with copper and golden patina, industrial artistic texture with warm tones, no people, no products' },
  { id: 'outdoor-grass-concrete', prompt: 'Clean concrete pavement edge meeting vibrant green grass, modern architectural urban nature transition, no people, no products' },
];

async function generateImage(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: `Generate a simple, clean background preview image for product photography selection thumbnail. 
            
Setting: ${prompt}

Style requirements:
- Empty background only, absolutely no products, people, or objects
- Soft, even lighting
- 4:3 aspect ratio composition
- Clean and professional
- Suitable as a small selection thumbnail`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      console.error(`Image generation failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error("No image URL in response");
      return null;
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

async function uploadToStorage(
  supabase: any,
  imageData: string,
  backgroundId: string
): Promise<string | null> {
  try {
    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const filePath = `bg-thumbnails/${backgroundId}.png`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error(`Upload error for ${backgroundId}:`, uploadError);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${backgroundId}:`, error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Parse request body for optional filtering
    let specificIds: string[] | null = null;
    try {
      const body = await req.json();
      if (body.ids && Array.isArray(body.ids)) {
        specificIds = body.ids;
      }
    } catch {
      // No body or invalid JSON, generate all
    }

    const backgroundsToGenerate = specificIds 
      ? BACKGROUNDS.filter(bg => specificIds!.includes(bg.id))
      : BACKGROUNDS;

    console.log(`Generating ${backgroundsToGenerate.length} background thumbnails...`);

    const results: Record<string, string> = {};
    const errors: string[] = [];

    // Process sequentially to avoid rate limits
    for (const bg of backgroundsToGenerate) {
      console.log(`Generating: ${bg.id}`);
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const imageData = await generateImage(bg.prompt, LOVABLE_API_KEY);
      
      if (imageData) {
        const publicUrl = await uploadToStorage(supabase, imageData, bg.id);
        if (publicUrl) {
          results[bg.id] = publicUrl;
          console.log(`✓ ${bg.id}: ${publicUrl}`);
        } else {
          errors.push(`${bg.id}: Upload failed`);
        }
      } else {
        errors.push(`${bg.id}: Generation failed`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: Object.keys(results).length,
        total: backgroundsToGenerate.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

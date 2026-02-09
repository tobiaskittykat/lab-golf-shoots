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
  
  // Outdoor backgrounds (19) - Birkenstock campaign editorial aesthetic
  { id: 'outdoor-beach', prompt: 'Warm golden sand with natural ripple texture, soft golden hour light, distant ocean blur, raw coastal Mediterranean atmosphere, earthy muted tones, no people, no products' },
  { id: 'outdoor-urban', prompt: 'Sun-warmed cobblestone European side street, aged sandstone walls, warm afternoon light with long shadows, lived-in urban character with patina, no people, no products' },
  { id: 'outdoor-park', prompt: 'Wild meadow grass with wildflowers, dappled golden sunlight through mature oak trees, natural organic parkland, earthy greens, no people, no products' },
  { id: 'outdoor-cafe', prompt: 'Weathered wooden bistro table on aged cobblestones, terracotta-toned Mediterranean walls, warm afternoon light, artisan cafe culture, no people, no products' },
  { id: 'outdoor-desert', prompt: 'Sculptural desert dune with wind-carved ridges, warm amber golden hour, vast minimalist landscape, raw earth textures, no people, no products' },
  { id: 'outdoor-forest', prompt: 'Dappled light through ancient oak canopy, moss-covered forest floor, rich earthy greens and browns, organic natural sanctuary, no people, no products' },
  { id: 'outdoor-rooftop', prompt: 'Weathered terracotta rooftop terrace, potted olive trees, warm golden hour cityscape, Mediterranean lifestyle atmosphere, no people, no products' },
  { id: 'outdoor-pool', prompt: 'Natural stone pool edge with sun-warmed travertine deck, turquoise water reflections, Mediterranean resort warmth, no people, no products' },
  { id: 'outdoor-mountain', prompt: 'Rugged mountain trail with worn natural stone, alpine wildflowers, expansive valley vista, raw outdoor adventure atmosphere, no people, no products' },
  { id: 'outdoor-vineyard', prompt: 'Sun-drenched vineyard rows with gnarled old vines, golden Tuscan light, terracotta earth between rows, artisanal wine country, no people, no products' },
  { id: 'outdoor-boardwalk', prompt: 'Sun-bleached weathered timber boardwalk, natural wood grain and patina, coastal salt air atmosphere, raw seaside character, no people, no products' },
  { id: 'outdoor-market', prompt: 'Artisan outdoor market with handwoven textiles and ceramics, warm natural materials, Mediterranean bazaar atmosphere, no people, no products' },
  { id: 'outdoor-cactus-garden', prompt: 'Southwestern desert garden with sculptural prickly pear cactus, warm sandy earth, terracotta and sage tones, raw natural desert flora, no people, no products' },
  { id: 'outdoor-cracked-earth', prompt: 'Sun-baked cracked clay earth with deep fissures, warm ochre and sienna tones, raw elemental texture, dramatic arid landscape, no people, no products' },
  { id: 'outdoor-salt-flats', prompt: 'Crystalline salt flat surface with mineral deposits, otherworldly natural landscape, warm reflected light, raw geological wonder, no people, no products' },
  { id: 'outdoor-picnic', prompt: 'Faded vintage gingham blanket on wild meadow grass, casual golden afternoon, handmade wicker basket vibe, relaxed editorial, no people, no products' },
  { id: 'outdoor-rocky-shore', prompt: 'Sun-warmed limestone rocks meeting clear turquoise shallows, natural coastal erosion texture, Mediterranean cove atmosphere, no people, no products' },
  { id: 'outdoor-weathered-metal', prompt: 'Naturally oxidized copper and iron surface with warm patina, golden rust tones, industrial craft texture with organic aging, no people, no products' },
  { id: 'outdoor-grass-concrete', prompt: 'Raw concrete slab edge meeting wild grass and clover, warm natural light, architectural meets organic, earthy tones, no people, no products' },
];

async function generateImage(prompt: string, apiKey: string, isOutdoor: boolean): Promise<string | null> {
  try {
    const styleInstructions = isOutdoor
      ? `Generate a background preview image in the style of a Birkenstock campaign photograph.

Setting: ${prompt}

Style requirements:
- Empty background only, absolutely no products, people, shoes, or objects
- Natural, earthy, grounded aesthetic -- NOT stock photography
- Warm natural lighting with organic textures visible
- Editorial photography feel with tactile materiality
- Muted, earthy color palette -- sand, terracotta, sage, stone, ochre
- Raw textures and natural imperfections, not polished or sterile
- 4:3 aspect ratio composition
- Suitable as a small selection thumbnail`
      : `Generate a simple, clean background preview image for product photography selection thumbnail. 
            
Setting: ${prompt}

Style requirements:
- Empty background only, absolutely no products, people, or objects
- Soft, even lighting
- 4:3 aspect ratio composition
- Clean and professional
- Suitable as a small selection thumbnail`;

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
            content: styleInstructions
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
      
      const imageData = await generateImage(bg.prompt, LOVABLE_API_KEY, bg.id.startsWith('outdoor-'));
      
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

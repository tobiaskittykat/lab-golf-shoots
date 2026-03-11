import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { brandId, url } = await req.json();

    if (!brandId || !url) throw new Error("brandId and url are required");

    // Fetch the webpage
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KittyKat/1.0)" },
    });

    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);

    const html = await response.text();

    // Extract image URLs from HTML
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    const ogRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
    const srcsetRegex = /srcset=["']([^"']+)["']/gi;

    const imageUrls = new Set<string>();

    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      imageUrls.add(match[1]);
    }
    while ((match = ogRegex.exec(html)) !== null) {
      imageUrls.add(match[1]);
    }

    // Resolve relative URLs and filter
    const baseUrl = new URL(url);
    const resolvedUrls: string[] = [];

    for (const imgUrl of imageUrls) {
      try {
        const resolved = new URL(imgUrl, baseUrl).href;
        // Filter out tiny images, icons, tracking pixels
        if (resolved.match(/\.(jpg|jpeg|png|webp)/i) &&
            !resolved.includes('favicon') &&
            !resolved.includes('icon') &&
            !resolved.includes('pixel') &&
            !resolved.includes('tracking') &&
            !resolved.includes('1x1')) {
          resolvedUrls.push(resolved);
        }
      } catch { /* invalid URL */ }
    }

    // Save images (limit to 20)
    const toSave = resolvedUrls.slice(0, 20);
    let imagesAdded = 0;

    for (const imageUrl of toSave) {
      const { error } = await supabase.from("brand_images").insert({
        brand_id: brandId,
        user_id: user.id,
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        category: "scraped",
      });

      if (!error) imagesAdded++;
    }

    return new Response(JSON.stringify({ imagesAdded, totalFound: resolvedUrls.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scrape-brand-images error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

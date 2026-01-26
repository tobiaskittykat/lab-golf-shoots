import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpenverseImage {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  source: string;
  creator?: string;
  creator_url?: string;
  license: string;
  license_url: string;
  detail_url: string;
}

interface SearchResult {
  url: string;
  thumbnailUrl: string;
  source: 'openverse';
  title: string;
  description?: string;
  creator?: string;
  license: string;
  originalSource: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 20, sources } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching Openverse for:', query);

    // Build search URL with optional source filter
    // Good sources for artistic content: flickr, wikimedia, rawpixel, smithsonian, europeana
    const params = new URLSearchParams({
      q: query,
      page_size: String(Math.min(limit, 50)),
      // Use permissive CC licenses instead of strict 'commercial' filter
      license: 'by,by-sa,by-nd,cc0,pdm',
      mature: 'false',
    });

    // Filter by high-quality sources if not specified
    if (sources && Array.isArray(sources) && sources.length > 0) {
      params.append('source', sources.join(','));
    }

    const searchUrl = `https://api.openverse.org/v1/images/?${params.toString()}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        // Openverse doesn't require auth for basic searches
      },
    });

    if (!response.ok) {
      console.error('Openverse API error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ success: false, error: `Openverse API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const images: OpenverseImage[] = data.results || [];
    
    console.log(`Found ${images.length} images from Openverse`);

    const results: SearchResult[] = images.map(img => ({
      url: img.url,
      thumbnailUrl: img.thumbnail || img.url,
      source: 'openverse',
      title: img.title || 'Untitled',
      description: img.creator ? `By ${img.creator}` : undefined,
      creator: img.creator,
      license: img.license,
      originalSource: img.source,
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        images: results,
        source: 'openverse',
        count: results.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error searching Openverse:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

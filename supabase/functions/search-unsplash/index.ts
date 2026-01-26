import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnsplashPhoto {
  id: string;
  description: string | null;
  alt_description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
  };
  color: string;
  blur_hash: string;
}

interface SearchResult {
  url: string;
  thumbnailUrl: string;
  source: 'unsplash';
  title: string;
  description?: string;
  photographer: string;
  color: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 20, orientation, color } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
    if (!apiKey) {
      console.error('UNSPLASH_ACCESS_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unsplash not configured. Please add UNSPLASH_ACCESS_KEY to secrets.',
          requiresSetup: true,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching Unsplash for:', query);

    // Build search URL
    const params = new URLSearchParams({
      query,
      per_page: String(Math.min(limit, 30)),
      order_by: 'relevant',
    });

    if (orientation) {
      params.append('orientation', orientation);
    }

    if (color) {
      params.append('color', color);
    }

    const searchUrl = `https://api.unsplash.com/search/photos?${params.toString()}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Client-ID ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error('Unsplash API error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ success: false, error: `Unsplash API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const photos: UnsplashPhoto[] = data.results || [];
    
    console.log(`Found ${photos.length} photos from Unsplash`);

    const results: SearchResult[] = photos.map(photo => ({
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      source: 'unsplash',
      title: photo.description || photo.alt_description || 'Untitled',
      description: `Photo by ${photo.user.name} on Unsplash`,
      photographer: photo.user.name,
      color: photo.color,
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        images: results,
        source: 'unsplash',
        count: results.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error searching Unsplash:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

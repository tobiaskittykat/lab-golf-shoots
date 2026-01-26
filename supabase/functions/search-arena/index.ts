import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArenaBlock {
  id: number;
  title: string;
  image?: {
    display?: { url: string };
    large?: { url: string };
    original?: { url: string };
  };
  source?: { url: string };
  description?: string;
}

interface ArenaChannel {
  id: number;
  title: string;
  contents?: ArenaBlock[];
}

interface SearchResult {
  url: string;
  thumbnailUrl: string;
  source: 'arena';
  title: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 20 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching Are.na for:', query);

    // Search Are.na channels - no auth required for public content
    const searchUrl = `https://api.are.na/v2/search/channels?q=${encodeURIComponent(query)}&per=10`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Are.na API error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ success: false, error: `Are.na API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const channels: ArenaChannel[] = data.channels || [];
    
    console.log(`Found ${channels.length} channels`);

    // Fetch blocks (images) from top channels
    const results: SearchResult[] = [];
    
    for (const channel of channels.slice(0, 5)) {
      try {
        const channelUrl = `https://api.are.na/v2/channels/${channel.id}/contents?per=20`;
        const channelResponse = await fetch(channelUrl, {
          headers: { 'Accept': 'application/json' },
        });
        
        if (!channelResponse.ok) continue;
        
        const channelData = await channelResponse.json();
        const blocks: ArenaBlock[] = channelData.contents || [];
        
        for (const block of blocks) {
          // Only include blocks with images
          if (block.image?.display?.url || block.image?.large?.url) {
            results.push({
              url: block.image.original?.url || block.image.large?.url || block.image.display?.url || '',
              thumbnailUrl: block.image.display?.url || block.image.large?.url || '',
              source: 'arena',
              title: block.title || channel.title,
              description: block.description || `From Are.na channel: ${channel.title}`,
            });
          }
          
          if (results.length >= limit) break;
        }
        
        if (results.length >= limit) break;
      } catch (err) {
        console.error(`Error fetching channel ${channel.id}:`, err);
      }
    }

    console.log(`Returning ${results.length} images from Are.na`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        images: results,
        source: 'arena',
        count: results.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error searching Are.na:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

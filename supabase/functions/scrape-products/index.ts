const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductImage {
  id: string;
  name: string;
  thumbnail: string;
  url: string;
  category: string;
  collection?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    const targetUrl = url || 'https://www.bandolierstyle.com/collections/all';

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping products from:', targetUrl);

    // Use Firecrawl to scrape the products page
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        formats: ['html', 'links', 'screenshot'],
        onlyMainContent: false,
        waitFor: 5000, // Wait for dynamic content
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || 'Failed to scrape products' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract product images from the HTML/links
    const html = data.data?.html || data.html || '';
    const links = data.data?.links || data.links || [];
    
    // Parse product image URLs from HTML
    // Bandolier typically has product images in their CDN
    const productImages: ProductImage[] = [];
    
    // Find Shopify CDN images (common pattern for Bandolier)
    const imgRegex = /https:\/\/[^"'\s]+(?:cdn\.shopify\.com|bandolierstyle\.com)[^"'\s]*(?:\.jpg|\.png|\.webp)[^"'\s]*/gi;
    const matches = html.match(imgRegex) || [];
    
    // Also check links for product pages
    const productLinks = links.filter((link: string) => 
      link.includes('/products/') || link.includes('/collections/')
    );
    
    // Dedupe and clean image URLs
    const seenUrls = new Set<string>();
    let counter = 1;
    
    for (const match of matches) {
      // Clean URL (remove query params for deduping, keep for actual use)
      const cleanUrl = match.split('?')[0];
      if (seenUrls.has(cleanUrl)) continue;
      seenUrls.add(cleanUrl);
      
      // Skip tiny images (icons, etc)
      if (match.includes('_icon') || match.includes('_small') || match.includes('16x16') || match.includes('32x32')) {
        continue;
      }
      
      // Extract product name from URL
      const urlParts = cleanUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const productName = filename
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\d+x\d+/g, '') // Remove dimensions
        .trim();
      
      if (productName.length > 2) {
        productImages.push({
          id: `bandolier-${counter}`,
          name: productName.charAt(0).toUpperCase() + productName.slice(1),
          thumbnail: match.includes('?') ? match : `${match}?w=400&h=300&fit=crop`,
          url: match.includes('?') ? match : `${match}?w=800`,
          category: 'product',
        });
        counter++;
      }
      
      // Limit to 50 products
      if (counter > 50) break;
    }

    console.log(`Found ${productImages.length} product images`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        products: productImages,
        productLinks: productLinks.slice(0, 20),
        totalFound: matches.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape products';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedProduct {
  name: string;
  imageUrl: string;
  category: string;
  color?: string;
  collection?: string;
}

interface FirecrawlResponse {
  success: boolean;
  data?: {
    extract?: {
      products?: ScrapedProduct[];
    };
  };
  error?: string;
}

// Download image and upload to Supabase storage
async function mirrorImageToStorage(
  supabaseClient: any,
  imageUrl: string,
  userId: string,
  productId: string
): Promise<{ storagePath: string; publicUrl: string } | null> {
  try {
    console.log(`Mirroring image for product ${productId}...`);
    
    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageMirror/1.0)',
      },
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch image (${response.status}):`, imageUrl);
      return null;
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      console.log(`Not an image (${contentType}):`, imageUrl);
      return null;
    }
    
    // Get image as array buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Determine file extension from content type
    const ext = contentType.includes('png') ? 'png' : 
                contentType.includes('webp') ? 'webp' : 'jpg';
    
    // Upload to Supabase storage
    const storagePath = `${userId}/${productId}.${ext}`;
    
    const { error: uploadError } = await supabaseClient.storage
      .from('product-images')
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: true,
      });
    
    if (uploadError) {
      console.error(`Upload error for ${productId}:`, uploadError);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('product-images')
      .getPublicUrl(storagePath);
    
    console.log(`Successfully mirrored: ${productId}`);
    return {
      storagePath,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error(`Mirror error for ${productId}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, userId } = await req.json();
    const targetUrl = url || 'https://www.bandolierstyle.com/collections/all';

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'userId is required for image mirroring' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client for storage operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Scraping products from:', targetUrl);

    // Use Firecrawl's JSON extraction with LLM to get clean product data
    const productSchema = {
      type: "object",
      properties: {
        products: {
          type: "array",
          description: "List of actual product items for sale. DO NOT include logos, icons, banners, or non-product images.",
          items: {
            type: "object",
            properties: {
              name: { 
                type: "string", 
                description: "Clean product name without dimensions or codes (e.g., 'Hailey Crossbody', 'Lily Phone Case', 'Donna Strap')" 
              },
              imageUrl: { 
                type: "string", 
                description: "Main product image URL. Can be from any CDN (Shopify, Cloudinary, etc). Must be an actual product photo." 
              },
              category: { 
                type: "string", 
                enum: ["phone-case", "crossbody", "strap", "wallet", "bag", "accessory", "pouch", "other"],
                description: "Product category based on the type of item" 
              },
              color: { 
                type: "string", 
                description: "Product color and/or material finish (e.g., 'Black Gold', 'Cognac Chrome', 'Zebra Print')" 
              },
              collection: { 
                type: "string", 
                description: "Collection name if shown (e.g., 'New Arrivals', 'Best Sellers', 'iPhone 16')" 
              }
            },
            required: ["name", "imageUrl", "category"]
          }
        }
      },
      required: ["products"]
    };

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        formats: ['extract'],
        extract: {
          schema: productSchema,
          prompt: `Extract up to 100 actual product items from this e-commerce page. 
          
IMPORTANT RULES:
- Only extract real products for sale (phone cases, crossbody bags, straps, wallets, pouches, accessories)
- DO NOT include: logos, icons, banners, promotional graphics, Adobe files, or any non-product images
- Product image URLs should show actual product photos from any valid image CDN
- Clean up product names: remove file codes, dimensions, dates (e.g., "Hailey Big D Ring Gold 17 20250811 003" should become "Hailey D-Ring - Gold")
- Combine product name with color/finish in a clean format like "Product Name - Color"
- Assign accurate categories based on what the product actually is
- Extract as many unique products as possible - each color variant is a separate product`
        },
        waitFor: 5000,
      }),
    });

    const data: FirecrawlResponse = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || 'Failed to scrape products' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedProducts = data.data?.extract?.products || [];
    console.log(`Firecrawl extracted ${extractedProducts.length} products`);

    // First pass: filter out obvious non-products (relaxed URL filter)
    const preFilteredProducts = extractedProducts
      .filter((product: ScrapedProduct) => {
        // Must have a valid image URL (any CDN is fine, not just Shopify)
        if (!product.imageUrl || !product.imageUrl.startsWith('http')) {
          console.log('Skipping invalid image URL:', product.name);
          return false;
        }
        // Must have a meaningful name
        if (!product.name || product.name.length < 3) {
          console.log('Skipping product with invalid name:', product.name);
          return false;
        }
        // Skip obvious non-products
        const skipPatterns = ['logo', 'icon', 'banner', 'adobe', 'express', 'file', '.svg'];
        if (skipPatterns.some(p => product.name.toLowerCase().includes(p) || product.imageUrl.toLowerCase().includes(p))) {
          console.log('Skipping non-product:', product.name);
          return false;
        }
        return true;
      })
      .slice(0, 100); // Increased limit to 100 products

    console.log(`Pre-filter passed: ${preFilteredProducts.length} products`);
    console.log('Starting image mirroring to storage...');

    // Generate stable external_id from product name (for upsert deduplication)
    const generateExternalId = (name: string) => {
      // Create a stable hash-like ID from the product name
      const normalized = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      return `bandolier-${normalized}`;
    };

// Mirror each image to Supabase storage
    const mirrorResults = await Promise.all(
      preFilteredProducts.map(async (product: ScrapedProduct) => {
        const externalId = generateExternalId(product.name);
        const mirrorResult = await mirrorImageToStorage(
          supabaseClient,
          product.imageUrl,
          userId,
          externalId
        );
        
        if (mirrorResult) {
          // Analyze the product image with AI vision
          let description = null;
          try {
            console.log(`Analyzing product: ${product.name}`);
            const analysisResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-product`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ imageUrl: mirrorResult.publicUrl })
            });
            
            if (analysisResponse.ok) {
              const analysisData = await analysisResponse.json();
              description = analysisData.description || null;
              console.log(`Analysis complete for ${product.name}: ${description?.summary || 'no summary'}`);
            } else {
              console.log(`Analysis failed for ${product.name}: ${analysisResponse.status}`);
            }
          } catch (analysisError) {
            console.error(`Analysis error for ${product.name}:`, analysisError);
          }

          return {
            id: externalId,
            externalId: externalId, // Stable ID for upsert
            name: product.name,
            thumbnail: mirrorResult.publicUrl,
            url: mirrorResult.publicUrl,
            storagePath: mirrorResult.storagePath,
            category: product.category || 'product',
            color: product.color,
            collection: product.collection,
            description, // NEW: AI-generated product analysis
          };
        }
        return null;
      })
    );

    // Filter out failed mirrors
    const validProducts = mirrorResults.filter(p => p !== null);
    const droppedCount = preFilteredProducts.length - validProducts.length;

    console.log(`Mirroring complete: ${validProducts.length} succeeded, ${droppedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        products: validProducts,
        totalExtracted: extractedProducts.length,
        totalPreFiltered: preFilteredProducts.length,
        totalMirrored: validProducts.length,
        totalDropped: droppedCount
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

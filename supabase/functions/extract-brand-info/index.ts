const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandInfo {
  name: string;
  tagline: string;
  industry: string;
  personality: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  socialLinks: Record<string, string>;
  mission: string;
  tone: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

    if (!firecrawlKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Extracting brand info from:', formattedUrl);

    // Step 1: Scrape with branding + markdown + links formats (with timeout)
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['branding', 'markdown', 'links'],
        onlyMainContent: false,
        timeout: 45000, // 45 second timeout
        waitFor: 3000, // Wait 3s for dynamic content
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error('Firecrawl scrape error:', scrapeData);
      
      // Handle timeout specifically with a user-friendly message
      if (scrapeData.code === 'SCRAPE_TIMEOUT' || scrapeData.error?.includes('timed out')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Website took too long to respond. This can happen with complex sites. Please try again or enter brand details manually.' 
          }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Handle blocked/inaccessible websites
      if (scrapeData.code === 'SCRAPE_ALL_ENGINES_FAILED' || scrapeData.error?.includes('scraping engines failed')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'This website blocks automated access. Please enter your brand details manually instead.' 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || 'Failed to scrape website' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const branding = scrapeData.data?.branding || scrapeData.branding || {};
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    const links = scrapeData.data?.links || scrapeData.links || [];
    const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

    console.log('Scraped branding:', JSON.stringify(branding, null, 2));

    // Extract social links from all links
    const socialPatterns = [
      { id: 'instagram', patterns: ['instagram.com/', 'instagr.am/'] },
      { id: 'tiktok', patterns: ['tiktok.com/@', 'tiktok.com/'] },
      { id: 'pinterest', patterns: ['pinterest.com/', 'pin.it/'] },
      { id: 'youtube', patterns: ['youtube.com/', 'youtu.be/'] },
      { id: 'facebook', patterns: ['facebook.com/', 'fb.com/'] },
      { id: 'twitter', patterns: ['twitter.com/', 'x.com/'] },
      { id: 'linkedin', patterns: ['linkedin.com/'] },
    ];

    const socialLinks: Record<string, string> = {};
    for (const link of links) {
      const lowerLink = link.toLowerCase();
      for (const social of socialPatterns) {
        if (socialLinks[social.id]) continue;
        for (const pattern of social.patterns) {
          if (lowerLink.includes(pattern)) {
            socialLinks[social.id] = link;
            break;
          }
        }
      }
    }

    // Step 2: Use AI to analyze and extract structured brand info
    let aiAnalysis: Partial<BrandInfo> = {};
    
    if (lovableKey) {
      try {
        const aiPrompt = `Analyze this website content and extract brand information. 

Website: ${formattedUrl}
Title: ${metadata.title || 'Unknown'}
Description: ${metadata.description || 'Unknown'}

Content excerpt:
${markdown.slice(0, 3000)}

Branding data extracted:
${JSON.stringify(branding, null, 2)}

Based on this, provide a JSON response with:
- name: The brand/company name
- tagline: Their main tagline or slogan (if found)
- industry: Their industry category (e.g., "Fashion & Apparel", "Technology", "Beauty & Cosmetics", etc.)
- personality: One of: "bold", "calm", "playful", "premium", "minimal" - based on tone and style
- mission: A brief mission statement (infer if not explicit)
- tone: Describe their communication tone in 2-3 words

Return ONLY valid JSON, no markdown.`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are a brand analyst. Extract and analyze brand information from website content. Always respond with valid JSON only.' },
              { role: 'user', content: aiPrompt }
            ],
            temperature: 0.3,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          
          // Parse JSON from response
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              aiAnalysis = JSON.parse(jsonMatch[0]);
            }
          } catch (parseErr) {
            console.error('Failed to parse AI response:', parseErr);
          }
        }
      } catch (aiErr) {
        console.error('AI analysis failed:', aiErr);
      }
    }

    // Combine all extracted data
    const brandInfo: BrandInfo = {
      name: aiAnalysis.name || metadata.title?.split(/[|–-]/)[0]?.trim() || '',
      tagline: aiAnalysis.tagline || metadata.description || '',
      industry: aiAnalysis.industry || '',
      personality: aiAnalysis.personality || 'minimal',
      colors: {
        primary: branding.colors?.primary || branding.colors?.background || '#000000',
        secondary: branding.colors?.secondary || branding.colors?.textPrimary || '#ffffff',
        accent: branding.colors?.accent || branding.colors?.textSecondary || '#666666',
      },
      socialLinks,
      mission: aiAnalysis.mission || '',
      tone: aiAnalysis.tone || '',
    };

    console.log('Extracted brand info:', JSON.stringify(brandInfo, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true, 
        brandInfo,
        rawBranding: branding,
        metadata,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting brand info:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract brand info';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

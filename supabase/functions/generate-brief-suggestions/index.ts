import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandBrain {
  visualDNA?: {
    colorPalette?: {
      primary?: string[];
      accents?: string[];
      seasonalPops?: string[];
    };
    colorMood?: string;
    photographyStyle?: string;
    lightingSignature?: string;
    compositionRules?: string[];
  };
  brandVoice?: {
    toneDescriptors?: string[];
    communicationStyle?: string;
    emotionalAppeal?: string;
  };
  creativeDirectionSummary?: string;
}

interface BriefRequest {
  brandName?: string;
  industry?: string;
  personality?: string;
  brandBrain?: BrandBrain;
  productCategories?: string[];
  count?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandName, industry, personality, brandBrain, productCategories, count = 18 }: BriefRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Extract useful brand context
    const visualDNA = brandBrain?.visualDNA;
    const brandVoice = brandBrain?.brandVoice;
    
    const photographyStyle = visualDNA?.photographyStyle || 'editorial';
    const colorMood = visualDNA?.colorMood || 'sophisticated';
    const lightingSignature = visualDNA?.lightingSignature || 'natural light';
    const toneDescriptors = brandVoice?.toneDescriptors?.join(', ') || 'refined, aspirational';
    const emotionalAppeal = brandVoice?.emotionalAppeal || 'confidence';
    const accentColors = visualDNA?.colorPalette?.accents?.slice(0, 2).join(', ') || '';
    const seasonalColors = visualDNA?.colorPalette?.seasonalPops?.slice(0, 2).join(', ') || '';
    const creativeSummary = brandBrain?.creativeDirectionSummary || '';
    const productList = productCategories?.length ? productCategories.join(', ') : '';

    const systemPrompt = `You are a creative director at a top marketing agency generating campaign brief ideas for a brand.

Given a brand's identity and product lineup, generate exactly ${count} short, punchy marketing brief suggestions that a marketing team would use to kick off a creative shoot or campaign.

Each brief should be:
- 8-15 words maximum
- Written as a campaign direction, not a product description
- Include both the concept AND the visual style/mood
- Format: "Campaign theme or moment - visual style, mood/energy"
- MUST be relevant to the brand's actual products (e.g., for a phone case brand, reference phone cases, straps, crossbody accessories, etc.)

Generate diverse briefs covering:
- Seasonal campaigns featuring the brand's products (spring, summer, fall, winter, holiday)
- Lifestyle moments where the products shine (travel, city life, work commute, weekend outings)
- Occasion-based campaigns (date night, work meeting, brunch, festival, vacation)
- Editorial styles showcasing the products (street style, fashion week, magazine editorial)
- Product launches (new collection, limited edition, collaboration, new colorways)
- Brand storytelling (craftsmanship details, customer moments, hands-free lifestyle)

Important:
- Do NOT mention the brand name in the briefs
- Each brief MUST be relevant to the brand's product categories
- Make each brief unique and actionable
- Tailor the visual language to match the brand's style
- Output ONLY a JSON array of strings, nothing else`;

    const userPrompt = `Brand: ${brandName || 'Lifestyle brand'}
Industry: ${industry || 'Fashion & Accessories'}
${productList ? `Products: ${productList}` : ''}
Personality: ${personality || 'Premium, sophisticated'}
Photography Style: ${photographyStyle}
Color Mood: ${colorMood}
Lighting: ${lightingSignature}
Tone: ${toneDescriptors}
Emotional Appeal: ${emotionalAppeal}
${accentColors ? `Accent Colors: ${accentColors}` : ''}
${seasonalColors ? `Seasonal Colors: ${seasonalColors}` : ''}
${creativeSummary ? `Creative Direction: ${creativeSummary}` : ''}

Generate ${count} campaign brief ideas that are specifically relevant to this brand's products and visual identity. Each brief should feel like it was written for a ${productList || 'fashion accessories'} brand.`;

    console.log('Generating brand-specific briefs for:', brandName);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', content.substring(0, 200));
    
    // Parse the JSON array from the response
    let briefs: string[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        briefs = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse briefs JSON:', parseError);
      // Fallback: try to split by newlines if it's a plain text list
      const lines = content.split('\n').filter((line: string) => line.trim().length > 10);
      briefs = lines.map((line: string) => line.replace(/^[-*\d.)\s]+/, '').trim()).slice(0, count);
    }

    // Validate we have valid briefs
    if (!Array.isArray(briefs) || briefs.length === 0) {
      console.error('No valid briefs generated, using fallback');
      briefs = getGenericFallbackBriefs(count);
    }

    // Ensure all briefs are strings and clean them up
    briefs = briefs
      .filter(b => typeof b === 'string' && b.length > 5)
      .map(b => b.replace(/^["']|["']$/g, '').trim())
      .slice(0, count);

    console.log(`Generated ${briefs.length} briefs for ${brandName}`);

    return new Response(JSON.stringify({ briefs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating briefs:", error);
    
    // Return fallback briefs on error
    const fallbackBriefs = getGenericFallbackBriefs(18);
    
    return new Response(JSON.stringify({ 
      briefs: fallbackBriefs,
      fallback: true,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getGenericFallbackBriefs(count: number): string[] {
  const fallbacks = [
    "Summer collection launch - golden hour luxury, effortless elegance",
    "Festival season drop - desert sunset vibes, bold and expressive",
    "City essentials campaign - coffee run to cocktail hour, urban chic",
    "Holiday party shoot - champagne moments, after-dark glamour",
    "Spring refresh campaign - garden party meets street style",
    "Street style editorial - fashion week energy, sophisticated edge",
    "Vacation essentials - poolside to dinner, versatile elegance",
    "Power accessories editorial - strong silhouettes, confident energy",
    "Morning routine content - everyday luxury, authentic moments",
    "New arrivals launch - fresh palette, optimistic energy",
    "Coastal collection - sun-drenched elegance, ocean blues",
    "Fall fashion campaign - rich tones, texture-forward styling",
    "Night out content - getting ready moments, going out in style",
    "Road trip content series - open highways, adventure-ready",
    "Resort collection drop - coastal elegance, effortless sophistication",
    "Statement print drop - bold patterns, unapologetically confident",
    "Mother's Day gifting - brunch settings, thoughtful luxury",
    "NYE celebration shoot - sparkle and spontaneity, glamorous",
  ];
  
  return fallbacks.slice(0, count);
}

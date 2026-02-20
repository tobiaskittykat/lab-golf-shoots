/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Logo placement settings for compositing
interface LogoPlacement {
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right';
  sizePercent: number;
  opacity: number;
  paddingPx: number;
  logoUrl: string;
}

interface GenerateImageRequest {
  // Concept info
  prompt: string;
  conceptTitle?: string;
  conceptDescription?: string;
  coreIdea?: string;
  tonality?: {
    adjectives?: string[];
    neverRules?: string[];
    voice?: string;
    emotion?: string;
    visualStyle?: string;
  };
  
  // Full 9-point concept data (NEW)
  visualWorld?: {
    atmosphere?: string;
    materials?: string[];
    palette?: string[];
    composition?: string;
    mustHave?: string[];
  };
  contentPillars?: { name: string; description: string }[];
  targetAudience?: { persona?: string; situation?: string };
  consumerInsight?: string;
  productFocus?: { productCategory?: string; visualGuidance?: string };
  taglines?: string[];
  
  // Style settings
  moodboardId?: string;
  moodboardName?: string;
  moodboardDescription?: string;
  moodboardUrl?: string;
  moodboardAnalysis?: {
    dominant_colors?: string[];
    color_mood?: string;
    key_elements?: string[];
    composition_style?: string;
    lighting_quality?: string;
    textures?: string[];
    emotional_tone?: string;
    suggested_props?: string[];
    best_for?: string[];
  };
  artisticStyle?: string;
  lightingStyle?: string;
  cameraAngle?: string;
  
  // References
  productReferenceUrls?: string[];
  productNames?: string[];
  shotTypePrompt?: string | null; // Single shot type (mutually exclusive), null = AI decides
  
  // Edit mode
  sourceImageUrl?: string;
  editMode?: boolean;
  
  // Extra prompt settings
  extraKeywords?: string[];
  negativePrompt?: string;
  textOnImage?: string;
  
  // Output settings
  imageCount?: number;
  resolution?: string;
  aspectRatio?: string;
  
  // AI settings
  aiModel?: string;
  guidanceScale?: number;
  seed?: number | null;
  
  // Organization
  brandId?: string;
  folder?: string;
  
  // Brand context
  brandContext?: {
    mission?: string;
    values?: string[];
    tone_of_voice?: string;
    visual_style?: {
      photography_style?: string;
      color_palette?: string[];
      avoid?: string[];
    };
    target_audience?: string;
  };
  brandName?: string;
  brandPersonality?: string;
  
  // Brand Brain (synthesized visual identity)
  brandBrain?: {
    visualDNA?: {
      colorPalette?: {
        description?: string;
        foundation?: string[];
        accents?: string[];
        seasonalPops?: string[];
      };
      primaryColors?: string[]; // Legacy fallback
      colorMood?: string;
      photographyStyle?: string;
      texturePreferences?: string[];
      lightingStyle?: string;
      compositionStyle?: string;
      avoidElements?: string[];
      modelStyling?: {
        usesModels?: boolean;
        demographics?: string;
        expression?: string;
        poseStyle?: string;
        stylingAesthetic?: string;
        hairAndMakeup?: string;
        bodyLanguage?: string;
      };
    };
    brandVoice?: {
      personality?: string;
      toneDescriptors?: string[];
      messagingStyle?: string;
    };
    creativeDirectionSummary?: string;
  };
  
  // Custom prompt agent system prompt
  customPromptAgentSystemPrompt?: string;
  
  // Product Identity (parsed from SKU name + description)
  productIdentity?: {
    brandName?: string;
    modelName?: string;
    material?: string;
    color?: string;
    productType?: string;
    fullName?: string;
    summary?: string;
  };
  
  // Logo placement for compositing
  logoPlacement?: LogoPlacement | null;
  
  // Product Shoot configuration
  productShootConfig?: {
    shotType?: string;
    settingType?: 'studio' | 'outdoor' | 'auto';
    backgroundId?: string;
    customBackgroundPrompt?: string;
    modelConfig?: {
      gender?: string;
      ethnicity?: string;
      clothing?: string;
      useOnBrandDefaults?: boolean;
    };
    // On-foot shot type specific config
    onFootConfig?: {
      poseVariation?: string;
      legStyling?: string;
      trouserColor?: string;
    };
  };
  
  // Component overrides for shoe customization
  componentOverrides?: {
    upper?: { material: string; color: string; colorHex?: string };
    footbed?: { material: string; color: string; colorHex?: string };
    sole?: { material: string; color: string; colorHex?: string };
    buckles?: { material: string; color: string; colorHex?: string };
    heelstrap?: { material: string; color: string; colorHex?: string };
    lining?: { material: string; color: string; colorHex?: string };
  };
  
  // Original analyzed components (for comparison)
  originalComponents?: {
    upper?: { material: string; color: string };
    footbed?: { material: string; color: string };
    sole?: { material: string; color: string };
    buckles?: { material: string; color: string } | null;
    heelstrap?: { material: string; color: string } | null;
    lining?: { material: string; color: string } | null;
  };
  
  // Toggle to attach reference images (default: true)
  attachReferenceImages?: boolean;
  
  // Remix mode (shoe swap on existing creative)
  remixMode?: boolean;
  remixRemoveText?: boolean;
}

// AI model mapping
const modelMap: Record<string, string> = {
  'auto': 'google/gemini-3-pro-image-preview',
  'nano-banana': 'google/gemini-2.5-flash-image-preview',
};

// === Shared helpers for override prompt construction ===

// Resolve "Custom" hex colors to human-readable names
function getColorDescription(override: { color: string; colorHex?: string }): string {
  if (override.color !== 'Custom' && override.color !== 'custom') {
    return override.color;
  }
  if (!override.colorHex) {
    return override.color;
  }
  const hex = override.colorHex.toUpperCase();
  const colorNames: Record<string, string> = {
    '#FF69B4': 'Hot Pink',
    '#FF1493': 'Deep Pink',
    '#FFC0CB': 'Pink',
    '#FFB6C1': 'Light Pink',
    '#FF0000': 'Red',
    '#00FF00': 'Lime Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FFA500': 'Orange',
    '#800080': 'Purple',
    '#00FFFF': 'Cyan',
    '#000000': 'Black',
    '#FFFFFF': 'White',
  };
  const namedColor = colorNames[hex];
  return namedColor ? `${namedColor} (${hex})` : hex;
}

// Build structured override prompt lines from overrides + original components
function buildOverrideLines(
  overrides: GenerateImageRequest['componentOverrides'],
  original: GenerateImageRequest['originalComponents']
): string[] {
  if (!overrides || !original) return [];

  const componentTypes = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'] as const;
  const changedComponents: string[] = [];

  for (const type of componentTypes) {
    const override = overrides[type];
    const orig = original[type];

    if (override && orig) {
      const colorDisplay = getColorDescription(override);
      if (override.material !== orig.material || override.color !== orig.color) {
        changedComponents.push(
          `${type.toUpperCase()}: ${override.material} in ${colorDisplay} (original was: ${orig.material} in ${orig.color})`
        );
      }
    } else if (override && !orig) {
      console.warn(`Skipping phantom override for ${type} (no original component)`);
    }
  }

  if (changedComponents.length === 0) return [];

  const lines: string[] = [
    "=== PRODUCT COMPONENT OVERRIDES ===",
    "The user has customized specific shoe components.",
    "Apply these modifications while maintaining the original silhouette:",
    "",
  ];
  changedComponents.forEach(c => lines.push(c));

  // Toe post sync for thong-style sandals
  const strapConstruction = (original as any).strapConstruction;
  if (strapConstruction === 'thong') {
    const soleSource = overrides.sole || original.sole;
    const buckleSource = overrides.buckles || (original.buckles ? original.buckles : null);
    if (soleSource) {
      const soleColor = overrides.sole ? getColorDescription(overrides.sole) : soleSource.color;
      lines.push(`TOE POST STRAP: ${soleColor} (must match sole color exactly — thong-style sandal)`);
    }
    if (buckleSource) {
      const buckleColor = overrides.buckles ? getColorDescription(overrides.buckles) : buckleSource.color;
      lines.push(`TOE POST PIN/RIVET: ${buckleColor} (must match buckle hardware finish)`);
    }
  }

  // Buckle shape preservation
  if (overrides.buckles) {
    lines.push("");
    lines.push("BUCKLE SHAPE AND INSCRIPTIONS: Change ONLY the material and color.");
    lines.push("The buckle SHAPE, SIZE, and any INSCRIBED TEXT must remain EXACTLY as shown in references.");
  }

  lines.push("");
  lines.push("Keep all OTHER components exactly as shown in reference images.");
  lines.push("");

  return lines;
}

// Background presets lookup (copy of frontend presets for server-side prompt building)
const backgroundPresets: Record<string, string> = {
  // Studio backgrounds
  'studio-white': 'clean white studio cyclorama background, professional product photography lighting, seamless white backdrop',
  'studio-black': 'deep black studio background, dramatic rim lighting, high contrast product photography',
  'studio-gradient-warm': 'soft warm gradient background, pink to orange tones, fashion photography lighting',
  'studio-gradient-cool': 'soft cool gradient background, blue to purple tones, modern studio lighting',
  'studio-concrete': 'polished concrete floor studio, industrial chic, soft window light',
  'studio-marble': 'white marble surface with grey veining, luxury product photography, elegant studio setting',
  'studio-fabric': 'soft linen fabric backdrop, natural texture, diffused lighting, tactile feel',
  'studio-wood': 'warm honey oak wood surface, natural grain, soft natural lighting',
  'studio-terrazzo': 'terrazzo surface with colorful chips, modern aesthetic, clean product photography',
  'studio-paper': 'seamless paper backdrop, soft shadows, classic product photography setup',
  // Outdoor backgrounds
  'outdoor-beach': 'warm golden sand with natural ripple texture, soft golden hour light, distant ocean blur, raw coastal Mediterranean atmosphere, Birkenstock summer campaign',
  'outdoor-urban': 'sun-warmed cobblestone European side street, aged sandstone walls, warm afternoon light with long shadows, lived-in urban character, Birkenstock city editorial',
  'outdoor-park': 'wild meadow grass with wildflowers, dappled golden sunlight through mature trees, natural organic parkland, Birkenstock nature campaign',
  'outdoor-cafe': 'weathered wooden bistro table on aged cobblestones, terracotta-toned walls, warm Mediterranean afternoon light, artisan cafe culture, Birkenstock European editorial',
  'outdoor-desert': 'sculptural desert dune with wind-carved ridges, warm amber golden hour, vast minimalist landscape, raw earth textures, Birkenstock nature campaign',
  'outdoor-forest': 'dappled light through ancient oak canopy, moss-covered forest floor, rich earthy greens and browns, organic natural sanctuary, Birkenstock woodland editorial',
  'outdoor-rooftop': 'weathered terracotta rooftop terrace, potted olive trees, warm golden hour cityscape, Mediterranean lifestyle, Birkenstock summer editorial',
  'outdoor-pool': 'natural stone pool edge with sun-warmed travertine deck, turquoise water reflections, Mediterranean resort warmth, Birkenstock summer campaign',
  'outdoor-mountain': 'rugged mountain trail with worn natural stone, alpine wildflowers, expansive valley vista, raw outdoor adventure, Birkenstock hiking editorial',
  'outdoor-vineyard': 'sun-drenched vineyard rows with gnarled old vines, golden Tuscan light, terracotta earth between rows, artisanal wine country, Birkenstock countryside editorial',
  'outdoor-boardwalk': 'sun-bleached weathered timber boardwalk, natural wood grain and patina, coastal salt air atmosphere, Birkenstock seaside campaign',
  'outdoor-market': 'artisan outdoor market with handwoven textiles and ceramics, warm natural materials, Mediterranean bazaar atmosphere, Birkenstock cultural editorial',
  'outdoor-cactus-garden': 'southwestern desert garden with sculptural prickly pear cactus, warm sandy earth, terracotta and sage tones, raw natural desert flora, Birkenstock desert editorial',
  'outdoor-cracked-earth': 'sun-baked cracked clay earth with deep fissures, warm ochre and sienna tones, raw elemental texture, Birkenstock earth editorial',
  'outdoor-salt-flats': 'crystalline salt flat surface with mineral deposits, otherworldly natural landscape, warm reflected light, raw geological wonder, Birkenstock nature editorial',
  'outdoor-picnic': 'faded vintage gingham blanket on wild meadow grass, casual golden afternoon, handmade wicker basket vibe, Birkenstock lifestyle editorial',
  'outdoor-rocky-shore': 'sun-warmed limestone rocks meeting clear turquoise shallows, natural coastal erosion texture, Mediterranean cove atmosphere, Birkenstock coastal editorial',
  'outdoor-weathered-metal': 'naturally oxidized copper and iron surface with warm patina, golden rust tones, industrial craft texture with organic aging, Birkenstock artisan editorial',
  'outdoor-grass-concrete': 'raw concrete slab edge meeting wild grass and clover, warm natural light, architectural meets organic, Birkenstock urban nature editorial',
};

// Call the prompt agent to craft a refined prompt (now MULTIMODAL - can see products)
async function craftPromptWithAgent(request: GenerateImageRequest, apiKey: string): Promise<string> {
  try {
    console.log("Calling MULTIMODAL prompt agent to craft refined prompt...");
    
    // Filter product URLs (skip GIFs which aren't supported)
    const productUrls = (request.productReferenceUrls || [])
      .filter(url => url && url.startsWith('http') && !url.toLowerCase().includes('.gif'));

    // Build the creative brief inline with ALL 9-point concept data
    const sections: string[] = [];
    
    // ===== SHOT DIRECTION (MANDATORY when specified) =====
    // Put shot type at the very top so it's emphasized as non-negotiable
    if (request.shotTypePrompt) {
      sections.push("=== MANDATORY SHOT DIRECTION ===");
      sections.push("⚠️ CRITICAL: The following shot type MUST be followed exactly:");
      sections.push(request.shotTypePrompt);
      sections.push("");
    }
    // If shotTypePrompt is null, this section is omitted and AI has creative freedom over composition
    
    // Brand Context Section
    if (request.brandContext || request.brandName || request.brandPersonality) {
      sections.push("=== BRAND CONTEXT ===");
      if (request.brandName) sections.push(`Brand: ${request.brandName}`);
      if (request.brandPersonality) sections.push(`Personality: ${request.brandPersonality}`);
      if (request.brandContext?.mission) sections.push(`Mission: ${request.brandContext.mission}`);
      if (request.brandContext?.values && request.brandContext.values.length > 0) {
        sections.push(`Values: ${request.brandContext.values.join(", ")}`);
      }
      if (request.brandContext?.tone_of_voice) sections.push(`Tone of Voice: ${request.brandContext.tone_of_voice}`);
      if (request.brandContext?.visual_style?.photography_style) {
        sections.push(`Photography Style: ${request.brandContext.visual_style.photography_style}`);
      }
      if (request.brandContext?.visual_style?.color_palette && request.brandContext.visual_style.color_palette.length > 0) {
        sections.push(`Brand Colors: ${request.brandContext.visual_style.color_palette.join(", ")}`);
      }
      if (request.brandContext?.visual_style?.avoid && request.brandContext.visual_style.avoid.length > 0) {
        sections.push(`AVOID: ${request.brandContext.visual_style.avoid.join(", ")}`);
      }
      if (request.brandContext?.target_audience) sections.push(`Target Audience: ${request.brandContext.target_audience}`);
      sections.push("");
    }
    
    // ===== BRAND BRAIN (SYNTHESIZED VISUAL IDENTITY - HIGH PRIORITY) =====
    if (request.brandBrain) {
      sections.push("=== BRAND BRAIN (SYNTHESIZED VISUAL IDENTITY) ===");
      sections.push("⚠️ HIGH PRIORITY: This is the brand's established visual DNA. Use this to ensure all images feel on-brand.");
      
      if (request.brandBrain.creativeDirectionSummary) {
        sections.push(`Creative Direction: ${request.brandBrain.creativeDirectionSummary}`);
      }
      
      if (request.brandBrain.visualDNA) {
        const vd = request.brandBrain.visualDNA;
        // Use new colorPalette structure with fallback to legacy primaryColors
        if (vd.colorPalette) {
          if (vd.colorPalette.description) sections.push(`Color Palette: ${vd.colorPalette.description}`);
          if (vd.colorPalette.foundation?.length) sections.push(`Foundation Colors (USE FOR BASE/BACKGROUND): ${vd.colorPalette.foundation.join(", ")}`);
          if (vd.colorPalette.accents?.length) sections.push(`Accent Colors (USE FOR HIGHLIGHTS/PRODUCT): ${vd.colorPalette.accents.join(", ")}`);
          if (vd.colorPalette.seasonalPops?.length) sections.push(`Seasonal Pop Colors (OPTIONAL VARIETY): ${vd.colorPalette.seasonalPops.join(", ")}`);
        } else if (vd.primaryColors?.length) {
          // Legacy fallback
          sections.push(`Brand Colors (INCORPORATE): ${vd.primaryColors.join(", ")}`);
        }
        if (vd.colorMood) sections.push(`Color Mood: ${vd.colorMood}`);
        if (vd.photographyStyle) sections.push(`Photography Style: ${vd.photographyStyle}`);
        if (vd.lightingStyle) sections.push(`Lighting: ${vd.lightingStyle}`);
        if (vd.compositionStyle) sections.push(`Composition: ${vd.compositionStyle}`);
        if (vd.texturePreferences?.length) sections.push(`Preferred Textures: ${vd.texturePreferences.join(", ")}`);
        
        // Model Styling Guidelines
        if (vd.modelStyling?.usesModels) {
          sections.push("");
          sections.push("=== MODEL STYLING GUIDELINES ===");
          sections.push("When models are used in this image, follow these guidelines:");
          if (vd.modelStyling.demographics) sections.push(`Model Demographics: ${vd.modelStyling.demographics}`);
          if (vd.modelStyling.expression) sections.push(`Expression: ${vd.modelStyling.expression}`);
          if (vd.modelStyling.poseStyle) sections.push(`Pose Style: ${vd.modelStyling.poseStyle}`);
          if (vd.modelStyling.stylingAesthetic) sections.push(`Wardrobe/Styling: ${vd.modelStyling.stylingAesthetic}`);
          if (vd.modelStyling.hairAndMakeup) sections.push(`Hair & Makeup: ${vd.modelStyling.hairAndMakeup}`);
          if (vd.modelStyling.bodyLanguage) sections.push(`Body Language: ${vd.modelStyling.bodyLanguage}`);
        }
      }
      
      if (request.brandBrain.brandVoice) {
        const bv = request.brandBrain.brandVoice;
        if (bv.personality) sections.push(`Brand Personality: ${bv.personality}`);
        if (bv.toneDescriptors?.length) sections.push(`Visual Tone: ${bv.toneDescriptors.join(", ")}`);
      }
      sections.push("");
    }
    
    // ===== BRAND RESTRICTIONS (HIGHEST PRIORITY - ALWAYS WINS) =====
    // Collect avoid elements from all sources and put them at top priority
    const allAvoidElements: string[] = [];
    if (request.brandBrain?.visualDNA?.avoidElements?.length) {
      allAvoidElements.push(...request.brandBrain.visualDNA.avoidElements);
    }
    if (request.brandContext?.visual_style?.avoid?.length) {
      allAvoidElements.push(...request.brandContext.visual_style.avoid);
    }
    
    if (allAvoidElements.length > 0) {
      sections.push("=== ⛔⛔⛔ BRAND RESTRICTIONS (ABSOLUTE PRIORITY) ⛔⛔⛔ ===");
      sections.push("These elements are FORBIDDEN by the brand. NEVER include them, even if the concept's mustHave or Visual World suggests them:");
      allAvoidElements.forEach(el => {
        sections.push(`❌ ${el}`);
      });
      sections.push("");
      sections.push("⚠️ CRITICAL: If a concept's 'mustHave' list contains any of these forbidden elements, IGNORE that mustHave item. The AVOID list ALWAYS takes precedence over concept direction.");
      sections.push("");
    }
    
    // ===== PRODUCT CATEGORY (from 9-point framework) =====
    if (request.productFocus) {
      sections.push("=== PRODUCT CATEGORY ===");
      if (request.productFocus.productCategory) sections.push(`Category: ${request.productFocus.productCategory}`);
      if (request.productFocus.visualGuidance) sections.push(`Visual Guidance: ${request.productFocus.visualGuidance}`);
      sections.push("");
    }
    
    // Campaign Concept Section (Core Idea = Single-minded Idea)
    if (request.conceptTitle || request.conceptDescription || request.coreIdea) {
      sections.push("=== CAMPAIGN CONCEPT ===");
      if (request.conceptTitle) sections.push(`Title: ${request.conceptTitle}`);
      if (request.coreIdea) sections.push(`Single-Minded Idea: ${request.coreIdea}`);
      if (request.conceptDescription) sections.push(`Description: ${request.conceptDescription}`);
      sections.push("");
    }
    
    // ===== MOODBOARD INSPIRATION (FIRST - PRIMARY STYLE INFLUENCE) =====
    // Placed BEFORE Visual World to establish style priority
    const hasMoodboard = !!(request.moodboardName || request.moodboardDescription || request.moodboardAnalysis);
    if (hasMoodboard) {
      sections.push("=== MOODBOARD INSPIRATION (PRIMARY STYLE INFLUENCE) ===");
      sections.push("⚠️ HIGH WEIGHT: The moodboard defines the dominant aesthetic. Use its colors, lighting, mood, and atmosphere as the primary style guide.");
      if (request.moodboardName) sections.push(`Moodboard: ${request.moodboardName}`);
      if (request.moodboardDescription) sections.push(`Description: ${request.moodboardDescription}`);
      if (request.moodboardAnalysis) {
        const analysis = request.moodboardAnalysis;
        if (analysis.dominant_colors?.length) sections.push(`Colors (FOLLOW THESE): ${analysis.dominant_colors.join(", ")}`);
        if (analysis.color_mood) sections.push(`Color Mood: ${analysis.color_mood}`);
        if (analysis.key_elements?.length) sections.push(`Key Visual Elements: ${analysis.key_elements.join(", ")}`);
        if (analysis.lighting_quality) sections.push(`Lighting (MATCH THIS): ${analysis.lighting_quality}`);
        if (analysis.textures?.length) sections.push(`Textures: ${analysis.textures.join(", ")}`);
        if (analysis.emotional_tone) sections.push(`Emotional Tone (CAPTURE THIS): ${analysis.emotional_tone}`);
        if (analysis.suggested_props?.length) sections.push(`Suggested Props: ${analysis.suggested_props.join(", ")}`);
        if (analysis.composition_style) sections.push(`Composition: ${analysis.composition_style}`);
      }
      sections.push("");
    }
    
    // ===== VISUAL WORLD (SUPPORTING DIRECTION when moodboard present) =====
    if (request.visualWorld) {
      if (hasMoodboard) {
        sections.push("=== VISUAL WORLD (SUPPORTING DIRECTION) ===");
        sections.push("MEDIUM WEIGHT: Use for composition, props, and scene structure. Blend harmoniously with moodboard aesthetic.");
      } else {
        sections.push("=== VISUAL WORLD ===");
      }
      if (request.visualWorld.atmosphere) sections.push(`Atmosphere: ${request.visualWorld.atmosphere}`);
      if (request.visualWorld.materials?.length) sections.push(`Materials: ${request.visualWorld.materials.join(", ")}`);
      if (request.visualWorld.palette?.length) sections.push(`Color Palette: ${request.visualWorld.palette.join(", ")}`);
      if (request.visualWorld.composition) sections.push(`Composition Rule: ${request.visualWorld.composition}`);
      if (request.visualWorld.mustHave?.length) sections.push(`MUST HAVE in frame: ${request.visualWorld.mustHave.join(", ")}`);
      sections.push("");
    }
    
    // ===== TONALITY (from 9-point framework) =====
    
    // ===== PRODUCT IDENTITY (CRITICAL for product shoots) =====
    // Pass brand, model, color, material to help AI name the product correctly
    if (request.productIdentity) {
      const pi = request.productIdentity;
      sections.push("=== PRODUCT IDENTITY (USE IN PROMPT) ===");
      sections.push("⚠️ IMPORTANT: Include these identifiers in your prompt for product recognition:");
      if (pi.brandName) sections.push(`Brand: ${pi.brandName}`);
      if (pi.modelName) sections.push(`Model: ${pi.modelName}`);
      if (pi.color) sections.push(`Color: ${pi.color}`);
      if (pi.material) sections.push(`Material: ${pi.material}`);
      if (pi.productType) sections.push(`Type: ${pi.productType}`);
      if (pi.summary) sections.push(`Description: ${pi.summary}`);
      sections.push("");
    }
    
    // Product Section (product names for clarity)
    if (request.productNames && request.productNames.length > 0) {
      sections.push("=== PRODUCT REFERENCES ===");
      sections.push(`Feature these products: ${request.productNames.join(", ")}`);
      sections.push("");
    }
    
    // Technical Settings Section
    if (request.artisticStyle || request.lightingStyle || request.cameraAngle) {
      sections.push("=== TECHNICAL SETTINGS ===");
      if (request.artisticStyle && request.artisticStyle !== 'auto') sections.push(`Style: ${request.artisticStyle}`);
      if (request.lightingStyle && request.lightingStyle !== 'auto') sections.push(`Lighting: ${request.lightingStyle}`);
      if (request.cameraAngle && request.cameraAngle !== 'auto') sections.push(`Camera: ${request.cameraAngle}`);
      // Add aspect ratio instruction so AI composes correctly for the format
      if (request.aspectRatio && request.aspectRatio !== '1:1') {
        sections.push(`Aspect Ratio: ${request.aspectRatio} format - compose the scene to fill this canvas shape effectively`);
      }
      sections.push("");
    }
    
    // Extra Keywords Section
    if (request.extraKeywords && request.extraKeywords.length > 0) {
      sections.push("=== ADDITIONAL KEYWORDS ===");
      sections.push(request.extraKeywords.join(", "));
      sections.push("");
    }
    
    // Text Overlay Section
    if (request.textOnImage) {
      sections.push("=== TEXT OVERLAY ===");
      sections.push(`Include text: "${request.textOnImage}"`);
      sections.push("");
    }
    
    // Negative Prompt Section
    if (request.negativePrompt) {
      sections.push("=== MUST AVOID ===");
      sections.push(request.negativePrompt);
      sections.push("");
    }
    
    // === PRODUCT SHOOT CONFIGURATION ===
    // Add background and model direction from product shoot settings
    if (request.productShootConfig) {
      const config = request.productShootConfig;
      
      // Background direction
      if (config.customBackgroundPrompt) {
        sections.push("=== BACKGROUND/SETTING ===");
        sections.push(config.customBackgroundPrompt);
        sections.push("");
    } else if (config.backgroundId === 'studio-auto') {
        // Randomly pick a specific studio preset for concrete, vivid direction
        const studioKeys = Object.keys(backgroundPresets).filter(k => k.startsWith('studio-') && k !== 'studio-auto');
        const randomStudioKey = studioKeys[Math.floor(Math.random() * studioKeys.length)];
        console.log(`[Auto Background] studio-auto resolved to: ${randomStudioKey}`);
        sections.push("=== BACKGROUND/SETTING ===");
        sections.push(backgroundPresets[randomStudioKey]);
        sections.push("");
      } else if (config.backgroundId === 'outdoor-auto') {
        // Randomly pick a specific outdoor preset for concrete, vivid direction
        const outdoorKeys = Object.keys(backgroundPresets).filter(k => k.startsWith('outdoor-'));
        const randomOutdoorKey = outdoorKeys[Math.floor(Math.random() * outdoorKeys.length)];
        console.log(`[Auto Background] outdoor-auto resolved to: ${randomOutdoorKey}`);
        sections.push("=== BACKGROUND/SETTING ===");
        sections.push(backgroundPresets[randomOutdoorKey]);
        sections.push("");
      } else if (config.backgroundId && backgroundPresets[config.backgroundId]) {
        sections.push("=== BACKGROUND/SETTING ===");
        sections.push(backgroundPresets[config.backgroundId]);
        sections.push("");
      }
      
      // Model direction (if not product-focus shot type)
      if (config.shotType !== 'product-focus' && config.modelConfig) {
        const modelParts: string[] = [];
        if (config.modelConfig.gender && config.modelConfig.gender !== 'auto') {
          modelParts.push(`${config.modelConfig.gender} model`);
        }
        if (config.modelConfig.ethnicity && config.modelConfig.ethnicity !== 'auto') {
          modelParts.push(config.modelConfig.ethnicity);
        }
        if (config.modelConfig.clothing && config.modelConfig.clothing !== 'auto') {
          modelParts.push(`${config.modelConfig.clothing} outfit`);
        }
        if (modelParts.length > 0) {
          sections.push("=== MODEL DIRECTION ===");
          sections.push(`Feature a ${modelParts.join(', ')}`);
          sections.push("");
        }
      }
    }
    
    // === PRODUCT COMPONENTS (always include when available) ===
    if (request.originalComponents) {
      const orig = request.originalComponents;
      const componentTypes = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'];
      const componentLines: string[] = [];

      for (const type of componentTypes) {
        const comp = orig[type];
        if (comp && comp.material) {
          componentLines.push(
            `${type.toUpperCase()}: ${comp.material} in ${comp.color || 'N/A'}`
          );
        }
      }

      if (componentLines.length > 0) {
        sections.push("=== PRODUCT COMPONENTS (from analysis) ===");
        sections.push("Accurately describe these materials and features in your prompt:");
        componentLines.forEach(line => sections.push(line));
        sections.push("");
      }

      // === BRANDING DETAILS (from component analysis) ===
      // Shot-type-aware: only inject branding elements that are actually visible
      const branding = (orig as any).branding;
      const visualShotType = request.productShootConfig?.shotType;
      if (branding) {
        sections.push("=== BRANDING DETAILS (from analysis - use EXACT text) ===");
        sections.push("⚠️ CRITICAL: Use the EXACT branding text below. Do NOT assume or generalize.");
        
        // Footbed text/logo: skip for on-foot/lifestyle (hidden by foot),
        // use simplified dynamic descriptor for productFocus
        if (visualShotType === 'on-foot' || visualShotType === 'lifestyle') {
          // Footbed is hidden — skip entirely
          console.log(`[branding] Skipping footbed branding for shot type: ${visualShotType}`);
        } else if (visualShotType === 'product-focus') {
          const footbedMaterial = orig.footbed?.material || 'cork';
          if (branding.footbedText) {
            const footbedLines = branding.footbedText.split('\n').filter(Boolean);
            if (footbedLines.length > 1) {
              const described = footbedLines.map((line: string) => `"${line.trim()}"`).join(', ');
              sections.push(`Footbed: branded ${footbedMaterial} footbed with stamped text (multi-line stamp): ${described}`);
            } else {
              sections.push(`Footbed: branded ${footbedMaterial} footbed with stamped text: "${branding.footbedText}"`);
            }
          } else {
            sections.push(`Footbed: branded ${footbedMaterial} footbed with maker's stamp (as shown in reference images)`);
          }
          if (branding.footbedLogo) {
            sections.push(`Footbed logo: ${branding.footbedLogo}`);
          }
        } else {
          // No shot type specified or unknown — include full branding as before
          if (branding.footbedText) {
            const footbedLines = branding.footbedText.split('\n').filter(Boolean);
            if (footbedLines.length > 1) {
              const described = footbedLines.map((line: string) => `"${line.trim()}"`).join(', ');
              sections.push(`Footbed text (multi-line stamp): ${described}`);
            } else {
              sections.push(`Footbed text: ${branding.footbedText}`);
            }
          }
          if (branding.footbedLogo) {
            sections.push(`Footbed logo: ${branding.footbedLogo}`);
          }
        }
        
        // Buckle engravings: always include (visible in all shot types)
        if (branding.buckleEngravings && Array.isArray(branding.buckleEngravings)) {
          branding.buckleEngravings.forEach((engraving: any, i: number) => {
            sections.push(`Buckle ${i + 1} (${engraving.location}): "${engraving.text}" in ${engraving.style}`);
          });
        }
        if (branding.otherBranding) {
          sections.push(`Other branding: ${branding.otherBranding}`);
        }
        sections.push("");
      }
    }
    
    // === COMPONENT OVERRIDES (only when user has customized) ===
    if (request.componentOverrides && request.originalComponents) {
      const overrideLines = buildOverrideLines(request.componentOverrides, request.originalComponents);
      if (overrideLines.length > 0) {
        overrideLines.forEach(line => sections.push(line));
      }
    }
    
    const creativeBrief = sections.join("\n");
    
    // Log the full creative brief for transparency
    console.log("=== CREATIVE BRIEF SENT TO PROMPT AGENT ===");
    console.log(creativeBrief);
    console.log("============================================");
    
    // Now call AI to craft the prompt
    // Use custom prompt if provided, otherwise use default
    const defaultSystemPrompt = `You are an expert creative director at a luxury fashion brand, skilled at crafting evocative image generation prompts.

Your job is to take a creative brief (and product reference images if provided) and transform them into a single, cohesive image generation prompt that will produce stunning, on-brand visuals.

PRIORITY HIERARCHY (when multiple style sources exist):
1. **Brand Brain / Brand Guidelines** - The non-negotiable brand identity foundation
2. **Moodboard** - Primary style influence for colors, lighting, mood
3. **Visual World** - Supporting direction for composition and props
4. **Shot Type** - Mandatory framing direction when specified

CRITICAL RULES:
1. **SHOT DIRECTION** - Handle based on what is provided in the brief:
   - If "=== MANDATORY SHOT DIRECTION ===" section EXISTS in the brief, follow it exactly:
     - "Product in Hand" = hands holding the product, close-up
     - "On Model" = product being worn/carried by a person
     - "Product Focus" = product-only shot in its natural environment, no hands or models
     - "Composition" = natural scene with contextual props, environmental composition
   - If NO shot direction section exists, you have CREATIVE FREEDOM. Do NOT prepend shot type labels like "On Model." or "Product Focus." - just describe the scene naturally.
2. Lead with the product DESCRIPTION (shot type label ONLY if explicitly specified in brief)

3. **⚠️ PRODUCT INTEGRITY IS CRITICAL** - When product reference images are provided:
   - **INCLUDE brand name and model name** (e.g., "Birkenstock Boston", "Nike Air Max") when provided in PRODUCT IDENTITY section - this helps the image generator understand the iconic product
   - ALSO describe the products visually in your prompt with EXACT detail
   - Include: material (leather, suede, croc-embossed), color, hardware finish (gold, silver, brushed metal)
   - Include: silhouette/type (clog, sandal, crossbody), and key details (cork footbed, adjustable buckle, chain strap)
   
    **⚠️ BRANDING FIDELITY (CRITICAL)**:
    - When a "BRANDING DETAILS" section is provided in the brief, use the EXACT text specified for each component.
    - Do NOT assume all buckles say "BIRKENSTOCK" — many models have abbreviated engravings like "BIRKEN" or "BIRK" on individual buckle bars. Use ONLY what the branding data specifies.
    - Buckle engravings must use the EXACT text specified in BRANDING DETAILS.
    - For footbed branding, defer to what is visible in reference images rather than attempting to render specific text. If a simplified footbed descriptor is provided (e.g., "branded Cork-Latex footbed with maker's stamp"), use that natural description instead of verbose stamp text.
    - If NO "BRANDING DETAILS" section exists in the brief, describe branding as visible in the reference images without assuming specific text. Fall back to generic: "signature branding on footbed and buckle hardware."
    - Your final prompt MUST explicitly describe buckle engravings to ensure fidelity. For footbed branding, a natural reference to the maker's stamp is sufficient.
    - **EMPHASIZE PRODUCT FIDELITY NATURALLY**: Weave product integrity requirements into your evocative description. The product must match reference images EXACTLY - same silhouette, same hardware placement, same materials, same branding. Make this emphasis feel natural, not like a checklist.

4. **BRAND GUIDELINES (MUST RESPECT)**:
   - When BRAND CONTEXT is provided (mission, values, tone), ensure the image feels aligned with the brand's identity
   - When visual style guidelines are provided (photography style, color palette), incorporate them as foundational elements
   - ⛔ When an "AVOID" list is provided, these elements are FORBIDDEN - never include them in the prompt
   - When Brand Brain data is marked as "HIGH PRIORITY", treat it as the brand's established visual DNA - all images must feel on-brand

5. **MOODBOARD LEADS STYLE** - When moodboard analysis is provided (marked as PRIMARY STYLE INFLUENCE), it carries HIGH WEIGHT for aesthetic decisions (colors, lighting, mood, atmosphere). The concept's Visual World carries MEDIUM WEIGHT for composition, props, and scene structure. BLEND both harmoniously, but when choosing colors, lighting, or mood, LEAN TOWARD the moodboard's aesthetic.
6. Weave in 2-3 specific elements from BOTH the Visual World AND moodboard analysis, but let moodboard dominate the "feel"
7. Set the mood, lighting, and atmosphere naturally - prioritize the moodboard's emotional tone
8. **TOE POST ACCURACY (THONG-STYLE SANDALS ONLY)** - When the brief includes TOE POST STRAP or TOE POST PIN entries, you MUST describe these colors explicitly in your prompt. The toe post is the vertical strap between the big toe and second toe. ONLY thong-style sandals (e.g., Gizeh, Ramses) have a toe post. Crossover-strap sandals (e.g., Mayari) do NOT have a toe post — never describe one for those models.
9. **BUCKLE SHAPE AND INSCRIPTION FIDELITY** - When the user changes buckle material/color, change ONLY the surface finish. The buckle SHAPE, SIZE, proportions, and any INSCRIBED TEXT (from BRANDING DETAILS) must remain EXACTLY as shown in reference images. Never generate generic buckle shapes — always match the specific hardware design visible in the references.
10. **ENTITY COUNT (CRITICAL)**:
   - The shot direction specifies how many shoes should appear. Respect this exactly.
   - If the brief says "ENTITY COUNT (MANDATORY): Exactly 1 shoe" — your prompt MUST describe "a single [Brand] [Model]", using singular language throughout. Do NOT write "a pair of". Only ONE shoe in frame.
   - If the brief says "ENTITY COUNT (MANDATORY): Exactly 2 shoes" — write "a pair of [Brand] [Model]" — exactly TWO shoes.
   - NEVER describe more shoes than the entity count specifies. This is non-negotiable.
11. Be specific and evocative - use sensory language
12. Keep it focused - one clear scene, not multiple concepts
13. Include quality indicators naturally (e.g., "editorial photography", "luxury lifestyle")
11. Respect the Tonality - if "never rules" are specified, absolutely do NOT include those elements
12. Match the target audience vibe without being heavy-handed
13. **NEVER ECHO SECTION HEADERS** - Do NOT start your prompt with labels like "Product Focus:", "Product Category:", "Visual World:", "Campaign Concept:", "=== PRODUCT INTEGRITY ===" etc. Start DIRECTLY with the image description and weave all requirements naturally into the prose.

QUALITY STANDARDS:
- High-quality, professional imagery
- Sharp focus on key elements
- Appropriate lighting for the mood
- Clean, intentional composition

OUTPUT: Return ONLY the crafted prompt text. No explanations, no bullet points, no placeholders, no section headers. Include brand/model names when provided, and describe products with visual precision. Start directly with the scene description.`;

    const systemPrompt = request.customPromptAgentSystemPrompt || defaultSystemPrompt;
    console.log("Using custom prompt agent system prompt:", !!request.customPromptAgentSystemPrompt);

    // Build multimodal content for prompt agent
    const promptAgentContent: any[] = [];
    
    // Add the creative brief FIRST as text
    promptAgentContent.push({
      type: "text",
      text: creativeBrief
    });
    
    // ALWAYS attach product images to Prompt Agent for accurate description
    // The agent needs to SEE the product to describe unchanged features accurately
    // The toggle only controls whether the IMAGE GENERATOR sees them (not the agent)
    if (productUrls.length > 0) {
      const attachCount = Math.min(productUrls.length, 10);
      console.log(`Adding ${attachCount} product images to prompt agent for visual analysis (ALWAYS attached to agent)`);
      for (const url of productUrls.slice(0, attachCount)) {
        promptAgentContent.push({
          type: "image_url",
          image_url: { url }
        });
      }
      
      // Determine if user has overrides or disabled reference attachment for image generator
      const hasOverrides = request.componentOverrides && 
        Object.keys(request.componentOverrides).length > 0;
      const refImagesDisabled = request.attachReferenceImages === false;
      
      // Build contextual fidelity instruction based on state
      let fidelityInstruction = `⚠️ PRODUCT FIDELITY IS CRITICAL: The above ${attachCount} image(s) are PRODUCT REFERENCES showing different angles of the same product.

MANDATORY REQUIREMENTS:
- Preserve EXACT visual details: materials, textures, colors, hardware finishes
- Match proportions and silhouette precisely  
- Render hardware (clasps, chains, buckles, magnetic closures) with photographic accuracy
- Do NOT simplify, reimagine, or take creative liberties with these products
- The products should look like they were photographed, not illustrated or reinterpreted

⚠️ REFERENCE-LINKED DESCRIPTIONS (CRITICAL):
When describing ANY product feature in your prompt, explicitly tie it to the reference images. Examples:
- Instead of "tobacco brown suede" → "tobacco brown suede exactly as shown in the reference images"
- Instead of "gold buckle hardware" → "gold buckle hardware matching the attached reference photos precisely"
- Instead of "cork footbed" → "signature cork footbed identical to the reference images in color and texture"

This reference-linking applies to ALL visual features:
- Color: "...in the exact shade visible in the reference images"
- Material: "...with the precise texture shown in the attached photos"
- Hardware: "...in the same finish as the reference"
- Silhouette: "...maintaining the exact proportions shown in the attached product photos"

Your prompt MUST include at least 2-3 explicit references to "the reference images" or "attached photos" when describing product details.`;

      // Add COMPONENT OVERRIDE MODE instructions if overrides are present
      if (hasOverrides) {
        const overrideEntries = Object.entries(request.componentOverrides || {});
        const overrideList = overrideEntries.map(([component, details]: [string, any]) => 
          `  - ${component}: ${details.color} ${details.material}`
        ).join('\n');
        
        fidelityInstruction += `

⚠️ COMPONENT OVERRIDE MODE (CRITICAL):
The user has CHANGED specific components from what's shown in the photos:
${overrideList}

OVERRIDE RULES:
- For CHANGED components listed above: Describe the NEW color/material specified, NOT what's in the photos
- For UNCHANGED components: Describe EXACTLY as shown in the reference photos
- Use EXPLICIT CONTRAST LANGUAGE to make changes crystal clear. Examples:
  - "Hot Pink suede upper (instead of the Taupe shown in the reference photos)"
  - "Midnight Blue leather (replacing the original Brown visible in the attached images)"
  - "...while keeping the silver buckle hardware exactly as shown in the reference photos"
- Make it UNMISTAKABLY CLEAR what differs from the reference photos vs what matches them
- The Image Generator needs this explicit contrast to know what to change vs preserve
- For TOE POST details on thong-style sandals (ONLY when TOE POST entries exist in the brief):
  - "White toe post strap (matching the White sole, instead of the original Black)"
  - "Silver toe post pin (matching the Silver buckle hardware)"
  - Always describe toe post strap color AND pin/rivet finish explicitly when TOE POST entries exist
  - NEVER describe a toe post for crossover-strap models (e.g., Mayari) — they don't have one
- For BUCKLE OVERRIDES: change ONLY color/material; preserve original buckle SHAPE, SIZE, and INSCRIBED TEXT from references`;
      }
      
      // Add PROMPT-ONLY MODE instructions if reference images disabled for generator
      if (refImagesDisabled) {
        fidelityInstruction += `

⚠️ PROMPT-ONLY GENERATION MODE (CRITICAL):
The Image Generator will NOT receive these reference images - only your text prompt.
Your descriptions must be EXCEPTIONALLY detailed and precise because the image model will rely 100% on your text.

EXTRA DETAIL REQUIREMENTS:
- Include EVERY visual detail: exact colors (not just "brown", but "warm tobacco brown with subtle orange undertones")
- Describe textures precisely: "soft napped suede with visible grain", "smooth full-grain leather with subtle sheen"
- Specify hardware finishes: "brushed antique brass with matte finish", "polished silver with mirror-like reflection"
- Detail proportions: "chunky 1.5-inch platform sole", "wide rounded toe box"
- Describe branding elements: "inscribed BIRKENSTOCK wordmark in classic serif typography on the cork footbed"
- Include construction details: "double-stitched welt", "contoured cork-latex footbed with anatomical arch support"

The more specific your descriptions, the better the image generator can recreate this product without visual reference.`;
      }
      
      promptAgentContent.push({ type: "text", text: fidelityInstruction });
    }
    
    // Add final instruction to craft the prompt
    promptAgentContent.push({
      type: "text",
      text: `Craft a single, evocative image generation prompt from this creative brief. When describing the product, explicitly reference the attached images for color, material, texture, and all visual details - use phrases like "exactly as shown in the reference images" and "matching the attached product photos precisely". This applies to ALL shot types.`
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: promptAgentContent }
        ],
      }),
    });

    if (!response.ok) {
      console.error("Prompt agent failed, falling back to basic prompt");
      return buildFallbackPrompt(request);
    }

    const aiResponse = await response.json();
    let craftedPrompt = aiResponse.choices?.[0]?.message?.content?.trim();
    
    if (!craftedPrompt) {
      console.error("No prompt from agent, falling back to basic prompt");
      return buildFallbackPrompt(request);
    }
    
    // Safety net: Clean up any placeholder patterns or echoed section headers the AI might have introduced
    craftedPrompt = craftedPrompt
      .replace(/\[(?:Product Name|product)[^\]]*,?\s*(?:e\.g\.,?\s*)?([\w\s\-\/]+)\]/gi, '$1')
      .replace(/\(e\.g\.,?\s*[^)]+\)/gi, '')
      .replace(/\[[^\]]*\]/g, '')
      // Strip shot type prefixes if AI echoes them anyway (fallback safety net)
      .replace(/^(?:On\s*Model|In\s*Hand|Product\s*(?:Focus|in\s*Hand)|Composition)[.,:\s]*/i, '')
      // Strip echoed section headers from the start of the prompt
      .replace(/^(?:Product\s*Focus|Product\s*Category|Visual\s*World|Campaign\s*Concept|Brand\s*Context|Moodboard)\s*:\s*/i, '')
      .trim();
    
    console.log("Prompt agent crafted:", craftedPrompt);
    return craftedPrompt;
    
  } catch (error) {
    console.error("Prompt agent error:", error);
    return buildFallbackPrompt(request);
  }
}

// Fallback to simple prompt building if agent fails
function buildFallbackPrompt(request: GenerateImageRequest): string {
  const parts: string[] = [];
  
  if (request.conceptDescription) parts.push(request.conceptDescription);
  else if (request.prompt) parts.push(request.prompt);
  
  if (request.moodboardDescription) parts.push(request.moodboardDescription);
  if (request.shotTypePrompt) parts.push(request.shotTypePrompt);
  if (request.extraKeywords?.length) parts.push(request.extraKeywords.join(", "));
  
  parts.push("high quality, professional, sharp focus");
  
  let finalPrompt = parts.join(". ");
  if (request.negativePrompt) finalPrompt += `. Avoid: ${request.negativePrompt}`;
  
  return finalPrompt;
}

// Convert base64 to Uint8Array for upload
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Calculate logo position on canvas
function calculateLogoPosition(
  position: LogoPlacement['position'],
  canvasWidth: number,
  canvasHeight: number,
  logoWidth: number,
  logoHeight: number,
  padding: number
): { x: number; y: number } {
  switch (position) {
    case 'top-left':
      return { x: padding, y: padding };
    case 'top-right':
      return { x: canvasWidth - logoWidth - padding, y: padding };
    case 'center':
      return { x: (canvasWidth - logoWidth) / 2, y: (canvasHeight - logoHeight) / 2 };
    case 'bottom-left':
      return { x: padding, y: canvasHeight - logoHeight - padding };
    case 'bottom-right':
    default:
      return { x: canvasWidth - logoWidth - padding, y: canvasHeight - logoHeight - padding };
  }
}

// Composite logo onto image using fetch + canvas simulation
async function compositeLogoOnImage(
  imageBase64: string,
  logoPlacement: LogoPlacement
): Promise<string> {
  try {
    console.log("Compositing logo onto image...");
    console.log("Logo URL:", logoPlacement.logoUrl);
    console.log("Position:", logoPlacement.position, "Size:", logoPlacement.sizePercent + "%", "Opacity:", logoPlacement.opacity);

    // Fetch logo as base64
    const logoResponse = await fetch(logoPlacement.logoUrl);
    if (!logoResponse.ok) {
      console.error("Failed to fetch logo:", logoResponse.status);
      return imageBase64; // Return original if logo fetch fails
    }
    
    const logoBlob = await logoResponse.arrayBuffer();
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBlob)));
    const logoContentType = logoResponse.headers.get('content-type') || 'image/png';
    
    // Use Lovable AI to composite images (since Deno doesn't have Canvas natively)
    // We'll send both images to a simple compositing request
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("No API key for compositing");
      return imageBase64;
    }

    // Create a compositing prompt that instructs the AI to add the logo
    const positionText = logoPlacement.position.replace('-', ' ');
    const compositingPrompt = `Take this image and add the provided logo in the ${positionText} corner. 
The logo should be approximately ${logoPlacement.sizePercent}% of the image width.
The logo opacity should be ${Math.round(logoPlacement.opacity * 100)}%.
Keep the main image EXACTLY as is - only add the logo overlay. Do not modify, enhance, or change the main image in any way.
The result should look like a simple watermark/branding overlay.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          { 
            role: "user", 
            content: [
              { type: "text", text: compositingPrompt },
              { 
                type: "image_url", 
                image_url: { url: `data:image/png;base64,${imageBase64}` } 
              },
              { 
                type: "image_url", 
                image_url: { url: `data:${logoContentType};base64,${logoBase64}` } 
              },
            ]
          }
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("Logo compositing API error:", response.status);
      return imageBase64;
    }

    const aiResponse = await response.json();
    const compositedImage = aiResponse.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (compositedImage && compositedImage.startsWith('data:image')) {
      // Extract base64 from data URL
      const match = compositedImage.match(/^data:image\/\w+;base64,(.+)$/);
      if (match) {
        console.log("✅ Logo successfully composited onto image");
        return match[1];
      }
    }
    
    console.warn("Compositing returned unexpected format, using original");
    return imageBase64;
  } catch (err) {
    console.error("Error compositing logo:", err);
    return imageBase64; // Return original on any error
  }
}

// Helper: Create pending rows in generated_images table
async function createPendingRows(
  supabaseClient: any,
  userId: string,
  body: GenerateImageRequest,
  imageCount: number,
): Promise<string[]> {
  const pendingIds: string[] = [];
  for (let i = 0; i < imageCount; i++) {
    const { data, error } = await supabaseClient
      .from('generated_images')
      .insert({
        user_id: userId,
        brand_id: body.brandId || null,
        prompt: body.prompt || '',
        image_url: '', // Placeholder - updated when generation completes
        status: 'pending',
        concept_title: body.conceptTitle || null,
        folder: body.folder || 'Uncategorized',
      })
      .select('id')
      .single();
    if (data) {
      pendingIds.push(data.id);
    } else {
      console.error(`[ASYNC] Failed to create pending row ${i}:`, error);
    }
  }
  return pendingIds;
}

// Background generation - runs after HTTP response is sent via EdgeRuntime.waitUntil
async function runBackgroundGeneration(params: {
  pendingIds: string[];
  body: GenerateImageRequest & { moodboard?: { thumbnail?: string; url?: string } };
  userId: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
  apiKey: string;
  selectedModel: string;
}) {
  const { pendingIds, body, userId, supabaseUrl, supabaseServiceKey, apiKey, selectedModel } = params;
  const bgSupabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const moodboardUrl = body.moodboardUrl || body.moodboard?.thumbnail || body.moodboard?.url;
    console.log("[BG] Starting background generation for", pendingIds.length, "images");
    console.log("[BG] Model:", selectedModel, "| Moodboard:", moodboardUrl || "NONE");

    // === REMIX MODE: bypass prompt agent, use direct editing prompt ===
    let refinedPrompt: string;
    if (body.remixMode) {
      const remixParts: string[] = [
        "Edit this image: replace the footwear/shoes with the EXACT product shown in the reference images.",
        "Keep the model, pose, background, lighting, and composition IDENTICAL. Only change the shoes.",
        "The replacement shoes must match the reference images precisely — same silhouette, materials, colors, hardware, and proportions.",
      ];
      
      // Component overrides — use shared structured builder
      if (body.componentOverrides) {
        const overrideLines = buildOverrideLines(body.componentOverrides, body.originalComponents);
        if (overrideLines.length > 0) {
          remixParts.push(overrideLines.join('\n'));
        }
      }
      
      if (body.remixRemoveText) {
        remixParts.push("ALSO: Remove any text, logos, watermarks, or ad copy overlaid on the image. Inpaint those areas to match the surrounding background seamlessly.");
      }
      
      refinedPrompt = remixParts.join('\n\n');
      console.log("[BG] Remix mode — using direct editing prompt (no prompt agent)");
    } else {
      // Craft refined prompt (can take a few seconds)
      refinedPrompt = await craftPromptWithAgent(body, apiKey);
    }
    console.log("[BG] Refined prompt:", refinedPrompt);

    // Generate each image in parallel
    const generateOne = async (pendingId: string, index: number) => {
      try {
        console.log(`[BG] Generating image ${index + 1}/${pendingIds.length}...`);

        // Build multimodal content
        const messageContent: any[] = [
          { type: "text", text: refinedPrompt }
        ];

        // Add source image for editing (image-to-image) — used by both editMode and remixMode
        if ((body.editMode || body.remixMode) && body.sourceImageUrl && body.sourceImageUrl.startsWith('http')) {
          messageContent.unshift({
            type: "image_url",
            image_url: { url: body.sourceImageUrl }
          });
          messageContent.unshift({
            type: "text",
            text: body.remixMode 
              ? "Replace the shoes/footwear in this image with the product shown in the reference images below:"
              : "Edit the following image according to these instructions:"
          });
        }

        // Add moodboard reference as style guide
        if (moodboardUrl && moodboardUrl.startsWith('http')) {
          messageContent.push({
            type: "image_url",
            image_url: { url: moodboardUrl }
          });
          messageContent.push({
            type: "text",
            text: "⚠️ PRIMARY STYLE REFERENCE: This moodboard image should STRONGLY influence the color palette, lighting quality, mood, and visual atmosphere of the generated image. It carries HIGH WEIGHT for all aesthetic decisions. Blend it harmoniously with the text direction, but let this image lead the visual feel."
          });
        }

        // Add product references as visual inputs
        const shouldAttachProductRefs = body.attachReferenceImages !== false;
        const productUrls = (body.productReferenceUrls || [])
          .filter((url: string) => url && url.startsWith('http') && !url.toLowerCase().includes('.gif'));

        if (shouldAttachProductRefs && productUrls.length > 0) {
          const attachCount = Math.min(productUrls.length, 6);
          console.log(`[BG] Attaching ${attachCount} of ${productUrls.length} product refs to image generator (capped at 6)`);
          for (let i = 0; i < attachCount; i++) {
            messageContent.push({
              type: "image_url",
              image_url: { url: productUrls[i] }
            });
          }
          messageContent.push({
            type: "text",
            text: `⚠️ PRODUCT FIDELITY IS CRITICAL: The above ${attachCount} image(s) show the SAME SINGLE product from different angles — they are NOT separate products. Do NOT interpret multiple reference angles as multiple separate shoes.\n\nGenerate ONLY the number of shoes specified in the prompt text (1 or 2).\n\nMANDATORY REQUIREMENTS:\n- Preserve EXACT visual details: materials, textures, colors, hardware finishes\n- Match proportions and silhouette precisely\n- Render hardware (clasps, chains, buckles, magnetic closures) with photographic accuracy\n- Do NOT simplify, reimagine, or take creative liberties with these products\n- The products should look like they were photographed, not illustrated or reinterpreted\n- If the product has croc-embossed leather, show croc-embossed leather. If it has a gold chain, show a gold chain.`
          });
        } else if (!shouldAttachProductRefs && productUrls.length > 0) {
          console.log("[BG] ⚠️ SKIPPING PRODUCT IMAGE ATTACHMENTS - user toggled off");
          messageContent.push({
            type: "text",
            text: `⚠️ NOTE: Reference images are disabled for this generation. Create the product based on the text descriptions provided in the prompt.`
          });
        }

        // Map resolution to image_size
        const imageSizeMap: Record<string, string> = {
          '512': '1K', '1024': '1K', '2048': '2K', '4096': '4K',
        };
        const imageSize = imageSizeMap[body.resolution || '1024'] || '1K';
        const aspectRatio = body.aspectRatio || '1:1';

        console.log(`[BG] Image ${index + 1} config: size=${imageSize}, aspectRatio=${aspectRatio}`);

        // Call AI Gateway for image generation
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [{ role: "user", content: messageContent }],
            modalities: ["image", "text"],
            image_config: { image_size: imageSize, aspect_ratio: aspectRatio },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[BG] Image ${index + 1} API error:`, response.status, errorText);
          throw new Error(`Generation failed: ${response.status}`);
        }

        const aiResponse = await response.json();
        const images = aiResponse.choices?.[0]?.message?.images;
        if (!images || images.length === 0) {
          throw new Error('No image in response');
        }

        const imageData = images[0];
        const imageUrl = imageData.image_url?.url;
        if (!imageUrl || !imageUrl.startsWith('data:image')) {
          throw new Error('Invalid image format');
        }

        // Extract base64
        const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!base64Match) {
          throw new Error('Could not parse image data');
        }

        const imageFormat = base64Match[1];
        let base64Data = base64Match[2];

        // Composite logo if enabled
        if (body.logoPlacement?.enabled && body.logoPlacement.logoUrl) {
          console.log("[BG] Compositing logo...");
          base64Data = await compositeLogoOnImage(base64Data, body.logoPlacement);
        }

        const imageBytes = base64ToUint8Array(base64Data);

        // Upload to storage
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const filename = `${userId}/${timestamp}-${randomId}.${imageFormat}`;

        const { error: uploadError } = await bgSupabase.storage
          .from('generated-images')
          .upload(filename, imageBytes, {
            contentType: `image/${imageFormat}`,
            cacheControl: '3600',
          });

        if (uploadError) {
          throw new Error(`Failed to save image: ${uploadError.message}`);
        }

        const { data: urlData } = bgSupabase.storage
          .from('generated-images')
          .getPublicUrl(filename);

        const publicUrl = urlData.publicUrl;
        console.log(`[BG] Image ${index + 1} uploaded:`, publicUrl);

        // UPDATE the pending row with completed data
        const refsWereAttached = body.attachReferenceImages !== false;
        const { error: updateError } = await bgSupabase
          .from('generated_images')
          .update({
            image_url: publicUrl,
            refined_prompt: refinedPrompt,
            negative_prompt: body.negativePrompt || null,
            product_reference_url: refsWereAttached ? (body.productReferenceUrls?.[0] || null) : null,
            moodboard_id: body.moodboardId || null,
            settings: {
              aiModel: selectedModel,
              artisticStyle: body.artisticStyle,
              lightingStyle: body.lightingStyle,
              cameraAngle: body.cameraAngle,
              resolution: body.resolution,
              aspectRatio: body.aspectRatio,
              guidanceScale: body.guidanceScale,
              seed: body.seed,
              extraKeywords: body.extraKeywords,
              textOnImage: body.textOnImage,
              references: {
                moodboardId: body.moodboardId || null,
                moodboardUrl: body.moodboardUrl || null,
                moodboardDescription: body.moodboardDescription || null,
                productReferenceUrls: refsWereAttached ? (body.productReferenceUrls || []) : [],
                shotTypePrompt: body.shotTypePrompt || null,
                sourceImageUrl: body.sourceImageUrl || null,
                referencesAttached: refsWereAttached,
              },
              logoApplied: body.logoPlacement?.enabled || false,
              logoPosition: body.logoPlacement?.position || null,
            },
            concept_id: body.conceptTitle ? `concept-${index}` : null,
            status: 'completed',
          })
          .eq('id', pendingId);

        if (updateError) {
          console.error(`[BG] DB update error for image ${index + 1}:`, updateError);
        } else {
          console.log(`[BG] ✅ Image ${index + 1} completed`);
        }

      } catch (err) {
        console.error(`[BG] ❌ Image ${index + 1} failed:`, err);
        await bgSupabase
          .from('generated_images')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown error',
          })
          .eq('id', pendingId);
      }
    };

    // Generate all images in parallel
    await Promise.all(pendingIds.map((id, i) => generateOne(id, i)));
    console.log(`[BG] Background generation complete`);

  } catch (err) {
    console.error("[BG] Critical failure:", err);
    // Mark all as failed
    for (const id of pendingIds) {
      await bgSupabase
        .from('generated_images')
        .update({
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Generation failed',
        })
        .eq('id', id);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use anon key + forwarded auth header for JWT validation (works with Lovable Cloud ES256 signing)
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data, error: claimsError } = await authClient.auth.getUser(token);

    if (claimsError || !data?.user) {
      console.error("JWT validation failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = data.user;

    // Service-role client for DB writes (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: GenerateImageRequest & { moodboard?: { thumbnail?: string; url?: string } } = await req.json();
    const imageCount = Math.min(body.imageCount || 1, 8);
    const selectedModel = modelMap[body.aiModel || 'auto'] || modelMap['auto'];

    console.log("[ASYNC] Creating", imageCount, "pending rows for user", user.id);

    // Create pending rows in database
    const pendingIds = await createPendingRows(supabase, user.id, body, imageCount);

    if (pendingIds.length === 0) {
      throw new Error("Failed to create pending image records");
    }

    console.log("[ASYNC] Pending rows created:", pendingIds);

    // Start background generation (continues after HTTP response)
    EdgeRuntime.waitUntil(
      runBackgroundGeneration({
        pendingIds,
        body,
        userId: user.id,
        supabaseUrl: SUPABASE_URL,
        supabaseServiceKey: SUPABASE_SERVICE_ROLE_KEY,
        apiKey: LOVABLE_API_KEY,
        selectedModel,
      })
    );

    // Return immediately with pending IDs
    return new Response(
      JSON.stringify({
        pendingIds,
        status: 'processing',
        total: imageCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate images" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

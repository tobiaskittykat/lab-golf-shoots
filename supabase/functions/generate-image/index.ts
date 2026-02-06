/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
}

// AI model mapping
const modelMap: Record<string, string> = {
  'auto': 'google/gemini-3-pro-image-preview',
  'nano-banana': 'google/gemini-2.5-flash-image-preview',
};

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
  'outdoor-beach': 'soft sandy beach background, golden hour sunlight, ocean in distance, relaxed coastal vibe',
  'outdoor-urban': 'urban city street background, modern architecture, stylish metropolitan setting',
  'outdoor-park': 'lush green park setting, dappled sunlight through trees, natural fresh atmosphere',
  'outdoor-cafe': 'charming European café terrace, cobblestone street, bistro chairs, warm afternoon light',
  'outdoor-desert': 'dramatic desert landscape, sand dunes, warm golden hour light, minimalist vast backdrop',
  'outdoor-forest': 'serene forest path, filtered sunlight through trees, natural earthy tones, peaceful setting',
  'outdoor-rooftop': 'modern rooftop setting, city skyline in background, golden hour, urban lifestyle',
  'outdoor-pool': 'luxury poolside setting, turquoise water, white deck, resort vibes, bright daylight',
  'outdoor-mountain': 'mountain hiking trail, scenic overlook, adventurous outdoor setting, natural beauty',
  'outdoor-vineyard': 'rolling vineyard hills, golden afternoon light, Tuscan countryside aesthetic, sophisticated',
  'outdoor-boardwalk': 'wooden boardwalk by the sea, coastal breeze, vacation vibes, relaxed summer setting',
  'outdoor-market': 'vibrant street market, colorful stalls, bustling atmosphere, authentic local setting',
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
    
    // === COMPONENT OVERRIDES (only when user has customized) ===
    if (request.componentOverrides && request.originalComponents) {
      const overrides = request.componentOverrides;
      const original = request.originalComponents;
      
      // Check if any overrides are different from original
      const componentTypes = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'] as const;
      const changedComponents: string[] = [];
      
      // Helper to get a descriptive color name from override data
      const getColorDescription = (override: { color: string; colorHex?: string }): string => {
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
      };
      
      for (const type of componentTypes) {
        const override = overrides[type];
        const orig = original[type];
        
        if (override && orig) {
          const colorDisplay = getColorDescription(override);
          if (override.material !== orig.material || override.color !== orig.color) {
            changedComponents.push(
              `${type.toUpperCase()}: ${override.material} in ${colorDisplay} (was: ${orig.material} in ${orig.color})`
            );
          }
        } else if (override && !orig) {
          const colorDisplay = getColorDescription(override);
          changedComponents.push(`${type.toUpperCase()}: ${override.material} in ${colorDisplay}`);
        }
      }
      
      if (changedComponents.length > 0) {
        sections.push("=== PRODUCT COMPONENT OVERRIDES ===");
        sections.push("⚠️ IMPORTANT: The user has customized specific shoe components.");
        sections.push("Generate the product with THESE modifications while maintaining");
        sections.push("the original silhouette and proportions from reference images:");
        sections.push("");
        changedComponents.forEach(c => sections.push(c));
        sections.push("");
        sections.push("Keep all OTHER components exactly as shown in reference images.");
        sections.push("The overall shoe silhouette/shape must remain unchanged.");
        sections.push("");
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
   
   **⚠️ BIRKENSTOCK LOGO FIDELITY (CRITICAL)**:
   - The embossed "BIRKENSTOCK" wordmark on the footbed and the engraved "Birkenstock" on the buckle are signature brand identifiers
   - These logos MUST be clearly visible and accurately reproduced in every product shot
   - Pay special attention to: the classic serif typography, correct letter spacing, proper placement on footbed and buckle
   - Your final prompt MUST explicitly describe and emphasize these logo elements to ensure the image generator renders them faithfully
   
   - Example: "the iconic Birkenstock Boston clog in taupe suede, featuring the signature cork-latex footbed with the embossed 'BIRKENSTOCK' wordmark clearly visible in classic serif typography, the adjustable metal buckle engraved with the distinctive 'Birkenstock' script, and contoured EVA sole"
   - **EMPHASIZE PRODUCT FIDELITY NATURALLY**: Weave product integrity requirements into your evocative description. The product must match reference images EXACTLY - same silhouette, same hardware placement, same materials, same branding. Make this emphasis feel natural, not like a checklist.

4. **BRAND GUIDELINES (MUST RESPECT)**:
   - When BRAND CONTEXT is provided (mission, values, tone), ensure the image feels aligned with the brand's identity
   - When visual style guidelines are provided (photography style, color palette), incorporate them as foundational elements
   - ⛔ When an "AVOID" list is provided, these elements are FORBIDDEN - never include them in the prompt
   - When Brand Brain data is marked as "HIGH PRIORITY", treat it as the brand's established visual DNA - all images must feel on-brand

5. **MOODBOARD LEADS STYLE** - When moodboard analysis is provided (marked as PRIMARY STYLE INFLUENCE), it carries HIGH WEIGHT for aesthetic decisions (colors, lighting, mood, atmosphere). The concept's Visual World carries MEDIUM WEIGHT for composition, props, and scene structure. BLEND both harmoniously, but when choosing colors, lighting, or mood, LEAN TOWARD the moodboard's aesthetic.
6. Weave in 2-3 specific elements from BOTH the Visual World AND moodboard analysis, but let moodboard dominate the "feel"
7. Set the mood, lighting, and atmosphere naturally - prioritize the moodboard's emotional tone
8. Be specific and evocative - use sensory language
9. Keep it focused - one clear scene, not multiple concepts
10. Include quality indicators naturally (e.g., "editorial photography", "luxury lifestyle")
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
- The Image Generator needs this explicit contrast to know what to change vs preserve`;
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
- Describe branding elements: "embossed BIRKENSTOCK wordmark in classic serif typography on the cork footbed"
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Get auth header for user identification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: GenerateImageRequest & { moodboard?: { thumbnail?: string; url?: string } } = await req.json();
    const imageCount = Math.min(body.imageCount || 1, 8);
    const selectedModel = modelMap[body.aiModel || 'auto'] || modelMap['auto'];
    
    // Extract moodboard URL from various possible locations (top-level or nested)
    const moodboardUrl = body.moodboardUrl || body.moodboard?.thumbnail || body.moodboard?.url;
    console.log("=== MOODBOARD URL EXTRACTION ===");
    console.log("body.moodboardUrl:", body.moodboardUrl);
    console.log("body.moodboard?.thumbnail:", body.moodboard?.thumbnail);
    console.log("Resolved moodboardUrl:", moodboardUrl || "NONE");
    console.log("================================");
    
    console.log("Generating", imageCount, "images with model:", selectedModel);
    console.log("Request:", JSON.stringify(body, null, 2));

    // Use the prompt agent to craft a refined, intelligent prompt
    const refinedPrompt = await craftPromptWithAgent(body, LOVABLE_API_KEY);
    console.log("Refined prompt:", refinedPrompt);

    // Generate images in parallel for faster response
    const generateSingleImage = async (index: number): Promise<any> => {
      try {
        console.log(`Generating image ${index + 1}/${imageCount}...`);
        
        // Build multimodal content
        const messageContent: any[] = [
          { type: "text", text: refinedPrompt }
        ];
        
        // Add source image for editing (image-to-image)
        if (body.editMode && body.sourceImageUrl && body.sourceImageUrl.startsWith('http')) {
          messageContent.unshift({
            type: "image_url",
            image_url: { url: body.sourceImageUrl }
          });
          messageContent.unshift({
            type: "text",
            text: "Edit the following image according to these instructions:"
          });
        }
        
        // Add moodboard reference as style guide (IMPORTANT: must attach as image)
        if (moodboardUrl && moodboardUrl.startsWith('http')) {
          console.log("✅ ATTACHING MOODBOARD TO MULTIMODAL PAYLOAD:", moodboardUrl);
          messageContent.push({
            type: "image_url",
            image_url: { url: moodboardUrl }
          });
          messageContent.push({
            type: "text",
            text: "⚠️ PRIMARY STYLE REFERENCE: This moodboard image should STRONGLY influence the color palette, lighting quality, mood, and visual atmosphere of the generated image. It carries HIGH WEIGHT for all aesthetic decisions. Blend it harmoniously with the text direction, but let this image lead the visual feel."
          });
        } else {
          console.log("⚠️ NO MOODBOARD URL TO ATTACH - moodboardUrl was:", moodboardUrl);
        }
        
        // Add product references as visual inputs (up to 10, skip GIFs which aren't supported)
        // BUT: Only attach if attachReferenceImages is not explicitly false
        const shouldAttachProductRefs = body.attachReferenceImages !== false;
        const productUrls = (body.productReferenceUrls || [])
          .filter(url => url && url.startsWith('http') && !url.toLowerCase().includes('.gif'));
        
        if (shouldAttachProductRefs && productUrls.length > 0) {
          // Attach up to 10 product reference images for maximum fidelity - Gemini supports many images
          const attachCount = Math.min(productUrls.length, 10);
          for (let i = 0; i < attachCount; i++) {
            const url = productUrls[i];
            messageContent.push({
              type: "image_url",
              image_url: { url }
            });
          }
          messageContent.push({
            type: "text",
            text: `⚠️ PRODUCT FIDELITY IS CRITICAL: The above ${attachCount} image(s) are PRODUCT REFERENCES showing different angles of the same product.

MANDATORY REQUIREMENTS:
- Preserve EXACT visual details: materials, textures, colors, hardware finishes
- Match proportions and silhouette precisely  
- Render hardware (clasps, chains, buckles, magnetic closures) with photographic accuracy
- Do NOT simplify, reimagine, or take creative liberties with these products
- The products should look like they were photographed, not illustrated or reinterpreted
- If the product has croc-embossed leather, show croc-embossed leather. If it has a gold chain, show a gold chain.`
          });
        } else if (!shouldAttachProductRefs && productUrls.length > 0) {
          console.log("⚠️ SKIPPING PRODUCT IMAGE ATTACHMENTS - user toggled off reference images");
          // Add a note to the prompt that we're relying on text descriptions only
          messageContent.push({
            type: "text",
            text: `⚠️ NOTE: Reference images are disabled for this generation. Create the product based on the text descriptions provided in the prompt. Use the component overrides and product identity descriptions to guide the rendering.`
          });
        }
        
        // Note: Shot type guidance is now in the text prompt via the creative brief
        // No image attachment for shot references - they guide via text only
        
        // Log the multimodal content structure for transparency
        console.log("=== MULTIMODAL CONTENT STRUCTURE ===");
        console.log(JSON.stringify(messageContent.map(c => 
          c.type === 'image_url' ? { type: 'image_url', url: c.image_url?.url?.slice(0, 100) + '...' } : c
        ), null, 2));
        console.log("=====================================");

        // Map resolution to Gemini image_size format
        const imageSizeMap: Record<string, string> = {
          '512': '1K',    // 512px → 1K (closest match)
          '1024': '1K',   // 1024px → 1K
          '2048': '2K',   // 2048px → 2K
          '4096': '4K',   // 4096px → 4K (true 4K!)
        };

        const imageSize = imageSizeMap[body.resolution || '1024'] || '1K';
        const aspectRatio = body.aspectRatio || '1:1';

        console.log(`Image config: size=${imageSize}, aspectRatio=${aspectRatio}`);

        // Call Lovable AI Gateway for image generation
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { 
                role: "user", 
                content: messageContent
              }
            ],
            modalities: ["image", "text"],
            image_config: {
              image_size: imageSize,
              aspect_ratio: aspectRatio,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Image generation error for image ${index + 1}:`, response.status, errorText);
          return {
            status: 'failed',
            error: `Generation failed: ${response.status}`,
            index
          };
        }

        const aiResponse = await response.json();
        console.log(`AI response for image ${index + 1}:`, JSON.stringify(aiResponse).slice(0, 500));
        
        // Extract the image from the response
        const images = aiResponse.choices?.[0]?.message?.images;
        if (!images || images.length === 0) {
          console.error(`No images in response for image ${index + 1}`);
          return {
            status: 'failed',
            error: 'No image in response',
            index
          };
        }

        const imageData = images[0];
        const imageUrl = imageData.image_url?.url;
        
        if (!imageUrl || !imageUrl.startsWith('data:image')) {
          console.error(`Invalid image URL format for image ${index + 1}`);
          return {
            status: 'failed',
            error: 'Invalid image format',
            index
          };
        }

        // Extract base64 data
        const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!base64Match) {
          console.error(`Could not parse base64 for image ${index + 1}`);
          return {
            status: 'failed',
            error: 'Could not parse image data',
            index
          };
        }

        const imageFormat = base64Match[1];
        let base64Data = base64Match[2];
        
        // Composite logo if enabled
        if (body.logoPlacement?.enabled && body.logoPlacement.logoUrl) {
          console.log("Logo placement enabled, compositing...");
          base64Data = await compositeLogoOnImage(base64Data, body.logoPlacement);
        }
        
        const imageBytes = base64ToUint8Array(base64Data);
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const filename = `${user.id}/${timestamp}-${randomId}.${imageFormat}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('generated-images')
          .upload(filename, imageBytes, {
            contentType: `image/${imageFormat}`,
            cacheControl: '3600',
          });

        if (uploadError) {
          console.error(`Upload error for image ${index + 1}:`, uploadError);
          return {
            status: 'failed',
            error: 'Failed to save image',
            index
          };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('generated-images')
          .getPublicUrl(filename);

        const publicUrl = urlData.publicUrl;
        console.log(`Image ${index + 1} uploaded to:`, publicUrl);

        // Determine if product references were actually attached to the AI payload
        const refsWereAttached = body.attachReferenceImages !== false;
        
        // Save to database with references stored in settings for reliable retrieval
        const { data: dbRecord, error: dbError } = await supabase
          .from('generated_images')
          .insert({
            user_id: user.id,
            brand_id: body.brandId || null,
            prompt: body.prompt,
            refined_prompt: refinedPrompt,
            negative_prompt: body.negativePrompt || null,
            image_url: publicUrl,
            product_reference_url: refsWereAttached ? (body.productReferenceUrls?.[0] || null) : null,
            context_reference_url: null, // Shot types are now text prompts, not image URLs
            moodboard_id: body.moodboardId || null,
            settings: {
              aiModel: selectedModel, // Save actual model used, not user selection
              artisticStyle: body.artisticStyle,
              lightingStyle: body.lightingStyle,
              cameraAngle: body.cameraAngle,
              resolution: body.resolution,
              aspectRatio: body.aspectRatio,
              guidanceScale: body.guidanceScale,
              seed: body.seed,
              extraKeywords: body.extraKeywords,
              textOnImage: body.textOnImage,
              // Only store references that were ACTUALLY attached to the generation
              references: {
                moodboardId: body.moodboardId || null,
                // Moodboard is always attached when present (no toggle for moodboard)
                moodboardUrl: body.moodboardUrl || null,
                moodboardDescription: body.moodboardDescription || null,
                // Only include product refs if they were actually attached
                productReferenceUrls: refsWereAttached ? (body.productReferenceUrls || []) : [],
                shotTypePrompt: body.shotTypePrompt || null,
                sourceImageUrl: body.sourceImageUrl || null,
                // Track whether references were attached for clarity
                referencesAttached: refsWereAttached,
              },
              // Track if logo was applied
              logoApplied: body.logoPlacement?.enabled || false,
              logoPosition: body.logoPlacement?.position || null,
            },
            concept_id: body.conceptTitle ? `concept-${index}` : null,
            concept_title: body.conceptTitle || null,
            status: 'completed',
            folder: body.folder || 'Uncategorized',
          })
          .select()
          .single();

        if (dbError) {
          console.error(`Database error for image ${index + 1}:`, dbError);
        }

        return {
          id: dbRecord?.id || `temp-${index}`,
          imageUrl: publicUrl,
          status: 'completed',
          prompt: body.prompt,
          refinedPrompt,
          index
        };

      } catch (imageError) {
        console.error(`Error generating image ${index + 1}:`, imageError);
        return {
          status: 'failed',
          error: imageError instanceof Error ? imageError.message : 'Unknown error',
          index
        };
      }
    };

    // Generate all images in parallel
    const imagePromises = Array.from({ length: imageCount }, (_, i) => generateSingleImage(i));
    const generatedImages = await Promise.all(imagePromises);

    // Check if any images were generated
    const successfulImages = generatedImages.filter(img => img.status === 'completed');
    console.log(`Generated ${successfulImages.length}/${imageCount} images successfully`);

    return new Response(
      JSON.stringify({ 
        images: generatedImages,
        total: imageCount,
        successful: successfulImages.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-image:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate images";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ============= SHOT TYPE CONFIGURATIONS =============
// Each shot type has static (always used) and dynamic (configurable) elements

import { studioBackgrounds, outdoorBackgrounds, weatherConditionOptions } from './presets';
import type { SettingType, WeatherCondition } from './types';

// Note: ProductShotType is used by other files, avoid circular imports
export type ProductShotType = 'product-focus' | 'on-foot' | 'lifestyle';

// ===== BACKGROUND CONTEXT =====
export interface BackgroundContext {
  settingType: SettingType;
  backgroundId?: string;
  customBackgroundPrompt?: string;
  weatherCondition?: WeatherCondition;
}

/**
 * Build background section for prompts based on user selection
 */
export function buildBackgroundSection(context: BackgroundContext): string[] {
  const sections: string[] = [];
  
  // Special case: White Cyclorama - exact hardcoded output
  if (context.backgroundId === 'studio-white') {
    sections.push("BACKGROUND (MANDATORY):");
    sections.push("- Pure white seamless studio background");
    sections.push("- Visible floor and wall plane");
    sections.push("- Soft cast shadows grounding the model");
    return sections;
  }
  
  sections.push("BACKGROUND:");
  
  if (context.customBackgroundPrompt) {
    // Custom prompt overrides everything
    sections.push(`- ${context.customBackgroundPrompt}`);
  } else if (context.backgroundId) {
    // Find the preset
    const allBackgrounds = [...studioBackgrounds, ...outdoorBackgrounds];
    const preset = allBackgrounds.find(bg => bg.id === context.backgroundId);
    if (preset) {
      sections.push(`- ${preset.prompt}`);
    }
  } else if (context.settingType === 'auto') {
    sections.push("- AI selects appropriate background for the product");
  } else if (context.settingType === 'studio') {
    // Default studio
    sections.push("- Clean professional studio environment");
    sections.push("- Seamless backdrop with soft shadows");
  } else {
    // Default outdoor
    sections.push("- Natural outdoor setting");
  }
  
  return sections;
}

/**
 * Build lighting section for prompts based on background type
 */
export function buildLightingSection(context: BackgroundContext): string[] {
  const sections: string[] = [];
  
  // Special case: White Cyclorama - exact hardcoded lighting
  if (context.backgroundId === 'studio-white') {
    sections.push("LIGHTING & TECHNICAL (MANDATORY):");
    sections.push("- Clean, diffused studio light");
    sections.push("- Soft contact shadows under the soles");
    return sections;
  }
  
  sections.push("LIGHTING:");
  
  const isOutdoor = context.settingType === 'outdoor' || context.backgroundId?.startsWith('outdoor-');
  const isStudio = context.settingType === 'studio' || context.backgroundId?.startsWith('studio-');
  
  if (isOutdoor) {
    // Natural lighting with weather condition
    const weatherOpt = weatherConditionOptions.find(w => w.value === (context.weatherCondition || 'auto'));
    if (weatherOpt) {
      sections.push(`- ${weatherOpt.lightingPrompt}`);
    } else {
      sections.push("- Natural outdoor lighting");
    }
  } else if (isStudio) {
    // Studio lighting
    sections.push("- Professional studio lighting, softbox diffusion");
    sections.push("- Controlled even illumination with soft shadows");
  } else {
    // Auto - let AI decide
    sections.push("- Lighting appropriate to the setting");
  }
  
  return sections;
}

// ===== RANDOM SELECTION UTILITY =====
/**
 * Pre-select a random concrete option when 'auto' is selected.
 * This ensures prompts always have specific, evocative language rather than
 * vague "AI will choose from..." instructions.
 */
function selectRandomFromOptions<T extends { value: string; prompt?: string | null }>(
  options: T[], 
  currentValue: string
): T {
  if (currentValue !== 'auto') {
    return options.find(o => o.value === currentValue) || options[0];
  }
  // Filter out 'auto' and pick random
  const concreteOptions = options.filter(o => o.value !== 'auto' && o.prompt);
  if (concreteOptions.length === 0) return options[0];
  return concreteOptions[Math.floor(Math.random() * concreteOptions.length)];
}

// ===== POSE VARIATIONS =====
export type PoseVariation = 
  | 'auto'
  | 'feet-parallel'
  | 'one-forward'
  | 'heel-relaxed'
  | 'toe-out'
  | 'soft-asymmetry';

export const poseVariationOptions = [
  { 
    value: 'auto' as PoseVariation, 
    label: 'Auto (AI chooses)', 
    prompt: null,
    narrative: null, // Narrative version for evocative prompts
  },
  { 
    value: 'feet-parallel' as PoseVariation, 
    label: 'Feet Parallel', 
    prompt: 'feet parallel with slight weight shift to one side',
    narrative: 'a natural, relaxed stance with feet parallel:\n– Slight weight shift to one side\n– Casual, grounded posture\n– No exaggerated movement or editorial posing',
  },
  { 
    value: 'one-forward' as PoseVariation, 
    label: 'One Foot Forward', 
    prompt: 'one foot subtly placed forward of the other',
    narrative: 'a natural, relaxed stance with one foot subtly placed forward:\n– Casual, grounded posture\n– Both feet fully on the ground\n– No exaggerated movement or editorial posing',
  },
  { 
    value: 'heel-relaxed' as PoseVariation, 
    label: 'Heel Relaxed', 
    prompt: 'heel of one foot relaxed outward at a natural angle',
    narrative: 'a natural, relaxed stance with the heel of one foot relaxed outward:\n– Natural, organic angle\n– Casual, grounded posture\n– No exaggerated movement or editorial posing',
  },
  { 
    value: 'toe-out' as PoseVariation, 
    label: 'Gentle Toe-Out', 
    prompt: 'gentle toe-out on one foot only, subtle and natural',
    narrative: 'a natural, relaxed stance with a gentle toe-out on one foot:\n– Subtle and organic\n– Casual, grounded posture\n– No exaggerated movement or editorial posing',
  },
  { 
    value: 'soft-asymmetry' as PoseVariation, 
    label: 'Soft Asymmetry', 
    prompt: 'soft asymmetry in stance, natural and never exaggerated',
    narrative: 'a natural, relaxed stance with soft asymmetry:\n– Natural weight distribution\n– Casual, grounded posture\n– No exaggerated movement or editorial posing',
  },
];

// ===== LEG STYLING =====
export type LegStyling = 
  | 'auto'
  | 'wide-leg-cropped'
  | 'straight-leg-cropped'
  | 'slim-cropped'
  | 'cuffed-jeans'
  | 'bare-ankle';

export const legStylingOptions = [
  { 
    value: 'auto' as LegStyling, 
    label: 'Auto (AI chooses)', 
    prompt: null,
    narrative: null,
  },
  { 
    value: 'wide-leg-cropped' as LegStyling, 
    label: 'Wide-Leg Cropped', 
    prompt: 'wide-leg trousers cropped just above the ankle, showing bare ankle, matte neutral fabric (black, charcoal, or dark navy)',
    narrative: 'Wide-leg trousers cropped just above the ankle, showing bare ankle.\nMatte fabric, no logos, no graphics.',
  },
  { 
    value: 'straight-leg-cropped' as LegStyling, 
    label: 'Straight-Leg Cropped', 
    prompt: 'straight-leg trousers cropped above ankle, small amount of bare ankle visible, matte neutral fabric',
    narrative: 'Straight-leg trousers cropped above the ankle, bare ankle visible.\nMatte fabric, no logos, no graphics.',
  },
  { 
    value: 'slim-cropped' as LegStyling, 
    label: 'Slim Cropped', 
    prompt: 'slim-fit cropped trousers ending above ankle, bare ankle showing, neutral matte fabric',
    narrative: 'Slim-fit cropped trousers ending just above the ankle, bare ankle showing.\nMatte fabric, no logos, no graphics.',
  },
  { 
    value: 'cuffed-jeans' as LegStyling, 
    label: 'Cuffed Jeans', 
    prompt: 'jeans with rolled cuff above ankle, relaxed casual style, bare ankle visible',
    narrative: 'Relaxed jeans with rolled cuff above the ankle, bare ankle visible.\nClassic denim, no logos, no graphics.',
  },
  { 
    value: 'bare-ankle' as LegStyling, 
    label: 'Bare Ankle Only', 
    prompt: 'cropped pants of any style with visible bare ankle, clean and minimal',
    narrative: 'Cropped pants ending above the ankle with visible bare ankle.\nClean, minimal styling, no logos, no graphics.',
  },
];

// ===== TROUSER COLOR =====
export type TrouserColor = 'auto' | 'black' | 'charcoal' | 'navy' | 'white' | 'beige' | 'denim-blue' | 'denim-light';

export const trouserColorOptions = [
  { value: 'auto' as TrouserColor, label: 'Auto (AI chooses)', prompt: null, narrative: null },
  { value: 'black' as TrouserColor, label: 'Black', prompt: 'black trousers', narrative: 'in black' },
  { value: 'charcoal' as TrouserColor, label: 'Charcoal', prompt: 'charcoal grey trousers', narrative: 'in charcoal grey' },
  { value: 'navy' as TrouserColor, label: 'Navy', prompt: 'dark navy trousers', narrative: 'in dark navy' },
  { value: 'white' as TrouserColor, label: 'White', prompt: 'crisp white trousers', narrative: 'in crisp white' },
  { value: 'beige' as TrouserColor, label: 'Beige / Khaki', prompt: 'beige or khaki trousers', narrative: 'in beige' },
  { value: 'denim-blue' as TrouserColor, label: 'Denim Blue', prompt: 'classic blue denim jeans', narrative: 'in classic blue denim' },
  { value: 'denim-light' as TrouserColor, label: 'Light Denim', prompt: 'light wash denim jeans', narrative: 'in light wash denim' },
];

// ===== MODEL GENDER =====
export type ModelGender = 'auto' | 'female' | 'male' | 'nonbinary';

export const genderOptions = [
  { value: 'auto' as ModelGender, label: 'Auto (AI chooses)' },
  { value: 'female' as ModelGender, label: 'Female' },
  { value: 'male' as ModelGender, label: 'Male' },
  { value: 'nonbinary' as ModelGender, label: 'Non-binary' },
];

// ===== ETHNICITY HELPER =====
/**
 * Convert ethnicity value to natural language description for prompts.
 * Returns empty string for 'auto' to let AI decide naturally.
 */
function getEthnicityDescription(ethnicity: string): string {
  const map: Record<string, string> = {
    'auto': '',
    'caucasian': 'Caucasian',
    'african': 'African',
    'asian': 'Asian',
    'hispanic': 'Hispanic',
    'middle-eastern': 'Middle Eastern',
    'south-asian': 'South Asian',
    'mixed': 'mixed-race',
  };
  return map[ethnicity] || '';
}

// ===== ON-FOOT SHOT TYPE CONFIG =====
export interface OnFootShotConfig {
  // Model appearance
  gender: ModelGender;
  ethnicity: string;
  // Pose & styling
  poseVariation: PoseVariation;
  legStyling: LegStyling;
  trouserColor: TrouserColor;
}

export const initialOnFootConfig: OnFootShotConfig = {
  gender: 'auto',
  ethnicity: 'auto',
  poseVariation: 'auto',
  legStyling: 'auto',
  trouserColor: 'auto',
};

// ===== SHOT TYPE PROMPT BUILDERS =====

/**
 * Build the complete prompt for "On Foot - Shoe Focus" shot type.
 * Balances static (essential) and dynamic (configurable) elements.
 */
export function buildOnFootPrompt(config: OnFootShotConfig, bgContext?: BackgroundContext): string {
  // Pre-select random options when 'auto' is set
  const selectedPose = selectRandomFromOptions(poseVariationOptions, config.poseVariation);
  const selectedLegStyle = selectRandomFromOptions(legStylingOptions, config.legStyling);
  const selectedColor = selectRandomFromOptions(trouserColorOptions, config.trouserColor);
  
  // Determine gender string
  const genderStr = config.gender === 'auto' 
    ? ['female', 'male'][Math.floor(Math.random() * 2)]
    : config.gender;
  
  // Determine ethnicity string and build model description
  const ethnicityStr = config.ethnicity === 'auto'
    ? ''
    : getEthnicityDescription(config.ethnicity);
  const modelDesc = ethnicityStr ? `${ethnicityStr} ${genderStr}` : genderStr;
  
  // Determine background description
  let backgroundDesc = 'a pure white seamless studio background with a visible floor plane and soft, natural contact shadows';
  let lightingDesc = 'clean, diffused studio lighting that accurately represents suede texture and true color';
  
  if (bgContext?.backgroundId === 'studio-white') {
    backgroundDesc = 'a pure white seamless studio background with a visible floor plane and soft, natural contact shadows';
    lightingDesc = 'clean, diffused studio lighting that accurately represents suede texture and true color';
  } else if (bgContext?.customBackgroundPrompt) {
    backgroundDesc = bgContext.customBackgroundPrompt;
    lightingDesc = 'lighting appropriate to the setting, revealing material textures';
  } else if (bgContext?.backgroundId) {
    const allBackgrounds = [...studioBackgrounds, ...outdoorBackgrounds];
    const preset = allBackgrounds.find(bg => bg.id === bgContext.backgroundId);
    if (preset) {
      backgroundDesc = preset.prompt.toLowerCase();
      const isOutdoor = bgContext.backgroundId.startsWith('outdoor-');
      if (isOutdoor) {
        const weatherOpt = weatherConditionOptions.find(w => w.value === (bgContext.weatherCondition || 'sunny'));
        lightingDesc = weatherOpt?.lightingPrompt || 'natural outdoor lighting';
      } else {
        lightingDesc = 'professional studio lighting, softbox diffusion, controlled even illumination';
      }
    }
  }

  // Build the evocative prompt
  const prompt = `A single, high-resolution e-commerce image (one frame only, no collage).

A close-up on-model product shot of a ${modelDesc} model wearing the footwear, photographed against ${backgroundDesc}.

Framing is tight and product-focused, showing the feet, shoes, ankles, and lower legs, cropped roughly from mid-calf down. The shoes fill most of the frame, consistent with official Birkenstock e-commerce photography.

Camera angle is eye-level to slightly low, neutral and undistorted. No top-down angle, no wide-angle distortion.

FOOTWEAR — LOCKED (MUST NOT CHANGE)
The model is wearing a Birkenstock Boston clog with the following fixed construction:
– Closed-toe Boston silhouette with rounded toe box
– Soft suede upper with visible nap and matte texture
– Single adjustable instep strap with metal buckle
– Natural cork-latex contoured footbed in warm brown cork tone
– EVA outsole with accurate thickness and tread pattern

The shoe's geometry, construction, proportions, and hardware placement must remain identical in every generation. Do not redesign, stylize, or reinterpret the product.

MATERIAL BEHAVIOR — LOCKED
– Suede remains matte, soft, and fibrous (no gloss, no synthetic smoothness)
– Buckle remains metal, brushed or satin finish, not shiny
– Cork remains natural warm brown tone
– EVA outsole remains matte with subtle rubber texture

STYLING & POSE — COMMERCIAL
The model stands in ${selectedPose.narrative || 'a natural, relaxed stance:\n– Feet flat or one foot slightly forward\n– Casual, grounded posture\n– No exaggerated movement or editorial posing'}

${selectedLegStyle.narrative || 'Pants are ankle-length or cropped to clearly show the shoe.'} ${selectedColor.narrative || 'in a neutral matte color'}.

Lighting is ${lightingDesc}.
Shadows are soft and realistic, grounding the shoe to the floor.
Focus is sharp, color is neutral and accurate.

The final image must be indistinguishable from an official Birkenstock e-commerce product photograph.`;

  return prompt;
}

/**
 * Get the base prompt hint for shot type (without dynamic config)
 * Used for quick display/preview
 */
export function getShotTypePromptHint(shotType: ProductShotType): string {
  switch (shotType) {
    case 'on-foot':
      return 'leg-down product shot, mid-calf to floor framing, both feet grounded, three-quarter side view, premium footwear e-commerce photography';
    case 'product-focus':
      return 'product only, detailed close-up, no model, studio lighting, clean background';
    case 'lifestyle':
      return 'full body fashion shot, lifestyle, product visible, editorial style';
    default:
      return '';
  }
}

/**
 * Check if a shot type has additional configuration options
 */
export function shotTypeHasConfig(shotType: ProductShotType): boolean {
  return shotType === 'on-foot' || shotType === 'lifestyle' || shotType === 'product-focus';
}

// ===== PRODUCT FOCUS SHOT TYPE =====

// Camera Angle options (5 variations from product gallery)
export type ProductFocusAngle = 
  | 'auto'
  | 'side-profile'
  | 'three-quarter'
  | 'top-down'
  | 'detail-closeup'
  | 'sole-view';

export const productFocusAngleOptions = [
  { 
    value: 'auto' as ProductFocusAngle, 
    label: 'Auto (AI chooses)', 
    prompt: null 
  },
  { 
    value: 'side-profile' as ProductFocusAngle, 
    label: 'Side Profile', 
    prompt: 'pure side profile view, product centered, showing full silhouette from lateral angle' 
  },
  { 
    value: 'three-quarter' as ProductFocusAngle, 
    label: 'Three-Quarter', 
    prompt: 'three-quarter view at 45-degree angle, showing depth and dimension of the product' 
  },
  { 
    value: 'top-down' as ProductFocusAngle, 
    label: 'Top Down', 
    prompt: 'overhead top-down view, footbed and upper fully visible from above' 
  },
  { 
    value: 'detail-closeup' as ProductFocusAngle, 
    label: 'Detail Close-up', 
    prompt: 'extreme close-up on buckle, hardware, stitching, and material textures' 
  },
  { 
    value: 'sole-view' as ProductFocusAngle, 
    label: 'Sole View', 
    prompt: 'sole facing camera, showing tread pattern, construction, and outsole details' 
  },
];

// Lighting Type options
export type ProductFocusLighting = 'auto' | 'studio' | 'natural';

export const productFocusLightingOptions = [
  { 
    value: 'auto' as ProductFocusLighting, 
    label: 'Auto (match background)', 
    prompt: null 
  },
  { 
    value: 'studio' as ProductFocusLighting, 
    label: 'Studio Lighting', 
    prompt: 'professional studio lighting, softbox diffusion, controlled even illumination, minimal shadows' 
  },
  { 
    value: 'natural' as ProductFocusLighting, 
    label: 'Natural Light', 
    prompt: 'soft natural daylight, gentle ambient shadows, organic and warm feel' 
  },
];

// Product Focus Shot Configuration Interface
export interface ProductFocusShotConfig {
  cameraAngle: ProductFocusAngle;
  lighting: ProductFocusLighting;
}

export const initialProductFocusConfig: ProductFocusShotConfig = {
  cameraAngle: 'auto',
  lighting: 'auto',
};

/**
 * Build the complete prompt for "Product Focus" shot type.
 * Product-only photography without models.
 */
export function buildProductFocusPrompt(config: ProductFocusShotConfig, bgContext?: BackgroundContext): string {
  const sections: string[] = [];
  
  // === STATIC: Always included ===
  sections.push("=== PRODUCT FOCUS SHOT ===");
  sections.push("");
  
  // Frame & Composition (STATIC)
  sections.push("FRAMING & COMPOSITION (MANDATORY):");
  sections.push("- Single, high-resolution e-commerce product image (one frame only, no collage)");
  sections.push("- Product only - NO hands, NO models, NO body parts, NO feet");
  sections.push("- Product centered in frame with balanced negative space");
  sections.push("- Clean, professional product photography composition");
  sections.push("");
  
  // Product integrity is now handled by the prompt agent instructions
  
  // Background (DYNAMIC)
  if (bgContext) {
    sections.push(...buildBackgroundSection(bgContext));
    sections.push("");
  }
  
  // Camera Angle (DYNAMIC)
  sections.push("CAMERA ANGLE:");
  if (config.cameraAngle === 'auto') {
    sections.push("- AI selects optimal angle to showcase product");
    sections.push("- May use: side profile, three-quarter view, top-down, detail close-up, or sole view");
  } else {
    const angleOpt = productFocusAngleOptions.find(a => a.value === config.cameraAngle);
    if (angleOpt?.prompt) {
      sections.push(`- ${angleOpt.prompt}`);
    }
  }
  sections.push("");
  
  // Lighting (DYNAMIC based on background or explicit choice)
  if (config.lighting !== 'auto') {
    // Explicit lighting choice overrides background-based lighting
    sections.push("LIGHTING:");
    const lightOpt = productFocusLightingOptions.find(l => l.value === config.lighting);
    if (lightOpt?.prompt) {
      sections.push(`- ${lightOpt.prompt}`);
    }
  } else if (bgContext) {
    // Use background-based lighting
    sections.push(...buildLightingSection(bgContext));
  } else {
    // Default fallback
    sections.push("LIGHTING:");
    sections.push("- Professional studio lighting, softbox diffusion");
    sections.push("- Controlled even illumination with soft shadows");
  }
  sections.push("- Accurately reveal material textures and finishes");
  sections.push("- Soft shadows that ground the product");
  sections.push("- Neutral color balance, no color cast");
  sections.push("");
  
  // Quality Standards (STATIC)
  sections.push("QUALITY STANDARDS:");
  sections.push("- Premium footwear e-commerce photography");
  sections.push("- Ultra-sharp focus on product details");
  sections.push("- Clean, professional composition");
  sections.push("- True to retail product photography standards");
  sections.push("");
  
  return sections.join("\n");
}

// ===== LIFESTYLE SHOT TYPE (Full Body on Model) =====

// Lifestyle Pose Variations
export type LifestylePose = 
  | 'auto'
  | 'front-relaxed'
  | 'three-quarter'
  | 'side-profile'
  | 'walking-pause'
  | 'heel-lift'
  | 'weight-shift';

export const lifestylePoseOptions = [
  { value: 'auto' as LifestylePose, label: 'Auto (AI chooses)', prompt: null, narrative: null },
  { value: 'front-relaxed' as LifestylePose, label: 'Front-Facing Relaxed', prompt: 'relaxed front-facing stance, arms hanging naturally', narrative: 'a relaxed front-facing stance:\n– Arms hanging naturally at sides\n– Weight evenly distributed\n– Casual, confident posture' },
  { value: 'three-quarter' as LifestylePose, label: 'Three-Quarter Stance', prompt: 'three-quarter body angle, natural pose', narrative: 'a three-quarter body angle:\n– Natural, slightly turned posture\n– Arms relaxed at sides or one slightly bent\n– Open, approachable stance' },
  { value: 'side-profile' as LifestylePose, label: 'Side Profile', prompt: 'full side profile view, clean silhouette', narrative: 'a full side profile:\n– Clean silhouette visible from head to toe\n– Arms relaxed along body\n– Natural standing posture' },
  { value: 'walking-pause' as LifestylePose, label: 'Walking Pause', prompt: 'subtle walking pause with one foot forward', narrative: 'a subtle walking pause:\n– One foot naturally forward\n– Mid-stride frozen moment\n– Casual, unstaged movement feel' },
  { value: 'heel-lift' as LifestylePose, label: 'Gentle Heel Lift', prompt: 'gentle heel lift with toes grounded', narrative: 'a gentle heel lift:\n– One heel slightly raised\n– Toes remain grounded\n– Subtle, natural weight shift' },
  { value: 'weight-shift' as LifestylePose, label: 'Weight Shift', prompt: 'soft weight shift through hips and knees', narrative: 'a soft weight shift:\n– Weight distributed unevenly through hips\n– Relaxed knee bend on one side\n– Natural, comfortable stance' },
];

// Trouser Styles (Full Body)
export type LifestyleTrouserStyle = 
  | 'auto'
  | 'tailored'
  | 'slim'
  | 'straight'
  | 'chinos'
  | 'joggers';

export const lifestyleTrouserStyleOptions = [
  { value: 'auto' as LifestyleTrouserStyle, label: 'Auto (AI chooses)', prompt: null, narrative: null },
  { value: 'tailored' as LifestyleTrouserStyle, label: 'Tailored Trousers', prompt: 'tailored trousers with clean lines', narrative: 'tailored trousers with clean lines' },
  { value: 'slim' as LifestyleTrouserStyle, label: 'Slim Pants', prompt: 'slim-fit pants, modern and understated', narrative: 'slim-fit pants, modern and understated' },
  { value: 'straight' as LifestyleTrouserStyle, label: 'Straight-Leg Pants', prompt: 'straight-leg pants, classic silhouette', narrative: 'straight-leg pants with classic silhouette' },
  { value: 'chinos' as LifestyleTrouserStyle, label: 'Relaxed Chinos', prompt: 'relaxed chinos, casual and comfortable', narrative: 'relaxed chinos, casual and comfortable' },
  { value: 'joggers' as LifestyleTrouserStyle, label: 'Minimal Joggers', prompt: 'minimal joggers, clean athleisure look', narrative: 'minimal joggers with clean athleisure aesthetic' },
];

// Top Styles
export type LifestyleTopStyle = 
  | 'auto'
  | 'button-up'
  | 'knitwear'
  | 'jacket'
  | 'tee';

export const lifestyleTopStyleOptions = [
  { value: 'auto' as LifestyleTopStyle, label: 'Auto (AI chooses)', prompt: null, narrative: null },
  { value: 'button-up' as LifestyleTopStyle, label: 'Button-Up Shirt', prompt: 'simple button-up shirt, clean and minimal', narrative: 'a simple button-up shirt, clean and minimal' },
  { value: 'knitwear' as LifestyleTopStyle, label: 'Knitwear / Sweater', prompt: 'soft knitwear or sweater, understated texture', narrative: 'soft knitwear with understated texture' },
  { value: 'jacket' as LifestyleTopStyle, label: 'Lightweight Jacket', prompt: 'lightweight jacket, relaxed layering', narrative: 'a lightweight jacket with relaxed layering' },
  { value: 'tee' as LifestyleTopStyle, label: 'Simple Tee', prompt: 'simple crew-neck tee, minimal and clean', narrative: 'a simple crew-neck tee, minimal and clean' },
];

// Outfit Color Schemes
export type LifestyleOutfitColor = 
  | 'auto'
  | 'monochrome-black'
  | 'monochrome-white'
  | 'monochrome-grey'
  | 'contrast-neutral'
  | 'navy-cream'
  | 'charcoal-white';

export const lifestyleOutfitColorOptions = [
  { value: 'auto' as LifestyleOutfitColor, label: 'Auto (AI chooses)', prompt: null, narrative: null },
  { value: 'monochrome-black' as LifestyleOutfitColor, label: 'Monochrome Black', prompt: 'all-black outfit, matte fabrics', narrative: 'all-black outfit with matte fabrics' },
  { value: 'monochrome-white' as LifestyleOutfitColor, label: 'Monochrome White/Cream', prompt: 'all-white or cream outfit, clean and fresh', narrative: 'all-white or cream outfit, clean and fresh' },
  { value: 'monochrome-grey' as LifestyleOutfitColor, label: 'Monochrome Grey', prompt: 'tonal grey outfit from charcoal to light grey', narrative: 'tonal grey outfit from charcoal to light grey' },
  { value: 'contrast-neutral' as LifestyleOutfitColor, label: 'Contrast Neutrals', prompt: 'contrasting neutral tones (black/white, navy/cream)', narrative: 'contrasting neutral tones' },
  { value: 'navy-cream' as LifestyleOutfitColor, label: 'Navy + Cream', prompt: 'navy and cream color combination, classic palette', narrative: 'navy and cream color combination' },
  { value: 'charcoal-white' as LifestyleOutfitColor, label: 'Charcoal + White', prompt: 'charcoal and white color pairing, understated', narrative: 'charcoal and white color pairing' },
];

// Lifestyle Shot Configuration Interface
export interface LifestyleShotConfig {
  // Model appearance
  gender: ModelGender;
  ethnicity: string;
  // Pose
  pose: LifestylePose;
  // Clothing
  trouserStyle: LifestyleTrouserStyle;
  topStyle: LifestyleTopStyle;
  outfitColor: LifestyleOutfitColor;
}

export const initialLifestyleConfig: LifestyleShotConfig = {
  gender: 'auto',
  ethnicity: 'auto',
  pose: 'auto',
  trouserStyle: 'auto',
  topStyle: 'auto',
  outfitColor: 'auto',
};

// ===== CUSTOMIZATION DETECTION HELPERS =====

/**
 * Check if OnFoot config has any non-auto values (is customized)
 */
export function isOnFootConfigCustomized(config: OnFootShotConfig): boolean {
  return (
    config.gender !== 'auto' ||
    config.ethnicity !== 'auto' ||
    config.poseVariation !== 'auto' ||
    config.legStyling !== 'auto' ||
    config.trouserColor !== 'auto'
  );
}

/**
 * Check if Lifestyle config has any non-auto values (is customized)
 */
export function isLifestyleConfigCustomized(config: LifestyleShotConfig): boolean {
  return (
    config.gender !== 'auto' ||
    config.ethnicity !== 'auto' ||
    config.pose !== 'auto' ||
    config.trouserStyle !== 'auto' ||
    config.topStyle !== 'auto' ||
    config.outfitColor !== 'auto'
  );
}

/**
 * Check if ProductFocus config has any non-auto values (is customized)
 */
export function isProductFocusConfigCustomized(config: ProductFocusShotConfig): boolean {
  return (
    config.cameraAngle !== 'auto' ||
    config.lighting !== 'auto'
  );
}

/**
 * Build the complete prompt for "Full Body on Model" shot type.
 * Uses evocative, narrative-style language matching professional e-commerce briefs.
 * Pre-selects random options when 'auto' is set for specificity.
 */
export function buildLifestylePrompt(config: LifestyleShotConfig, bgContext?: BackgroundContext): string {
  // Pre-select random options when 'auto' is set
  const selectedPose = selectRandomFromOptions(lifestylePoseOptions, config.pose);
  const selectedTrouserStyle = selectRandomFromOptions(lifestyleTrouserStyleOptions, config.trouserStyle);
  const selectedTopStyle = selectRandomFromOptions(lifestyleTopStyleOptions, config.topStyle);
  const selectedOutfitColor = selectRandomFromOptions(lifestyleOutfitColorOptions, config.outfitColor);
  
  // Determine gender string
  const genderStr = config.gender === 'auto' 
    ? ['female', 'male'][Math.floor(Math.random() * 2)]
    : config.gender;
  
  // Determine ethnicity string and build model description
  const ethnicityStr = config.ethnicity === 'auto'
    ? ''
    : getEthnicityDescription(config.ethnicity);
  const modelDesc = ethnicityStr ? `${ethnicityStr} ${genderStr}` : genderStr;
  
  // Determine background description
  let backgroundDesc = 'a pure white seamless studio background with visible floor and wall plane';
  let lightingDesc = 'clean, diffused studio lighting with soft, realistic shadows grounding the model';
  
  if (bgContext?.backgroundId === 'studio-white') {
    backgroundDesc = 'a pure white seamless studio background with visible floor and wall plane';
    lightingDesc = 'clean, diffused studio lighting with soft, realistic shadows grounding the model';
  } else if (bgContext?.customBackgroundPrompt) {
    backgroundDesc = bgContext.customBackgroundPrompt;
    lightingDesc = 'lighting appropriate to the setting, revealing material textures';
  } else if (bgContext?.backgroundId) {
    const allBackgrounds = [...studioBackgrounds, ...outdoorBackgrounds];
    const preset = allBackgrounds.find(bg => bg.id === bgContext.backgroundId);
    if (preset) {
      backgroundDesc = preset.prompt.toLowerCase();
      const isOutdoor = bgContext.backgroundId.startsWith('outdoor-');
      if (isOutdoor) {
        const weatherOpt = weatherConditionOptions.find(w => w.value === (bgContext.weatherCondition || 'sunny'));
        lightingDesc = weatherOpt?.lightingPrompt || 'natural outdoor lighting';
      } else {
        lightingDesc = 'professional studio lighting, softbox diffusion, controlled even illumination';
      }
    }
  }

  // Build clothing description
  const trouserDesc = selectedTrouserStyle.narrative || 'tailored trousers or straight-leg pants';
  const topDesc = selectedTopStyle.narrative || 'a simple button-up shirt or knitwear';
  const colorDesc = selectedOutfitColor.narrative || 'in neutral tones (black, white, charcoal, navy, cream)';

  // Build the evocative prompt
  const prompt = `A single, high-resolution e-commerce image (one frame only, no collage).

A full-body product-on-model shot, framed from upper chest or shoulders down to the feet, with the head cropped out of frame.

The ${modelDesc} model is photographed at a pulled-back distance, allowing full body proportions and clear negative space around the figure, on ${backgroundDesc}.

Camera angle is eye-level and neutral, with no wide-angle distortion, matching classic Birkenstock lookbook and e-commerce photography.

FOOTWEAR — LOCKED (MUST NOT CHANGE)
The model is wearing a Birkenstock Boston clog with the following fixed construction and materials:
– Closed-toe Boston silhouette
– Soft suede upper with visible nap and matte texture
– Single adjustable instep strap
– One metal buckle
– Natural cork-latex contoured footbed in warm brown cork tone
– EVA outsole with accurate thickness and tread

The shoe's geometry, construction, stitching, and material behavior must remain identical in every generation. Do not redesign, stylize, or reinterpret the product.

MATERIAL BEHAVIOR — LOCKED
– Suede remains matte, fibrous, and soft (no gloss, no leather sheen)
– Buckle remains metal, not plastic
– Cork footbed remains natural brown and unchanged

CLOTHING — VARIABLE (CONTROLLED)
The model wears minimal, classic, timeless clothing:
– ${trouserDesc}
– ${topDesc}
– Colors: ${colorDesc}

Fabrics are matte and clean.
No logos, no graphics, no bold textures, no trends.

POSE — VARIABLE (LOOKBOOK-REALISTIC)
The model stands in ${selectedPose.narrative || 'a natural, commercially realistic pose:\n– Relaxed, confident posture\n– Arms hanging naturally or slightly bent\n– Casual, human, and unstyled feel'}

Pose must feel casual, human, and unstyled—never editorial or exaggerated.

Lighting is ${lightingDesc}.
Focus is sharp, color is neutral and accurate, materials are clearly visible.

The final image must look indistinguishable from an official Birkenstock e-commerce or lookbook photograph.`;

  return prompt;
}

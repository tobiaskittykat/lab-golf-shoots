// ============= SHOT TYPE CONFIGURATIONS =============
// Each shot type has static (always used) and dynamic (configurable) elements

// Note: ProductShotType is used by other files, avoid circular imports
export type ProductShotType = 'product-focus' | 'on-foot' | 'lifestyle';

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
    prompt: null // AI will select from the list below
  },
  { 
    value: 'feet-parallel' as PoseVariation, 
    label: 'Feet Parallel', 
    prompt: 'feet parallel with slight weight shift to one side' 
  },
  { 
    value: 'one-forward' as PoseVariation, 
    label: 'One Foot Forward', 
    prompt: 'one foot subtly placed forward of the other' 
  },
  { 
    value: 'heel-relaxed' as PoseVariation, 
    label: 'Heel Relaxed', 
    prompt: 'heel of one foot relaxed outward at a natural angle' 
  },
  { 
    value: 'toe-out' as PoseVariation, 
    label: 'Gentle Toe-Out', 
    prompt: 'gentle toe-out on one foot only, subtle and natural' 
  },
  { 
    value: 'soft-asymmetry' as PoseVariation, 
    label: 'Soft Asymmetry', 
    prompt: 'soft asymmetry in stance, natural and never exaggerated' 
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
    prompt: null 
  },
  { 
    value: 'wide-leg-cropped' as LegStyling, 
    label: 'Wide-Leg Cropped', 
    prompt: 'wide-leg trousers cropped just above the ankle, showing bare ankle, matte neutral fabric (black, charcoal, or dark navy)' 
  },
  { 
    value: 'straight-leg-cropped' as LegStyling, 
    label: 'Straight-Leg Cropped', 
    prompt: 'straight-leg trousers cropped above ankle, small amount of bare ankle visible, matte neutral fabric' 
  },
  { 
    value: 'slim-cropped' as LegStyling, 
    label: 'Slim Cropped', 
    prompt: 'slim-fit cropped trousers ending above ankle, bare ankle showing, neutral matte fabric' 
  },
  { 
    value: 'cuffed-jeans' as LegStyling, 
    label: 'Cuffed Jeans', 
    prompt: 'jeans with rolled cuff above ankle, relaxed casual style, bare ankle visible' 
  },
  { 
    value: 'bare-ankle' as LegStyling, 
    label: 'Bare Ankle Only', 
    prompt: 'cropped pants of any style with visible bare ankle, clean and minimal' 
  },
];

// ===== TROUSER COLOR =====
export type TrouserColor = 'auto' | 'black' | 'charcoal' | 'navy' | 'white' | 'beige' | 'denim-blue' | 'denim-light';

export const trouserColorOptions = [
  { value: 'auto' as TrouserColor, label: 'Auto (AI chooses)', prompt: null },
  { value: 'black' as TrouserColor, label: 'Black', prompt: 'black trousers' },
  { value: 'charcoal' as TrouserColor, label: 'Charcoal', prompt: 'charcoal grey trousers' },
  { value: 'navy' as TrouserColor, label: 'Navy', prompt: 'dark navy trousers' },
  { value: 'white' as TrouserColor, label: 'White', prompt: 'crisp white trousers' },
  { value: 'beige' as TrouserColor, label: 'Beige / Khaki', prompt: 'beige or khaki trousers' },
  { value: 'denim-blue' as TrouserColor, label: 'Denim Blue', prompt: 'classic blue denim jeans' },
  { value: 'denim-light' as TrouserColor, label: 'Light Denim', prompt: 'light wash denim jeans' },
];

// ===== MODEL GENDER =====
export type ModelGender = 'auto' | 'female' | 'male' | 'nonbinary';

export const genderOptions = [
  { value: 'auto' as ModelGender, label: 'Auto (AI chooses)' },
  { value: 'female' as ModelGender, label: 'Female' },
  { value: 'male' as ModelGender, label: 'Male' },
  { value: 'nonbinary' as ModelGender, label: 'Non-binary' },
];

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
export function buildOnFootPrompt(config: OnFootShotConfig): string {
  const sections: string[] = [];
  
  // === STATIC: Always included ===
  sections.push("=== ON-FOOT SHOE FOCUS SHOT ===");
  sections.push("");
  
  // Frame & Composition (STATIC)
  sections.push("FRAMING & COMPOSITION (MANDATORY):");
  sections.push("- Single, high-resolution e-commerce image (one frame only, no collage)");
  sections.push("- Leg-down product shot framed from mid-calf to floor");
  sections.push("- Both feet fully visible and grounded on the surface");
  sections.push("- Camera angle: eye-level to slightly low, three-quarter side view (not top-down)");
  sections.push("- Similar to standard Birkenstock/premium footwear product-on-model photography");
  sections.push("");
  
  // Product Integrity (STATIC - CRITICAL)
  sections.push("PRODUCT INTEGRITY (CRITICAL):");
  sections.push("- The model wears Birkenstock footwear - match the reference EXACTLY");
  sections.push("- Preserve exact Birkenstock silhouette, buckle placement, sole thickness, hardware finish");
  sections.push("- Maintain signature Birkenstock details: cork-latex footbed, contoured sole, adjustable strap");
  sections.push("- No reinterpretation, no added elements, no modifications");
  sections.push("- Capture visible texture: suede nap, leather grain, cork texture, sole grooves");
  sections.push("");
  
  // Pose (DYNAMIC with auto fallback)
  sections.push("POSE DIRECTION:");
  if (config.poseVariation === 'auto') {
    sections.push("- Natural, grounded stance with subtle variation");
    sections.push("- AI may select: feet parallel, one foot forward, heel relaxed, gentle toe-out, or soft asymmetry");
  } else {
    const poseOpt = poseVariationOptions.find(p => p.value === config.poseVariation);
    if (poseOpt?.prompt) {
      sections.push(`- ${poseOpt.prompt}`);
    }
  }
  sections.push("- Both feet remain fully on the ground at all times");
  sections.push("- NO walking, NO stepping mid-air, NO crossed legs, NO fashion posing");
  sections.push("");
  
  // Leg Styling (DYNAMIC with auto fallback)
  sections.push("LEG STYLING:");
  if (config.legStyling === 'auto') {
    sections.push("- Cropped trousers or pants ending just above ankle");
    sections.push("- Small amount of bare ankle visible");
    sections.push("- Clean, minimal styling that doesn't distract from the product");
  } else {
    const legOpt = legStylingOptions.find(l => l.value === config.legStyling);
    if (legOpt?.prompt) {
      sections.push(`- ${legOpt.prompt}`);
    }
  }
  
  // Trouser Color (DYNAMIC)
  if (config.trouserColor !== 'auto') {
    const colorOpt = trouserColorOptions.find(c => c.value === config.trouserColor);
    if (colorOpt?.prompt) {
      sections.push(`- ${colorOpt.prompt}`);
    }
  } else {
    sections.push("- Neutral, matte fabric that complements the product");
  }
  sections.push("");
  
  // === MODEL DIRECTION (DYNAMIC) ===
  const modelParts: string[] = [];
  if (config.gender && config.gender !== 'auto') {
    modelParts.push(`${config.gender} model`);
  }
  if (config.ethnicity && config.ethnicity !== 'auto') {
    modelParts.push(config.ethnicity);
  }
  if (modelParts.length > 0) {
    sections.push("MODEL:");
    sections.push(`- ${modelParts.join(', ')}`);
    sections.push("");
  }
  
  // Lighting & Technical (STATIC)
  sections.push("LIGHTING & TECHNICAL (MANDATORY):");
  sections.push("- Clean, diffused studio light");
  sections.push("- Soft contact shadows under the soles");
  sections.push("- Accurately reveal material textures: suede, cork grain, buckle finish, outsole depth");
  sections.push("- Ultra-sharp focus on the footwear");
  sections.push("- Neutral color balance, no color cast");
  sections.push("- No wide-angle distortion, no dramatic perspective");
  sections.push("");
  
  // Composition Standards (STATIC)
  sections.push("QUALITY STANDARDS:");
  sections.push("- Calm, balanced composition");
  sections.push("- True to premium footwear e-commerce standards");
  sections.push("- Professional retail-ready output");
  sections.push("");
  
  return sections.join("\n");
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
export function buildProductFocusPrompt(config: ProductFocusShotConfig): string {
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
  
  // Product Integrity (STATIC - CRITICAL)
  sections.push("PRODUCT INTEGRITY (CRITICAL):");
  sections.push("- This is Birkenstock footwear - match the reference EXACTLY");
  sections.push("- Preserve exact Birkenstock silhouette, buckle placement, sole thickness, hardware finish");
  sections.push("- Maintain signature Birkenstock details: cork-latex footbed, contoured sole, adjustable strap");
  sections.push("- Capture visible texture: suede nap, leather grain, cork texture, sole grooves");
  sections.push("- NO reinterpretation, NO modifications, NO creative liberties with the product");
  sections.push("");
  
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
  
  // Lighting (DYNAMIC)
  sections.push("LIGHTING:");
  if (config.lighting === 'auto') {
    sections.push("- Lighting matched to background setting");
    sections.push("- Studio backgrounds: controlled softbox lighting with minimal shadows");
    sections.push("- Outdoor settings: soft natural daylight with gentle ambient shadows");
  } else {
    const lightOpt = productFocusLightingOptions.find(l => l.value === config.lighting);
    if (lightOpt?.prompt) {
      sections.push(`- ${lightOpt.prompt}`);
    }
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
  { value: 'auto' as LifestylePose, label: 'Auto (AI chooses)', prompt: null },
  { value: 'front-relaxed' as LifestylePose, label: 'Front-Facing Relaxed', prompt: 'relaxed front-facing stance, arms hanging naturally' },
  { value: 'three-quarter' as LifestylePose, label: 'Three-Quarter Stance', prompt: 'three-quarter body angle, natural pose' },
  { value: 'side-profile' as LifestylePose, label: 'Side Profile', prompt: 'full side profile view, clean silhouette' },
  { value: 'walking-pause' as LifestylePose, label: 'Walking Pause', prompt: 'subtle walking pause with one foot forward' },
  { value: 'heel-lift' as LifestylePose, label: 'Gentle Heel Lift', prompt: 'gentle heel lift with toes grounded' },
  { value: 'weight-shift' as LifestylePose, label: 'Weight Shift', prompt: 'soft weight shift through hips and knees' },
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
  { value: 'auto' as LifestyleTrouserStyle, label: 'Auto (AI chooses)', prompt: null },
  { value: 'tailored' as LifestyleTrouserStyle, label: 'Tailored Trousers', prompt: 'tailored trousers with clean lines' },
  { value: 'slim' as LifestyleTrouserStyle, label: 'Slim Pants', prompt: 'slim-fit pants, modern and understated' },
  { value: 'straight' as LifestyleTrouserStyle, label: 'Straight-Leg Pants', prompt: 'straight-leg pants, classic silhouette' },
  { value: 'chinos' as LifestyleTrouserStyle, label: 'Relaxed Chinos', prompt: 'relaxed chinos, casual and comfortable' },
  { value: 'joggers' as LifestyleTrouserStyle, label: 'Minimal Joggers', prompt: 'minimal joggers, clean athleisure look' },
];

// Top Styles
export type LifestyleTopStyle = 
  | 'auto'
  | 'button-up'
  | 'knitwear'
  | 'jacket'
  | 'tee';

export const lifestyleTopStyleOptions = [
  { value: 'auto' as LifestyleTopStyle, label: 'Auto (AI chooses)', prompt: null },
  { value: 'button-up' as LifestyleTopStyle, label: 'Button-Up Shirt', prompt: 'simple button-up shirt, clean and minimal' },
  { value: 'knitwear' as LifestyleTopStyle, label: 'Knitwear / Sweater', prompt: 'soft knitwear or sweater, understated texture' },
  { value: 'jacket' as LifestyleTopStyle, label: 'Lightweight Jacket', prompt: 'lightweight jacket, relaxed layering' },
  { value: 'tee' as LifestyleTopStyle, label: 'Simple Tee', prompt: 'simple crew-neck tee, minimal and clean' },
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
  { value: 'auto' as LifestyleOutfitColor, label: 'Auto (AI chooses)', prompt: null },
  { value: 'monochrome-black' as LifestyleOutfitColor, label: 'Monochrome Black', prompt: 'all-black outfit, matte fabrics' },
  { value: 'monochrome-white' as LifestyleOutfitColor, label: 'Monochrome White/Cream', prompt: 'all-white or cream outfit, clean and fresh' },
  { value: 'monochrome-grey' as LifestyleOutfitColor, label: 'Monochrome Grey', prompt: 'tonal grey outfit from charcoal to light grey' },
  { value: 'contrast-neutral' as LifestyleOutfitColor, label: 'Contrast Neutrals', prompt: 'contrasting neutral tones (black/white, navy/cream)' },
  { value: 'navy-cream' as LifestyleOutfitColor, label: 'Navy + Cream', prompt: 'navy and cream color combination, classic palette' },
  { value: 'charcoal-white' as LifestyleOutfitColor, label: 'Charcoal + White', prompt: 'charcoal and white color pairing, understated' },
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

/**
 * Build the complete prompt for "Full Body on Model" shot type.
 * Balances static (essential) and dynamic (configurable) elements.
 */
export function buildLifestylePrompt(config: LifestyleShotConfig): string {
  const sections: string[] = [];
  
  // === STATIC: Always included ===
  sections.push("=== FULL BODY ON MODEL SHOT ===");
  sections.push("");
  
  // Frame & Composition (STATIC)
  sections.push("FRAMING & COMPOSITION (MANDATORY):");
  sections.push("- Single, high-resolution e-commerce image (one frame only, no collage)");
  sections.push("- Full-body product-on-model shot, framed from upper chest/shoulders to feet");
  sections.push("- Head intentionally cropped out of frame");
  sections.push("- Pulled-back distance showing full body proportions and negative space");
  sections.push("- Similar to classic Birkenstock lookbook imagery");
  sections.push("");
  
  // Background (STATIC)
  sections.push("BACKGROUND (MANDATORY):");
  sections.push("- Pure white seamless studio background");
  sections.push("- Visible floor and wall plane");
  sections.push("- Soft cast shadows grounding the model");
  sections.push("- Camera angle: eye-level, neutral, no compression or wide-angle distortion");
  sections.push("");
  
  // Product Integrity (STATIC - CRITICAL)
  sections.push("PRODUCT INTEGRITY (CRITICAL - LOCKED):");
  sections.push("- The model wears Birkenstock footwear - match the reference EXACTLY");
  sections.push("- Preserve exact Birkenstock silhouette, buckle placement, sole thickness, hardware finish");
  sections.push("- Maintain signature Birkenstock details: natural cork-latex footbed, contoured sole, EVA outsole");
  sections.push("- No shearling, no lining, no extra padding, no reinterpretation");
  sections.push("- The Birkenstock shoe must remain IDENTICAL across all generated images");
  sections.push("");
  
  // === MODEL DIRECTION (DYNAMIC) ===
  const modelParts: string[] = [];
  if (config.gender && config.gender !== 'auto') {
    modelParts.push(`${config.gender} model`);
  }
  if (config.ethnicity && config.ethnicity !== 'auto') {
    modelParts.push(config.ethnicity);
  }
  if (modelParts.length > 0) {
    sections.push("MODEL:");
    sections.push(`- ${modelParts.join(', ')}`);
    sections.push("");
  }
  
  // Pose (DYNAMIC with auto fallback)
  sections.push("POSE DIRECTION:");
  if (config.pose === 'auto') {
    sections.push("- Natural, commercially realistic pose");
    sections.push("- AI may select: front-facing relaxed, three-quarter stance, side profile, walking pause, heel lift, or weight shift");
  } else {
    const poseOpt = lifestylePoseOptions.find(p => p.value === config.pose);
    if (poseOpt?.prompt) {
      sections.push(`- ${poseOpt.prompt}`);
    }
  }
  sections.push("- Arms may hang naturally or be slightly bent");
  sections.push("- Pose must feel casual, human, and unstyled—never exaggerated or editorial");
  sections.push("");
  
  // Clothing (DYNAMIC with auto fallback)
  sections.push("CLOTHING (VARIABLE - CONTROLLED):");
  sections.push("- Minimal, classic, timeless clothing");
  
  // Trouser style
  if (config.trouserStyle !== 'auto') {
    const trouserOpt = lifestyleTrouserStyleOptions.find(t => t.value === config.trouserStyle);
    if (trouserOpt?.prompt) {
      sections.push(`- ${trouserOpt.prompt}`);
    }
  } else {
    sections.push("- Trousers: tailored, slim, straight-leg, chinos, or minimal joggers");
  }
  
  // Top style
  if (config.topStyle !== 'auto') {
    const topOpt = lifestyleTopStyleOptions.find(t => t.value === config.topStyle);
    if (topOpt?.prompt) {
      sections.push(`- ${topOpt.prompt}`);
    }
  } else {
    sections.push("- Top: button-up shirt, knitwear, lightweight jacket, or simple tee");
  }
  
  // Outfit color
  if (config.outfitColor !== 'auto') {
    const colorOpt = lifestyleOutfitColorOptions.find(c => c.value === config.outfitColor);
    if (colorOpt?.prompt) {
      sections.push(`- ${colorOpt.prompt}`);
    }
  } else {
    sections.push("- Colors: black, white, off-white, cream, charcoal, grey, navy, or muted beige only");
  }
  
  sections.push("- Fabrics are matte and clean");
  sections.push("- NO logos, NO graphics, NO bold textures, NO trends");
  sections.push("");
  
  // Lighting & Technical (STATIC)
  sections.push("LIGHTING & TECHNICAL (MANDATORY):");
  sections.push("- Clean, diffused studio lighting");
  sections.push("- Soft shadows that ground the model");
  sections.push("- Materials clearly visible: suede texture, cork grain, buckle finish");
  sections.push("- Sharp focus, neutral and accurate color");
  sections.push("");
  
  // Quality Standards (STATIC)
  sections.push("QUALITY STANDARDS:");
  sections.push("- Timeless, calm, brand-safe composition");
  sections.push("- Suitable for lookbook and product listing use");
  sections.push("- True to premium footwear e-commerce standards");
  sections.push("");
  
  return sections.join("\n");
}

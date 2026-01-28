// ============= SHOT TYPE CONFIGURATIONS =============
// Each shot type has static (always used) and dynamic (configurable) elements

import { ProductShotType } from './types';

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
  sections.push("- The footwear must match the reference EXACTLY in shape, materials, proportions");
  sections.push("- Preserve exact buckle placement, sole thickness, hardware finish");
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
  return shotType === 'on-foot';
}

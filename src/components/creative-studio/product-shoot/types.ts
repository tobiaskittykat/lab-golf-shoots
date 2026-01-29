// ============= PRODUCT SHOOT TYPES =============

// Shoot mode - new shoot vs remix existing
export type ShootMode = 'new' | 'remix';

// Recolor options
export type RecolorOption = 'none' | 'pre-generation' | 'during-generation';

// Setting type for backgrounds
export type SettingType = 'studio' | 'outdoor' | 'auto';

// Weather condition for outdoor backgrounds
export type WeatherCondition = 'auto' | 'sunny' | 'overcast' | 'golden-hour' | 'cloudy' | 'dappled';

// Model configuration options
// ModelGender is now defined in shotTypeConfigs.ts
export type ModelClothing = 'casual' | 'smart-casual' | 'formal' | 'athletic' | 'bohemian' | 'auto';

// Re-export ProductShotType from shotTypeConfigs to avoid circular imports
export type { ProductShotType } from './shotTypeConfigs';

// Remix change options
export interface RemixChanges {
  changeModel?: boolean;
  changeBackground?: boolean;
  changeColor?: boolean;
  changeAngle?: boolean;
}

// Model configuration - uses types from shotTypeConfigs
import type { ModelGender, ProductShotType } from './shotTypeConfigs';

export interface ModelConfig {
  gender: ModelGender;
  ethnicity: string;
  clothing: ModelClothing;
  useOnBrandDefaults: boolean;
}

// Re-export shot type configs including ModelGender and BackgroundContext
export { 
  type OnFootShotConfig,
  type PoseVariation,
  type LegStyling,
  type TrouserColor,
  type ModelGender,
  type LifestyleShotConfig,
  type LifestylePose,
  type LifestyleTrouserStyle,
  type LifestyleTopStyle,
  type LifestyleOutfitColor,
  type ProductFocusShotConfig,
  type ProductFocusAngle,
  type ProductFocusLighting,
  type BackgroundContext,
  initialOnFootConfig,
  initialLifestyleConfig,
  initialProductFocusConfig,
  buildOnFootPrompt,
  buildLifestylePrompt,
  buildProductFocusPrompt,
  buildBackgroundSection,
  buildLightingSection,
  shotTypeHasConfig,
  genderOptions,
} from './shotTypeConfigs';

// Product SKU for multi-angle grouping
export interface ProductSKUData {
  id: string;
  name: string;
  skuCode: string | null;
  compositeImageUrl: string | null;
  brandId: string | null;
  angles: Array<{
    id: string;
    thumbnailUrl: string;
    angle: string | null;
  }>;
}

// Import config types for the state
import type { OnFootShotConfig, LifestyleShotConfig, ProductFocusShotConfig } from './shotTypeConfigs';

// Product Shoot State - extends creative studio state
export interface ProductShootState {
  // Mode
  shootMode: ShootMode;
  
  // Remix mode
  remixSourceImage?: string;
  remixChanges: RemixChanges;
  
  // Product with recolor (now supports SKU)
  selectedProductId?: string;
  selectedSkuId?: string;
  productRecolorOption: RecolorOption;
  productTargetColor?: string;
  recoloredProductUrl?: string;
  isRecoloring?: boolean;
  
  // Background
  settingType: SettingType;
  backgroundId?: string;
  customBackgroundPrompt?: string;
  weatherCondition?: WeatherCondition;
  
  // Model
  modelConfig: ModelConfig;
  
  // Shot type (product-specific)
  productShotType: ProductShotType;
  
  // Shot-type-specific configs
  onFootConfig?: OnFootShotConfig;
  lifestyleConfig?: LifestyleShotConfig;
  productFocusConfig?: ProductFocusShotConfig;
  
  // Post-generation integrity check
  integrityResults?: Record<string, ProductIntegrityResult>;
}

// Background preset for selection
export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'studio' | 'outdoor';
  thumbnail: string;
  prompt: string;
  colorHint?: string; // For generating placeholder thumbnails
}

// Product integrity analysis result
export interface ProductIntegrityResult {
  score: number;           // 0-100
  issues: string[];        // List of detected issues
  passesCheck: boolean;    // score >= 70
  analyzed: boolean;       // Has been analyzed
}

// Initial product shoot state
export const initialProductShootState: ProductShootState = {
  shootMode: 'new',
  remixChanges: {},
  productRecolorOption: 'none',
  settingType: 'studio', // Default to studio with white cyclorama
  backgroundId: 'studio-white', // White cyclorama as default
  weatherCondition: 'auto',
  modelConfig: {
    gender: 'auto',
    ethnicity: 'auto',
    clothing: 'auto',
    useOnBrandDefaults: true,
  },
  productShotType: 'lifestyle',
  // On-foot specific config
  onFootConfig: {
    gender: 'auto',
    ethnicity: 'auto',
    poseVariation: 'auto',
    legStyling: 'auto',
    trouserColor: 'auto',
  },
  // Lifestyle (full body) specific config
  lifestyleConfig: {
    gender: 'auto',
    ethnicity: 'auto',
    pose: 'auto',
    trouserStyle: 'auto',
    topStyle: 'auto',
    outfitColor: 'auto',
  },
  // Product focus specific config
  productFocusConfig: {
    cameraAngle: 'auto',
    lighting: 'auto',
  },
};

// LEGACY: Old shot types with emojis (kept for reference)
export const legacyProductShotTypes = [
  { 
    id: 'flat-lay' as const, 
    name: 'Flat Lay', 
    icon: '📐',
    description: 'Product on surface, overhead angle',
    promptHint: 'flat lay photography, overhead shot, product on surface'
  },
  { 
    id: 'on-foot' as const, 
    name: 'On Foot', 
    icon: '👟',
    description: 'Model wearing the shoes',
    promptHint: 'shoes on model feet, wearing product'
  },
  { 
    id: 'in-hand' as const, 
    name: 'In Hand', 
    icon: '🤲',
    description: 'Model holding the shoes',
    promptHint: 'hands holding product, close-up detail'
  },
  { 
    id: 'lifestyle' as const, 
    name: 'Lifestyle', 
    icon: '🚶',
    description: 'Full body with shoes as hero',
    promptHint: 'lifestyle photography, full body shot, product as focal point'
  },
  { 
    id: 'product-focus' as const, 
    name: 'Product Focus', 
    icon: '🎯',
    description: 'Close-up, no model',
    promptHint: 'product only, detailed close-up, no model'
  },
  { 
    id: 'paired-outfit' as const, 
    name: 'Paired with Outfit', 
    icon: '👔',
    description: 'Full look styling',
    promptHint: 'styled outfit, fashion editorial, complete look'
  },
];

// New simplified shot types for visual selector
// These match the ShotTypeVisualSelector component
export const productShotTypes = [
  { 
    id: 'product-focus' as ProductShotType, 
    name: 'Product Focus', 
    description: 'Close-up, no model',
    promptHint: 'product only, detailed close-up, no model, studio lighting'
  },
  { 
    id: 'on-foot' as ProductShotType, 
    name: 'On Foot - Shoe Focus', 
    description: 'Model wearing shoes, camera on product',
    promptHint: 'shoes on model feet, product as focal point, cropped view, lifestyle'
  },
  { 
    id: 'lifestyle' as ProductShotType, 
    name: 'Full Body on Model', 
    description: 'Full outfit with product',
    promptHint: 'full body fashion shot, lifestyle, product visible, editorial style'
  },
];

// Ethnicity options for model configuration
export const ethnicityOptions = [
  { value: 'auto', label: 'Auto / Brand Default' },
  { value: 'caucasian', label: 'Caucasian' },
  { value: 'african', label: 'African / Black' },
  { value: 'asian', label: 'Asian' },
  { value: 'hispanic', label: 'Hispanic / Latino' },
  { value: 'middle-eastern', label: 'Middle Eastern' },
  { value: 'south-asian', label: 'South Asian' },
  { value: 'mixed', label: 'Mixed / Multiracial' },
];

// Common color presets for recoloring
export const colorPresets = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Navy', value: '#1E3A5F' },
  { name: 'Tan', value: '#D2B48C' },
  { name: 'Brown', value: '#8B4513' },
  { name: 'Burgundy', value: '#722F37' },
  { name: 'Olive', value: '#556B2F' },
  { name: 'Grey', value: '#808080' },
  { name: 'Cobalt Blue', value: '#0047AB' },
  { name: 'Forest Green', value: '#228B22' },
  { name: 'Coral', value: '#FF7F50' },
  { name: 'Dusty Rose', value: '#DCAE96' },
];

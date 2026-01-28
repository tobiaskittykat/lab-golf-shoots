// ============= PRODUCT SHOOT TYPES =============

// Shoot mode - new shoot vs remix existing
export type ShootMode = 'new' | 'remix';

// Recolor options
export type RecolorOption = 'none' | 'pre-generation' | 'during-generation';

// Setting type for backgrounds
export type SettingType = 'studio' | 'outdoor' | 'auto';

// Model configuration options
export type ModelGender = 'female' | 'male' | 'nonbinary' | 'auto';
export type ModelClothing = 'casual' | 'smart-casual' | 'formal' | 'athletic' | 'bohemian' | 'auto';

// Product-specific shot types
export type ProductShotType = 
  | 'flat-lay' 
  | 'on-foot' 
  | 'in-hand' 
  | 'lifestyle' 
  | 'product-focus' 
  | 'paired-outfit';

// Remix change options
export interface RemixChanges {
  changeModel?: boolean;
  changeBackground?: boolean;
  changeColor?: boolean;
  changeAngle?: boolean;
}

// Model configuration
export interface ModelConfig {
  gender: ModelGender;
  ethnicity: string;
  clothing: ModelClothing;
  useOnBrandDefaults: boolean;
}

// Product Shoot State - extends creative studio state
export interface ProductShootState {
  // Mode
  shootMode: ShootMode;
  
  // Remix mode
  remixSourceImage?: string;
  remixChanges: RemixChanges;
  
  // Product with recolor
  selectedProductId?: string;
  productRecolorOption: RecolorOption;
  productTargetColor?: string;
  recoloredProductUrl?: string;
  isRecoloring?: boolean;
  
  // Background
  settingType: SettingType;
  backgroundId?: string;
  customBackgroundPrompt?: string;
  
  // Model
  modelConfig: ModelConfig;
  
  // Shot type (product-specific)
  productShotType: ProductShotType;
  
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
  settingType: 'auto',
  modelConfig: {
    gender: 'auto',
    ethnicity: 'auto',
    clothing: 'auto',
    useOnBrandDefaults: true,
  },
  productShotType: 'lifestyle',
};

// Product shot type definitions with icons and descriptions
export const productShotTypes = [
  { 
    id: 'flat-lay' as ProductShotType, 
    name: 'Flat Lay', 
    icon: '📐',
    description: 'Product on surface, overhead angle',
    promptHint: 'flat lay photography, overhead shot, product on surface'
  },
  { 
    id: 'on-foot' as ProductShotType, 
    name: 'On Foot', 
    icon: '👟',
    description: 'Model wearing the shoes',
    promptHint: 'shoes on model feet, wearing product'
  },
  { 
    id: 'in-hand' as ProductShotType, 
    name: 'In Hand', 
    icon: '🤲',
    description: 'Model holding the shoes',
    promptHint: 'hands holding product, close-up detail'
  },
  { 
    id: 'lifestyle' as ProductShotType, 
    name: 'Lifestyle', 
    icon: '🚶',
    description: 'Full body with shoes as hero',
    promptHint: 'lifestyle photography, full body shot, product as focal point'
  },
  { 
    id: 'product-focus' as ProductShotType, 
    name: 'Product Focus', 
    icon: '🎯',
    description: 'Close-up, no model',
    promptHint: 'product only, detailed close-up, no model'
  },
  { 
    id: 'paired-outfit' as ProductShotType, 
    name: 'Paired with Outfit', 
    icon: '👔',
    description: 'Full look styling',
    promptHint: 'styled outfit, fashion editorial, complete look'
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

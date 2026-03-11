// ============= PRODUCT SHOOT TYPES =============

export type ShootMode = 'new' | 'remix' | 'setup';
export type RecolorOption = 'none' | 'pre-generation' | 'during-generation';
export type SettingType = 'studio' | 'outdoor' | 'custom' | 'scene';
export type WeatherCondition = 'auto' | 'sunny' | 'overcast' | 'golden-hour' | 'cloudy' | 'dappled';
export type ModelClothing = 'casual' | 'smart-casual' | 'formal' | 'athletic' | 'bohemian' | 'auto';

export type { ProductShotType } from './shotTypeConfigs';

export interface RemixChanges {
  changeModel?: boolean;
  changeBackground?: boolean;
  changeColor?: boolean;
  changeAngle?: boolean;
}

import type { ModelGender, ProductShotType } from './shotTypeConfigs';

export interface ModelConfig {
  gender: ModelGender;
  ethnicity: string;
  clothing: ModelClothing;
  useOnBrandDefaults: boolean;
}

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

import type { OnFootShotConfig, LifestyleShotConfig, ProductFocusShotConfig } from './shotTypeConfigs';

export type { ShoeComponents, ComponentOverrides, ComponentType, ShoeComponent, ComponentOverride } from '@/lib/birkenstockMaterials';
export { parseHexFromColor, stripHexFromColor } from '@/lib/birkenstockMaterials';

export interface ProductShootState {
  shootMode: ShootMode;
  remixSourceImages: string[];
  remixRemoveText: boolean;
  remixChanges: RemixChanges;
  selectedProductId?: string;
  selectedSkuId?: string;
  productRecolorOption: RecolorOption;
  productTargetColor?: string;
  recoloredProductUrl?: string;
  isRecoloring?: boolean;
  settingType: SettingType;
  backgroundId?: string;
  customBackgroundPrompt?: string;
  weatherCondition?: WeatherCondition;
  sceneImageUrl?: string;
  modelConfig: ModelConfig;
  productShotType: ProductShotType;
  onFootConfig?: OnFootShotConfig;
  lifestyleConfig?: LifestyleShotConfig;
  productFocusConfig?: ProductFocusShotConfig;
  integrityResults?: Record<string, ProductIntegrityResult>;
  componentOverrides?: import('@/lib/birkenstockMaterials').ComponentOverrides;
  attachReferenceImages: boolean;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'studio' | 'outdoor';
  thumbnail: string;
  prompt: string;
  colorHint?: string;
}

export interface IntegrityDetails {
  colorMatch: { score: number; notes: string };
  silhouetteMatch: { score: number; notes: string };
  featureMatch: { score: number; notes: string };
  materialMatch: { score: number; notes: string };
}

export interface ProductIntegrityResult {
  score: number;
  issues: string[];
  passesCheck: boolean;
  analyzed?: boolean;
  analyzedAt?: string;
  details?: IntegrityDetails;
}

export const initialProductShootState: ProductShootState = {
  shootMode: 'new',
  remixSourceImages: [],
  remixRemoveText: false,
  remixChanges: {},
  productRecolorOption: 'none',
  settingType: 'studio',
  backgroundId: 'studio-white',
  weatherCondition: 'sunny',
  modelConfig: {
    gender: 'auto',
    ethnicity: 'auto',
    clothing: 'auto',
    useOnBrandDefaults: true,
  },
  productShotType: 'product-focus',
  onFootConfig: {
    gender: 'auto',
    ethnicity: 'auto',
    poseVariation: 'auto',
    legStyling: 'auto',
    trouserColor: 'auto',
  },
  lifestyleConfig: {
    gender: 'auto',
    ethnicity: 'auto',
    pose: 'auto',
    trouserStyle: 'auto',
    topStyle: 'auto',
    outfitColor: 'auto',
  },
  productFocusConfig: {
    cameraAngle: 'auto',
    lighting: 'auto',
  },
  componentOverrides: undefined,
  attachReferenceImages: true,
};

export const productShotTypes = [
  { id: 'product-focus' as ProductShotType, name: 'Product Focus', description: 'Close-up, no model', promptHint: 'product only, detailed close-up, no model, studio lighting' },
  { id: 'on-foot' as ProductShotType, name: 'On Foot - Shoe Focus', description: 'Model wearing shoes, camera on product', promptHint: 'shoes on model feet, product as focal point, cropped view, lifestyle' },
  { id: 'lifestyle' as ProductShotType, name: 'Full Body on Model', description: 'Full outfit with product', promptHint: 'full body fashion shot, lifestyle, product visible, editorial style' },
];

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

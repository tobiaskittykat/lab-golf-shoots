// Creative Studio types - core type definitions
import { LogoPlacement, defaultLogoPlacement } from '@/lib/imageCompositing';
export type { LogoPlacement } from '@/lib/imageCompositing';

export type { ProductShootState, ShootMode, RecolorOption, SettingType, ModelGender, ModelClothing, ProductShotType, RemixChanges, ModelConfig, BackgroundPreset, ProductIntegrityResult } from './product-shoot/types';
export { initialProductShootState } from './product-shoot/types';

export interface VisualAnalysis {
  dominant_colors?: string[];
  color_mood?: string;
  key_elements?: string[];
  composition_style?: string;
  lighting_quality?: string;
  textures?: string[];
  emotional_tone?: string;
  suggested_props?: string[];
  best_for?: string[];
}

export interface Moodboard {
  id: string;
  name: string;
  thumbnail: string;
  filePath?: string;
  description?: string;
  visualAnalysis?: VisualAnalysis;
}

export interface ProductFocus {
  productCategory: string;
  visualGuidance?: string;
}

export interface VisualWorld {
  atmosphere: string;
  materials: string[];
  palette: string[];
  composition: string;
  mustHave: string[];
}

export interface ContentPillar {
  name: string;
  description: string;
}

export interface TargetAudience {
  persona: string;
  situation: string;
}

export interface Tonality {
  adjectives: string[];
  neverRules: string[];
}

export interface ConceptPresets {
  artisticStyle?: string;
  lightingStyle?: string;
  cameraAngle?: string;
  moodboardId?: string;
  productIds?: string[];
  extraKeywords?: string[];
  useCase?: string;
  aspectRatio?: string;
}

export interface Concept {
  id: string;
  title: string;
  productFocus?: ProductFocus;
  coreIdea?: string;
  visualWorld?: VisualWorld;
  taglines?: string[];
  contentPillars?: ContentPillar[];
  targetAudience?: TargetAudience;
  consumerInsight?: string;
  tonality?: Tonality;
  description: string;
  tags: string[];
  presets?: ConceptPresets;
}

export interface ReferenceImage {
  id: string;
  name: string;
  thumbnail: string;
  url?: string;
  category: 'product' | 'context';
  shotPrompt?: string;
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  status: 'pending' | 'completed' | 'failed' | 'nsfw';
  prompt: string;
  refinedPrompt?: string;
  conceptTitle?: string;
  conceptId?: string;
  error?: string;
  index: number;
  moodboardId?: string;
  moodboardUrl?: string;
  productReferenceUrl?: string;
  productReferenceUrls?: string[];
  productIds?: string[];
  contextReferenceUrl?: string;
  contextReferenceUrls?: string[];
  liked?: boolean | null;
  shotType?: string;
  settings?: {
    aiModel?: string;
    artisticStyle?: string;
    lightingStyle?: string;
    cameraAngle?: string;
    resolution?: string;
    aspectRatio?: string;
    [key: string]: unknown;
  };
}

export interface UserPreference {
  conceptId: string;
  conceptTitle: string;
  moodboardId: string;
  shotType: string;
  productIds?: string[];
  liked: boolean;
}

import { ProductShootState, initialProductShootState as defaultProductShootState } from './product-shoot/types';

export interface CreativeStudioState {
  step: 1 | 2 | 3;
  selectedBrand: string | null;
  outputFormat: string | null;
  mediaType: 'image' | 'video';
  targetPersona: string | null;
  useCase: 'product' | 'lifestyle' | 'localization' | 'ugc';
  prompt: string;
  selectedTypeCard: string | null;
  concepts: Concept[];
  savedConcepts: any[];
  selectedConcept: string | null;
  moodboard: string | null;
  productReferences: string[];
  contextReference: string | null;
  styleReference: string | null;
  textOnImage: string;
  extraKeywords: string[];
  negativePrompt: string;
  imageCount: number;
  resolution: string;
  aspectRatio: string;
  artisticStyle: string | null;
  aiModel: string;
  seed: number | null;
  guidanceScale: number;
  saveToFolder: string | null;
  lightingStyle: string;
  cameraAngle: string;
  sequentialGeneration: boolean;
  isGenerating: boolean;
  isLoadingConcepts: boolean;
  generatedImages: GeneratedImage[];
  editMode: 'generate' | 'edit' | 'variation';
  baseImage: GeneratedImage | null;
  editDescription: string;
  isEditPanelOpen: boolean;
  curatedMoodboards: string[];
  curatedProducts: string[];
  displayedMoodboardIds: string[];
  displayedProductIds: string[];
  logoPlacement: LogoPlacement;
  discoveryMode: boolean;
  discoveryImages: GeneratedImage[];
  userPreferences: UserPreference[];
  isDiscoveryGenerating: boolean;
  productShoot: ProductShootState;
}

export const initialCreativeStudioState: CreativeStudioState = {
  step: 1, selectedBrand: null, outputFormat: 'social-post', mediaType: 'image', targetPersona: null, useCase: 'product', prompt: '', selectedTypeCard: 'product',
  concepts: [], savedConcepts: [], selectedConcept: null, moodboard: null, productReferences: [], contextReference: null, styleReference: null,
  textOnImage: '', extraKeywords: [], negativePrompt: '', imageCount: 4, resolution: '1024', aspectRatio: '1:1', artisticStyle: null, aiModel: 'auto', seed: null, guidanceScale: 7, saveToFolder: null,
  lightingStyle: 'auto', cameraAngle: 'auto', sequentialGeneration: false, isGenerating: false, isLoadingConcepts: false, generatedImages: [],
  editMode: 'generate', baseImage: null, editDescription: '', isEditPanelOpen: false,
  curatedMoodboards: [], curatedProducts: [], displayedMoodboardIds: [], displayedProductIds: [],
  logoPlacement: defaultLogoPlacement, discoveryMode: false, discoveryImages: [], userPreferences: [], isDiscoveryGenerating: false,
  productShoot: defaultProductShootState,
};

export const sampleMoodboards: Moodboard[] = [];
export const sampleProductReferences: ReferenceImage[] = [];
export const sampleContextReferences: ReferenceImage[] = [];

export const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
export const aiModels = [
  { value: 'auto', label: 'Auto', description: 'Best quality', model: 'google/gemini-3-pro-image-preview' },
  { value: 'nano-banana', label: 'Nano Banana Pro', description: 'Fast iteration', model: 'google/gemini-2.5-flash-image-preview' },
];

// Creative Studio types - core type definitions

export interface Concept {
  id: string;
  title: string;
  description?: string;
  coreIdea?: string;
  tonality?: {
    adjectives?: string[];
    neverRules?: string[];
  };
  visualWorld?: {
    atmosphere?: string;
    materials?: string;
    palette?: string[];
    composition?: string;
    mustHave?: string[];
  };
  contentPillars?: { name: string; description: string }[];
  targetAudience?: {
    persona?: string;
    situation?: string;
  };
  consumerInsight?: string;
  productFocus?: {
    productCategory?: string;
  };
  taglines?: string[];
  tags?: string[];
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  status: 'pending' | 'completed' | 'failed';
  prompt?: string;
  refinedPrompt?: string;
  conceptTitle?: string;
  conceptId?: string;
  index?: number;
  moodboardId?: string;
  moodboardUrl?: string;
  productReferenceUrls?: string[];
  productReferenceUrl?: string;
  productIds?: string[];
  shotType?: string;
  liked?: boolean | null;
  error?: string;
  settings?: Record<string, unknown>;
}

export interface Moodboard {
  id: string;
  name: string;
  thumbnail: string;
  description?: string;
}

export interface UserPreference {
  conceptId: string;
  moodboardId?: string;
  shotType: string;
  liked: boolean;
  productIds?: string[];
}

export interface LogoPlacement {
  enabled: boolean;
  position: string;
  sizePercent: number;
  opacity: number;
  paddingPx: number;
}

export interface ProductShootState {
  selectedProductId?: string;
  productShotType?: string;
  settingType?: string;
  backgroundId?: string;
  customBackgroundPrompt?: string;
  weatherCondition?: string;
  sceneImageUrl?: string;
  modelConfig?: Record<string, unknown>;
  onFootConfig?: Record<string, unknown>;
  lifestyleConfig?: Record<string, unknown>;
  productFocusConfig?: Record<string, unknown>;
  recoloredProductUrl?: string;
  componentOverrides?: Record<string, any>;
  shootMode?: string;
  remixSourceImages: string[];
  remixRemoveText?: boolean;
  attachReferenceImages?: boolean;
}

export interface CreativeStudioState {
  prompt: string;
  concepts: Concept[];
  selectedConcept: string | null;
  moodboard: string | null;
  contextReference: string | null;
  productReferences: string[];
  artisticStyle?: string;
  lightingStyle?: string;
  cameraAngle?: string;
  extraKeywords?: string;
  negativePrompt?: string;
  textOnImage?: string;
  imageCount: number;
  resolution: string;
  aspectRatio: string;
  aiModel?: string;
  guidanceScale?: number;
  seed?: number;
  saveToFolder?: string;
  logoPlacement?: LogoPlacement;
  useCase?: string;
  productShoot?: ProductShootState;
  sequentialGeneration?: boolean;
}

// Sample data
export const sampleMoodboards: Moodboard[] = [];
export const sampleProductReferences: { id: string; name: string; url: string }[] = [];
export const sampleContextReferences: { id: string; name: string; shotPrompt: string }[] = [];

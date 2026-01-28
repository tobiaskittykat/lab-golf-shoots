// ============= 9-POINT CAMPAIGN CONCEPT FRAMEWORK =============

import { LogoPlacement, defaultLogoPlacement } from '@/lib/imageCompositing';
export type { LogoPlacement } from '@/lib/imageCompositing';

// Re-export Product Shoot types for convenience
export type { 
  ProductShootState,
  ShootMode,
  RecolorOption,
  SettingType,
  ModelGender,
  ModelClothing,
  ProductShotType,
  RemixChanges,
  ModelConfig,
  BackgroundPreset,
  ProductIntegrityResult,
} from './product-shoot/types';
export { initialProductShootState } from './product-shoot/types';

// Product Focus - high-level product category (exact product chosen via reference image)
export interface ProductFocus {
  productCategory: string;    // "Nike basketball sneaker" or "luxury crossbody bag"
  visualGuidance?: string;    // "hero shot with texture details" (optional shot direction)
}

// Visual World - art direction rules
export interface VisualWorld {
  atmosphere: string;         // "Night city glow + steam breath + wool coats"
  materials: string[];        // ["leather", "metal", "knit"]
  palette: string[];          // ["black", "cream", "deep green", "chrome"]
  composition: string;        // "60% on-body, 40% macro details"
  mustHave: string[];         // ["always show strap line across torso"]
}

// Content Pillar - repeatable story bucket
export interface ContentPillar {
  name: string;               // "Cold commute proof"
  description: string;        // "gloves + tap + quick access"
}

// Target Audience - persona + situation
export interface TargetAudience {
  persona: string;            // "Style-led urban women 25–45"
  situation: string;          // "who commute, travel, want bag-level polish"
}

// Tonality - 3 adjectives + 2 "never" rules
export interface Tonality {
  adjectives: string[];       // ["polished", "confident", "warm"]
  neverRules: string[];       // ["techy", "cheap hacks"]
}

// ============= MAIN CONCEPT INTERFACE =============
export interface Concept {
  id: string;
  
  // 1. Name (title)
  title: string;
  
  // 2. Product Focus
  productFocus?: ProductFocus;
  
  // 3. Single-minded Idea (core idea)
  coreIdea?: string;
  
  // 4. Visual World
  visualWorld?: VisualWorld;
  
  // 5. Taglines (set of options)
  taglines?: string[];
  
  // 6. Content Pillars
  contentPillars?: ContentPillar[];
  
  // 7. Target Audience
  targetAudience?: TargetAudience;
  
  // 8. Consumer Insight
  consumerInsight?: string;
  
  // 9. Tonality
  tonality?: Tonality;
  
  // Legacy/simplified fields (for backwards compatibility and quick display)
  description: string;        // Can be derived from coreIdea + visualWorld
  tags: string[];
  
  // Generation presets
  presets?: ConceptPresets;
}

export interface ConceptPresets {
  artisticStyle?: string;
  lightingStyle?: string;
  cameraAngle?: string;
  moodboardId?: string;
  productIds?: string[];       // Up to 3 product reference IDs
  extraKeywords?: string[];
  useCase?: string;
  aspectRatio?: string;
}

export interface SavedConcept extends Concept {
  userId: string;
  brandId?: string;
  createdAt: string;
  updatedAt: string;
}

// Campaign objectives for concept creation
export const campaignObjectives = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'conversion', label: 'Conversion / Sales' },
  { value: 'launch', label: 'Product Launch' },
  { value: 'seasonal', label: 'Seasonal Campaign' },
  { value: 'ugc', label: 'UGC Style Content' },
];

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
  thumbnail: string; // Gradient CSS or image URL
  filePath?: string; // Storage path for signed URL fallback
  description?: string;
  visualAnalysis?: VisualAnalysis;
}

export interface ReferenceImage {
  id: string;
  name: string;
  thumbnail: string;
  url?: string; // Actual image URL for AI input
  category: 'product' | 'context';
  shotPrompt?: string; // Text guidance for AI when used as shot type
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
  // Reference images used for generation
  moodboardId?: string;
  moodboardUrl?: string;
  productReferenceUrl?: string;
  productReferenceUrls?: string[]; // Support multiple product references
  productIds?: string[]; // Product IDs used (for preference tracking)
  contextReferenceUrl?: string;
  contextReferenceUrls?: string[]; // Support multiple context references
  // Discovery mode fields
  liked?: boolean | null; // null = not rated, true = liked, false = disliked
  shotType?: string; // ID of shot type used (for preference learning)
  // Generation settings
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

// User preference from Discovery Mode
export interface UserPreference {
  conceptId: string;
  conceptTitle: string;
  moodboardId: string; // Can be empty string if not matched
  shotType: string;
  productIds?: string[]; // Product IDs to carry forward
  liked: boolean;
}

// Campaign Style - aggregated preferences after swiping
export interface CampaignStyle {
  likedConcepts: { conceptId: string; conceptTitle: string; count: number }[];
  likedShotTypes: { shotType: string; shotName: string; count: number }[];
  likedMoodboards: string[];
  totalLiked: number;
  totalReviewed: number;
}

// Import ProductShootState type
import { ProductShootState, initialProductShootState as defaultProductShootState } from './product-shoot/types';

export interface CreativeStudioState {
  // Step 1
  step: 1 | 2 | 3;
  selectedBrand: string | null;
  outputFormat: string | null;
  mediaType: 'image' | 'video';
  targetPersona: string | null;
  useCase: 'product' | 'lifestyle' | 'localization' | 'ugc';
  prompt: string;
  selectedTypeCard: string | null;

  // Step 2
  concepts: Concept[];
  savedConcepts: SavedConcept[];
  selectedConcept: string | null;
  moodboard: string | null;
  productReferences: string[]; // Changed to array, max 3
  contextReference: string | null; // Single shot type (mutually exclusive), null = AI decides
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

  // Prompt refinement
  lightingStyle: string;
  cameraAngle: string;

  // Generation
  isGenerating: boolean;
  isLoadingConcepts: boolean;
  generatedImages: GeneratedImage[];
  
  // Edit mode (Creative Tools Panel)
  editMode: 'generate' | 'edit' | 'variation';
  baseImage: GeneratedImage | null;
  editDescription: string;
  isEditPanelOpen: boolean;
  
  // Curated options from smart-match
  curatedMoodboards: string[];
  curatedProducts: string[];
  
  // Stable display order (set by smart-match, only modified by gallery selection)
  displayedMoodboardIds: string[];
  displayedProductIds: string[];
  
  // Logo placement settings
  logoPlacement: LogoPlacement;
  
  // Discovery Mode
  discoveryMode: boolean;
  discoveryImages: GeneratedImage[];
  userPreferences: UserPreference[];
  isDiscoveryGenerating: boolean;
  
  // Product Shoot specific state
  productShoot: ProductShootState;
}

export const initialCreativeStudioState: CreativeStudioState = {
  step: 1,
  selectedBrand: null,
  outputFormat: 'social-post',
  mediaType: 'image',
  targetPersona: null,
  useCase: 'lifestyle',
  prompt: '',
  selectedTypeCard: 'lifestyle',

  concepts: [],
  savedConcepts: [],
  selectedConcept: null,
  moodboard: null,
  productReferences: [], // Changed to array, max 3
  contextReference: null, // Single shot type, null = AI chooses
  styleReference: null,
  textOnImage: '',
  extraKeywords: [],
  negativePrompt: '',
  imageCount: 4,
  resolution: '1024',
  aspectRatio: '1:1',
  artisticStyle: null,
  aiModel: 'auto',
  seed: null,
  guidanceScale: 7,
  saveToFolder: null,

  lightingStyle: 'auto',
  cameraAngle: 'auto',

  isGenerating: false,
  isLoadingConcepts: false,
  generatedImages: [],
  
  // Edit mode defaults
  editMode: 'generate',
  baseImage: null,
  editDescription: '',
  isEditPanelOpen: false,
  
  // Curated options from smart-match
  curatedMoodboards: [],
  curatedProducts: [],
  
  // Stable display order
  displayedMoodboardIds: [],
  displayedProductIds: [],
  
  // Logo placement defaults (OFF by default)
  logoPlacement: defaultLogoPlacement,
  
  // Discovery Mode defaults
  discoveryMode: false,
  discoveryImages: [],
  userPreferences: [],
  isDiscoveryGenerating: false,
  
  // Product Shoot defaults
  productShoot: defaultProductShootState,
};

export const typeCards = [
  { 
    id: 'product', 
    label: 'Product Shot', 
    icon: '📦',
    description: 'Clean product photography',
    promptTemplate: 'Professional product photography of [product], studio lighting, white background, high-end commercial style'
  },
  { 
    id: 'lifestyle', 
    label: 'Lifestyle', 
    icon: '🌿',
    description: 'Natural, contextual settings',
    promptTemplate: 'Lifestyle photography showing [product] in natural setting, authentic, warm tones, editorial feel'
  },
  { 
    id: 'localization', 
    label: 'Media Localization', 
    icon: '🌍',
    description: 'Adapt visuals for different markets',
    promptTemplate: 'Localized marketing visual for [product], culturally adapted, market-specific appeal, authentic regional aesthetic'
  },
  { 
    id: 'ugc', 
    label: 'UGC Content', 
    icon: '📱',
    description: 'User-generated style content',
    promptTemplate: 'Authentic user-generated style content featuring [product], casual, relatable, social media native aesthetic'
  },
];

export const useCaseOptions = [
  { value: 'product', label: 'Product Shot' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'localization', label: 'Media Localization' },
  { value: 'ugc', label: 'UGC Content' },
];

// Output format options with default aspect ratios
export const outputFormats = [
  { value: 'social-post', label: 'Social Post', aspectRatio: '1:1', description: 'Square format for feeds' },
  { value: 'stories-reels', label: 'Stories & Reels', aspectRatio: '9:16', description: 'Vertical for Stories/TikTok/Shorts' },
  { value: 'email-banner', label: 'Email & Banner', aspectRatio: '3:1', description: 'Wide horizontal headers' },
  { value: 'website-hero', label: 'Website Hero', aspectRatio: '16:9', description: 'Standard widescreen' },
  { value: 'ecommerce', label: 'E-commerce', aspectRatio: '1:1', description: 'Product listings' },
];

export const aspectRatios = ['1:1', '4:5', '16:9', '9:16', '4:3', '3:4'];

export const resolutions = [
  { value: '512', label: '512px' },
  { value: '1024', label: '1024px' },
  { value: '2048', label: '2048px' },
];

// Updated artistic styles - more visual/cinematic options
export const artisticStyles = [
  { value: 'photorealistic', label: 'Photorealistic', icon: '📷', color: 'bg-slate-500' },
  { value: 'cinematic', label: 'Cinematic', icon: '🎬', color: 'bg-amber-600' },
  { value: 'film-noir', label: 'Film Noir', icon: '🖤', color: 'bg-gray-900' },
  { value: 'vintage-film', label: 'Vintage Film', icon: '📽️', color: 'bg-orange-700' },
  { value: 'cartoon', label: 'Cartoon', icon: '🎨', color: 'bg-yellow-500' },
  { value: 'anime', label: 'Anime', icon: '✨', color: 'bg-pink-500' },
  { value: '3d-render', label: '3D Render', icon: '🧊', color: 'bg-cyan-500' },
  { value: 'watercolor', label: 'Watercolor', icon: '💧', color: 'bg-blue-400' },
  { value: 'oil-painting', label: 'Oil Painting', icon: '🖼️', color: 'bg-amber-800' },
  { value: 'pop-art', label: 'Pop Art', icon: '🔴', color: 'bg-red-500' },
  { value: 'cyberpunk', label: 'Cyberpunk', icon: '💜', color: 'bg-purple-600' },
  { value: 'minimalist', label: 'Minimalist', icon: '⬜', color: 'bg-gray-200' },
  { value: 'sketch', label: 'Sketch', icon: '✏️', color: 'bg-gray-400' },
  { value: 'collage', label: 'Collage', icon: '📰', color: 'bg-emerald-600' },
];

export const lightingStyles = [
  { value: 'auto', label: 'Auto' },
  { value: 'natural', label: 'Natural Light' },
  { value: 'studio', label: 'Studio' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'golden-hour', label: 'Golden Hour' },
  { value: 'soft', label: 'Soft/Diffused' },
  { value: 'neon', label: 'Neon' },
  { value: 'backlit', label: 'Backlit' },
];

export const cameraAngles = [
  { value: 'auto', label: 'Auto' },
  { value: 'eye-level', label: 'Eye Level' },
  { value: 'overhead', label: 'Overhead/Flat Lay' },
  { value: 'close-up', label: 'Close-Up' },
  { value: 'wide', label: 'Wide Shot' },
  { value: 'low-angle', label: 'Low Angle' },
  { value: 'dutch-angle', label: 'Dutch Angle' },
];

// Updated AI models - only Lovable AI supported models
export const aiModels = [
  { 
    value: 'auto', 
    label: 'Auto', 
    description: 'Best quality',
    model: 'google/gemini-3-pro-image-preview' 
  },
  { 
    value: 'nano-banana', 
    label: 'Nano Banana Pro', 
    description: 'Fast iteration',
    model: 'google/gemini-2.5-flash-image-preview' 
  },
];

export const targetPersonas = [
  { value: 'gen-z', label: 'Gen Z (18-24)' },
  { value: 'millennials', label: 'Millennials (25-40)' },
  { value: 'gen-x', label: 'Gen X (41-56)' },
  { value: 'professionals', label: 'Professionals' },
  { value: 'parents', label: 'Parents' },
  { value: 'luxury', label: 'Luxury Consumers' },
  { value: 'eco-conscious', label: 'Eco-Conscious' },
  { value: 'fitness', label: 'Fitness Enthusiasts' },
];

// Custom moodboards are now loaded from the database - no hardcoded samples
export const sampleMoodboards: Moodboard[] = [];

// Bandolier product references - phone cases and accessories
export const sampleProductReferences: ReferenceImage[] = [
  { 
    id: 'product-1', 
    name: 'Crossbody Phone Case', 
    thumbnail: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
    category: 'product' 
  },
  { 
    id: 'product-2', 
    name: 'Leather Phone Wallet', 
    thumbnail: 'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=800',
    category: 'product' 
  },
  { 
    id: 'product-3', 
    name: 'Gold Hardware Detail', 
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    category: 'product' 
  },
  { 
    id: 'product-4', 
    name: 'Pebbled Leather', 
    thumbnail: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    category: 'product' 
  },
  { 
    id: 'product-5', 
    name: 'Crossbody Strap', 
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    category: 'product' 
  },
  { 
    id: 'product-6', 
    name: 'Card Slot Detail', 
    thumbnail: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800',
    category: 'product' 
  },
];

// Bandolier shot type references - content-focused guidance for AI
import shotProductFocus from '@/assets/shot-references/product-focus.jpg';
import shotProductInHand from '@/assets/shot-references/product-in-hand.jpg';
import shotProductComposition from '@/assets/shot-references/product-composition.jpg';
import shotProductOnModel from '@/assets/shot-references/product-on-model.jpg';

export const sampleContextReferences: ReferenceImage[] = [
  { 
    id: 'shot-product-focus', 
    name: 'Product Focus', 
    thumbnail: shotProductFocus,
    url: shotProductFocus,
    category: 'context',
    shotPrompt: 'Product-only shot showcasing the item in its natural environment, no hands or models'
  },
  { 
    id: 'shot-in-hand', 
    name: 'In Hand', 
    thumbnail: shotProductInHand,
    url: shotProductInHand,
    category: 'context',
    shotPrompt: 'Close-up of hands holding the product'
  },
  { 
    id: 'shot-composition', 
    name: 'Composition', 
    thumbnail: shotProductComposition,
    url: shotProductComposition,
    category: 'context',
    shotPrompt: 'Natural scene with contextual props, environmental composition'
  },
  { 
    id: 'shot-on-model', 
    name: 'On Model', 
    thumbnail: shotProductOnModel,
    url: shotProductOnModel,
    category: 'context',
    shotPrompt: 'Model wearing the crossbody product'
  },
];

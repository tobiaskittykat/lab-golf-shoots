export interface Concept {
  id: string;
  title: string;
  description: string;
  tags: string[];
  // Preset settings that define the concept
  presets?: ConceptPresets;
}

export interface ConceptPresets {
  artisticStyle?: string;
  lightingStyle?: string;
  cameraAngle?: string;
  moodboardId?: string;
  extraKeywords?: string[];
  useCase?: string;
}

export interface SavedConcept extends Concept {
  userId: string;
  brandId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Moodboard {
  id: string;
  name: string;
  thumbnail: string; // Gradient CSS or image URL
  description?: string;
}

export interface ReferenceImage {
  id: string;
  name: string;
  thumbnail: string;
  url?: string; // Actual image URL for AI input
  category: 'product' | 'context';
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  status: 'pending' | 'completed' | 'failed' | 'nsfw';
  prompt: string;
  refinedPrompt?: string;
  error?: string;
  index: number;
  productReferenceUrl?: string;
  contextReferenceUrl?: string;
  contextReferenceUrls?: string[]; // Support multiple context references
}

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
  productReference: string | null;
  contextReferences: string[]; // Changed from single to array
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
}

export const initialCreativeStudioState: CreativeStudioState = {
  step: 1,
  selectedBrand: null,
  outputFormat: 'social-post',
  mediaType: 'image',
  targetPersona: null,
  useCase: 'product',
  prompt: '',
  selectedTypeCard: null,

  concepts: [],
  savedConcepts: [],
  selectedConcept: null,
  moodboard: null,
  productReference: null,
  contextReferences: [], // Changed to array
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

// Sample moodboards with Unsplash images
export const sampleMoodboards: Moodboard[] = [
  { 
    id: 'minimal-clean', 
    name: 'Minimal & Clean', 
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    description: 'Clean whites, soft grays, simple compositions'
  },
  { 
    id: 'warm-earthy', 
    name: 'Warm & Earthy', 
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
    description: 'Terracotta, sand, warm browns'
  },
  { 
    id: 'bold-vibrant', 
    name: 'Bold & Vibrant', 
    thumbnail: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=400&h=300&fit=crop',
    description: 'High contrast, saturated colors'
  },
  { 
    id: 'moody-dark', 
    name: 'Moody & Dark', 
    thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&h=300&fit=crop',
    description: 'Deep shadows, dramatic contrast'
  },
  { 
    id: 'pastel-soft', 
    name: 'Pastel & Soft', 
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    description: 'Gentle pastels, dreamy atmosphere'
  },
  { 
    id: 'nature-organic', 
    name: 'Nature & Organic', 
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    description: 'Lush greens, natural textures'
  },
  { 
    id: 'luxury-gold', 
    name: 'Luxury & Gold', 
    thumbnail: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    description: 'Rich golds, sophisticated elegance'
  },
  { 
    id: 'ocean-breeze', 
    name: 'Ocean Breeze', 
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    description: 'Cool blues, coastal vibes'
  },
];

// Sample product references with real shoe images
export const sampleProductReferences: ReferenceImage[] = [
  { 
    id: 'product-1', 
    name: 'White Sneakers', 
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    category: 'product' 
  },
  { 
    id: 'product-2', 
    name: 'Running Shoes', 
    thumbnail: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    category: 'product' 
  },
  { 
    id: 'product-3', 
    name: 'Classic Leather', 
    thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
    category: 'product' 
  },
  { 
    id: 'product-4', 
    name: 'High Top Sneakers', 
    thumbnail: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    category: 'product' 
  },
  { 
    id: 'product-5', 
    name: 'Sports Sneakers', 
    thumbnail: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
    category: 'product' 
  },
  { 
    id: 'product-6', 
    name: 'Minimal White', 
    thumbnail: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
    category: 'product' 
  },
];

// Sample context references with real lifestyle images
export const sampleContextReferences: ReferenceImage[] = [
  { 
    id: 'context-1', 
    name: 'Urban Street', 
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    category: 'context' 
  },
  { 
    id: 'context-2', 
    name: 'Beach Scene', 
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    category: 'context' 
  },
  { 
    id: 'context-3', 
    name: 'City Skyline', 
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
    category: 'context' 
  },
  { 
    id: 'context-4', 
    name: 'Modern Studio', 
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    category: 'context' 
  },
  { 
    id: 'context-5', 
    name: 'Nature Trail', 
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    category: 'context' 
  },
  { 
    id: 'context-6', 
    name: 'Gym Interior', 
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    category: 'context' 
  },
];

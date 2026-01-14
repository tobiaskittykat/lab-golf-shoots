export interface Concept {
  id: string;
  title: string;
  description: string;
  tags: string[];
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
}

export interface CreativeStudioState {
  // Step 1
  step: 1 | 2 | 3; // Added step 3 for results
  selectedBrand: string | null;
  selectedCampaign: string | null;
  mediaType: 'image' | 'video';
  targetPersona: string | null;
  useCase: 'ad' | 'lifestyle' | 'newsletter' | 'social' | 'product';
  prompt: string;
  selectedTypeCard: string | null;

  // Step 2
  concepts: Concept[];
  selectedConcept: string | null;
  moodboard: string | null;
  productReference: string | null;
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

  // Prompt refinement
  lightingStyle: string;
  cameraAngle: string;

  // Generation
  isGenerating: boolean;
  isLoadingConcepts: boolean;
  generatedImages: GeneratedImage[];
}

export const initialCreativeStudioState: CreativeStudioState = {
  step: 1,
  selectedBrand: null,
  selectedCampaign: null,
  mediaType: 'image',
  targetPersona: null,
  useCase: 'product',
  prompt: '',
  selectedTypeCard: null,

  concepts: [],
  selectedConcept: null,
  moodboard: null,
  productReference: null,
  contextReference: null,
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
    id: 'ad', 
    label: 'Ad Creative', 
    icon: '📢',
    description: 'Marketing-ready visuals',
    promptTemplate: 'Bold advertising creative for [product], eye-catching, modern design, perfect for digital campaigns'
  },
  { 
    id: 'social', 
    label: 'Social Post', 
    icon: '📱',
    description: 'Platform-optimized content',
    promptTemplate: 'Social media ready content featuring [product], engaging, shareable, trendy aesthetic'
  },
];

export const useCaseOptions = [
  { value: 'ad', label: 'Ad Creative' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'social', label: 'Social Post' },
  { value: 'product', label: 'Product Shot' },
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

// Sample moodboards with visual gradients
export const sampleMoodboards: Moodboard[] = [
  { 
    id: 'minimal-clean', 
    name: 'Minimal & Clean', 
    thumbnail: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    description: 'Clean whites, soft grays, simple compositions'
  },
  { 
    id: 'warm-earthy', 
    name: 'Warm & Earthy', 
    thumbnail: 'linear-gradient(135deg, #fef3c7 0%, #d97706 50%, #78350f 100%)',
    description: 'Terracotta, sand, warm browns'
  },
  { 
    id: 'bold-vibrant', 
    name: 'Bold & Vibrant', 
    thumbnail: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 50%, #06b6d4 100%)',
    description: 'High contrast, saturated colors'
  },
  { 
    id: 'moody-dark', 
    name: 'Moody & Dark', 
    thumbnail: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
    description: 'Deep shadows, dramatic contrast'
  },
  { 
    id: 'pastel-soft', 
    name: 'Pastel & Soft', 
    thumbnail: 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 50%, #cffafe 100%)',
    description: 'Gentle pastels, dreamy atmosphere'
  },
  { 
    id: 'nature-organic', 
    name: 'Nature & Organic', 
    thumbnail: 'linear-gradient(135deg, #86efac 0%, #22c55e 50%, #166534 100%)',
    description: 'Lush greens, natural textures'
  },
  { 
    id: 'luxury-gold', 
    name: 'Luxury & Gold', 
    thumbnail: 'linear-gradient(135deg, #fef9c3 0%, #eab308 50%, #854d0e 100%)',
    description: 'Rich golds, sophisticated elegance'
  },
  { 
    id: 'ocean-breeze', 
    name: 'Ocean Breeze', 
    thumbnail: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 50%, #0369a1 100%)',
    description: 'Cool blues, coastal vibes'
  },
];

// Sample product references
export const sampleProductReferences: ReferenceImage[] = [
  { id: 'product-1', name: 'White Background', thumbnail: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)', category: 'product' },
  { id: 'product-2', name: 'Marble Surface', thumbnail: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 30%, #f1f5f9 70%, #e2e8f0 100%)', category: 'product' },
  { id: 'product-3', name: 'Wood Texture', thumbnail: 'linear-gradient(135deg, #d4a574 0%, #8b6914 50%, #a67c52 100%)', category: 'product' },
  { id: 'product-4', name: 'Fabric Background', thumbnail: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 50%, #f59e0b 100%)', category: 'product' },
];

// Sample context references
export const sampleContextReferences: ReferenceImage[] = [
  { id: 'context-1', name: 'Coffee Shop', thumbnail: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #451a03 100%)', category: 'context' },
  { id: 'context-2', name: 'Beach Scene', thumbnail: 'linear-gradient(135deg, #0ea5e9 0%, #fcd34d 50%, #f59e0b 100%)', category: 'context' },
  { id: 'context-3', name: 'Urban Street', thumbnail: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #1e293b 100%)', category: 'context' },
  { id: 'context-4', name: 'Kitchen', thumbnail: 'linear-gradient(135deg, #fafaf9 0%, #e7e5e4 50%, #a8a29e 100%)', category: 'context' },
  { id: 'context-5', name: 'Office Space', thumbnail: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 50%, #475569 100%)', category: 'context' },
  { id: 'context-6', name: 'Garden', thumbnail: 'linear-gradient(135deg, #86efac 0%, #4ade80 50%, #166534 100%)', category: 'context' },
];

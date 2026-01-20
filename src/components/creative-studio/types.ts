// ============= 9-POINT CAMPAIGN CONCEPT FRAMEWORK =============

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

// Bandolier-focused moodboards - luxury phone accessories aesthetic
export const sampleMoodboards: Moodboard[] = [
  { 
    id: 'urban-luxe', 
    name: 'Urban Luxe', 
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop',
    description: 'Night city glow, polished urban settings, sophisticated street style'
  },
  { 
    id: 'winter-commute', 
    name: 'Winter Commute', 
    thumbnail: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=400&h=300&fit=crop',
    description: 'Steam breath, wool coats, coffee runs, cold weather elegance'
  },
  { 
    id: 'leather-textures', 
    name: 'Leather & Gold', 
    thumbnail: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop',
    description: 'Pebbled leather, gold hardware, tactile luxury details'
  },
  { 
    id: 'neutral-minimal', 
    name: 'Neutral Minimal', 
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    description: 'Black, greige, ivory, cream - sophisticated neutrals'
  },
  { 
    id: 'travel-ready', 
    name: 'Travel Ready', 
    thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
    description: 'Airport lounges, hotel lobbies, jet-set lifestyle'
  },
  { 
    id: 'cafe-culture', 
    name: 'Café Culture', 
    thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    description: 'Coffee shops, marble tables, casual sophistication'
  },
  { 
    id: 'evening-out', 
    name: 'Evening Out', 
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
    description: 'Dinner dates, events, low lighting, dressed up'
  },
  { 
    id: 'hands-free-life', 
    name: 'Hands-Free Life', 
    thumbnail: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=400&h=300&fit=crop',
    description: 'Active lifestyle, multitasking, on-the-go convenience'
  },
];

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

// Bandolier context references - urban lifestyle settings
export const sampleContextReferences: ReferenceImage[] = [
  { 
    id: 'context-1', 
    name: 'City Street', 
    thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
    category: 'context' 
  },
  { 
    id: 'context-2', 
    name: 'Coffee Shop', 
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    category: 'context' 
  },
  { 
    id: 'context-3', 
    name: 'Airport Terminal', 
    thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
    category: 'context' 
  },
  { 
    id: 'context-4', 
    name: 'Evening Event', 
    thumbnail: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
    category: 'context' 
  },
  { 
    id: 'context-5', 
    name: 'Winter Street', 
    thumbnail: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=800',
    category: 'context' 
  },
  { 
    id: 'context-6', 
    name: 'Boutique Interior', 
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    category: 'context' 
  },
];

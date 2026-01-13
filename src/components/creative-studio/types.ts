export interface Concept {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface CreativeStudioState {
  // Step 1
  step: 1 | 2;
  selectedBrand: string | null;
  selectedCampaign: string | null;
  mediaType: 'image' | 'video';
  useCase: 'ad' | 'lifestyle' | 'newsletter' | 'social' | 'product';
  prompt: string;
  selectedTypeCard: string | null;

  // Step 2
  concepts: Concept[];
  selectedConcept: string | null;
  moodboard: string | null;
  productReference: string | null;
  masterReference: string | null;
  textOnImage: string;
  extraKeywords: string[];
  negativePrompt: string;
  imageCount: number;
  resolution: string;
  aspectRatio: string;
  imageStyle: string[];
  aiModel: string;
  seed: number | null;
  guidanceScale: number;
  saveToFolder: string | null;

  // Advanced
  colorPalette: string[];
  lightingStyle: string;
  cameraAngle: string;

  // Generation
  isGenerating: boolean;
  isLoadingConcepts: boolean;
  generatedImages: string[];
}

export const initialCreativeStudioState: CreativeStudioState = {
  step: 1,
  selectedBrand: null,
  selectedCampaign: null,
  mediaType: 'image',
  useCase: 'product',
  prompt: '',
  selectedTypeCard: null,

  concepts: [],
  selectedConcept: null,
  moodboard: null,
  productReference: null,
  masterReference: null,
  textOnImage: '',
  extraKeywords: [],
  negativePrompt: '',
  imageCount: 4,
  resolution: '1024',
  aspectRatio: '1:1',
  imageStyle: [],
  aiModel: 'auto',
  seed: null,
  guidanceScale: 7,
  saveToFolder: null,

  colorPalette: [],
  lightingStyle: 'natural',
  cameraAngle: 'eye-level',

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

export const imageStyles = [
  'Minimalist', 'Vibrant', 'Moody', 'Vintage', 'Modern', 
  'Luxury', 'Playful', 'Editorial', 'Dramatic', 'Soft'
];

export const lightingStyles = [
  { value: 'natural', label: 'Natural Light' },
  { value: 'studio', label: 'Studio' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'golden-hour', label: 'Golden Hour' },
  { value: 'soft', label: 'Soft/Diffused' },
];

export const cameraAngles = [
  { value: 'eye-level', label: 'Eye Level' },
  { value: 'overhead', label: 'Overhead/Flat Lay' },
  { value: 'close-up', label: 'Close-Up' },
  { value: 'wide', label: 'Wide Shot' },
  { value: 'low-angle', label: 'Low Angle' },
];

export const aiModels = [
  { value: 'auto', label: 'Auto (Recommended)' },
  { value: 'gemini', label: 'Gemini Image' },
  { value: 'flux', label: 'Flux' },
];

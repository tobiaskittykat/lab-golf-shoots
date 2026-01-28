// ============= BACKGROUND PRESETS =============

import { BackgroundPreset } from './types';

// Studio backgrounds (8-12 options)
export const studioBackgrounds: BackgroundPreset[] = [
  { 
    id: 'studio-white', 
    name: 'White Cyclorama', 
    category: 'studio', 
    thumbnail: '', 
    prompt: 'clean white studio cyclorama background, professional product photography lighting, seamless white backdrop',
    colorHint: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)'
  },
  { 
    id: 'studio-black', 
    name: 'Black Void', 
    category: 'studio', 
    thumbnail: '', 
    prompt: 'deep black studio background, dramatic rim lighting, high contrast product photography',
    colorHint: 'linear-gradient(180deg, #1A1A1A 0%, #000000 100%)'
  },
  { 
    id: 'studio-gradient-warm', 
    name: 'Warm Gradient', 
    category: 'studio', 
    thumbnail: '', 
    prompt: 'soft warm gradient background, pink to orange tones, fashion photography lighting',
    colorHint: 'linear-gradient(135deg, #FFB6C1 0%, #FFA07A 100%)'
  },
  { 
    id: 'studio-gradient-cool', 
    name: 'Cool Gradient', 
    category: 'studio', 
    thumbnail: '', 
    prompt: 'soft cool gradient background, blue to purple tones, modern studio lighting',
    colorHint: 'linear-gradient(135deg, #87CEEB 0%, #9370DB 100%)'
  },
  { 
    id: 'studio-concrete', 
    name: 'Concrete Floor', 
    category: 'studio', 
    thumbnail: '', 
    prompt: 'polished concrete floor studio, industrial chic, soft window light',
    colorHint: 'linear-gradient(180deg, #E8E8E8 0%, #BEBEBE 100%)'
  },
  { 
    id: 'studio-marble', 
    name: 'Marble Surface', 
    category: 'studio', 
    thumbnail: '', 
    prompt: 'white marble surface with grey veining, luxury product photography, elegant studio setting',
    colorHint: 'linear-gradient(135deg, #FAFAFA 0%, #E0E0E0 50%, #F5F5F5 100%)'
  },
  { 
    id: 'studio-fabric', 
    name: 'Textured Fabric', 
    category: 'studio', 
    thumbnail: '', 
    prompt: 'soft linen fabric backdrop, natural texture, diffused lighting, tactile feel',
    colorHint: 'linear-gradient(180deg, #F5F0E6 0%, #E8DFD3 100%)'
  },
  { 
    id: 'studio-wood', 
    name: 'Warm Wood', 
    category: 'studio', 
    thumbnail: '', 
    prompt: 'warm honey oak wood surface, natural grain, soft natural lighting',
    colorHint: 'linear-gradient(180deg, #DEB887 0%, #CD853F 100%)'
  },
  { 
    id: 'studio-terrazzo', 
    name: 'Terrazzo', 
    category: 'studio', 
    thumbnail: '', 
    prompt: 'terrazzo surface with colorful chips, modern aesthetic, clean product photography',
    colorHint: 'linear-gradient(135deg, #FAF8F5 0%, #F0EDE8 100%)'
  },
  { 
    id: 'studio-paper', 
    name: 'Paper Backdrop', 
    category: 'studio', 
    thumbnail: '', 
    prompt: 'seamless paper backdrop, soft shadows, classic product photography setup',
    colorHint: 'linear-gradient(180deg, #FFFEF5 0%, #F5F5DC 100%)'
  },
];

// Outdoor backgrounds (8-12 options)
export const outdoorBackgrounds: BackgroundPreset[] = [
  { 
    id: 'outdoor-beach', 
    name: 'Sandy Beach', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'soft sandy beach background, golden hour sunlight, ocean in distance, relaxed coastal vibe',
    colorHint: 'linear-gradient(180deg, #87CEEB 0%, #F4A460 50%, #DEB887 100%)'
  },
  { 
    id: 'outdoor-urban', 
    name: 'Urban Street', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'urban city street background, modern architecture, stylish metropolitan setting',
    colorHint: 'linear-gradient(180deg, #708090 0%, #A9A9A9 100%)'
  },
  { 
    id: 'outdoor-park', 
    name: 'Park Grass', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'lush green park setting, dappled sunlight through trees, natural fresh atmosphere',
    colorHint: 'linear-gradient(180deg, #90EE90 0%, #228B22 100%)'
  },
  { 
    id: 'outdoor-cafe', 
    name: 'Café Terrace', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'charming European café terrace, cobblestone street, bistro chairs, warm afternoon light',
    colorHint: 'linear-gradient(180deg, #F5DEB3 0%, #D2691E 100%)'
  },
  { 
    id: 'outdoor-desert', 
    name: 'Desert Dunes', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'dramatic desert landscape, sand dunes, warm golden hour light, minimalist vast backdrop',
    colorHint: 'linear-gradient(180deg, #EDC9AF 0%, #C19A6B 100%)'
  },
  { 
    id: 'outdoor-forest', 
    name: 'Forest Path', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'serene forest path, filtered sunlight through trees, natural earthy tones, peaceful setting',
    colorHint: 'linear-gradient(180deg, #556B2F 0%, #2F4F4F 100%)'
  },
  { 
    id: 'outdoor-rooftop', 
    name: 'Rooftop', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'modern rooftop setting, city skyline in background, golden hour, urban lifestyle',
    colorHint: 'linear-gradient(180deg, #FFB347 0%, #708090 100%)'
  },
  { 
    id: 'outdoor-pool', 
    name: 'Poolside', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'luxury poolside setting, turquoise water, white deck, resort vibes, bright daylight',
    colorHint: 'linear-gradient(180deg, #E0FFFF 0%, #40E0D0 100%)'
  },
  { 
    id: 'outdoor-mountain', 
    name: 'Mountain Trail', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'mountain hiking trail, scenic overlook, adventurous outdoor setting, natural beauty',
    colorHint: 'linear-gradient(180deg, #87CEEB 0%, #708090 50%, #2F4F4F 100%)'
  },
  { 
    id: 'outdoor-vineyard', 
    name: 'Vineyard', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'rolling vineyard hills, golden afternoon light, Tuscan countryside aesthetic, sophisticated',
    colorHint: 'linear-gradient(180deg, #9ACD32 0%, #6B8E23 100%)'
  },
  { 
    id: 'outdoor-boardwalk', 
    name: 'Boardwalk', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'wooden boardwalk by the sea, coastal breeze, vacation vibes, relaxed summer setting',
    colorHint: 'linear-gradient(180deg, #87CEEB 0%, #DEB887 100%)'
  },
  { 
    id: 'outdoor-market', 
    name: 'Street Market', 
    category: 'outdoor', 
    thumbnail: '', 
    prompt: 'vibrant street market, colorful stalls, bustling atmosphere, authentic local setting',
    colorHint: 'linear-gradient(135deg, #FF6347 0%, #FFD700 50%, #32CD32 100%)'
  },
];

// Get all backgrounds
export const allBackgrounds: BackgroundPreset[] = [...studioBackgrounds, ...outdoorBackgrounds];

// Get backgrounds by category
export const getBackgroundsByCategory = (category: 'studio' | 'outdoor'): BackgroundPreset[] => {
  return category === 'studio' ? studioBackgrounds : outdoorBackgrounds;
};

// Get background by ID
export const getBackgroundById = (id: string): BackgroundPreset | undefined => {
  return allBackgrounds.find(bg => bg.id === id);
};

// ============= BACKGROUND PRESETS =============

import { BackgroundPreset, WeatherCondition } from './types';

// Import background thumbnails
import studioWhite from '@/assets/backgrounds/studio-white.jpg';
import studioBlack from '@/assets/backgrounds/studio-black.jpg';
import studioGradientWarm from '@/assets/backgrounds/studio-gradient-warm.jpg';
import studioGradientCool from '@/assets/backgrounds/studio-gradient-cool.jpg';
import studioConcrete from '@/assets/backgrounds/studio-concrete.jpg';
import studioMarble from '@/assets/backgrounds/studio-marble.jpg';
import studioFabric from '@/assets/backgrounds/studio-fabric.jpg';
import studioWood from '@/assets/backgrounds/studio-wood.jpg';
import studioTerrazzo from '@/assets/backgrounds/studio-terrazzo.jpg';
import studioPaper from '@/assets/backgrounds/studio-paper.jpg';
import outdoorBeach from '@/assets/backgrounds/outdoor-beach.jpg';
import outdoorUrban from '@/assets/backgrounds/outdoor-urban.jpg';
import outdoorPark from '@/assets/backgrounds/outdoor-park.jpg';
import outdoorCafe from '@/assets/backgrounds/outdoor-cafe.jpg';
import outdoorDesert from '@/assets/backgrounds/outdoor-desert.jpg';
import outdoorForest from '@/assets/backgrounds/outdoor-forest.jpg';
import outdoorRooftop from '@/assets/backgrounds/outdoor-rooftop.jpg';
import outdoorPool from '@/assets/backgrounds/outdoor-pool.jpg';
import outdoorMountain from '@/assets/backgrounds/outdoor-mountain.jpg';
import outdoorVineyard from '@/assets/backgrounds/outdoor-vineyard.jpg';
import outdoorBoardwalk from '@/assets/backgrounds/outdoor-boardwalk.jpg';
import outdoorMarket from '@/assets/backgrounds/outdoor-market.jpg';
import outdoorCactusGarden from '@/assets/backgrounds/outdoor-cactus-garden.jpg';
import outdoorCrackedEarth from '@/assets/backgrounds/outdoor-cracked-earth.jpg';
import outdoorSaltFlats from '@/assets/backgrounds/outdoor-salt-flats.jpg';
import outdoorPicnic from '@/assets/backgrounds/outdoor-picnic.jpg';
import outdoorRockyShore from '@/assets/backgrounds/outdoor-rocky-shore.jpg';
import outdoorWeatheredMetal from '@/assets/backgrounds/outdoor-weathered-metal.jpg';
import outdoorGrassConcrete from '@/assets/backgrounds/outdoor-grass-concrete.jpg';

// ============= WEATHER OPTIONS =============
export interface WeatherOption {
  value: WeatherCondition;
  label: string;
  prompt: string | null;
  lightingPrompt: string;
}

export const weatherConditionOptions: WeatherOption[] = [
  { 
    value: 'auto', 
    label: 'Auto (AI chooses)', 
    prompt: null,
    lightingPrompt: 'natural outdoor lighting appropriate for the setting'
  },
  { 
    value: 'sunny', 
    label: 'Sunny', 
    prompt: 'bright sunny day with clear blue sky',
    lightingPrompt: 'bright direct sunlight with sharp, defined shadows'
  },
  { 
    value: 'overcast', 
    label: 'Overcast', 
    prompt: 'overcast sky with soft even lighting',
    lightingPrompt: 'soft diffused daylight with minimal shadows, even illumination'
  },
  { 
    value: 'golden-hour', 
    label: 'Golden Hour', 
    prompt: 'warm golden hour sunlight',
    lightingPrompt: 'warm golden hour light with long, soft shadows and rich warm tones'
  },
  { 
    value: 'cloudy', 
    label: 'Cloudy', 
    prompt: 'cloudy day with soft lighting',
    lightingPrompt: 'soft even lighting with no harsh shadows, gentle ambient glow'
  },
  { 
    value: 'dappled', 
    label: 'Dappled Light', 
    prompt: 'dappled light filtered through trees or structures',
    lightingPrompt: 'dappled light filtered through foliage or architecture, creating soft patterns'
  },
];

// Studio backgrounds (10 options)
export const studioBackgrounds: BackgroundPreset[] = [
  { 
    id: 'studio-white', 
    name: 'White Cyclorama', 
    category: 'studio', 
    thumbnail: studioWhite, 
    prompt: 'clean white studio cyclorama background, professional product photography lighting, seamless white backdrop',
    colorHint: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)'
  },
  { 
    id: 'studio-black', 
    name: 'Black Void', 
    category: 'studio', 
    thumbnail: studioBlack, 
    prompt: 'deep black studio background, dramatic rim lighting, high contrast product photography',
    colorHint: 'linear-gradient(180deg, #1A1A1A 0%, #000000 100%)'
  },
  { 
    id: 'studio-gradient-warm', 
    name: 'Warm Gradient', 
    category: 'studio', 
    thumbnail: studioGradientWarm, 
    prompt: 'soft warm gradient background, pink to orange tones, fashion photography lighting',
    colorHint: 'linear-gradient(135deg, #FFB6C1 0%, #FFA07A 100%)'
  },
  { 
    id: 'studio-gradient-cool', 
    name: 'Cool Gradient', 
    category: 'studio', 
    thumbnail: studioGradientCool, 
    prompt: 'soft cool gradient background, blue to purple tones, modern studio lighting',
    colorHint: 'linear-gradient(135deg, #87CEEB 0%, #9370DB 100%)'
  },
  { 
    id: 'studio-concrete', 
    name: 'Concrete Floor', 
    category: 'studio', 
    thumbnail: studioConcrete, 
    prompt: 'polished concrete floor studio, industrial chic, soft window light',
    colorHint: 'linear-gradient(180deg, #E8E8E8 0%, #BEBEBE 100%)'
  },
  { 
    id: 'studio-marble', 
    name: 'Marble Surface', 
    category: 'studio', 
    thumbnail: studioMarble, 
    prompt: 'white marble surface with grey veining, luxury product photography, elegant studio setting',
    colorHint: 'linear-gradient(135deg, #FAFAFA 0%, #E0E0E0 50%, #F5F5F5 100%)'
  },
  { 
    id: 'studio-fabric', 
    name: 'Textured Fabric', 
    category: 'studio', 
    thumbnail: studioFabric, 
    prompt: 'soft linen fabric backdrop, natural texture, diffused lighting, tactile feel',
    colorHint: 'linear-gradient(180deg, #F5F0E6 0%, #E8DFD3 100%)'
  },
  { 
    id: 'studio-wood', 
    name: 'Warm Wood', 
    category: 'studio', 
    thumbnail: studioWood, 
    prompt: 'warm honey oak wood surface, natural grain, soft natural lighting',
    colorHint: 'linear-gradient(180deg, #DEB887 0%, #CD853F 100%)'
  },
  { 
    id: 'studio-terrazzo', 
    name: 'Terrazzo', 
    category: 'studio', 
    thumbnail: studioTerrazzo, 
    prompt: 'terrazzo surface with colorful chips, modern aesthetic, clean product photography',
    colorHint: 'linear-gradient(135deg, #FAF8F5 0%, #F0EDE8 100%)'
  },
  { 
    id: 'studio-paper', 
    name: 'Paper Backdrop', 
    category: 'studio', 
    thumbnail: studioPaper, 
    prompt: 'seamless paper backdrop, soft shadows, classic product photography setup',
    colorHint: 'linear-gradient(180deg, #FFFEF5 0%, #F5F5DC 100%)'
  },
];

// Outdoor backgrounds (12 options)
export const outdoorBackgrounds: BackgroundPreset[] = [
  { 
    id: 'outdoor-beach', 
    name: 'Sandy Beach', 
    category: 'outdoor', 
    thumbnail: outdoorBeach, 
    prompt: 'soft sandy beach background, golden hour sunlight, ocean in distance, relaxed coastal vibe',
    colorHint: 'linear-gradient(180deg, #87CEEB 0%, #F4A460 50%, #DEB887 100%)'
  },
  { 
    id: 'outdoor-urban', 
    name: 'Urban Street', 
    category: 'outdoor', 
    thumbnail: outdoorUrban, 
    prompt: 'urban city street background, modern architecture, stylish metropolitan setting',
    colorHint: 'linear-gradient(180deg, #708090 0%, #A9A9A9 100%)'
  },
  { 
    id: 'outdoor-park', 
    name: 'Park Grass', 
    category: 'outdoor', 
    thumbnail: outdoorPark, 
    prompt: 'lush green park setting, dappled sunlight through trees, natural fresh atmosphere',
    colorHint: 'linear-gradient(180deg, #90EE90 0%, #228B22 100%)'
  },
  { 
    id: 'outdoor-cafe', 
    name: 'Café Terrace', 
    category: 'outdoor', 
    thumbnail: outdoorCafe, 
    prompt: 'charming European café terrace, cobblestone street, bistro chairs, warm afternoon light',
    colorHint: 'linear-gradient(180deg, #F5DEB3 0%, #D2691E 100%)'
  },
  { 
    id: 'outdoor-desert', 
    name: 'Desert Dunes', 
    category: 'outdoor', 
    thumbnail: outdoorDesert, 
    prompt: 'dramatic desert landscape, sand dunes, warm golden hour light, minimalist vast backdrop',
    colorHint: 'linear-gradient(180deg, #EDC9AF 0%, #C19A6B 100%)'
  },
  { 
    id: 'outdoor-forest', 
    name: 'Forest Path', 
    category: 'outdoor', 
    thumbnail: outdoorForest, 
    prompt: 'serene forest path, filtered sunlight through trees, natural earthy tones, peaceful setting',
    colorHint: 'linear-gradient(180deg, #556B2F 0%, #2F4F4F 100%)'
  },
  { 
    id: 'outdoor-rooftop', 
    name: 'Rooftop', 
    category: 'outdoor', 
    thumbnail: outdoorRooftop, 
    prompt: 'modern rooftop setting, city skyline in background, golden hour, urban lifestyle',
    colorHint: 'linear-gradient(180deg, #FFB347 0%, #708090 100%)'
  },
  { 
    id: 'outdoor-pool', 
    name: 'Poolside', 
    category: 'outdoor', 
    thumbnail: outdoorPool, 
    prompt: 'luxury poolside setting, turquoise water, white deck, resort vibes, bright daylight',
    colorHint: 'linear-gradient(180deg, #E0FFFF 0%, #40E0D0 100%)'
  },
  { 
    id: 'outdoor-mountain', 
    name: 'Mountain Trail', 
    category: 'outdoor', 
    thumbnail: outdoorMountain, 
    prompt: 'mountain hiking trail, scenic overlook, adventurous outdoor setting, natural beauty',
    colorHint: 'linear-gradient(180deg, #87CEEB 0%, #708090 50%, #2F4F4F 100%)'
  },
  { 
    id: 'outdoor-vineyard', 
    name: 'Vineyard', 
    category: 'outdoor', 
    thumbnail: outdoorVineyard, 
    prompt: 'rolling vineyard hills, golden afternoon light, Tuscan countryside aesthetic, sophisticated',
    colorHint: 'linear-gradient(180deg, #9ACD32 0%, #6B8E23 100%)'
  },
  { 
    id: 'outdoor-boardwalk', 
    name: 'Boardwalk', 
    category: 'outdoor', 
    thumbnail: outdoorBoardwalk, 
    prompt: 'wooden boardwalk by the sea, coastal breeze, vacation vibes, relaxed summer setting',
    colorHint: 'linear-gradient(180deg, #87CEEB 0%, #DEB887 100%)'
  },
  { 
    id: 'outdoor-market', 
    name: 'Street Market', 
    category: 'outdoor', 
    thumbnail: outdoorMarket, 
    prompt: 'vibrant street market, colorful stalls, bustling atmosphere, authentic local setting',
    colorHint: 'linear-gradient(135deg, #FF6347 0%, #FFD700 50%, #32CD32 100%)'
  },
  { 
    id: 'outdoor-cactus-garden', 
    name: 'Cactus Garden', 
    category: 'outdoor', 
    thumbnail: outdoorCactusGarden, 
    prompt: 'southwestern desert setting with prickly pear cactus, sandy beige ground, natural desert flora backdrop',
    colorHint: 'linear-gradient(180deg, #8B9D83 0%, #D4C5A9 50%, #C8B896 100%)'
  },
  { 
    id: 'outdoor-cracked-earth', 
    name: 'Cracked Earth', 
    category: 'outdoor', 
    thumbnail: outdoorCrackedEarth, 
    prompt: 'dry cracked earth surface, deep fissures in clay ground, dramatic arid landscape texture',
    colorHint: 'linear-gradient(180deg, #C8B896 0%, #A89968 100%)'
  },
  { 
    id: 'outdoor-salt-flats', 
    name: 'Salt Flats', 
    category: 'outdoor', 
    thumbnail: outdoorSaltFlats, 
    prompt: 'white crystalline salt flat surface, turquoise mineral deposits, otherworldly natural phenomenon',
    colorHint: 'linear-gradient(135deg, #F0F8FF 0%, #B0E0E6 50%, #E0F7FA 100%)'
  },
  { 
    id: 'outdoor-picnic', 
    name: 'Picnic Blanket', 
    category: 'outdoor', 
    thumbnail: outdoorPicnic, 
    prompt: 'red gingham picnic blanket on green grass, casual outdoor lifestyle setting, summer day',
    colorHint: 'linear-gradient(135deg, #DC143C 0%, #FFFFFF 25%, #DC143C 50%, #228B22 100%)'
  },
  { 
    id: 'outdoor-rocky-shore', 
    name: 'Rocky Shore', 
    category: 'outdoor', 
    thumbnail: outdoorRockyShore, 
    prompt: 'natural limestone rock surface, turquoise water edge, spa-like serene coastal setting',
    colorHint: 'linear-gradient(180deg, #D3D3D3 0%, #40E0D0 100%)'
  },
  { 
    id: 'outdoor-weathered-metal', 
    name: 'Weathered Metal', 
    category: 'outdoor', 
    thumbnail: outdoorWeatheredMetal, 
    prompt: 'oxidized metal surface with rust patina, golden hour tones, industrial artistic texture',
    colorHint: 'linear-gradient(135deg, #CD7F32 0%, #DAA520 50%, #B87333 100%)'
  },
  { 
    id: 'outdoor-grass-concrete', 
    name: 'Grass Edge', 
    category: 'outdoor', 
    thumbnail: outdoorGrassConcrete, 
    prompt: 'clean concrete pavement meets lush green grass, modern architectural transition, urban nature',
    colorHint: 'linear-gradient(90deg, #228B22 0%, #C0C0C0 50%, #DCDCDC 100%)'
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

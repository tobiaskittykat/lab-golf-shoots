// ============= BACKGROUND PRESETS =============
// Stub version - asset images replaced with colorHint placeholders

import { BackgroundPreset, WeatherCondition } from './types';

export interface WeatherOption {
  value: WeatherCondition;
  label: string;
  prompt: string | null;
  lightingPrompt: string;
}

export const weatherConditionOptions: WeatherOption[] = [
  { value: 'auto', label: 'Auto (AI chooses)', prompt: null, lightingPrompt: 'natural outdoor lighting appropriate for the setting' },
  { value: 'sunny', label: 'Sunny', prompt: 'bright sunny day with clear blue sky', lightingPrompt: 'bright direct sunlight with sharp, defined shadows' },
  { value: 'overcast', label: 'Overcast', prompt: 'overcast sky with soft even lighting', lightingPrompt: 'soft diffused daylight with minimal shadows, even illumination' },
  { value: 'golden-hour', label: 'Golden Hour', prompt: 'warm golden hour sunlight', lightingPrompt: 'warm golden hour light with long, soft shadows and rich warm tones' },
  { value: 'cloudy', label: 'Cloudy', prompt: 'cloudy day with soft lighting', lightingPrompt: 'soft even lighting with no harsh shadows, gentle ambient glow' },
  { value: 'dappled', label: 'Dappled Light', prompt: 'dappled light filtered through trees or structures', lightingPrompt: 'dappled light filtered through foliage or architecture, creating soft patterns' },
];

export const studioBackgrounds: BackgroundPreset[] = [
  { id: 'studio-white', name: 'White Cyclorama', category: 'studio', thumbnail: '', prompt: 'clean white studio cyclorama background, professional product photography lighting, seamless white backdrop', colorHint: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)' },
  { id: 'studio-black', name: 'Black Void', category: 'studio', thumbnail: '', prompt: 'deep black studio background, dramatic rim lighting, high contrast product photography', colorHint: 'linear-gradient(180deg, #1A1A1A 0%, #000000 100%)' },
  { id: 'studio-gradient-warm', name: 'Warm Gradient', category: 'studio', thumbnail: '', prompt: 'soft warm gradient background, pink to orange tones, fashion photography lighting', colorHint: 'linear-gradient(135deg, #FFB6C1 0%, #FFA07A 100%)' },
  { id: 'studio-gradient-cool', name: 'Cool Gradient', category: 'studio', thumbnail: '', prompt: 'soft cool gradient background, blue to purple tones, modern studio lighting', colorHint: 'linear-gradient(135deg, #87CEEB 0%, #9370DB 100%)' },
  { id: 'studio-concrete', name: 'Concrete Floor', category: 'studio', thumbnail: '', prompt: 'polished concrete floor studio, industrial chic, soft window light', colorHint: 'linear-gradient(180deg, #E8E8E8 0%, #BEBEBE 100%)' },
  { id: 'studio-marble', name: 'Marble Surface', category: 'studio', thumbnail: '', prompt: 'white marble surface with grey veining, luxury product photography, elegant studio setting', colorHint: 'linear-gradient(135deg, #FAFAFA 0%, #E0E0E0 50%, #F5F5F5 100%)' },
  { id: 'studio-fabric', name: 'Textured Fabric', category: 'studio', thumbnail: '', prompt: 'soft linen fabric backdrop, natural texture, diffused lighting, tactile feel', colorHint: 'linear-gradient(180deg, #F5F0E6 0%, #E8DFD3 100%)' },
  { id: 'studio-wood', name: 'Warm Wood', category: 'studio', thumbnail: '', prompt: 'warm honey oak wood surface, natural grain, soft natural lighting', colorHint: 'linear-gradient(180deg, #DEB887 0%, #CD853F 100%)' },
  { id: 'studio-terrazzo', name: 'Terrazzo', category: 'studio', thumbnail: '', prompt: 'terrazzo surface with colorful chips, modern aesthetic, clean product photography', colorHint: 'linear-gradient(135deg, #FAF8F5 0%, #F0EDE8 100%)' },
  { id: 'studio-paper', name: 'Paper Backdrop', category: 'studio', thumbnail: '', prompt: 'seamless paper backdrop, soft shadows, classic product photography setup', colorHint: 'linear-gradient(180deg, #FFFEF5 0%, #F5F5DC 100%)' },
];

export const outdoorBackgrounds: BackgroundPreset[] = [
  { id: 'outdoor-beach', name: 'Sandy Beach', category: 'outdoor', thumbnail: '', prompt: 'warm golden sand with natural ripple texture, soft golden hour light, distant ocean blur', colorHint: 'linear-gradient(180deg, #87CEEB 0%, #F4A460 50%, #DEB887 100%)' },
  { id: 'outdoor-urban', name: 'Urban Street', category: 'outdoor', thumbnail: '', prompt: 'sun-warmed cobblestone European side street, aged sandstone walls, warm afternoon light', colorHint: 'linear-gradient(180deg, #708090 0%, #A9A9A9 100%)' },
  { id: 'outdoor-park', name: 'Park Grass', category: 'outdoor', thumbnail: '', prompt: 'wild meadow grass with wildflowers, dappled golden sunlight through mature trees', colorHint: 'linear-gradient(180deg, #90EE90 0%, #228B22 100%)' },
  { id: 'outdoor-cafe', name: 'Café Terrace', category: 'outdoor', thumbnail: '', prompt: 'weathered wooden bistro table on aged cobblestones, terracotta-toned walls', colorHint: 'linear-gradient(180deg, #F5DEB3 0%, #D2691E 100%)' },
  { id: 'outdoor-desert', name: 'Desert Dunes', category: 'outdoor', thumbnail: '', prompt: 'sculptural desert dune with wind-carved ridges, warm amber golden hour', colorHint: 'linear-gradient(180deg, #EDC9AF 0%, #C19A6B 100%)' },
  { id: 'outdoor-forest', name: 'Forest Path', category: 'outdoor', thumbnail: '', prompt: 'dappled light through ancient oak canopy, moss-covered forest floor', colorHint: 'linear-gradient(180deg, #556B2F 0%, #2F4F4F 100%)' },
  { id: 'outdoor-rooftop', name: 'Rooftop', category: 'outdoor', thumbnail: '', prompt: 'weathered terracotta rooftop terrace, potted olive trees, warm golden hour cityscape', colorHint: 'linear-gradient(180deg, #FFB347 0%, #708090 100%)' },
  { id: 'outdoor-pool', name: 'Poolside', category: 'outdoor', thumbnail: '', prompt: 'natural stone pool edge with sun-warmed travertine deck, turquoise water reflections', colorHint: 'linear-gradient(180deg, #E0FFFF 0%, #40E0D0 100%)' },
  { id: 'outdoor-mountain', name: 'Mountain Trail', category: 'outdoor', thumbnail: '', prompt: 'rugged mountain trail with worn natural stone, alpine wildflowers', colorHint: 'linear-gradient(180deg, #87CEEB 0%, #708090 50%, #2F4F4F 100%)' },
  { id: 'outdoor-vineyard', name: 'Vineyard', category: 'outdoor', thumbnail: '', prompt: 'sun-drenched vineyard rows with gnarled old vines, golden Tuscan light', colorHint: 'linear-gradient(180deg, #9ACD32 0%, #6B8E23 100%)' },
];

export const allBackgrounds: BackgroundPreset[] = [...studioBackgrounds, ...outdoorBackgrounds];
export const getBackgroundsByCategory = (category: 'studio' | 'outdoor'): BackgroundPreset[] => category === 'studio' ? studioBackgrounds : outdoorBackgrounds;
export const getBackgroundById = (id: string): BackgroundPreset | undefined => allBackgrounds.find(bg => bg.id === id);

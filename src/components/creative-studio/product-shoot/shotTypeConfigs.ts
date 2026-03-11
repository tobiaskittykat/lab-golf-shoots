// Shot Type Configs - full implementation
import { studioBackgrounds, outdoorBackgrounds, weatherConditionOptions } from './presets';
import type { SettingType, WeatherCondition } from './types';

export type ProductShotType = 'product-focus' | 'on-foot' | 'lifestyle';
export type ModelGender = 'auto' | 'female' | 'male' | 'nonbinary';
export type PoseVariation = 'auto' | 'feet-parallel' | 'one-forward' | 'heel-relaxed' | 'toe-out' | 'soft-asymmetry';
export type LegStyling = 'auto' | 'wide-leg-cropped' | 'straight-leg-cropped' | 'slim-cropped' | 'cuffed-jeans' | 'bare-ankle';
export type TrouserColor = 'auto' | 'black' | 'charcoal' | 'navy' | 'white' | 'beige' | 'denim-blue' | 'denim-light';
export type ProductFocusAngle = 'auto' | 'hero' | 'side-profile' | 'top-down' | 'sole-view' | 'detail-closeup' | 'pair-shot' | 'lifestyle';
export type ProductFocusLighting = 'auto' | 'studio' | 'natural';
export type LifestylePose = 'auto' | 'front-relaxed' | 'three-quarter' | 'side-profile' | 'walking-pause' | 'heel-lift' | 'weight-shift';
export type LifestyleTrouserStyle = 'auto' | 'tailored' | 'slim' | 'straight' | 'chinos' | 'joggers';
export type LifestyleTopStyle = 'auto' | 'button-up' | 'knitwear' | 'jacket' | 'tee';
export type LifestyleOutfitColor = 'auto' | 'monochrome-black' | 'monochrome-white' | 'monochrome-grey' | 'contrast-neutral' | 'navy-cream' | 'charcoal-white';

export interface BackgroundContext {
  settingType: SettingType;
  backgroundId?: string;
  customBackgroundPrompt?: string;
  weatherCondition?: WeatherCondition;
}

export interface OnFootShotConfig {
  gender: ModelGender;
  ethnicity: string;
  poseVariation: PoseVariation;
  legStyling: LegStyling;
  trouserColor: TrouserColor;
}

export interface ProductFocusShotConfig {
  cameraAngle: ProductFocusAngle;
  lighting: ProductFocusLighting;
}

export interface LifestyleShotConfig {
  gender: ModelGender;
  ethnicity: string;
  pose: LifestylePose;
  trouserStyle: LifestyleTrouserStyle;
  topStyle: LifestyleTopStyle;
  outfitColor: LifestyleOutfitColor;
}

export const genderOptions = [
  { value: 'auto' as ModelGender, label: 'Auto (AI chooses)' },
  { value: 'female' as ModelGender, label: 'Female' },
  { value: 'male' as ModelGender, label: 'Male' },
  { value: 'nonbinary' as ModelGender, label: 'Non-binary' },
];

export const initialOnFootConfig: OnFootShotConfig = { gender: 'auto', ethnicity: 'auto', poseVariation: 'auto', legStyling: 'auto', trouserColor: 'auto' };
export const initialProductFocusConfig: ProductFocusShotConfig = { cameraAngle: 'auto', lighting: 'auto' };
export const initialLifestyleConfig: LifestyleShotConfig = { gender: 'auto', ethnicity: 'auto', pose: 'auto', trouserStyle: 'auto', topStyle: 'auto', outfitColor: 'auto' };

export function shotTypeHasConfig(shotType: ProductShotType): boolean {
  return shotType === 'on-foot' || shotType === 'lifestyle' || shotType === 'product-focus';
}

export function buildBackgroundSection(context: BackgroundContext): string[] {
  const sections: string[] = [];
  if (context.backgroundId === 'studio-white') {
    sections.push("BACKGROUND (MANDATORY):", "- Pure white seamless studio background", "- Visible floor and wall plane", "- Soft cast shadows grounding the model");
    return sections;
  }
  sections.push("BACKGROUND:");
  if (context.customBackgroundPrompt) {
    sections.push(`- ${context.customBackgroundPrompt}`);
  } else if (context.backgroundId) {
    const allBgs = [...studioBackgrounds, ...outdoorBackgrounds];
    const preset = allBgs.find(bg => bg.id === context.backgroundId);
    if (preset) sections.push(`- ${preset.prompt}`);
  } else if (context.settingType === 'studio') {
    sections.push("- Clean professional studio environment");
  } else {
    sections.push("- Natural outdoor setting");
  }
  return sections;
}

export function buildLightingSection(context: BackgroundContext): string[] {
  const sections: string[] = [];
  if (context.backgroundId === 'studio-white') {
    sections.push("LIGHTING & TECHNICAL (MANDATORY):", "- Clean, diffused studio light", "- Soft contact shadows under the soles");
    return sections;
  }
  sections.push("LIGHTING:");
  const isOutdoor = context.settingType === 'outdoor' || context.backgroundId?.startsWith('outdoor-');
  if (isOutdoor) {
    const weatherOpt = weatherConditionOptions.find(w => w.value === (context.weatherCondition || 'auto'));
    sections.push(`- ${weatherOpt?.lightingPrompt || 'Natural outdoor lighting'}`);
  } else {
    sections.push("- Professional studio lighting, softbox diffusion");
  }
  return sections;
}

export function buildOnFootPrompt(config: OnFootShotConfig, bgContext?: BackgroundContext): string {
  const genderStr = config.gender === 'auto' ? ['female', 'male'][Math.floor(Math.random() * 2)] : config.gender;
  const backgroundDesc = bgContext?.customBackgroundPrompt || 'a pure white seamless studio background';
  return `A single, high-resolution e-commerce image (one frame only, no collage).
ENTITY COUNT (MANDATORY): Exactly 2 shoes (one pair worn on feet).

A close-up on-model product shot of a ${genderStr} model wearing the footwear, photographed against ${backgroundDesc}.
Framing is tight and product-focused, showing the feet, shoes, ankles, and lower legs, cropped roughly from mid-calf down.

FOOTWEAR — LOCKED (MUST NOT CHANGE)
The model is wearing the exact footwear shown in the product reference images.
The shoe's geometry, construction, silhouette, proportions must remain identical.

The final image must be indistinguishable from an official e-commerce product photograph.`;
}

export function buildProductFocusPrompt(config: ProductFocusShotConfig, bgContext?: BackgroundContext): string {
  const backgroundDesc = bgContext?.customBackgroundPrompt || 'a clean, neutral studio background';
  return `A single, high-resolution e-commerce product image (one frame only, no collage).

A product-only shot — NO hands, NO models, NO body parts. The footwear is the sole subject, photographed against ${backgroundDesc}.

FOOTWEAR — LOCKED (MUST NOT CHANGE)
The exact footwear shown in the product reference images. Do not redesign or reinterpret.

The final image must be indistinguishable from an official e-commerce product photograph.`;
}

export function buildLifestylePrompt(config: LifestyleShotConfig, bgContext?: BackgroundContext): string {
  const genderStr = config.gender === 'auto' ? ['female', 'male'][Math.floor(Math.random() * 2)] : config.gender;
  const backgroundDesc = bgContext?.customBackgroundPrompt || 'a pure white seamless studio background';
  return `A single, high-resolution e-commerce image (one frame only, no collage).
ENTITY COUNT (MANDATORY): Exactly 2 shoes (one pair worn by the model).

A full-body product-on-model shot, framed from upper chest down to the feet, head cropped out.
The ${genderStr} model is photographed against ${backgroundDesc}.

FOOTWEAR — LOCKED (MUST NOT CHANGE)
The model is wearing the exact footwear shown in the product reference images.
The shoe's geometry, construction, silhouette, proportions must remain identical.

The final image must look indistinguishable from an official e-commerce or lookbook photograph.`;
}

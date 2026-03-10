// Shot Type Configs - stub

export interface BackgroundContext {
  settingType?: string;
  backgroundId?: string;
  customBackgroundPrompt?: string;
  weatherCondition?: string;
}

export const initialOnFootConfig: Record<string, unknown> = {
  poseVariation: 'feet-parallel',
  legStyling: 'straight-leg',
  trouserColor: 'dark',
  gender: 'neutral',
};

export const initialLifestyleConfig: Record<string, unknown> = {
  pose: 'front-facing',
  clothingStyle: 'casual',
  gender: 'neutral',
};

export const initialProductFocusConfig: Record<string, unknown> = {
  cameraAngle: 'three-quarter',
  lighting: 'studio',
};

export function buildOnFootPrompt(config: Record<string, unknown>, bg: BackgroundContext): string {
  const parts = ['On foot product shot'];
  if (config.poseVariation) parts.push(`pose: ${config.poseVariation}`);
  if (config.legStyling) parts.push(`leg styling: ${config.legStyling}`);
  if (config.trouserColor) parts.push(`trouser color: ${config.trouserColor}`);
  if (config.gender) parts.push(`model: ${config.gender}`);
  if (bg.settingType) parts.push(`setting: ${bg.settingType}`);
  if (bg.customBackgroundPrompt) parts.push(`background: ${bg.customBackgroundPrompt}`);
  return parts.join(', ');
}

export function buildLifestylePrompt(config: Record<string, unknown>, bg: BackgroundContext): string {
  const parts = ['Full body lifestyle shot'];
  if (config.pose) parts.push(`pose: ${config.pose}`);
  if (config.clothingStyle) parts.push(`clothing: ${config.clothingStyle}`);
  if (config.gender) parts.push(`model: ${config.gender}`);
  if (bg.settingType) parts.push(`setting: ${bg.settingType}`);
  if (bg.customBackgroundPrompt) parts.push(`background: ${bg.customBackgroundPrompt}`);
  return parts.join(', ');
}

export function buildProductFocusPrompt(config: Record<string, unknown>, bg: BackgroundContext): string {
  const parts = ['Product focus shot'];
  if (config.cameraAngle) parts.push(`angle: ${config.cameraAngle}`);
  if (config.lighting) parts.push(`lighting: ${config.lighting}`);
  if (bg.settingType) parts.push(`setting: ${bg.settingType}`);
  if (bg.customBackgroundPrompt) parts.push(`background: ${bg.customBackgroundPrompt}`);
  return parts.join(', ');
}

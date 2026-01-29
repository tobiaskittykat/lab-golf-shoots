// Product Shoot Components - barrel export
export { ProductShootSubtypeSelector } from './ProductShootSubtypeSelector';
export { BackgroundSelector } from './BackgroundSelector';
export { ModelConfigurator } from './ModelConfigurator';
export { OnFootConfigurator } from './OnFootConfigurator';
export { LifestyleConfigurator } from './LifestyleConfigurator';

export { ProductIntegrityBadge } from './ProductIntegrityBadge';
export { ProductShootStep2, initialProductShootState } from './ProductShootStep2';

// Types
export * from './types';

// Shot type configs
export * from './shotTypeConfigs';

// Presets
export { 
  studioBackgrounds, 
  outdoorBackgrounds, 
  allBackgrounds,
  getBackgroundsByCategory,
  getBackgroundById,
  weatherConditionOptions,
} from './presets';

export type { WeatherOption } from './presets';

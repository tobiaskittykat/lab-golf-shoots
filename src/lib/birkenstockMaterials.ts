/**
 * Birkenstock Material & Color Reference Library
 * Curated options for shoe component customization
 */

// Materials organized by component type
export const COMPONENT_MATERIALS = {
  upper: [
    { value: 'Suede', label: 'Suede' },
    { value: 'Oiled Leather', label: 'Oiled Leather' },
    { value: 'Smooth Leather', label: 'Smooth Leather' },
    { value: 'Nubuck', label: 'Nubuck' },
    { value: 'Birko-Flor', label: 'Birko-Flor' },
    { value: 'Birkibuc', label: 'Birkibuc' },
    { value: 'Wool Felt', label: 'Wool Felt' },
    { value: 'EVA', label: 'EVA' },
    { value: 'Patent Leather', label: 'Patent Leather' },
    { value: 'Shearling', label: 'Shearling' },
    // Fabric/textile options
    { value: 'Fabric', label: 'Fabric (Woven)' },
    { value: 'Canvas', label: 'Canvas' },
    { value: 'Mesh', label: 'Mesh (Breathable)' },
    { value: 'Recycled PET', label: 'Recycled PET (Eco)' },
  ],
  footbed: [
    { value: 'Cork-Latex', label: 'Cork-Latex (Original)' },
    { value: 'Soft Footbed', label: 'Soft Footbed (Blue Label)' },
    { value: 'EVA', label: 'EVA' },
    { value: 'Exquisite', label: 'Exquisite (Leather-Wrapped)' },
  ],
  sole: [
    { value: 'EVA', label: 'EVA (Standard)' },
    { value: 'Rubber', label: 'Rubber' },
    { value: 'Polyurethane', label: 'Polyurethane (PU)' },
    { value: 'Cork', label: 'Cork' },
  ],
  buckles: [
    { value: 'Metal (Brass)', label: 'Metal (Brass/Gold)' },
    { value: 'Metal (Silver)', label: 'Metal (Silver)' },
    { value: 'Metal (Copper)', label: 'Metal (Copper)' },
    { value: 'Antique Brass', label: 'Antique Brass' },
    { value: 'Matte Plastic', label: 'Matte Plastic' },
    { value: 'Matte Plastic (Coordinated)', label: 'Matte Plastic (Color-Matched)' },
  ],
  heelstrap: [
    { value: 'Suede', label: 'Suede' },
    { value: 'Oiled Leather', label: 'Oiled Leather' },
    { value: 'Smooth Leather', label: 'Smooth Leather' },
    { value: 'Birko-Flor', label: 'Birko-Flor' },
    { value: 'Nubuck', label: 'Nubuck' },
  ],
  lining: [
    { value: 'Shearling (Cream)', label: 'Shearling (Cream)' },
    { value: 'Shearling (Black)', label: 'Shearling (Black)' },
    { value: 'Suede', label: 'Suede' },
    { value: 'Wool Felt', label: 'Wool Felt' },
    { value: 'Microfiber', label: 'Microfiber' },
  ],
} as const;

// Color presets based on Birkenstock's actual color palette
export const COLOR_PRESETS = [
  { name: 'Taupe', hex: '#B8A99A', category: 'neutral' },
  { name: 'Tobacco', hex: '#6F4E37', category: 'brown' },
  { name: 'Mocha', hex: '#967969', category: 'brown' },
  { name: 'Stone', hex: '#928E85', category: 'neutral' },
  { name: 'Black', hex: '#1C1C1C', category: 'basic' },
  { name: 'Habana', hex: '#5C4033', category: 'brown' },
  { name: 'Cognac', hex: '#834C24', category: 'brown' },
  { name: 'Sand', hex: '#C2B280', category: 'neutral' },
  { name: 'White', hex: '#FFFFFF', category: 'basic' },
  { name: 'Navy', hex: '#1E3A5F', category: 'color' },
  { name: 'Antique White', hex: '#FAEBD7', category: 'neutral' },
  { name: 'Chocolate', hex: '#3D2314', category: 'brown' },
  { name: 'Cork Brown', hex: '#8B7355', category: 'brown' },
  { name: 'Cream', hex: '#FFFDD0', category: 'neutral' },
  { name: 'Anthracite', hex: '#383838', category: 'basic' },
  { name: 'Desert Soil', hex: '#A67B5B', category: 'brown' },
  { name: 'Iron', hex: '#48494B', category: 'basic' },
  { name: 'Mink', hex: '#81715E', category: 'neutral' },
  { name: 'Port', hex: '#6C3461', category: 'color' },
  { name: 'Thyme', hex: '#6B8E4E', category: 'color' },
  // Summer/fabric colorways
  { name: 'Apricot', hex: '#E6A57E', category: 'color' },
  { name: 'Coral', hex: '#FF7F50', category: 'color' },
  { name: 'Peach', hex: '#FFDAB9', category: 'color' },
] as const;

// Component type definitions
export type ComponentType = 'upper' | 'footbed' | 'sole' | 'buckles' | 'heelstrap' | 'lining';

export interface ShoeComponent {
  material: string;
  color: string;
  colorHex?: string;
  confidence: number;
  notes?: string;
}

export interface ShoeComponents {
  upper: ShoeComponent;
  footbed: ShoeComponent;
  sole: ShoeComponent;
  buckles?: ShoeComponent | null;
  heelstrap?: ShoeComponent | null;
  lining?: ShoeComponent | null;
  analyzedAt?: string;
  analysisVersion?: string;
}

export interface ComponentOverride {
  material: string;
  color: string;
  colorHex?: string;
}

export type ComponentOverrides = Partial<Record<ComponentType, ComponentOverride>>;

// Helper to get materials for a component type
export function getMaterialsForComponent(type: ComponentType) {
  return COMPONENT_MATERIALS[type] || [];
}

// Helper to find a color preset by name or hex
export function findColorPreset(colorOrHex: string) {
  const lower = colorOrHex.toLowerCase();
  return COLOR_PRESETS.find(
    c => c.name.toLowerCase() === lower || c.hex.toLowerCase() === lower
  );
}

// Helper to check if any overrides are set
export function hasAnyOverrides(overrides: ComponentOverrides | undefined, original: ShoeComponents | null): boolean {
  if (!overrides || !original) return false;
  
  const componentTypes: ComponentType[] = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'];
  
  for (const type of componentTypes) {
    const override = overrides[type];
    const originalComponent = original[type];
    
    if (!override || !originalComponent) continue;
    
    if (
      override.material !== originalComponent.material ||
      override.color !== originalComponent.color
    ) {
      return true;
    }
  }
  
  return false;
}

// Helper to get a descriptive color name from override data (resolves "Custom" to hex)
function getColorDescription(override: { color: string; colorHex?: string }): string {
  if (override.color !== 'Custom' && override.color !== 'custom') {
    return override.color;
  }
  if (!override.colorHex) {
    return override.color;
  }
  const hex = override.colorHex.toUpperCase();
  const colorNames: Record<string, string> = {
    '#FF69B4': 'Hot Pink',
    '#FF1493': 'Deep Pink',
    '#FFC0CB': 'Pink',
    '#FFB6C1': 'Light Pink',
    '#FF0000': 'Red',
    '#00FF00': 'Lime Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FFA500': 'Orange',
    '#800080': 'Purple',
    '#00FFFF': 'Cyan',
    '#000000': 'Black',
    '#FFFFFF': 'White',
  };
  const namedColor = colorNames[hex];
  return namedColor ? `${namedColor} (${hex})` : hex;
}

// Build override prompt section for image generation
export function buildComponentOverridePrompt(
  overrides: ComponentOverrides,
  original: ShoeComponents
): string {
  const lines: string[] = [];
  
  lines.push("=== PRODUCT COMPONENT OVERRIDES ===");
  lines.push("⚠️ IMPORTANT: The user has customized specific shoe components.");
  lines.push("Generate the product with THESE modifications while maintaining");
  lines.push("the original silhouette and proportions from reference images:");
  lines.push("");
  
  const componentTypes: ComponentType[] = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'];
  
  for (const type of componentTypes) {
    const override = overrides[type];
    const originalComponent = original[type];
    
    if (!override) continue;
    
    const isChanged = !originalComponent ||
      override.material !== originalComponent.material ||
      override.color !== originalComponent.color;
    
    if (isChanged) {
      const colorDisplay = getColorDescription(override);
      lines.push(`${type.toUpperCase()}: ${override.material} in ${colorDisplay}`);
      if (originalComponent) {
        lines.push(`  (Original was: ${originalComponent.material} in ${originalComponent.color})`);
      }
    }
  }
  
  lines.push("");
  lines.push("Keep all OTHER components exactly as shown in reference images.");
  lines.push("The overall shoe silhouette/shape must remain unchanged.");
  
  return lines.join("\n");
}

// Component display labels
export const COMPONENT_LABELS: Record<ComponentType, string> = {
  upper: 'Upper',
  footbed: 'Footbed',
  sole: 'Sole',
  buckles: 'Buckles',
  heelstrap: 'Heel Strap',
  lining: 'Lining',
};
